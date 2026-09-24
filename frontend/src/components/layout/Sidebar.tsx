import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NavigationGroup } from '@/components/navigation/NavigationGroup'
import { Kbd } from '@/components/ui/Kbd'
import { Tooltip } from '@/components/ui/Tooltip'
import { NAVIGATION } from '@/constants/navigation'
import { useShell } from '@/context/ShellContext'
import { SidebarBrand } from './Brand'

export const SIDEBAR_NAV_ID = 'primary-navigation'

/**
 * Persistent sidebar for tablet (icon rail) and desktop (collapsible). Hidden on mobile.
 *
 * Always-dark CMRL navy (`bg-nav`). The `.on-dark` class re-maps the standard tokens for
 * everything inside, so child components keep using their normal classes.
 */
export function Sidebar() {
  const { sidebarCollapsed: collapsed, sidebarCollapsible, toggleSidebar } = useShell()
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose
  const toggleLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar'
  const width = collapsed ? 'w-sidebar-rail' : 'w-sidebar'
  const labelOpacity = collapsed ? 'opacity-0' : ''

  return (
    <aside
      aria-label="Sidebar"
      className={`on-dark sticky top-0 z-20 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-border bg-nav transition-[width] duration-200 ease-(--ease-standard) md:flex ${width}`}
    >
      {/* ── Brand header ─────────────────────────────────────────────── */}
      <div className="relative h-topbar-lg shrink-0 border-b border-border">
        <Link
          to="/dashboard"
          aria-label="ODMS home"
          className="absolute inset-x-2 inset-y-1.5 flex items-center rounded-lg px-2 transition-colors duration-150 hover:bg-subtle focus-visible:outline-offset-0"
        >
          <SidebarBrand collapsed={collapsed} />
        </Link>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav
        id={SIDEBAR_NAV_ID}
        aria-label="Main navigation"
        className="flex flex-1 [scrollbar-width:thin] flex-col gap-2 overflow-x-hidden overflow-y-auto py-3"
      >
        {NAVIGATION.map((group, index) => (
          <NavigationGroup key={group.id} group={group} collapsed={collapsed} isFirst={index === 0} />
        ))}
      </nav>

      {/* ── Collapse control ─────────────────────────────────────────── */}
      {sidebarCollapsible && (
        <div className="shrink-0 border-t border-border p-3">
          <Tooltip content={toggleLabel} shortcut="[" side="right" disabled={!collapsed} describe={false}>
            <button
              type="button"
              onClick={toggleSidebar}
              aria-controls={SIDEBAR_NAV_ID}
              aria-expanded={!collapsed}
              aria-label={toggleLabel}
              aria-keyshortcuts="["
              className="flex h-9 w-full items-center gap-3 overflow-hidden rounded-md px-2.75 text-body font-medium text-ink-muted transition-colors hover:bg-subtle hover:text-ink focus-visible:outline-offset-[-2px]"
            >
              <ToggleIcon aria-hidden className="size-4.5 shrink-0" strokeWidth={1.75} />
              <span className={`whitespace-nowrap transition-opacity ${labelOpacity}`}>Collapse</span>
              <Kbd className={`ml-auto transition-opacity ${labelOpacity}`}>[</Kbd>
            </button>
          </Tooltip>
        </div>
      )}
    </aside>
  )
}
