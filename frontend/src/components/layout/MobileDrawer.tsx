import { X } from 'lucide-react'
import { NavigationGroup } from '@/components/navigation/NavigationGroup'
import { Avatar } from '@/components/ui/Avatar'
import { Dialog } from '@/components/ui/Dialog'
import { IconButton } from '@/components/ui/IconButton'
import { NAVIGATION } from '@/constants/navigation'
import { useSession } from '@/context/SessionContext'
import { useShell } from '@/context/ShellContext'
import { BrandLockup } from './Brand'
import { ShiftContext } from './ShiftContext'
import { StationContext } from './StationContext'

export const MOBILE_DRAWER_ID = 'mobile-navigation'

/** Full navigation for mobile and tablet, as a modal side drawer. */
export function MobileDrawer() {
  const { drawerOpen, closeDrawer } = useShell()
  const { user } = useSession()

  return (
    <Dialog
      id={MOBILE_DRAWER_ID}
      open={drawerOpen}
      onClose={closeDrawer}
      aria-label="Navigation"
      className="odms-drawer on-dark fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-80 max-w-[calc(100vw-3rem)] flex-col bg-nav shadow-overlay open:flex"
    >
      <div className="flex h-20 shrink-0 items-center justify-between border-b border-border pr-2 pl-4">
        <BrandLockup className="h-12" />
        <IconButton icon={X} label="Close navigation" tooltip={false} onClick={closeDrawer} />
      </div>

      <div className="shrink-0 space-y-2.5 border-b border-border bg-canvas px-4 py-3 text-caption">
        <StationContext variant="full" />
        <ShiftContext variant="full" className="pl-9.5" />
      </div>

      <nav aria-label="Main navigation" className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain py-3">
        {NAVIGATION.map((group) => (
          <NavigationGroup key={group.id} group={group} density="touch" onNavigate={closeDrawer} />
        ))}
      </nav>

      <div className="flex shrink-0 items-center gap-3 border-t border-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <Avatar name={user.name} />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-secondary font-semibold text-ink">{user.name}</p>
          <p className="truncate text-caption text-ink-muted">{user.role}</p>
        </div>
      </div>
    </Dialog>
  )
}
