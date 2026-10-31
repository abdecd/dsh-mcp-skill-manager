import type { Context } from '@deepseek-ai/cordis'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { parseDocument, parse as parseYaml, isSeq, isMap } from 'yaml'
import {
  RPC_CHANNEL,
  sortByEnabled,
  type ManagerData,
  type McpItem,
  type McpScope,
  type RpcResult,
  type SkillItem,
  type SkillScope,
  type SkillSource,
  type ToggleMcpPayload,
  type ToggleSkillPayload,
} from './shared.ts'

export { sortByEnabled } from './shared.ts'
export const name = 'mcp-skill-manager'
// RPC registration delegates to the Host web server through Connection.rpc.
export const inject = ['connection', 'webServer']

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

export interface AllowedPatchPaths {
  profilePatchPath?: string | undefined
  globalPatchPath: string
  globalAgentsMcpPath?: string | undefined
  projectConfigPaths?: string[] | undefined
  projectRoot?: string | undefined
  workspaceRoots?: string[] | undefined
}

/** Determine server-derived allowed patch paths from ProfileContext and environment. */
export function getAllowedPatchPaths(
  ctx: Context,
  dshHome: string,
  projectRoot?: string,
  agentsHome?: string,
  workspaceRoots?: string[],
): AllowedPatchPaths {
  const profileContext = (ctx.get('profileContext') || (ctx as any).profileContext) as {
    patchPath?: string
    home?: string
    dir?: string
    name?: string
  } | undefined

  const globalPatchPath = path.resolve(path.join(profileContext?.home || dshHome, 'cordis.patch.yml'))
  const rawProfilePatchPath = profileContext?.patchPath ? path.resolve(profileContext.patchPath) : undefined
  const profilePatchPath =
    rawProfilePatchPath && rawProfilePatchPath !== globalPatchPath ? rawProfilePatchPath : undefined

  const resolvedAgentsHome = agentsHome || process.env.DSH_AGENTS_HOME || path.join(os.homedir(), '.agents')
  const globalAgentsMcpPath = path.resolve(path.join(resolvedAgentsHome, 'mcp.json'))

  let projectConfigPaths: string[] | undefined
  let resolvedProjectRoot: string | undefined
  if (projectRoot) {
    resolvedProjectRoot = path.resolve(projectRoot)
    projectConfigPaths = [
      path.resolve(path.join(resolvedProjectRoot, '.agents', 'mcp.json')),
      path.resolve(path.join(resolvedProjectRoot, '.dsh', 'mcp.json')),
      path.resolve(path.join(resolvedProjectRoot, 'mcp.json')),
      path.resolve(path.join(resolvedProjectRoot, '.dsh', 'cordis.patch.yml')),
    ]
  }

  return {
    profilePatchPath,
    globalPatchPath,
    globalAgentsMcpPath,
    projectConfigPaths,
    projectRoot: resolvedProjectRoot,
    workspaceRoots: workspaceRoots ? workspaceRoots.map((w) => path.resolve(w)) : undefined,
  }
}

/** Read MCP definitions from a cordis.patch.yml file */
export async function readMcpsFromFile(
  cordisPatchPath: string,
  scope: McpScope,
): Promise<McpItem[]> {
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
                const rawId = String(pluginItem.get('id') ?? '')
                const name = String(pluginItem.get('name') ?? '')
                const config = pluginItem.get('config')
                const isMcp =
                  name === '@deepseek-ai/dsh-mcp-client' ||
                  rawId.startsWith('mcp-') ||
                  (isMap(config) && config.has('serverName'))

                if (isMcp) {
                  const serverName = (isMap(config) && String(config.get('serverName') ?? '')) || rawId
                  const transport = (isMap(config) && String(config.get('transport') ?? '')) || 'stdio'
                  const command = (isMap(config) && config.has('command') ? String(config.get('command')) : undefined)
                  const url = (isMap(config) && config.has('url') ? String(config.get('url')) : undefined)
                  let args: string[] | undefined
                  if (isMap(config) && config.has('args')) {
                    const rawArgs = config.get('args')
                    if (isSeq(rawArgs)) {
                      args = rawArgs.items.map((it) => String(it))
                    }
                  }
                  const disabled = Boolean(pluginItem.get('disabled'))
                  mcps.push({
                    id: `${scope}:${rawId || serverName}`,
                    serverName,
                    name,
                    transport,
                    command,
                    args,
                    url,
                    enabled: !disabled,
                    scope,
                    configPath: path.resolve(cordisPatchPath),
                  })
                }
              }
            }
          }
        }
      }
    }
  } catch (err: any) {
    if (err?.code !== 'ENOENT') {
      console.warn(`[dsh-mcp-skill-manager] Failed to read ${cordisPatchPath}:`, err)
    }
  }
  return mcps
}

