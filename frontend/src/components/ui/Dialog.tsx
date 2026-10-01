import { useEffect, useRef, type DialogHTMLAttributes, type MouseEvent, type ReactNode } from 'react'

interface DialogProps extends Omit<DialogHTMLAttributes<HTMLDialogElement>, 'open' | 'onClose' | 'onCancel'> {
  open: boolean
  onClose: () => void
  children: ReactNode
}

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
      // React passes a nested dialog's cancel/close up the component tree; only handle this dialog's own.
      onCancel={(event) => {
        if (event.target !== event.currentTarget) return
        event.preventDefault()
        onClose()
      }}
      onClose={(event) => {
        if (event.target === event.currentTarget && open) onClose()
      }}
      onClick={handleClick}
      {...props}
    >
      {children}
    </dialog>
  )
}
