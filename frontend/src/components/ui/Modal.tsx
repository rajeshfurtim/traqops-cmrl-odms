import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Dialog } from './Dialog'
import { IconButton } from './IconButton'

type ModalSize = 'md' | 'lg' | 'xl'

const SIZES: Record<ModalSize, string> = {
  md: 'md:w-[min(32rem,calc(100vw-4rem))]',
  lg: 'md:w-[min(44rem,calc(100vw-4rem))]',
  xl: 'md:w-[min(72rem,calc(100vw-4rem))]',
}

const BASE =
  'odms-dialog m-0 h-dvh max-h-none w-screen max-w-none flex-col overflow-hidden bg-surface-raised text-ink open:flex md:m-auto md:h-fit md:max-h-[min(52rem,90vh)] md:rounded-xl md:border md:border-border md:shadow-overlay'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: ReactNode
  size?: ModalSize
  footer?: ReactNode
  children: ReactNode
}

export function Modal({ open, onClose, title, description, size = 'md', footer, children }: ModalProps) {
  return (
    <Dialog open={open} onClose={onClose} aria-label={title} className={`${BASE} ${SIZES[size]}`}>
      {open && (
        <>
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border py-3 pr-2 pl-5">
            <div className="min-w-0 pt-1.5">
              <h2 className="text-heading text-ink">{title}</h2>
              {description && <p className="mt-0.5 text-secondary text-ink-muted">{description}</p>}
            </div>
            <IconButton icon={X} label="Close" tooltip={false} onClick={onClose} />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && (
            <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-canvas px-5 py-3">
              {footer}
            </footer>
          )}
        </>
      )}
    </Dialog>
  )
}
