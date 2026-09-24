import type { ReactNode } from 'react'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import type { Crumb } from '@/types'

interface PageHeaderProps {
  title: string
  description?: ReactNode

  breadcrumb?: 'auto' | Crumb[] | false

  status?: ReactNode

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
    <header
      className={`on-header mb-5 rounded-xl border-l-[0.5rem] border-accent bg-header px-4 py-4 text-ink shadow-card sm:px-5 lg:mb-6 lg:px-6 lg:py-5 ${className}`}
    >
      {breadcrumb === 'auto' && <Breadcrumb items={routeCrumbs} variant="back" className="mb-1.5 lg:hidden" />}
      {Array.isArray(breadcrumb) && <Breadcrumb items={breadcrumb} className="mb-2" />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <h1 className="text-title font-extrabold tracking-tight text-ink lg:text-title-lg">{title}</h1>
            {status}
          </div>
          {description && <p className="mt-1 max-w-2xl text-body text-ink-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div>}
      </div>
    </header>
  )
}
