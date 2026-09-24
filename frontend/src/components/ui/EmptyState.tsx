import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className = '' }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-border bg-surface px-6 py-14 text-center shadow-card sm:py-20 ${className}`}
    >
      <span className="mb-4 flex size-11 items-center justify-center rounded-lg bg-subtle text-ink-muted">
        <Icon aria-hidden className="size-5" strokeWidth={1.75} />
      </span>
      <h2 className="text-heading text-ink">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-body text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