/** Read MCP definitions from a JSON file (e.g. .agents/mcp.json, .dsh/mcp.json, or mcp.json) */
export async function readMcpsFromJsonFile(
  filePath: string,
  scope: McpScope,
): Promise<McpItem[]> {
  const mcps: McpItem[] = []
  try {
    const content = await fs.promises.readFile(filePath, 'utf8')
    const json = JSON.parse(content)
    const servers =
      json?.mcpServers ||
      json?.servers ||
      (typeof json === 'object' && json !== null && !Array.isArray(json) && !json.command ? json : null)

    if (servers && typeof servers === 'object') {
      for (const [serverName, rawConfig] of Object.entries(servers)) {
        if (!rawConfig || typeof rawConfig !== 'object') continue
        const cfg = rawConfig as Record<string, any>
        const command = typeof cfg.command === 'string' ? cfg.command : undefined
        const url = typeof cfg.url === 'string' ? cfg.url : undefined
        const transport = typeof cfg.transport === 'string' ? cfg.transport : (url ? 'sse' : 'stdio')
        let args: string[] | undefined
        if (Array.isArray(cfg.args)) {
          args = cfg.args.map((a) => String(a))
        }
        const disabled = cfg.disabled === true

        mcps.push({
          id: `${scope}:${serverName}`,
          serverName,
          name: serverName,
          transport,
          command,
          args,
          url,
          enabled: !disabled,
          scope,
          configPath: path.resolve(filePath),
        })
      }
    }
  } catch (err: any) {
    if (err?.code !== 'ENOENT') {
      console.warn(`[dsh-mcp-skill-manager] Failed to read ${filePath}:`, err)
    }
  }
  return mcps
}

/** Collect project-level MCPs from .agents/mcp.json, .dsh/mcp.json, mcp.json, or .dsh/cordis.patch.yml */
export async function collectProjectMcps(
  projectRoot: string,
  ignorePaths?: Set<string>,
): Promise<McpItem[]> {
  const resolvedRoot = path.resolve(projectRoot)
  const candidates = [
    path.join(resolvedRoot, '.agents', 'mcp.json'),
    path.join(resolvedRoot, '.dsh', 'mcp.json'),
    path.join(resolvedRoot, 'mcp.json'),
    path.join(resolvedRoot, '.dsh', 'cordis.patch.yml'),
  ]

  const items: McpItem[] = []
  const seenNames = new Set<string>()

  for (const candidate of candidates) {
    const resolvedCandidate = path.resolve(candidate)
    if (ignorePaths && ignorePaths.has(resolvedCandidate)) {
      continue
    }

    let mcps: McpItem[] = []
    if (candidate.endsWith('.json')) {
      mcps = await readMcpsFromJsonFile(candidate, 'project')
    } else if (candidate.endsWith('.yml') || candidate.endsWith('.yaml')) {
      mcps = await readMcpsFromFile(candidate, 'project')
    }

    for (const mcp of mcps) {
      if (!seenNames.has(mcp.serverName)) {
        seenNames.add(mcp.serverName)
        items.push(mcp)
      }
    }
  }

  return items
}

