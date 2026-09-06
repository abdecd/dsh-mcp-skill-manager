import { useState, type ReactNode } from 'react'
import { McpSkillModal } from './McpSkillModal.tsx'
import styles from './McpSkillManager.module.css'

export interface McpSkillButtonProps {
  rpc?: any
  sessionId?: string | undefined
}

export function McpSkillButton({ rpc, sessionId }: McpSkillButtonProps): ReactNode {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className={`${styles.inputBtn} ${open ? styles.inputBtnActive : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        title="MCP & Skill 管理"
        aria-label="MCP & Skill 管理"
      >
        {/* Tool / Blocks SVG icon */}
        <svg
          width="15"
          height="15"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="2"
            y="2"
            width="5"
            height="5"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <rect
            x="9"
            y="2"
            width="5"
            height="5"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <rect
            x="2"
            y="9"
            width="5"
            height="5"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M9 11.5H14M11.5 9V14"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <McpSkillModal
          rpc={rpc}
          sessionId={sessionId}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
