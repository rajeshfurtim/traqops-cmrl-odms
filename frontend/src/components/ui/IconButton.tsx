import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, Ref } from 'react'
import { Tooltip, type TooltipSide } from './Tooltip'

const BASE =
  'relative inline-flex size-11 shrink-0 items-center justify-center rounded-md transition-[color,background-color,transform] duration-150 active:scale-95 disabled:pointer-events-none disabled:opacity-50 md:size-10'

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: LucideIcon
  /** Accessible name. Also shown as the tooltip. */
  label: string
  /** Tooltip placement, or `false` to hide it. */
  tooltip?: TooltipSide | false
  shortcut?: string
  /** Numeric badge (e.g. unread count). Hidden when 0. */
  badge?: number
  active?: boolean
  ref?: Ref<HTMLButtonElement>
}

export function IconButton({
  icon: Icon,
  label,
  tooltip = 'bottom',
  shortcut,
  badge,
  active = false,
  type = 'button',
  className = '',
  ...props
}: IconButtonProps) {
  const state = active ? 'bg-muted text-ink' : 'text-ink-secondary hover:bg-subtle hover:text-ink active:bg-muted'

  const button = (
    <button type={type} aria-label={label} className={`${BASE} ${state} ${className}`} {...props}>
      <Icon aria-hidden className="size-5" strokeWidth={1.75} />
      {badge ? (
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-dot px-1 text-[0.625rem] leading-none font-semibold text-on-primary tabular-nums ring-2 ring-surface"
        >
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  )

  // Always wrapped (even when disabled) so toggling the tooltip never remounts the button and drops focus.
  return (
    <Tooltip
      content={label}
      side={tooltip || undefined}
      shortcut={shortcut}
      describe={false}
      disabled={tooltip === false}
    >
      {button}
    </Tooltip>
  )
}
