import type { Context } from '@deepseek-ai/cordis'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { spawn } from 'node:child_process'
import { parseDocument, parse as parseYaml, isSeq, isMap } from 'yaml'
import {
  RPC_CHANNEL,
  type ManagerData,
  type McpItem,
  type RpcResult,
  type SkillItem,
  type SkillScope,
  type SkillSource,
  type ToggleMcpPayload,
  type ToggleSkillPayload,
} from './shared.ts'

export const name = 'mcp-skill-manager'
export const inject = ['connection']

/** Walk up filesystem looking for .git or project markers */
async function findProjectRoot(startDir: string): Promise<string> {
  let current = path.resolve(startDir)
  while (true) {
    try {
      const gitStat = await fs.promises.stat(path.join(current, '.git'))
      if (gitStat) return current
    } catch {}
    const parent = path.dirname(current)
    if (parent === current) return startDir
    current = parent
  }
}

/** Extract YAML frontmatter metadata from markdown */
function parseFrontmatter(content: string): { name?: string | undefined; description?: string | undefined; whenToUse?: string | undefined } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match || !match[1]) return {}
  try {
    const parsed = parseYaml(match[1])
    if (parsed && typeof parsed === 'object') {
      return {
        name: typeof parsed.name === 'string' ? parsed.name : undefined,
        description: typeof parsed.description === 'string' ? parsed.description : undefined,
        whenToUse: typeof parsed.whenToUse === 'string' ? parsed.whenToUse : undefined,
      }
    }
  } catch {}
  return {}
}

/** Scan one folder for skills (directories with SKILL.md or flat .md files) */
async function scanDirectory(
  dirPath: string,
  enabled: boolean,
  scope: SkillScope,
  source: SkillSource,
  parentDir: string,
): Promise<SkillItem[]> {
  const items: SkillItem[] = []
  try {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      if (entry.name === '.system' || entry.name === 'skills-disable' || entry.name === 'skill-disable' || entry.name === '.git') continue

      if (entry.isDirectory()) {
        const skillMdPath = path.join(dirPath, entry.name, 'SKILL.md')
        let name = entry.name
        let description = ''
        let whenToUse: string | undefined

        try {
          const content = await fs.promises.readFile(skillMdPath, 'utf8')
          const fm = parseFrontmatter(content)
          if (fm.name) name = fm.name
          if (fm.description) description = fm.description.trim()
          if (fm.whenToUse) whenToUse = fm.whenToUse.trim()
        } catch {
          // SKILL.md not found or unreadable, still include folder
        }

        items.push({
          id: `${scope}:${source}:${entry.name}`,
          name,
          description,
          whenToUse,
          scope,
          source,
          enabled,
          path: path.join(dirPath, entry.name),
          parentDir,
          filename: entry.name,
          isBundle: true,
        })
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const filePath = path.join(dirPath, entry.name)
        let name = entry.name.slice(0, -3)
        let description = ''
        let whenToUse: string | undefined

        try {
          const content = await fs.promises.readFile(filePath, 'utf8')
          const fm = parseFrontmatter(content)
          if (fm.name) name = fm.name
          if (fm.description) description = fm.description.trim()
          if (fm.whenToUse) whenToUse = fm.whenToUse.trim()
        } catch {}

        items.push({
          id: `${scope}:${source}:${name}`,
          name,
          description,
          whenToUse,
          scope,
          source,
          enabled,
          path: filePath,
          parentDir,
          filename: entry.name,
          isBundle: false,
        })
      }
    }
  } catch {
    // Directory doesn't exist
  }
  return items
}

/** Collect skills for a given parent directory (e.g. <root>/.agents or ~/.dsh) */
async function collectSkillsForParent(
  parentDir: string,
  scope: SkillScope,
  source: SkillSource,
): Promise<SkillItem[]> {
  const activeDir = path.join(parentDir, 'skills')
  const disabledDir = path.join(parentDir, 'skills-disable')
  const legacyDisabledDir = path.join(parentDir, 'skill-disable')
  const nestedDisabledDir = path.join(parentDir, 'skills', 'skills-disable')

  const [activeItems, disabledItems, legacyDisabledItems, nestedDisabledItems] = await Promise.all([
    scanDirectory(activeDir, true, scope, source, parentDir),
    scanDirectory(disabledDir, false, scope, source, parentDir),
    scanDirectory(legacyDisabledDir, false, scope, source, parentDir),
    scanDirectory(nestedDisabledDir, false, scope, source, parentDir),
  ])

  // Merge and deduplicate by filename
  const map = new Map<string, SkillItem>()
  for (const item of activeItems) map.set(item.filename, item)
  for (const item of disabledItems) {
    if (!map.has(item.filename)) map.set(item.filename, item)
  }
  for (const item of legacyDisabledItems) {
    if (!map.has(item.filename)) map.set(item.filename, item)
  }
  for (const item of nestedDisabledItems) {
    if (!map.has(item.filename)) map.set(item.filename, item)
  }

  return Array.from(map.values())
}

