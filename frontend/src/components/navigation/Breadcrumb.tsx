import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { Crumb } from '@/types'

interface BreadcrumbProps {
  items: Crumb[]
  /**
   * `trail` — full path, long trails collapse their middle.
   * `back`  — only the parent as a back link (compact screens).
   */
  variant?: 'trail' | 'back'
  className?: string
}

const MAX_VISIBLE = 4

export function Breadcrumb({ items, variant = 'trail', className = '' }: BreadcrumbProps) {
  if (variant === 'back') {
    const parent = items.at(-2)
    if (!parent?.to) return null
    return (
      <nav aria-label="Breadcrumb" className={className}>
        <Link
          to={parent.to}
          className="-ml-1 inline-flex h-8 items-center gap-1 rounded-md pr-2 pl-1 text-secondary font-medium text-ink-muted transition-colors hover:text-ink"
        >
          <ChevronLeft aria-hidden className="size-4" strokeWidth={2} />
          {parent.label}
        </Link>
      </nav>
    )
  }

  const visible: (Crumb | 'ellipsis')[] =
    items.length > MAX_VISIBLE ? [items[0], 'ellipsis', ...items.slice(-2)] : items

  return (
    <nav aria-label="Breadcrumb" className={`min-w-0 ${className}`}>
      <ol className="flex min-w-0 items-center gap-1 text-body">
        {visible.map((item, index) => {
          const isLast = index === visible.length - 1
          return (
            <Fragment key={item === 'ellipsis' ? 'ellipsis' : `${item.label}-${index}`}>
              {index > 0 && (
                <li aria-hidden className="flex shrink-0 text-ink-disabled">
                  <ChevronRight className="size-3.5" strokeWidth={2} />
                </li>
              )}
              <li className={`flex min-w-0 ${isLast ? '' : 'shrink-0'}`}>
                {item === 'ellipsis' ? (
                  <span className="px-1 text-ink-muted" aria-label="More levels">
                    …
                  </span>
                ) : isLast || !item.to ? (
                  <span aria-current={isLast ? 'page' : undefined} className="truncate font-semibold text-ink">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.to}
                    className="truncate rounded-sm font-medium text-ink-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
