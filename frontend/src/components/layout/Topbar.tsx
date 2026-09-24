import { Menu, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Breadcrumb } from '@/components/navigation/Breadcrumb'
import { SearchTrigger } from '@/components/search/SearchTrigger'
import { IconButton } from '@/components/ui/IconButton'
import { useShell } from '@/context/ShellContext'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { Brand } from './Brand'
import { MOBILE_DRAWER_ID } from './MobileDrawer'
import { NotificationPanel } from './NotificationPanel'
import { ShiftContext } from './ShiftContext'
import { StationContext } from './StationContext'
import { UserMenu } from './UserMenu'
export function Topbar() {
  const { drawerOpen, openDrawer, openSearch } = useShell()
  const crumbs = useBreadcrumbs()
  const current = crumbs.at(-1)

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-surface/80">
      <div className="flex h-topbar items-center gap-2 px-2 sm:px-3 md:h-topbar-lg md:gap-3 md:px-4 xl:gap-4 xl:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-1 md:min-w-40 md:gap-2 lg:min-w-56 xl:min-w-60">
          <IconButton
            icon={Menu}
            label="Open navigation"
            tooltip={false}
            onClick={openDrawer}
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            aria-controls={MOBILE_DRAWER_ID}
            className="lg:hidden"
          />
          <Link to="/dashboard" aria-label="ODMS home" className="rounded-md p-1 md:hidden">
            <Brand />
          </Link>
          {current && (
            <p className="hidden min-w-0 truncate text-heading text-ink md:block lg:hidden" aria-hidden>
              {current.label}
            </p>
          )}
          <Breadcrumb items={crumbs} className="hidden lg:block" />
        </div>

        <SearchTrigger className="hidden w-full min-w-36 shrink md:flex md:max-w-60 lg:max-w-72 xl:max-w-sm 2xl:max-w-md" />

        <div className="flex shrink-0 items-center justify-end gap-0.5 md:gap-2">
          <IconButton icon={Search} label="Search" tooltip={false} onClick={openSearch} className="md:hidden" />

          <div
            role="group"
            aria-label="Operating context"
            className="mr-1 hidden h-10 shrink-0 items-center gap-3 rounded-lg border border-border bg-surface px-3 text-secondary shadow-card md:flex xl:h-11 xl:gap-4 xl:px-4"
          >
            <StationContext variant="compact" className="xl:hidden" />
            <StationContext variant="full" className="hidden xl:flex" />
            <span aria-hidden className="h-5 w-px bg-border-strong xl:h-6" />
            <ShiftContext variant="compact" className="xl:hidden" />
            <ShiftContext variant="full" className="hidden xl:block" />
          </div>

          <NotificationPanel />
          <UserMenu />
        </div>
      </div>

      <MobileContextBar />
    </header>
  )
}

function MobileContextBar() {
  return (
    <div
      role="group"
      aria-label="Operating context"
      className="flex h-9 items-center gap-3 border-t border-border bg-canvas px-4 text-caption md:hidden"
    >
      <StationContext variant="minimal" />
      <span aria-hidden className="h-3.5 w-px shrink-0 bg-border-strong" />
      <ShiftContext variant="compact" />
    </div>
  )
}
