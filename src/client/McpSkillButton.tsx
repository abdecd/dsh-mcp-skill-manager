import { useState, type ReactNode } from 'react'
import { McpSkillModal } from './McpSkillModal.tsx'

export interface McpSkillButtonProps {
  rpc?: any
  sessionId?: string | undefined
}

export function McpSkillButton({ rpc, sessionId }: McpSkillButtonProps): ReactNode {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [tooltipVisible, setTooltipVisible] = useState(false)

  return (
    <span
      onMouseEnter={() => {
        setHovered(true)
        setTooltipVisible(true)
      }}
      onMouseLeave={() => {
        setHovered(false)
        setTooltipVisible(false)
      }}
      onFocus={() => setTooltipVisible(true)}
      onBlur={() => setTooltipVisible(false)}
      style={{
        display: 'inline-flex',
        position: 'relative',
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <button
        type="button"
        title="MCP & Skill 管理"
        aria-label="MCP & Skill 管理"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
          padding: 0,
          border: 0,
          borderRadius: 8,
          background: open
            ? 'var(--dsw-alias-interactive-bg-hover-solid, rgba(255, 255, 255, 0.16))'
            : hovered
              ? 'var(--dsw-alias-interactive-bg-hover, rgba(255, 255, 255, 0.08))'
              : 'transparent',
          color: open
            ? 'var(--dsw-alias-state-business-primary, #3b82f6)'
            : hovered
              ? 'var(--dsw-alias-label-primary, #ffffff)'
              : 'var(--dsw-alias-label-secondary, #94a3b8)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        {/* Modern 4-block / puzzle icon for MCP & Skills */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <path d="M14 17.5h7M17.5 14v7" />
        </svg>
      </button>

      {tooltipVisible && !open && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 'calc(100% + 8px)',
            zIndex: 1000,
            transform: 'translateX(-50%)',
            padding: '4px 8px',
            borderRadius: 6,
            background: 'var(--dsw-specific-tip, #1f2329)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            color: 'var(--dsw-alias-label-primary, #fff)',
            fontSize: 12,
            lineHeight: '18px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
          }}
        >
          MCP & Skill 管理
        </span>
      )}

      {open && (
        <McpSkillModal
          rpc={rpc}
          sessionId={sessionId}
          onClose={() => setOpen(false)}
        />
      )}
    </span>
  )
}
