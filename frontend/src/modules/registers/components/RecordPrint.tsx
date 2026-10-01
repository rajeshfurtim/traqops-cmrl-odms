import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const PRINTING = 'odms-printing'

/**
 * Prints one record's form without the app around it. Same mechanism as the shared export's PrintPortal: the
 * sheet mounts at the end of <body> and a class on <html> hides everything else while printing.
 */
export function RecordPrint({ children, onDone }: { children: ReactNode; onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const done = useRef(onDone)
  useLayoutEffect(() => {
    done.current = onDone
  })

  useEffect(() => {
    const root = document.documentElement
    let cancelled = false
    const finish = () => {
      root.classList.remove(PRINTING)
      done.current()
    }
    const images = Array.from(ref.current?.querySelectorAll('img') ?? [])
    Promise.all(images.map((img) => img.decode().catch(() => undefined))).then(() => {
      if (cancelled) return
      root.classList.add(PRINTING)
      window.addEventListener('afterprint', finish, { once: true })
      window.print()
    })
    return () => {
      cancelled = true
      window.removeEventListener('afterprint', finish)
      root.classList.remove(PRINTING)
    }
  }, [])

  return createPortal(
    <div ref={ref} className="odms-print-root">
      <style>{`@page { size: A4 portrait; margin: 10mm; }`}</style>
      {children}
    </div>,
    document.body,
  )
}
