import {
  cloneElement,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { Kbd } from './Kbd'

export type TooltipSide = 'top' | 'right' | 'bottom' | 'left'

interface TooltipProps {
  content: ReactNode
  children: ReactElement<{ 'aria-describedby'?: string }>
  side?: TooltipSide
  shortcut?: string
  disabled?: boolean
  /** Hover delay in ms. Keyboard focus shows immediately. */
  delay?: number
  /**
   * Link the tooltip to the trigger via aria-describedby.
   * Set to false when the content duplicates the trigger's accessible name.
   */
  describe?: boolean
  /** Class for the wrapping element. Defaults to `display: contents` so it does not affect layout. */
  className?: string
}

/** Offsets in rem so they follow the fluid UI scale. */
const GAP_REM = 0.5
const VIEWPORT_MARGIN_REM = 0.5

export function Tooltip({
  content,
  children,
  side = 'top',
  shortcut,
  disabled = false,
  delay = 350,
  describe = true,
  className,
}: TooltipProps) {
  const id = useId()
  const triggerRef = useRef<HTMLSpanElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)
  const timer = useRef<number | undefined>(undefined)
  // Portal target while open. Inside an open <dialog> the tooltip must render there to stay in the top layer.
  const [container, setContainer] = useState<Element | null>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const open = container !== null && !disabled

  const show = (immediate = false) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(
      () => setContainer(triggerRef.current?.closest('dialog') ?? document.body),
      immediate ? 0 : delay,
    )
  }
  const hide = () => {
    window.clearTimeout(timer.current)
    setContainer(null)
    setPosition(null)
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // Position against the trigger, clamped to the viewport.
  useLayoutEffect(() => {
    if (!open) return
    const trigger = triggerRef.current?.firstElementChild ?? triggerRef.current
    const tip = tipRef.current
    if (!trigger || !tip) return
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    const GAP = GAP_REM * rem
    const VIEWPORT_MARGIN = VIEWPORT_MARGIN_REM * rem
    const r = trigger.getBoundingClientRect()
    const w = tip.offsetWidth
    const h = tip.offsetHeight
    let top: number
    let left: number
    switch (side) {
      case 'right':
        top = r.top + r.height / 2 - h / 2
        left = r.right + GAP
        break
      case 'left':
        top = r.top + r.height / 2 - h / 2
        left = r.left - GAP - w
        break
      case 'bottom':
        top = r.bottom + GAP
        left = r.left + r.width / 2 - w / 2
        break
      default:
        top = r.top - GAP - h
        left = r.left + r.width / 2 - w / 2
    }
    const clamp = (v: number, max: number) => Math.min(Math.max(v, VIEWPORT_MARGIN), max - VIEWPORT_MARGIN)
    setPosition({ top: clamp(top, window.innerHeight - h), left: clamp(left, window.innerWidth - w) })
  }, [open, side])

  // WCAG 1.4.13: dismissible with Escape; hide on scroll so it never detaches from its trigger.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && hide()
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', hide, true)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', hide, true)
    }
  }, [open])

  return (
    <span
      ref={triggerRef}
      className={className ?? 'contents'}
      onPointerEnter={(e: PointerEvent) => e.pointerType === 'mouse' && show()}
      onPointerLeave={hide}
      onPointerDown={hide}
      onFocus={(e) => (e.target as Element).matches(':focus-visible') && show(true)}
      onBlur={hide}
    >
      {describe && open ? cloneElement(children, { 'aria-describedby': id }) : children}
      {open &&
        createPortal(
          <div
            ref={tipRef}
            id={id}
            role="tooltip"
            aria-hidden={!describe}
            style={{ top: position?.top ?? 0, left: position?.left ?? 0 }}
            className={`pointer-events-none fixed z-[60] flex max-w-64 items-center gap-2 rounded-md bg-tooltip px-2 py-1 text-caption font-medium text-on-tooltip shadow-sm ${position ? '' : 'invisible'}`}
          >
            {content}
            {shortcut && <Kbd tone="inverse">{shortcut}</Kbd>}
          </div>,
          container,
        )}
    </span>
  )
}
