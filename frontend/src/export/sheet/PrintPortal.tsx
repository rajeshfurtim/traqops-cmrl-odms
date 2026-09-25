import { useEffect, useLayoutEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { ReportLayout } from '../layout'
import { ReportSheet } from './ReportSheet'

const PRINTING = 'odms-printing'

/**
 * Prints one report without the app around it: the sheet mounts at the end of <body>, a class on <html> hides
 * everything else in print, and the page counter comes from @page margin boxes. Pages need no `print:hidden`.
 */
export function PrintPortal({ layout, onDone }: { layout: ReportLayout; onDone: () => void }) {
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
      <style>{`@page { size: A4 ${layout.orientation}; margin: 10mm 10mm 14mm;
        @bottom-right { content: "Page " counter(page) " of " counter(pages); font: 8pt Inter, sans-serif; color: #6b7280; } }`}</style>
      <ReportSheet layout={layout} variant="print" />
    </div>,
    document.body,
  )
}
