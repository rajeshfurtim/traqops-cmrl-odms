import type { ReactNode } from 'react'
import { StatusDot, type StatusTone } from './StatusDot'

export type BadgeTone = 'neutral' | 'primary' | StatusTone

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-subtle text-ink-secondary',
  primary: 'bg-primary-subtle text-primary-ink',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  danger: 'bg-danger-subtle text-danger',
  info: 'bg-info-subtle text-info',
}

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone

  dot?: boolean
  className?: string
}

export function Badge({ children, tone = 'neutral', dot = false, className = '' }: BadgeProps) {
  const showDot = dot && tone !== 'neutral' && tone !== 'primary'
  return (
    <span
      className={`inline-flex h-5 shrink-0 items-center gap-1.5 rounded px-1.5 text-caption font-medium whitespace-nowrap ${TONES[tone]} ${className}`}
    >
      {showDot && <StatusDot tone={tone} halo={false} />}
      {children}
    </span>
  )
}

/** Marker for navigation entries that are planned but not yet available. */
export function SoonBadge({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-flex h-5 items-center rounded border border-border px-1.5 text-[0.6875rem] font-medium text-ink-muted ${className}`}
    >
      Soon
    </span>
  )
}
