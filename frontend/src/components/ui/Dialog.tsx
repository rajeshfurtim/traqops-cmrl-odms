import { useEffect, useRef, type DialogHTMLAttributes, type MouseEvent, type ReactNode } from 'react'

interface DialogProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'onClose' | 'onCancel'> {
  open: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * Modal built on the native <dialog>: top-layer rendering, inert background,
 * Escape handling and focus restoration come from the platform.
 * Focus lands on the first `[data-autofocus]` element, else the first focusable one.
 */
export function Dialog({ open, onClose, children, ...props }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // Clicks on the ::backdrop target the dialog itself, outside its box.
  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return
    const r = event.currentTarget.getBoundingClientRect()
    const inside =
      event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom
    if (!inside) onClose()
  }

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClose={() => {
        if (open) onClose()
      }}
      onClick={handleClick}
      {...props}
    >
      {children}
    </dialog>
  )
}
