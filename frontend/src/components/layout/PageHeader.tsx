import type { ReactNode } from 'react'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import type { Crumb } from '@/types'

interface PageHeaderProps {
  title: string
  description?: ReactNode
  /**
   * `auto` (default): the topbar shows the trail on desktop, so the page only
   * adds a compact back link on smaller screens. Pass items to always render a full trail.
   */
  breadcrumb?: 'auto' | Crumb[] | false
  /** Inline status next to the title, e.g. a <Badge>. */
  status?: ReactNode
  /** Page-level actions, right-aligned on desktop and wrapped below on mobile. */
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  breadcrumb = 'auto',
  status,
  actions,
  className = '',
}: PageHeaderProps) {
  const routeCrumbs = useBreadcrumbs()

  return (
    <header className={`mb-5 lg:mb-7 ${className}`}>
      {breadcrumb === 'auto' && <Breadcrumb items={routeCrumbs} variant="back" className="mb-1.5 lg:hidden" />}
      {Array.isArray(breadcrumb) && <Breadcrumb items={breadcrumb} className="mb-2" />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <h1 className="text-title font-semibold text-ink lg:text-title-lg">{title}</h1>
            {status}
          </div>
          {description && <p className="mt-1 max-w-2xl text-body text-ink-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div>}
      </div>
    </header>
  )
}
