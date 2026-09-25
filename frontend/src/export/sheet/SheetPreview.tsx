import { useLayoutEffect, useRef, useState } from 'react'
import { PAGE_REM, type ReportLayout } from '../layout'
import { ReportSheet } from './ReportSheet'

/** Shows the sheet at true A4 width, zoomed down to fit the pane, so line breaks match the printout. */
export function SheetPreview({ layout }: { layout: ReportLayout }) {
  const ref = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(1)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      setZoom(Math.min(1, el.clientWidth / (PAGE_REM[layout.orientation] * rem)))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [layout.orientation])

  return (
    <div ref={ref} className="flex w-full justify-center">
      <div style={{ zoom }}>
        <ReportSheet layout={layout} />
      </div>
    </div>
  )
}
