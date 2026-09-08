/**
 * Shared types and RPC contract for dsh-mcp-skill-manager.
 */

export const RPC_CHANNEL = '/mcp-skill-manager'

export type SkillScope = 'project' | 'global'
export type SkillSource = 'project-dsh' | 'project-agents' | 'user-dsh' | 'user-agents' | 'custom'

export interface SkillItem {
  id: string
  name: string
  description: string
  scope: SkillScope
  source: SkillSource
  enabled: boolean
  path: string
  parentDir: string
  filename: string
  isBundle: boolean
  whenToUse?: string | undefined
}

export interface McpItem {
  id: string
  serverName: string
  name: string
  transport: string
  command?: string | undefined
  args?: string[] | undefined
  url?: string | undefined
  enabled: boolean
  scope: 'global'
  configPath?: string | undefined
}

export interface ManagerData {
  projectRoot: string | null
  projectSkills: SkillItem[]
  globalSkills: SkillItem[]
  globalMcps: McpItem[]
}

export interface ToggleSkillPayload {
  path: string
  parentDir: string
  filename: string
  isBundle: boolean
  enabled: boolean
}

export interface ToggleMcpPayload {
  id: string
  serverName?: string | undefined
  enabled: boolean
}

export interface OpenFolderPayload {
  path: string
}

export type RpcResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } }

/**
 * Sort items so that enabled items appear first, while preserving relative order (stable sort).
 */
export function sortByEnabled<T extends { enabled: boolean }>(items: T[]): T[] {
  const enabled: T[] = []
  const disabled: T[] = []
  for (const item of items) {
    if (item.enabled) {
      enabled.push(item)
    } else {
      disabled.push(item)
    }
  }
  return [...enabled, ...disabled]
}

