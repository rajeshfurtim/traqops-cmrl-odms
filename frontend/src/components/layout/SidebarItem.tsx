import { NavLink, useMatch } from 'react-router-dom'
import { SoonBadge } from '@/components/ui/Badge'
import { Tooltip } from '@/components/ui/Tooltip'
import type { NavItem } from '@/types'

const ITEM =
  'relative flex w-full items-center gap-3 overflow-hidden rounded-md px-2.75 text-body font-medium transition-colors duration-150'

export type SidebarItemDensity = 'default' | 'touch'

interface SidebarItemProps {
  item: NavItem
  collapsed: boolean
  density?: SidebarItemDensity
  onNavigate?: () => void
}

export function SidebarItem({ item, collapsed, density = 'default', onNavigate }: SidebarItemProps) {
  const Icon = item.icon
  const available = item.status === 'available' && Boolean(item.to)
  const isActive = Boolean(useMatch({ path: item.to ?? '/__unavailable__', end: false })) && available

  const base = `${ITEM} ${density === 'touch' ? 'h-11' : 'h-9'}`
  const linkState = isActive
    ? 'bg-primary-subtle text-primary-ink'
    : 'text-ink-secondary hover:bg-subtle hover:text-ink'
  const iconState = isActive ? 'text-primary' : 'text-ink-muted group-hover:text-ink-secondary'

  // Kept in the DOM when collapsed so the link keeps its accessible name.
  const label = (
    <span className={`truncate whitespace-nowrap transition-opacity duration-150 ${collapsed ? 'opacity-0' : ''}`}>
      {item.label}
    </span>
  )

  const content = available ? (
    <NavLink
      to={item.to!}
      onClick={onNavigate}
      className={`group ${base} focus-visible:outline-offset-[-2px] ${linkState}`}
    >
      <Icon
        aria-hidden
        strokeWidth={isActive ? 2 : 1.75}
        className={`size-4.5 shrink-0 transition-colors ${iconState}`}
      />
      {label}
    </NavLink>
  ) : (
    <div aria-disabled="true" className={`${base} cursor-not-allowed text-ink-disabled`}>
      <Icon aria-hidden strokeWidth={1.75} className="size-4.5 shrink-0" />
      {label}
      <span className="sr-only">(coming soon)</span>
      {!collapsed && <SoonBadge className="ml-auto" />}
    </div>
  )

  return (
    <li className="relative">
      {isActive && <span aria-hidden className="absolute top-2 bottom-2 -left-3 w-0.75 rounded-r-full bg-accent" />}
      <Tooltip
        content={available ? item.label : `${item.label} · Coming soon`}
        side="right"
        disabled={!collapsed}
        describe={false}
        delay={120}
      >
        {content}
      </Tooltip>
    </li>
  )
}
