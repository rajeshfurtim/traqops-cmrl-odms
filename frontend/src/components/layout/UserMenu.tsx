import {
  ChevronDown,
  CircleHelp,
  LogOut,
  Monitor,
  Moon,
  SlidersHorizontal,
  Sun,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { useSession } from '@/context/SessionContext'
import { useTheme } from '@/context/ThemeContext'
import { useDismiss } from '@/hooks/useDismiss'
import type { ThemePreference } from '@/utils/theme'

interface MenuAction {
  id: string
  label: string
  icon: LucideIcon
  tone?: 'danger'

  separated?: boolean
}

const ACTIONS: MenuAction[] = [
  { id: 'profile', label: 'Profile', icon: UserRound },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'help', label: 'Help', icon: CircleHelp },
  { id: 'logout', label: 'Log out', icon: LogOut, tone: 'danger', separated: true },
]

const THEMES: { value: ThemePreference; label: string; icon: LucideIcon }[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
]

const THEME_OPTION =
  'flex h-10 flex-col items-center justify-center gap-0.5 rounded-md text-caption font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-focus md:h-11'
const MENU_ITEM =
  'flex h-11 w-full items-center gap-3 rounded-md px-2.5 text-body font-medium transition-colors outline-none hover:bg-subtle focus-visible:bg-subtle md:h-9'

export function UserMenu() {
  const { user, station } = useSession()
  const { preference, setPreference } = useTheme()
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const focusOnOpen = useRef<'first' | 'last'>('first')

  const close = (restoreFocus: boolean) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }

  useDismiss(open, (reason) => close(reason === 'escape'), [triggerRef, menuRef])

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"], [role="menuitemradio"]') ?? [])

  useEffect(() => {
    if (!open) return
    const list = items()
    ;(focusOnOpen.current === 'first' ? list[0] : list.at(-1))?.focus()
  }, [open])

  const openWith = (target: 'first' | 'last') => {
    focusOnOpen.current = target
    setOpen(true)
  }

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openWith(event.key === 'ArrowDown' ? 'first' : 'last')
    }
  }

  const onMenuKeyDown = (event: KeyboardEvent) => {
    const list = items()
    const index = list.indexOf(document.activeElement as HTMLElement)
    const move = (next: number) => {
      event.preventDefault()
      list[(next + list.length) % list.length]?.focus()
    }
    switch (event.key) {
      case 'ArrowDown':
        return move(index + 1)
      case 'ArrowUp':
        return move(index - 1)
      case 'Home':
        return move(0)
      case 'End':
        return move(list.length - 1)
      case 'Tab':
        return close(false)
    }
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Account: ${user.name}, ${user.role}`}
        onClick={() => (open ? close(false) : openWith('first'))}
        onKeyDown={onTriggerKeyDown}
        className={`flex h-11 items-center gap-2.5 rounded-md px-1.5 transition-colors min-[1400px]:pr-2 md:h-10 ${open ? 'bg-muted' : 'hover:bg-subtle'}`}
      >
        <Avatar name={user.name} />
        <span className="hidden min-w-0 text-left leading-tight min-[1400px]:block">
          <span className="block truncate text-secondary font-semibold text-ink">{user.name}</span>
          <span className="block truncate text-caption text-ink-muted">{user.role}</span>
        </span>
        <ChevronDown
          aria-hidden
          strokeWidth={2}
          className={`hidden size-4 text-ink-muted transition-transform duration-150 min-[1400px]:block ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Account"
          onKeyDown={onMenuKeyDown}
          className="odms-pop absolute top-full right-0 z-40 mt-2 w-64 overflow-hidden rounded-lg border border-border bg-surface-raised shadow-overlay"
        >
          <div className="flex items-center gap-3 border-b border-border px-3.5 py-3">
            <Avatar name={user.name} size="lg" />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-body font-semibold text-ink">{user.name}</p>
              <p className="truncate text-secondary text-ink-muted">{user.role}</p>
              <p className="mt-0.5 truncate text-caption text-ink-muted">
                {station.shortName} · {station.code}
              </p>
            </div>
          </div>
          <div role="group" aria-labelledby={`${menuId}-theme`} className="border-b border-border px-3.5 py-3">
            <p id={`${menuId}-theme`} className="mb-2 text-caption font-medium text-ink-muted">
              Theme
            </p>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-canvas p-1">
              {THEMES.map((option) => {
                const Icon = option.icon
                const selected = preference === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    tabIndex={-1}
                    onClick={() => setPreference(option.value)}
                    className={`${THEME_OPTION} ${selected ? 'bg-surface-raised text-ink shadow-sm' : 'text-ink-muted hover:bg-subtle hover:text-ink'}`}
                  >
                    <Icon aria-hidden className="size-4" strokeWidth={1.75} />
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="p-1.5">
            {ACTIONS.map((action) => {
              const Icon = action.icon
              const danger = action.tone === 'danger'
              return (
                <div key={action.id}>
                  {action.separated && <div role="separator" className="-mx-1.5 my-1.5 h-px bg-border" />}
                  <button
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => close(true)}
                    className={`${MENU_ITEM} ${danger ? 'text-danger' : 'text-ink'}`}
                  >
                    <Icon
                      aria-hidden
                      strokeWidth={1.75}
                      className={`size-4 ${danger ? 'text-danger' : 'text-ink-muted'}`}
                    />
                    {action.label}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
