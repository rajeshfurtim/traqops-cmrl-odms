import type { HTMLAttributes, ReactNode } from 'react'

const CARD = 'rounded-xl border border-border bg-surface shadow-card'

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article' | 'nav'
}

export function Card({ as: Tag = 'section', className = '', ...props }: CardProps) {
  return <Tag className={`${CARD} ${className}`} {...props} />
}

interface CardHeaderProps {
  title: ReactNode
  /** Right-aligned: a count, badge or small action. */
  aside?: ReactNode
  id?: string
  className?: string
}

export function CardHeader({ title, aside, id, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <h2 id={id} className="text-heading text-ink">
        {title}
      </h2>
      {aside}
    </div>
  )
}
