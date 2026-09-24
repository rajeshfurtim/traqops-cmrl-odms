import { ArrowRightLeft, Bell, BellOff, FileClock, Info, TriangleAlert, type LucideIcon } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { IconButton } from '@/components/ui/IconButton'
import { MOCK_NOTIFICATIONS } from '@/constants/mock'
import { useDismiss } from '@/hooks/useDismiss'
import { useNow } from '@/hooks/useNow'
import type { AppNotification, NotificationKind } from '@/types'
import { formatDateTime, formatRelativeTime } from '@/utils/format'

const KIND: Record<NotificationKind, { icon: LucideIcon; className: string }> = {
  attention: { icon: TriangleAlert, className: 'bg-warning-subtle text-warning' },
  handover: { icon: ArrowRightLeft, className: 'bg-primary-subtle text-primary' },
  update: { icon: FileClock, className: 'bg-info-subtle text-info' },
  system: { icon: Info, className: 'bg-subtle text-ink-muted' },
}

const PANEL =
  'odms-pop z-40 flex flex-col overflow-hidden rounded-lg border border-border bg-surface-raised shadow-overlay outline-none'
// Mobile: full-width sheet under the header
const PANEL_MOBILE =
  'fixed inset-x-2 top-[calc(var(--spacing-topbar)+0.25rem)] max-h-[calc(100dvh-var(--spacing-topbar)-1rem)]'
// Tablet and up: popover anchored to the bell
const PANEL_DESKTOP =
  'md:absolute md:inset-x-auto md:top-full md:right-0 md:mt-2 md:w-95 md:max-h-[min(35rem,calc(100dvh-6rem))]'

export function NotificationPanel() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const panelId = useId()
  const headingId = useId()

  const unread = notifications.filter((n) => !n.read).length

  useDismiss(
    open,
    (reason) => {
      setOpen(false)
      if (reason === 'escape') triggerRef.current?.focus()
    },
    [triggerRef, panelRef],
  )

  useEffect(() => {
    if (open) panelRef.current?.focus()
  }, [open])

  const markRead = (id: string) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)))
  const markAllRead = () => setNotifications((list) => list.map((n) => ({ ...n, read: true })))

  return (
    <div className="md:relative">
      <IconButton
        ref={triggerRef}
        icon={Bell}
        label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        badge={unread}
        active={open}
        tooltip={open ? false : 'bottom'}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
      />

      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={headingId}
          tabIndex={-1}
          className={`${PANEL} ${PANEL_MOBILE} ${PANEL_DESKTOP}`}
        >
          <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border pr-2 pl-4">
            <h2 id={headingId} className="flex items-center gap-2 text-heading text-ink">
              Notifications
              {unread > 0 && (
                <span className="rounded bg-danger-subtle px-1.5 text-caption font-semibold text-danger tabular-nums">
                  {unread} new
                </span>
              )}
            </h2>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="h-8 rounded-md px-2 text-secondary font-medium text-primary-ink transition-colors hover:bg-primary-subtle"
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-12 text-center">
              <BellOff aria-hidden className="mb-3 size-5 text-ink-muted" strokeWidth={1.75} />
              <p className="text-body font-medium text-ink">You're all caught up</p>
            </div>
          ) : (
            <NotificationList notifications={notifications} onRead={markRead} />
          )}

          <p className="shrink-0 border-t border-border bg-canvas px-4 py-2.5 text-caption text-ink-muted">
            Showing notifications for <span className="font-medium text-ink-secondary">the current shift</span>
          </p>
        </div>
      )}
    </div>
  )
}

function NotificationList({
  notifications,
  onRead,
}: {
  notifications: AppNotification[]
  onRead: (id: string) => void
}) {
  const now = useNow()
  return (
    <ul className="flex-1 overflow-y-auto overscroll-contain py-1">
      {notifications.map((n) => {
        const kind = KIND[n.kind]
        const Icon = kind.icon
        return (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => onRead(n.id)}
              className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-subtle focus-visible:outline-offset-[-2px]"
            >
              <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md ${kind.className}`}>
                <Icon aria-hidden className="size-4" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-body ${n.read ? 'text-ink-secondary' : 'font-semibold text-ink'}`}>
                  {n.title}
                </span>
                <span className="mt-0.5 block text-secondary text-ink-muted">{n.body}</span>
                <time
                  dateTime={n.createdAt.toISOString()}
                  title={formatDateTime(n.createdAt)}
                  className="mt-1 block text-caption text-ink-muted"
                >
                  {formatRelativeTime(n.createdAt, now)}
                </time>
              </span>
              <span className="flex w-2 shrink-0 justify-center pt-2">
                {!n.read && <span className="size-2 rounded-full bg-primary" />}
                <span className="sr-only">{n.read ? 'Read' : 'Unread'}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
