import { useState, useEffect, useMemo, type ReactNode } from 'react'
import type { ManagerData, McpItem, SkillItem } from '../shared.ts'
import { Switch } from './Switch.tsx'
import styles from './McpSkillManager.module.css'

export interface McpSkillPopoverProps {
  rpc: any
  sessionId?: string | undefined
  onClose: () => void
}

type ListItem =
  | { type: 'skill'; item: SkillItem }
  | { type: 'mcp'; item: McpItem }

export function McpSkillPopover({ rpc, sessionId, onClose }: McpSkillPopoverProps): ReactNode {
  const [data, setData] = useState<ManagerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'project' | 'global'>('all')
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set())

  // Load list from Host
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      if (!rpc) {
        throw new Error('RPC 服务不可用')
      }
      const res = await rpc.call('/mcp-skill-manager', 'list', { sessionId })
      if (res && res.ok) {
        setData(res.value)
      } else {
        throw new Error(res?.error?.message ?? '获取 MCP/Skill 列表失败')
      }
    } catch (err: any) {
      setError(String(err?.message ?? err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [sessionId])

  // Toggle Skill
  const handleToggleSkill = async (skill: SkillItem) => {
    if (togglingIds.has(skill.id)) return
    setTogglingIds((prev) => new Set(prev).add(skill.id))
    const nextState = !skill.enabled

    try {
      const res = await rpc.call('/mcp-skill-manager', 'toggle-skill', {
        path: skill.path,
        parentDir: skill.parentDir,
        filename: skill.filename,
        isBundle: skill.isBundle,
        enabled: nextState,
      })

      if (res && res.ok) {
        setData((prev) => {
          if (!prev) return prev
          const updater = (items: SkillItem[]) =>
            items.map((it) =>
              it.id === skill.id
                ? { ...it, enabled: nextState, path: res.value.newPath }
                : it,
            )
          return {
            ...prev,
            projectSkills: updater(prev.projectSkills),
            globalSkills: updater(prev.globalSkills),
          }
        })
      } else {
        alert(`切换技能失败: ${res?.error?.message ?? '未知错误'}`)
      }
    } catch (err: any) {
      alert(`切换技能失败: ${String(err?.message ?? err)}`)
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(skill.id)
        return next
      })
    }
  }

  // Open folder in OS default file manager
  const handleOpenFolder = async (targetPath?: string) => {
    if (!targetPath) return
    try {
      await rpc.call('/mcp-skill-manager', 'open-folder', { path: targetPath })
    } catch (err: any) {
      console.warn('[dsh-mcp-skill-manager] 打开文件夹失败:', err)
    }
  }

  // Toggle MCP
  const handleToggleMcp = async (mcp: McpItem) => {
    if (togglingIds.has(mcp.id)) return
    setTogglingIds((prev) => new Set(prev).add(mcp.id))
    const nextState = !mcp.enabled

    try {
      const res = await rpc.call('/mcp-skill-manager', 'toggle-mcp', {
        id: mcp.id,
        serverName: mcp.serverName,
        enabled: nextState,
      })

      if (res && res.ok) {
        setData((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            globalMcps: prev.globalMcps.map((it) =>
              it.id === mcp.id ? { ...it, enabled: nextState } : it,
            ),
          }
        })
      } else {
        alert(`切换 MCP 失败: ${res?.error?.message ?? '未知错误'}`)
      }
    } catch (err: any) {
      alert(`切换 MCP 失败: ${String(err?.message ?? err)}`)
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(mcp.id)
        return next
      })
    }
  }

  const query = searchQuery.trim().toLowerCase()

  const filteredProjectSkills = useMemo(() => {
    if (!data) return []
    return data.projectSkills.filter(
      (it) =>
        !query ||
        it.name.toLowerCase().includes(query) ||
        it.description.toLowerCase().includes(query) ||
        it.filename.toLowerCase().includes(query),
    )
  }, [data, query])

  const filteredGlobalSkills = useMemo(() => {
    if (!data) return []
    return data.globalSkills.filter(
      (it) =>
        !query ||
        it.name.toLowerCase().includes(query) ||
        it.description.toLowerCase().includes(query) ||
        it.filename.toLowerCase().includes(query),
    )
  }, [data, query])

  const filteredGlobalMcps = useMemo(() => {
    if (!data) return []
    return data.globalMcps.filter(
      (it) =>
        !query ||
        it.serverName.toLowerCase().includes(query) ||
        it.id.toLowerCase().includes(query) ||
        (it.command && it.command.toLowerCase().includes(query)),
    )
  }, [data, query])

  const projectCount = data ? data.projectSkills.length : 0
  const globalSkillCount = data ? data.globalSkills.length : 0
  const globalMcpCount = data ? data.globalMcps.length : 0

  // Combine into a single list: project level first, then global level
  const visibleItems = useMemo(() => {
    const list: ListItem[] = []
    if (activeTab === 'all' || activeTab === 'project') {
      for (const skill of filteredProjectSkills) {
        list.push({ type: 'skill', item: skill })
      }
    }
    if (activeTab === 'all' || activeTab === 'global') {
      for (const mcp of filteredGlobalMcps) {
        list.push({ type: 'mcp', item: mcp })
      }
      for (const skill of filteredGlobalSkills) {
        list.push({ type: 'skill', item: skill })
      }
    }
    return list
  }, [activeTab, filteredProjectSkills, filteredGlobalMcps, filteredGlobalSkills])

  return (
    <div
      className={styles.popoverMenu}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h4 className={styles.title}>MCP & Skills</h4>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={loadData}
            title="刷新"
            aria-label="刷新"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M13.65 2.35A7.95 7.95 0 0 0 8 0C3.58 0 0 3.58 0 8s3.58 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 8 14c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={onClose}
            title="关闭"
            aria-label="关闭"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="搜索技能或 MCP 服务..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('all')}
          >
            全部 ({projectCount + globalSkillCount + globalMcpCount})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'project' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('project')}
          >
            项目 ({projectCount})
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === 'global' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('global')}
          >
            全局 ({globalSkillCount + globalMcpCount})
          </button>
        </div>
      </div>

      {/* Single Compact List */}
      <div className={styles.listContainer}>
        {loading && !data ? (
          <div className={styles.emptyState}>加载中...</div>
        ) : error ? (
          <div className={styles.emptyState} style={{ color: '#ef4444' }}>
            加载失败: {error}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className={styles.emptyState}>
            {searchQuery ? '无匹配结果' : '暂无相关项'}
          </div>
        ) : (
          <div className={styles.cardList}>
            {visibleItems.map((entry) => {
              if (entry.type === 'skill') {
                const skill = entry.item
                const isToggling = togglingIds.has(skill.id)
                return (
                  <div
                    key={skill.id}
                    className={`${styles.itemCard} ${!skill.enabled ? styles.itemCardDisabled : ''}`}
                    onClick={() => handleOpenFolder(skill.path)}
                    title={`点击打开对应文件夹:\n${skill.path}`}
                  >
                    <div className={styles.itemInfo}>
                      <div className={styles.itemTitleRow}>
                        <span className={styles.itemName} title={skill.name}>
                          {skill.name}
                        </span>
                        <span className={`${styles.itemBadge} ${styles.badgeSkill}`}>
                          Skill
                        </span>
                        <span
                          className={`${styles.itemBadge} ${
                            skill.scope === 'project' ? styles.badgeProject : styles.badgeGlobal
                          }`}
                        >
                          {skill.scope === 'project' ? '项目' : '全局'}
                        </span>
                      </div>
                      {skill.description ? (
                        <div className={styles.itemDesc} title={skill.description}>
                          {skill.description}
                        </div>
                      ) : null}
                    </div>
                    <div className={styles.itemAction} onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={skill.enabled}
                        loading={isToggling}
                        disabled={isToggling}
                        ariaLabel={`切换技能 ${skill.name}`}
                        onChange={() => handleToggleSkill(skill)}
                      />
                    </div>
                  </div>
                )
              } else {
                const mcp = entry.item
                const isToggling = togglingIds.has(mcp.id)
                return (
                  <div
                    key={mcp.id}
                    className={`${styles.itemCard} ${!mcp.enabled ? styles.itemCardDisabled : ''}`}
                    onClick={() => handleOpenFolder(mcp.configPath || undefined)}
                    title={`点击打开配置文件所在目录:\n${mcp.configPath || '~/.dsh/cordis.patch.yml'}`}
                  >
                    <div className={styles.itemInfo}>
                      <div className={styles.itemTitleRow}>
                        <span className={styles.itemName} title={mcp.serverName}>
                          {mcp.serverName}
                        </span>
                        <span className={`${styles.itemBadge} ${styles.badgeMcp}`}>
                          MCP
                        </span>
                        <span className={`${styles.itemBadge} ${styles.badgeGlobal}`}>
                          全局
                        </span>
                      </div>
                      <div
                        className={styles.itemDesc}
                        title={
                          (mcp.command ? `${mcp.command} ${(mcp.args || []).join(' ')}` : '') ||
                          mcp.url ||
                          mcp.transport
                        }
                      >
                        {mcp.transport}
                        {mcp.command ? ` · ${mcp.command} ${(mcp.args || []).join(' ')}` : ''}
                        {mcp.url ? ` · ${mcp.url}` : ''}
                      </div>
                    </div>
                    <div className={styles.itemAction} onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={mcp.enabled}
                        loading={isToggling}
                        disabled={isToggling}
                        ariaLabel={`切换 MCP ${mcp.serverName}`}
                        onChange={() => handleToggleMcp(mcp)}
                      />
                    </div>
                  </div>
                )
              }
            })}
          </div>
        )}
      </div>
    </div>
  )
}
