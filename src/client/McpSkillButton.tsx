import { useState, useRef, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { McpSkillPopover } from './McpSkillPopover.tsx'

export interface McpSkillButtonProps {
  rpc?: any
  sessionId?: string | undefined
}

export function McpSkillButton({ rpc, sessionId }: McpSkillButtonProps): ReactNode {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)
  const rootRef = useRef<HTMLSpanElement>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  // Close when clicking outside or pressing Escape. The popover is portaled to
  // document.body, so it needs its own inside check in addition to the trigger.
  useEffect(() => {
    if (!open) return
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (
        target &&
        (rootRef.current?.contains(target) || popoverRef.current?.contains(target))
      ) {
        return
      }
      setOpen(false)
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const popover = open ? (
    <McpSkillPopover
      rpc={rpc}
      sessionId={sessionId}
      onClose={() => setOpen(false)}
      anchorRef={rootRef}
      popoverRef={popoverRef}
      portal
    />
  ) : null

  return (
    <span
      ref={rootRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        position: 'relative',
        flex: '0 0 30px',
        width: 30,
        minWidth: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <button
        type="button"
        aria-label="MCP & Skills 管理"
        aria-haspopup="true"
        aria-expanded={open}
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
        {/* 4-block / tools icon */}
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

      {/* Render outside the composer stacking/overflow context on every viewport. */}
      {typeof document === 'undefined' ? popover : popover && createPortal(popover, document.body)}
    </span>
  )
}
