import { useId } from 'react'
import { SidebarItem, type SidebarItemDensity } from '@/components/layout/SidebarItem'
import type { NavGroup } from '@/types'

interface NavigationGroupProps {
  group: NavGroup
  collapsed?: boolean
  density?: SidebarItemDensity
  /** Hide the separator shown in collapsed mode (first group). */
  isFirst?: boolean
  onNavigate?: () => void
}

export function NavigationGroup({
  group,
  collapsed = false,
  density = 'default',
  isFirst = false,
  onNavigate,
}: NavigationGroupProps) {
  const headingId = useId()
  const headingRow = collapsed && isFirst ? 'h-0' : 'h-8'

  return (
    <div role="group" aria-labelledby={headingId} className="px-3">
      <div className={`flex items-center px-2.75 ${headingRow}`}>
        <span
          id={headingId}
          className={`text-label whitespace-nowrap text-ink-muted uppercase ${collapsed ? 'sr-only' : ''}`}
        >
          {group.label}
        </span>
        {collapsed && !isFirst && <span aria-hidden className="h-px w-full bg-border" />}
      </div>
      <ul className="flex flex-col gap-0.5">
        {group.items.map((item) => (
          <SidebarItem key={item.id} item={item} collapsed={collapsed} density={density} onNavigate={onNavigate} />
        ))}
      </ul>
    </div>
  )
}