/** Normalize a skill parent for duplicate detection across project/global scopes. */
function skillParentKey(parentDir: string): string {
  const resolved = path.resolve(parentDir)
  return process.platform === 'win32' ? resolved.toLowerCase() : resolved
}

/** Read global MCP definitions from ~/.dsh/cordis.patch.yml */
async function readGlobalMcps(cordisPatchPath: string): Promise<McpItem[]> {
  const mcps: McpItem[] = []
  try {
    const content = await fs.promises.readFile(cordisPatchPath, 'utf8')
    const doc = parseDocument(content)
    const contents = doc.contents
    if (isSeq(contents)) {
      for (const item of contents.items) {
        if (isMap(item)) {
          const insertSeq = item.get('insert')
          if (isSeq(insertSeq)) {
            for (const pluginItem of insertSeq.items) {
              if (isMap(pluginItem)) {
                const id = String(pluginItem.get('id') ?? '')
                const name = String(pluginItem.get('name') ?? '')
                const config = pluginItem.get('config')
                const isMcp =
                  name === '@deepseek-ai/dsh-mcp-client' ||
                  id.startsWith('mcp-') ||
                  (isMap(config) && config.has('serverName'))

                if (isMcp) {
                  const serverName = (isMap(config) && String(config.get('serverName') ?? '')) || id
                  const transport = (isMap(config) && String(config.get('transport') ?? '')) || 'stdio'
                  const command = (isMap(config) && config.has('command') ? String(config.get('command')) : undefined)
                  const url = (isMap(config) && config.has('url') ? String(config.get('url')) : undefined)
                  let args: string[] | undefined
                  if (isMap(config) && config.has('args')) {
                    const rawArgs = config.get('args')
                    if (isSeq(rawArgs)) {
                      args = (rawArgs.toJSON() as unknown[]).map(String)
                    }
                  }
                  const rawDisabled = (pluginItem as any).get('disabled')
                  const disabled = rawDisabled === true || rawDisabled === 'true'
                  mcps.push({
                    id,
                    serverName,
                    name,
                    transport,
                    command,
                    url,
                    args,
                    enabled: !disabled,
                    scope: 'global',
                    configPath: cordisPatchPath,
                  })
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('[dsh-mcp-skill-manager] Failed to read cordis.patch.yml:', err)
  }
  return mcps
}

/** Toggle an MCP's disabled property in cordis.patch.yml */
async function toggleMcp(cordisPatchPath: string, payload: ToggleMcpPayload): Promise<boolean> {
  const content = await fs.promises.readFile(cordisPatchPath, 'utf8')
  const doc = parseDocument(content)
  const contents = doc.contents
  let modified = false

  if (isSeq(contents)) {
    for (const item of contents.items) {
      if (isMap(item)) {
        const insertSeq = item.get('insert')
        if (isSeq(insertSeq)) {
          for (const pluginItem of insertSeq.items) {
            if (isMap(pluginItem)) {
              const id = String(pluginItem.get('id') ?? '')
              const config = pluginItem.get('config')
              const serverName = isMap(config) ? String(config.get('serverName') ?? '') : ''
              if (id === payload.id || (payload.serverName && serverName === payload.serverName)) {
                if (payload.enabled) {
                  // Activate: remove disabled property
                  (pluginItem as any).delete('disabled')
                } else {
                  // Deactivate: add disabled: true
                  (pluginItem as any).set('disabled', true)
                }
                modified = true
                break
              }
            }
          }
        }
      }
      if (modified) break
    }
  }

  if (modified) {
    await fs.promises.writeFile(cordisPatchPath, doc.toString(), 'utf8')
    return true
  }
  throw new Error(`MCP server not found in cordis.patch.yml: ${payload.id || payload.serverName}`)
}

/** Open a target file or folder in the host OS default file manager */
async function openNativeFolder(targetPath: string): Promise<boolean> {
  let folderToOpen = path.resolve(targetPath)
  try {
    const st = await fs.promises.stat(folderToOpen)
    if (!st.isDirectory()) {
      folderToOpen = path.dirname(folderToOpen)
    }
  } catch {
    folderToOpen = path.dirname(folderToOpen)
  }

  const platform = process.platform
  if (platform === 'darwin') {
    spawn('open', [folderToOpen], { detached: true, stdio: 'ignore' }).unref()
    return true
  }
  if (platform === 'win32') {
    spawn('explorer.exe', [folderToOpen], { detached: true, stdio: 'ignore' }).unref()
    return true
  }
  spawn('xdg-open', [folderToOpen], { detached: true, stdio: 'ignore' }).unref()
  return true
}

/** Move a skill between skills and skills-disable */
async function toggleSkill(payload: ToggleSkillPayload): Promise<{ newPath: string; enabled: boolean }> {
  const targetDirName = payload.enabled ? 'skills' : 'skills-disable'
  const targetDir = path.join(payload.parentDir, targetDirName)
  await fs.promises.mkdir(targetDir, { recursive: true })
  const targetPath = path.join(targetDir, payload.filename)

  try {
    await fs.promises.rename(payload.path, targetPath)
  } catch (err: any) {
    if (err?.code === 'EXDEV') {
      await fs.promises.cp(payload.path, targetPath, { recursive: true })
      await fs.promises.rm(payload.path, { recursive: true, force: true })
    } else {
      throw err
    }
  }

  return { newPath: targetPath, enabled: payload.enabled }
}

export function apply(ctx: Context): void {
  const connection = ctx.get('connection') as any
  const dshHome = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  const agentsHome = process.env.DSH_AGENTS_HOME || path.join(os.homedir(), '.agents')
  const cordisPatchPath = path.join(dshHome, 'cordis.patch.yml')

  if (connection && connection.rpc) {
    connection.rpc.handle(
      RPC_CHANNEL,
      async (endpoint: string, payload: any): Promise<RpcResult<any>> => {
        try {
          if (endpoint === 'list') {
            // Resolve project root
            let cwd = process.cwd()
            const workspaceRegistry = ctx.get('workspaceRegistry') as any
            if (workspaceRegistry && typeof workspaceRegistry.list === 'function') {
              const workspaces = workspaceRegistry.list()
              if (Array.isArray(workspaces)) {
                if (payload?.sessionId) {
                  const ws = workspaces.find((w: any) => Array.isArray(w.sessionIds) && w.sessionIds.includes(payload.sessionId))
                  if (ws?.path) cwd = ws.path
                } else if (workspaces[0]?.path) {
                  cwd = workspaces[0].path
                }
              }
            }

            const projectRoot = await findProjectRoot(cwd)

            // 1. Project-level skills
            // When the workspace is ~, ~/.dsh and ~/.agents are also the global
            // parents. Scan those directories only once and expose them as global.
            const globalSkillParents = new Set(
              [dshHome, agentsHome].map((parentDir) => skillParentKey(parentDir)),
            )
            const projectDshParent = path.join(projectRoot, '.dsh')
            const projectAgentsParent = path.join(projectRoot, '.agents')
            const [projectDshSkills, projectAgentsSkills] = await Promise.all([
              globalSkillParents.has(skillParentKey(projectDshParent))
                ? Promise.resolve([] as SkillItem[])
                : collectSkillsForParent(projectDshParent, 'project', 'project-dsh'),
              globalSkillParents.has(skillParentKey(projectAgentsParent))
                ? Promise.resolve([] as SkillItem[])
                : collectSkillsForParent(projectAgentsParent, 'project', 'project-agents'),
            ])
            const projectSkills = [...projectDshSkills, ...projectAgentsSkills]

            // 2. Global-level skills
            const [globalDshSkills, globalAgentsSkills] = await Promise.all([
              collectSkillsForParent(dshHome, 'global', 'user-dsh'),
              collectSkillsForParent(agentsHome, 'global', 'user-agents'),
            ])
            const globalSkills = [...globalDshSkills, ...globalAgentsSkills]

            // 3. Global MCPs
            const globalMcps = await readGlobalMcps(cordisPatchPath)

            const data: ManagerData = {
              projectRoot,
              projectSkills,
              globalSkills,
              globalMcps,
            }

            return { ok: true, value: data }
          }

          if (endpoint === 'toggle-skill') {
            const res = await toggleSkill(payload as ToggleSkillPayload)
            return { ok: true, value: res }
          }

          if (endpoint === 'toggle-mcp') {
            await toggleMcp(cordisPatchPath, payload as ToggleMcpPayload)
            return { ok: true, value: { enabled: payload.enabled } }
          }

          if (endpoint === 'open-folder') {
            const targetPath = String(payload?.path ?? '')
            if (targetPath) {
              await openNativeFolder(targetPath)
              return { ok: true, value: { opened: true } }
            }
            return { ok: false, error: { code: 'bad-request', message: 'Path is required' } }
          }

          return {
            ok: false,
            error: { code: 'bad-request', message: `Unknown endpoint: ${endpoint}` },
          }
        } catch (err: any) {
          return {
            ok: false,
            error: { code: 'internal', message: String(err?.message ?? err) },
          }
        }
      },
      { authority: 'loopback' },
    )
  }
}
