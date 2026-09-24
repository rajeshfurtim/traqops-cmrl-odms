import type { ReactNode } from 'react'

type KbdTone = 'default' | 'inverse'

const TONES: Record<KbdTone, string> = {
  default: 'border border-border bg-surface text-ink-muted',
  inverse: 'bg-on-tooltip/15 text-on-tooltip',
}

interface KbdProps {
  children: ReactNode
  tone?: KbdTone
  className?: string
}

export function Kbd({ children, tone = 'default', className = '' }: KbdProps) {
  return (
    <kbd
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded px-1 font-sans text-[0.6875rem] leading-none font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </kbd>
  )
}
