import { useState, useEffect, useMemo, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { ManagerData, McpItem, SkillItem } from '../shared.ts'
import { Switch } from './Switch.tsx'
import styles from './McpSkillManager.module.css'

export interface McpSkillModalProps {
  rpc: any
  sessionId?: string | undefined
  onClose: () => void
}

export function McpSkillModal({ rpc, sessionId, onClose }: McpSkillModalProps): ReactNode {
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

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

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

  // Filter items
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

  const modalContent = (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.titleRow}>
              <h3 className={styles.title}>MCP & Skill 管理</h3>
            </div>
            <p className={styles.subtitle}>
              先显示项目级，再显示全局级 · 开关即时激活与停用
            </p>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.iconBtn}
              onClick={loadData}
              title="刷新列表"
              aria-label="刷新列表"
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
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
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
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
            placeholder="搜索技能或 MCP 服务名称、描述..."
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
              项目级 ({projectCount})
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'global' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('global')}
            >
              全局级 ({globalSkillCount + globalMcpCount})
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className={styles.content}>
          {loading && !data ? (
            <div className={styles.emptyState}>正在加载 MCP 和 Skill 列表...</div>
          ) : error ? (
            <div className={styles.emptyState} style={{ color: '#ef4444' }}>
              加载失败: {error}
            </div>
          ) : (
            <>
              {/* 1. PROJECT LEVEL SECTION (DISPLAYED FIRST) */}
              {(activeTab === 'all' || activeTab === 'project') && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      📁 项目级技能 (Project Skills)
                    </div>
                    {data?.projectRoot && (
                      <div className={styles.sectionSubtitle} title={data.projectRoot}>
                        项目: {data.projectRoot}
                      </div>
                    )}
                  </div>

                  {filteredProjectSkills.length === 0 ? (
                    <div className={styles.emptyState}>
                      当前项目目录下未发现技能 (支持 .agents/skills 或 .dsh/skills)
                    </div>
                  ) : (
                    <div className={styles.cardList}>
                      {filteredProjectSkills.map((skill) => {
                        const isToggling = togglingIds.has(skill.id)
                        return (
                          <div
                            key={skill.id}
                            className={`${styles.itemCard} ${!skill.enabled ? styles.itemCardDisabled : ''}`}
                          >
                            <div className={styles.itemInfo}>
                              <div className={styles.itemTitleRow}>
                                <span className={styles.itemName}>{skill.name}</span>
                                <span className={`${styles.itemBadge} ${styles.badgeProject}`}>
                                  项目级
                                </span>
                                <span
                                  className={`${styles.itemBadge} ${
                                    skill.enabled
                                      ? styles.badgeActive
                                      : styles.badgeInactive
                                  }`}
                                >
                                  {skill.enabled ? '已激活' : '已停用'}
                                </span>
                              </div>
                              {skill.description ? (
                                <div className={styles.itemDesc}>
                                  {skill.description}
                                </div>
                              ) : null}
                              <div className={styles.itemExtra}>
                                路径: {skill.path}
                              </div>
                            </div>
                            <div className={styles.itemAction}>
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
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 2. GLOBAL LEVEL SECTION (DISPLAYED SECOND) */}
              {(activeTab === 'all' || activeTab === 'global') && (
                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                      🌐 全局级 (Global Level)
                    </div>
                  </div>

                  {/* 2.1 Global MCP Services */}
                  <div style={{ marginTop: '4px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--dsw-alias-label-secondary, #94a3b8)',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      🔌 全局 MCP 服务 (~/.dsh/cordis.patch.yml)
                    </div>

                    {filteredGlobalMcps.length === 0 ? (
                      <div className={styles.emptyState}>
                        ~/.dsh/cordis.patch.yml 中未找到 MCP 配置
                      </div>
                    ) : (
                      <div className={styles.cardList}>
                        {filteredGlobalMcps.map((mcp) => {
                          const isToggling = togglingIds.has(mcp.id)
                          return (
                            <div
                              key={mcp.id}
                              className={`${styles.itemCard} ${!mcp.enabled ? styles.itemCardDisabled : ''}`}
                            >
                              <div className={styles.itemInfo}>
                                <div className={styles.itemTitleRow}>
                                  <span className={styles.itemName}>
                                    {mcp.serverName}
                                  </span>
                                  <span className={`${styles.itemBadge} ${styles.badgeMcp}`}>
                                    全局 MCP
                                  </span>
                                  <span
                                    className={`${styles.itemBadge} ${
                                      mcp.enabled
                                        ? styles.badgeActive
                                        : styles.badgeInactive
                                    }`}
                                  >
                                    {mcp.enabled ? '已激活' : '已停用'}
                                  </span>
                                </div>
                                <div className={styles.itemExtra}>
                                  ID: {mcp.id} · 传输: {mcp.transport}
                                  {mcp.command ? ` · 命令: ${mcp.command} ${(mcp.args || []).join(' ')}` : ''}
                                  {mcp.url ? ` · URL: ${mcp.url}` : ''}
                                </div>
                              </div>
                              <div className={styles.itemAction}>
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
                        })}
                      </div>
                    )}
                  </div>

                  {/* 2.2 Global Skills */}
                  <div style={{ marginTop: '16px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        color: 'var(--dsw-alias-label-secondary, #94a3b8)',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      ⚡ 全局技能 (~/.agents/skills 或 ~/.dsh/skills)
                    </div>

                    {filteredGlobalSkills.length === 0 ? (
                      <div className={styles.emptyState}>未找到全局技能</div>
                    ) : (
                      <div className={styles.cardList}>
                        {filteredGlobalSkills.map((skill) => {
                          const isToggling = togglingIds.has(skill.id)
                          return (
                            <div
                              key={skill.id}
                              className={`${styles.itemCard} ${!skill.enabled ? styles.itemCardDisabled : ''}`}
                            >
                              <div className={styles.itemInfo}>
                                <div className={styles.itemTitleRow}>
                                  <span className={styles.itemName}>{skill.name}</span>
                                  <span className={`${styles.itemBadge} ${styles.badgeGlobal}`}>
                                    全局 Skill
                                  </span>
                                  <span
                                    className={`${styles.itemBadge} ${
                                      skill.enabled
                                        ? styles.badgeActive
                                        : styles.badgeInactive
                                    }`}
                                  >
                                    {skill.enabled ? '已激活' : '已停用'}
                                  </span>
                                </div>
                                {skill.description ? (
                                  <div className={styles.itemDesc}>
                                    {skill.description}
                                  </div>
                                ) : null}
                                <div className={styles.itemExtra}>
                                  路径: {skill.path}
                                </div>
                              </div>
                              <div className={styles.itemAction}>
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
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerTip}>
            <span>💡 停用技能时移动至同级 skill-disable 目录；停用 MCP 则在 cordis.patch.yml 增加 disabled: true</span>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            完成
          </button>
        </div>
      </div>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}
