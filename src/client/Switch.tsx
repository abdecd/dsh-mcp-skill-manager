import { type ReactNode } from 'react'
import styles from './McpSkillManager.module.css'

export interface SwitchProps {
  checked: boolean
  onChange: (next: boolean) => void
  disabled?: boolean
  loading?: boolean
  ariaLabel?: string
}

export function Switch({
  checked,
  onChange,
  disabled = false,
  loading = false,
  ariaLabel,
}: SwitchProps): ReactNode {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled || loading) return
    onChange(!checked)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled || loading) return
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      e.stopPropagation()
      onChange(!checked)
    }
  }

  const trackClass = [
    styles.switchTrack,
    checked ? styles.switchTrackChecked : '',
    disabled || loading ? styles.switchTrackDisabled : '',
  ]
    .filter(Boolean)
    .join(' ')

  const thumbClass = [
    styles.switchThumb,
    checked ? styles.switchThumbChecked : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      tabIndex={disabled || loading ? -1 : 0}
      className={trackClass}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className={thumbClass}>
        {loading && (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className={styles.loadingSpinner} />
          </div>
        )}
      </div>
    </div>
  )
}