/** Toggle an MCP's disabled property in a JSON file */
export async function toggleJsonMcp(
  filePath: string,
  payload: ToggleMcpPayload,
): Promise<boolean> {
  const content = await fs.promises.readFile(filePath, 'utf8')
  const json = JSON.parse(content)
  const servers = json?.mcpServers || json?.servers || json

  const rawId = payload.id ? payload.id.replace(/^(project|profile|global):/, '') : ''
  const targetName = payload.serverName || rawId
  if (!targetName || !servers || typeof servers !== 'object' || !servers[targetName]) {
    throw new Error(`MCP server "${targetName}" not found in ${filePath}`)
  }

  const serverObj = servers[targetName]
  if (payload.enabled) {
    delete serverObj.disabled
  } else {
    serverObj.disabled = true
  }

  await fs.promises.writeFile(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8')
  return true
}

/** Toggle an MCP in a YAML cordis.patch.yml file */
async function toggleYamlMcp(
  candidatePath: string,
  payload: ToggleMcpPayload,
  rawId: string,
): Promise<boolean> {
  const content = await fs.promises.readFile(candidatePath, 'utf8')
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
              if (
                (rawId && id === rawId) ||
                (payload.id && id === payload.id) ||
                (payload.serverName && (serverName === payload.serverName || id === payload.serverName))
              ) {
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
    await fs.promises.writeFile(candidatePath, doc.toString(), 'utf8')
    return true
  }
  return false
}

/** Toggle an MCP's disabled property in allowed files (JSON or YAML) */
export async function toggleMcp(
  allowedPaths: AllowedPatchPaths,
  payload: ToggleMcpPayload,
): Promise<boolean> {
  const { profilePatchPath, globalPatchPath, globalAgentsMcpPath, projectConfigPaths, projectRoot, workspaceRoots } = allowedPaths

  // Strictly validate target path against server-derived allowlist
  let targetPath: string | undefined
  if (payload.configPath) {
    const resolvedPayloadPath = path.resolve(payload.configPath)
    const isGlobal =
      resolvedPayloadPath === globalPatchPath ||
      Boolean(globalAgentsMcpPath && resolvedPayloadPath === globalAgentsMcpPath)
    const isProfile = Boolean(profilePatchPath && resolvedPayloadPath === profilePatchPath)
    const isProjectConfig = Boolean(projectConfigPaths && projectConfigPaths.includes(resolvedPayloadPath))

    const isAllowedConfigName =
      resolvedPayloadPath.endsWith(`${path.sep}.agents${path.sep}mcp.json`) ||
      resolvedPayloadPath.endsWith(`${path.sep}.dsh${path.sep}mcp.json`) ||
      resolvedPayloadPath.endsWith(`${path.sep}mcp.json`) ||
      resolvedPayloadPath.endsWith(`${path.sep}.dsh${path.sep}cordis.patch.yml`)

    const isInsideProject = Boolean(
      projectRoot &&
      resolvedPayloadPath.startsWith(projectRoot + path.sep) &&
      isAllowedConfigName
    )
    const isInsideWorkspace = Boolean(
      workspaceRoots &&
      workspaceRoots.some((ws) => resolvedPayloadPath.startsWith(ws + path.sep)) &&
      isAllowedConfigName
    )

    if (!isGlobal && !isProfile && !isProjectConfig && !isInsideProject && !isInsideWorkspace) {
      throw new Error(`Forbidden: target config path is not an allowed profile, global patch, or project config file: ${payload.configPath}`)
    }

    // Verify consistency between scope and configPath to prevent functional mismatch
    if (payload.scope === 'profile' && (!profilePatchPath || resolvedPayloadPath !== profilePatchPath)) {
      throw new Error(`Invalid request: scope "profile" does not match configPath: ${payload.configPath}`)
    }
    if (payload.scope === 'global' && !isGlobal) {
      throw new Error(`Invalid request: scope "global" does not match configPath: ${payload.configPath}`)
    }
    if (payload.scope === 'project' && !isProjectConfig && !isInsideProject && !isInsideWorkspace) {
      throw new Error(`Invalid request: scope "project" does not match configPath: ${payload.configPath}`)
    }
    targetPath = resolvedPayloadPath
  } else if (payload.scope === 'profile') {
    if (!profilePatchPath) {
      throw new Error('Profile patch path is not available in current profileContext')
    }
    targetPath = profilePatchPath
  } else if (payload.scope === 'global') {
    targetPath = globalPatchPath
  }

  // If targetPath is not yet determined, search candidate files in order:
  const candidatePaths: string[] = targetPath
    ? [targetPath]
    : [
        ...(payload.scope === 'project' ? (projectConfigPaths || []) : []),
        ...(payload.scope !== 'global' && payload.scope !== 'project' ? (profilePatchPath ? [profilePatchPath] : []) : []),
        ...(payload.scope !== 'profile' && payload.scope !== 'project'
          ? [globalPatchPath, ...(globalAgentsMcpPath ? [globalAgentsMcpPath] : [])]
          : []),
        ...(payload.scope === undefined
          ? [
              ...(profilePatchPath ? [profilePatchPath] : []),
              globalPatchPath,
              ...(globalAgentsMcpPath ? [globalAgentsMcpPath] : []),
              ...(projectConfigPaths || []),
            ]
          : []),
      ].filter((p): p is string => Boolean(p))

  // Strip possible scope prefix for ID matching
  const rawId = payload.id ? payload.id.replace(/^(project|profile|global):/, '') : ''

  for (const candidatePath of candidatePaths) {
    try {
      if (candidatePath.endsWith('.json')) {
        const ok = await toggleJsonMcp(candidatePath, payload)
        if (ok) return true
      } else {
        const ok = await toggleYamlMcp(candidatePath, payload, rawId)
        if (ok) return true
      }
    } catch (err: any) {
      if (err?.code !== 'ENOENT') {
        throw err
      }
    }
  }

  throw new Error(`MCP server not found in allowed patch/config files: ${payload.id || payload.serverName}`)
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

let cachedMcpClientPlugin: any = null

/** Safe resolver for the @deepseek-ai/dsh-mcp-client plugin without uninjected property access */
export async function resolveMcpClientPlugin(ctx: Context): Promise<any> {
  if (cachedMcpClientPlugin) return cachedMcpClientPlugin

  // 1. Try finding from active Cordis registry
  try {
    const registry = (ctx as any).root?.registry || (ctx as any).registry
    if (registry && typeof registry.get === "function") {
      try {
        const found = registry.get("@deepseek-ai/dsh-mcp-client")
        if (found) return found
      } catch {}
    }
    if (registry && typeof registry.values === 'function') {
      for (const runtime of registry.values()) {
        if (
          runtime &&
          (runtime.name === 'mcp-client' ||
            runtime.name === 'dsh-mcp-client' ||
            runtime.name === '@deepseek-ai/dsh-mcp-client')
        ) {
          cachedMcpClientPlugin = {
            name: runtime.name || 'mcp-client',
            apply: runtime.callback,
            Config: runtime.Config,
            inject: ['tools'],
          }
          return cachedMcpClientPlugin
        }
      }
    }
  } catch {}

  // 2. Direct package import
  try {
    const pkg = '@deepseek-ai/dsh-mcp-client';
    const mod = await import(/* @vite-ignore */ pkg)
    if (mod && (typeof mod.apply === 'function' || typeof mod.default === 'function')) {
      cachedMcpClientPlugin = mod.default || mod
      return cachedMcpClientPlugin
    }
  } catch {}

  // 3. Search in global pnpm directories / DSH directories
  try {
    const pnpmGlobal = path.join(os.homedir(), '.local/share/pnpm/global')
    const candidates: string[] = []
    if (fs.existsSync(pnpmGlobal)) {
      const v11 = path.join(pnpmGlobal, 'v11')
      if (fs.existsSync(v11)) {
        for (const sub of fs.readdirSync(v11)) {
          const pnpmDir = path.join(v11, sub, 'node_modules/.pnpm')
          if (fs.existsSync(pnpmDir)) {
            for (const entry of fs.readdirSync(pnpmDir)) {
              if (
                entry.startsWith('@deepseek-ai+dsh-mcp-client@') ||
                entry === '@deepseek-ai+dsh-mcp-client'
              ) {
                const target = path.join(
                  pnpmDir,
                  entry,
                  'node_modules/@deepseek-ai/dsh-mcp-client/lib/index.js',
                )
                if (fs.existsSync(target)) candidates.push(target)
              }
            }
          }
        }
      }
    }

    for (const c of candidates) {
      try {
        const mod = await import(c)
        if (mod && (typeof mod.apply === 'function' || typeof mod.default === 'function')) {
          cachedMcpClientPlugin = mod.default || mod
          return cachedMcpClientPlugin
        }
      } catch {}
    }
  } catch {}

  return null
}

/** Runtime manager to dynamically mount/unmount Project MCP Client instances in Cordis */
/** Find and dispose any running global MCP Client fiber in Cordis matching serverName */
export function disposeGlobalMcp(ctx: Context, serverName: string): boolean {
  let disposed = false
  try {
    const registry = (ctx as any).root?.registry || (ctx as any).registry
    if (registry && typeof registry.values === 'function') {
      for (const runtime of registry.values()) {
        if (
          runtime &&
          (runtime.name === 'mcp-client' ||
            runtime.name === 'dsh-mcp-client' ||
            runtime.name === '@deepseek-ai/dsh-mcp-client')
        ) {
          if (runtime.fibers && typeof runtime.fibers[Symbol.iterator] === 'function') {
            for (const fiber of Array.from(runtime.fibers)) {
              const fiberConfig = (fiber as any)?.config
              if (fiberConfig && fiberConfig.serverName === serverName) {
                try {
                  if (typeof (fiber as any).dispose === 'function') {
                    ;(fiber as any).dispose()
                    disposed = true
                  }
                } catch (err) {
                  console.warn(`[dsh-mcp-skill-manager] Failed to dispose global fiber for ${serverName}:`, err)
                }
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn(`[dsh-mcp-skill-manager] Failed to search global fibers for ${serverName}:`, err)
  }
  return disposed
}

/** Compute a stable 4-character hex hash from projectRoot for namespace collision avoidance */
export function getProjectHash(projectRoot: string): string {
  const resolved = path.resolve(projectRoot)
  const key = process.platform === 'win32' ? resolved.toLowerCase() : resolved
  return createHash('sha256').update(key).digest('hex').slice(0, 4)
}

/**
 * Generate a collision-safe runtime serverName under DSH length constraint (max 32 chars).
 * Example: "kwin-mcp" -> "kwin-mcp-a1b2"
 */
export function toScopedServerName(serverName: string, projectRoot: string): string {
  const hash = getProjectHash(projectRoot)
  const maxBaseLen = 32 - 1 - hash.length // 32 - 1 - 4 = 27
  const base = serverName.slice(0, maxBaseLen)
  return `${base}-${hash}`
}

export class ProjectMcpRuntime {
  // Key: normalizedProjectRoot -> Map<serverName, Fork>
  private projectForks = new Map<string, Map<string, any>>()

  constructor(private ctx: Context) {
    if (typeof (this.ctx as any).on === 'function') {
      ;(this.ctx as any).on('dispose', () => {
        this.disposeAll()
      })
    }
  }

  private normalizeProjectRoot(projectRoot: string): string {
    const resolved = path.resolve(projectRoot)
    return process.platform === 'win32' ? resolved.toLowerCase() : resolved
  }

  public getKey(configPath: string, serverName: string): string {
    return `${path.resolve(configPath)}:${serverName}`
  }

  async mount(item: McpItem, projectRoot: string): Promise<boolean> {
    if (!item.configPath) return false
    const rootKey = this.normalizeProjectRoot(projectRoot)
    let forksMap = this.projectForks.get(rootKey)
    if (!forksMap) {
      forksMap = new Map()
      this.projectForks.set(rootKey, forksMap)
    }

    // Unmount previous instance of this server in this project
    this.unmount(item.serverName, projectRoot)

    try {
      const mcpClientPlugin = await resolveMcpClientPlugin(this.ctx)

      if (mcpClientPlugin) {
        const mountCtx = typeof (this.ctx as any).root?.plugin === 'function' ? (this.ctx as any).root : this.ctx
        if (typeof mountCtx.plugin === 'function') {
          const runtimeServerName = toScopedServerName(item.serverName, projectRoot)
          const fork = mountCtx.plugin(mcpClientPlugin, {
            serverName: runtimeServerName,
            transport: item.transport,
            command: item.command,
            args: item.args,
            url: item.url,
            cwd: path.resolve(projectRoot),
            env: process.env,
          })
          forksMap.set(item.serverName, fork)
          return true
        }
      } else {
        console.warn(`[dsh-mcp-skill-manager] MCP client module could not be resolved for ${item.serverName}`)
      }
    } catch (err) {
      console.warn(`[dsh-mcp-skill-manager] Dynamic mount failed for ${item.serverName} in ${projectRoot}:`, err)
    }
    return false
  }

  unmount(serverName: string, projectRoot?: string): boolean {
    if (projectRoot) {
      const rootKey = this.normalizeProjectRoot(projectRoot)
      const forksMap = this.projectForks.get(rootKey)
      if (forksMap && forksMap.has(serverName)) {
        const fork = forksMap.get(serverName)
        try {
          if (typeof fork?.dispose === 'function') {
            fork.dispose()
          }
        } catch (err) {
          console.warn(`[dsh-mcp-skill-manager] Dynamic unmount error for ${serverName} in ${projectRoot}:`, err)
        }
        forksMap.delete(serverName)
        return true
      }
      return false
    }

    // Search across all projects if projectRoot not specified
    let unmounted = false
    for (const map of this.projectForks.values()) {
      if (map.has(serverName)) {
        const fork = map.get(serverName)
        try {
          if (typeof fork?.dispose === 'function') {
            fork.dispose()
          }
        } catch {}
        map.delete(serverName)
        unmounted = true
      }
    }
    return unmounted
  }

  /**
   * Reconcile mounted MCPs for a specific project ONLY.
   * Other projects running in parallel are completely preserved and NOT disposed.
   */
  async syncProject(projectRoot: string, projectMcps: McpItem[]): Promise<void> {
    const rootKey = this.normalizeProjectRoot(projectRoot)
    let forksMap = this.projectForks.get(rootKey)
    if (!forksMap) {
      forksMap = new Map()
      this.projectForks.set(rootKey, forksMap)
    }

    const desiredServers = new Set<string>()
    const desiredItems: McpItem[] = []

    for (const mcp of projectMcps) {
      if (mcp.enabled) {
        desiredServers.add(mcp.serverName)
        desiredItems.push(mcp)
      }
    }

    // 1. Dispose only the disabled or removed servers WITHIN THIS PROJECT
    for (const [serverName, fork] of Array.from(forksMap.entries())) {
      if (!desiredServers.has(serverName)) {
        try {
          if (typeof fork?.dispose === 'function') {
            fork.dispose()
          }
        } catch (err) {
          console.warn(`[dsh-mcp-skill-manager] Project ${projectRoot} unmount error for ${serverName}:`, err)
        }
        forksMap.delete(serverName)
      }
    }

    // 2. Mount desired items for this project if not already mounted
    for (const item of desiredItems) {
      if (!forksMap.has(item.serverName)) {
        await this.mount(item, projectRoot)
      }
    }
  }

  getMountedCount(): number {
    let total = 0
    for (const map of this.projectForks.values()) {
      total += map.size
    }
    return total
  }

  isMounted(serverName: string, projectRoot?: string): boolean {
    if (projectRoot) {
      const rootKey = this.normalizeProjectRoot(projectRoot)
      return Boolean(this.projectForks.get(rootKey)?.has(serverName))
    }
    for (const map of this.projectForks.values()) {
      if (map.has(serverName)) return true
    }
    return false
  }

  disposeAll(): void {
    for (const map of this.projectForks.values()) {
      for (const fork of map.values()) {
        try {
          if (typeof fork?.dispose === 'function') {
            fork.dispose()
          }
        } catch {}
      }
      map.clear()
    }
    this.projectForks.clear()
  }
}

export function apply(ctx: Context): void {
  const connection = ctx.get('connection') as any
  const dshHome = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  const agentsHome = process.env.DSH_AGENTS_HOME || path.join(os.homedir(), '.agents')
  const mcpRuntime = new ProjectMcpRuntime(ctx)

  // Session-level Tool Isolation:
  // Ensure that project-scoped MCP tools (suffixed with project hash) are ONLY visible to sessions
  // belonging to that exact project, eliminating cross-project tool contamination.
  if (typeof (ctx as any).on === 'function') {
    ;(ctx as any).on('system-prompt/assemble', async (_assembly: any, context: any, next: any) => {
      const res = await next()
      try {
        if (!res || !Array.isArray(res.tools)) return res
        const session = context?.agent?.session
        let sessionCwd = session?.header?.cwd
        const sessionId = session?.id

        if (!sessionCwd && sessionId) {
          const workspaceRegistry = ctx.get('workspaceRegistry') as any
          if (workspaceRegistry && typeof workspaceRegistry.list === 'function') {
            const list = workspaceRegistry.list()
            if (Array.isArray(list)) {
              const ws = list.find((w: any) => Array.isArray(w.sessionIds) && w.sessionIds.includes(sessionId))
              if (ws?.path) sessionCwd = ws.path
            }
          }
        }

        let currentHash: string | null = null
        if (sessionCwd) {
          const projectRoot = await findProjectRoot(sessionCwd)
          if (projectRoot) currentHash = getProjectHash(projectRoot)
        }

        // Filter out any project MCP tools that belong to other projects
        res.tools = res.tools.filter((tool: any) => {
          if (!tool || typeof tool.name !== 'string') return true
          const match = tool.name.match(/^mcp__.*-([a-f0-9]{4})__/)
          if (match) {
            const toolHash = match[1]
            return currentHash !== null && toolHash === currentHash
          }
          return true
        })
      } catch (err) {
        console.warn('[dsh-mcp-skill-manager] Tool isolation filter error:', err)
      }
      return res
    })
  }

  // Guard against unauthorized cross-project tool execution
  try {
    const toolsService = ctx.get('tools') as any
    if (toolsService && typeof toolsService.guard === 'function') {
      toolsService.guard((exec: any) => {
        if (!exec || typeof exec.name !== 'string') return undefined
        const match = exec.name.match(/^mcp__.*-([a-f0-9]{4})__/)
        if (match) {
          const toolHash = match[1]
          const sessionCwd = exec.agent?.session?.header?.cwd
          if (!sessionCwd) return 'Denied: unable to verify session project root for project-level tool'
          const expectedHash = getProjectHash(path.resolve(sessionCwd))
          if (toolHash !== expectedHash) {
            return `Denied: tool ${exec.name} belongs to another project and cannot be called from this session.`
          }
        }
        return undefined
      })
    }
  } catch {}




  if (connection && connection.rpc) {
    connection.rpc.handle(
      RPC_CHANNEL,
      async (endpoint: string, payload: any): Promise<RpcResult<any>> => {
        try {
          // Precise Resolution of project root & workspace roots per session
          const workspaceRegistry = ctx.get('workspaceRegistry') as any
          let workspaces: any[] = []
          if (workspaceRegistry && typeof workspaceRegistry.list === 'function') {
            const list = workspaceRegistry.list()
            if (Array.isArray(list)) workspaces = list
          }

          const workspaceRoots = workspaces.map((w: any) => w?.path).filter((p): p is string => Boolean(p))

          let cwd: string | null = null

          // 1. Try finding workspace matching current sessionId
          if (payload?.sessionId && workspaces.length > 0) {
            const ws = workspaces.find((w: any) => Array.isArray(w.sessionIds) && w.sessionIds.includes(payload.sessionId))
            if (ws?.path) cwd = ws.path
          }

          // 2. Try querying global sessions service for session header cwd
          if (!cwd && payload?.sessionId) {
            try {
              const sessionsService = ctx.get('sessions') as any
              if (sessionsService) {
                const s = typeof sessionsService.get === 'function'
                  ? sessionsService.get(payload.sessionId)
                  : (sessionsService.store?.get?.(payload.sessionId) || sessionsService.list?.get?.(payload.sessionId))
                if (s?.header?.cwd) cwd = s.header.cwd
              }
            } catch {}
          }

          // 3. Try matching payload configPath or path to workspaces
          if (!cwd && payload?.configPath && workspaces.length > 0) {
            const resolvedConfig = path.resolve(payload.configPath)
            const matchedWs = workspaces.find((w: any) => w?.path && (resolvedConfig === path.resolve(w.path) || resolvedConfig.startsWith(path.resolve(w.path) + path.sep)))
            if (matchedWs?.path) cwd = matchedWs.path
          }

          if (!cwd && payload?.path && workspaces.length > 0) {
            const resolvedTarget = path.resolve(payload.path)
            const matchedWs = workspaces.find((w: any) => w?.path && (resolvedTarget === path.resolve(w.path) || resolvedTarget.startsWith(path.resolve(w.path) + path.sep)))
            if (matchedWs?.path) cwd = matchedWs.path
          }

          // 4. If payload specifies an explicit path
          if (!cwd && payload?.path) {
            cwd = path.resolve(payload.path)
          }

          // 5. Fallback to process.cwd() or single workspace only if sessionId not provided
          if (!cwd && !payload?.sessionId) {
            if (workspaces.length === 1 && workspaces[0]?.path) {
              cwd = workspaces[0].path
            } else {
              cwd = process.cwd()
            }
          }

          const projectRoot = cwd ? await findProjectRoot(cwd) : null
          const allowedPaths = getAllowedPatchPaths(ctx, dshHome, projectRoot || undefined, agentsHome, workspaceRoots)

          if (endpoint === 'list') {
            // 1. Project-level skills (only if projectRoot resolved)
            const globalSkillParents = new Set(
              [dshHome, agentsHome].map((parentDir) => skillParentKey(parentDir)),
            )
            let projectSkills: SkillItem[] = []
            let projectMcps: McpItem[] = []

            if (projectRoot) {
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
              projectSkills = sortByEnabled([...projectDshSkills, ...projectAgentsSkills])

              // Project-level MCPs
              const globalMcpPaths = new Set([
                allowedPaths.globalPatchPath,
                ...(allowedPaths.globalAgentsMcpPath ? [allowedPaths.globalAgentsMcpPath] : []),
                ...(allowedPaths.profilePatchPath ? [allowedPaths.profilePatchPath] : []),
              ])
              projectMcps = sortByEnabled(await collectProjectMcps(projectRoot, globalMcpPaths))

              // Reconcile and synchronize project-level MCPs for THIS project
              await mcpRuntime.syncProject(projectRoot, projectMcps)
            }

            // 2. Global-level skills
            const [globalDshSkills, globalAgentsSkills] = await Promise.all([
              collectSkillsForParent(dshHome, 'global', 'user-dsh'),
              collectSkillsForParent(agentsHome, 'global', 'user-agents'),
            ])
            const globalSkills = sortByEnabled([...globalDshSkills, ...globalAgentsSkills])

            // 4. Profile & Global MCPs (.dsh/cordis.patch.yml + .agents/mcp.json)
            const [profileMcps, globalPatchMcps, globalAgentsMcps] = await Promise.all([
              allowedPaths.profilePatchPath
                ? readMcpsFromFile(allowedPaths.profilePatchPath, 'profile')
                : Promise.resolve([] as McpItem[]),
              readMcpsFromFile(allowedPaths.globalPatchPath, 'global'),
              allowedPaths.globalAgentsMcpPath
                ? readMcpsFromJsonFile(allowedPaths.globalAgentsMcpPath, 'global')
                : Promise.resolve([] as McpItem[]),
            ])

            // Deduplicate global MCPs by serverName
            const seenGlobalNames = new Set<string>()
            const combinedGlobalMcps: McpItem[] = []
            for (const m of [...profileMcps, ...globalPatchMcps, ...globalAgentsMcps]) {
              if (!seenGlobalNames.has(m.serverName)) {
                seenGlobalNames.add(m.serverName)
                combinedGlobalMcps.push(m)
              }
            }
            const globalMcps = sortByEnabled(combinedGlobalMcps)

            const data: ManagerData = {
              projectRoot,
              projectSkills,
              globalSkills,
              projectMcps,
              globalMcps,
            }

            return { ok: true, value: data }
          }

          if (endpoint === 'toggle-skill') {
            const res = await toggleSkill(payload as ToggleSkillPayload)
            return { ok: true, value: res }
          }

          if (endpoint === 'toggle-mcp') {
            await toggleMcp(allowedPaths, payload as ToggleMcpPayload)

            const rawId = payload.id ? payload.id.replace(/^(project|profile|global):/, '') : ''
            const targetServerName = payload.serverName || rawId

            // Dynamic Cordis mount/unmount synchronization for project MCPs
            const targetScope = payload.scope || (payload.configPath && allowedPaths.projectConfigPaths?.includes(path.resolve(payload.configPath)) ? 'project' : undefined)
            if (targetScope === 'project' && projectRoot) {
              const globalMcpPaths = new Set([
                allowedPaths.globalPatchPath,
                ...(allowedPaths.globalAgentsMcpPath ? [allowedPaths.globalAgentsMcpPath] : []),
                ...(allowedPaths.profilePatchPath ? [allowedPaths.profilePatchPath] : []),
              ])
              const updatedProjectMcps = await collectProjectMcps(projectRoot, globalMcpPaths)
              await mcpRuntime.syncProject(projectRoot, updatedProjectMcps)
            } else if (!payload.enabled && targetServerName) {
              // If a Global or Profile MCP is turned off, immediately dispose any running fiber in Cordis
              // so that the background process is terminated and tools are immediately unregistered from ctx.tools!
              disposeGlobalMcp(ctx, targetServerName)
            }

            return { ok: true, value: { enabled: payload.enabled } }
          }

          if (endpoint === 'open-folder') {
            const targetPath = String(payload?.path ?? '')
            if (targetPath) {
              await openNativeFolder(targetPath)
              return { ok: true, value: { opened: true } }
            }
            return {
              ok: false,
              error: { code: 'bad-request', message: 'Path is required', details: {} },
            }
          }

          return {
            ok: false,
            error: { code: 'bad-request', message: `Unknown endpoint: ${endpoint}`, details: {} },
          }
        } catch (err: any) {
          return {
            ok: false,
            error: { code: 'internal', message: String(err?.message ?? err), details: {} },
          }
        }
      },
      { authority: 'loopback' },
    )
  }
}
