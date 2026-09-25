import logo from '@/assets/cmrl-logo.png'
import { pairRows, type ReportLayout } from '../layout'

const CELL = 'border border-paper-line px-2 py-1 align-middle'
const KEY = `${CELL} bg-paper-head font-semibold`
const ALIGN = { left: 'text-left', center: 'text-center', right: 'text-right' } as const

/** A4 width (see PAGE_REM), so the on-screen sheet wraps text like the printed page. */
const PAGE_WIDTH = { portrait: 'w-[49.625rem]', landscape: 'w-[70.1875rem]' } as const

/** The header: logo, organisation, title, subtitle, department, document control and run details. */
export function ReportSheetHeader({ header }: { header: ReportLayout['header'] }) {
  const { docControl, runDetails } = header

  if (header.layout === 'compact') {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3 border-b-2 border-paper-brand pb-1.5">
          <img src={logo} alt="CMRL" className="size-8 shrink-0 object-contain" />
          <div className="min-w-0 flex-1">
            <p className="text-[0.625rem] font-bold tracking-wide text-paper-brand">{header.organisation}</p>
            <p className="text-[0.8125rem] font-bold">
              {header.title}
              {header.subtitle && <span className="font-medium text-paper-muted"> · {header.subtitle}</span>}
            </p>
            {header.department && <p className="text-[0.625rem] text-paper-muted">{header.department}</p>}
          </div>
          {docControl.length > 0 && (
            <p className="shrink-0 text-right text-[0.5625rem] leading-normal">
              {docControl.map((d) => (
                <span key={d.label} className="block">
                  <span className="font-semibold text-paper-muted">{d.label}:</span> {d.value}
                </span>
              ))}
            </p>
          )}
        </div>
        <p className="text-[0.625rem] leading-normal">
          {runDetails.map((d, i) => (
            <span key={d.label}>
              {i > 0 && <span className="text-paper-muted"> · </span>}
              <span className="font-semibold text-paper-muted">{d.label}:</span> {d.value}
            </span>
          ))}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <table className="w-full border-collapse border border-paper-line">
        <tbody>
          <tr>
            <td className={`${CELL} w-[12%] p-2 text-center`}>
              <img src={logo} alt="CMRL" className="mx-auto size-11 object-contain" />
            </td>
            <td className={`${CELL} p-2 text-center`}>
              <p className="text-[0.9375rem] font-bold tracking-wide text-paper-brand">{header.organisation}</p>
              <p className="mt-0.5 text-[0.8125rem] font-bold uppercase">{header.title}</p>
              {header.subtitle && (
                <p className="text-[0.6875rem] font-semibold tracking-wider text-paper-muted uppercase">
                  {header.subtitle}
                </p>
              )}
              {header.department && <p className="text-[0.6875rem]">{header.department}</p>}
            </td>
            {docControl.length > 0 && (
              <td className={`${CELL} w-[22%] p-2 text-[0.625rem] leading-normal`}>
                {docControl.map((d) => (
                  <span key={d.label} className="block">
                    <span className="font-semibold text-paper-muted uppercase">{d.label}:</span> {d.value}
                  </span>
                ))}
              </td>
            )}
          </tr>
        </tbody>
      </table>

      {runDetails.length > 0 && (
        <table className="w-full border-collapse border border-paper-line">
          <tbody>
            {pairRows(runDetails).map((pair) => (
              <tr key={pair[0].label}>
                {pair.map((d, i) => (
                  <RunDetailCells key={d.label} label={d.label} value={d.value} span={pair.length === 1 && i === 0} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function RunDetailCells({ label, value, span }: { label: string; value: string; span: boolean }) {
  return (
    <>
      <td className={`${KEY} w-[15%]`}>{label}</td>
      <td className={`${CELL} w-[35%]`} colSpan={span ? 3 : 1}>
        {value}
      </td>
    </>
  )
}

interface ReportSheetProps {
  layout: ReportLayout
  /** On screen the sheet is a framed page; in print the page itself is the frame. */
  variant?: 'screen' | 'print'
}

/** The report as HTML, drawn from the same `ReportLayout` as the PDF. Used for the preview and for printing. */
export function ReportSheet({ layout, variant = 'screen' }: ReportSheetProps) {
  const screen = variant === 'screen'
  const hidden = layout.totalRows - layout.rows.length

  return (
    <article
      aria-label={layout.documentTitle}
      className={`relative isolate flex flex-col gap-2.5 bg-paper text-[0.6875rem] leading-snug text-paper-ink ${
        screen
          ? `shrink-0 overflow-hidden border border-paper-line/70 p-[2.4rem] shadow-sm ${PAGE_WIDTH[layout.orientation]}`
          : ''
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none inset-0 -z-10 grid place-items-center ${screen ? 'absolute' : 'fixed'}`}
      >
        <img src={logo} alt="" className="w-1/2 max-w-80 opacity-[0.06]" />
      </div>

      <ReportSheetHeader header={layout.header} />

      <table className="w-full table-fixed border-collapse border border-paper-line">
        <colgroup>
          {layout.columns.map((c) => (
            <col key={c.id} style={{ width: c.width }} />
          ))}
        </colgroup>
        <thead>
          <tr className="bg-paper-head font-semibold">
            {layout.columns.map((c) => (
              <th key={c.id} scope="col" className={`${CELL} ${ALIGN[c.align]}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {layout.rows.length === 0 ? (
            <tr>
              <td colSpan={layout.columns.length} className={`${CELL} py-8 text-center text-paper-muted`}>
                No records match the selected filters.
              </td>
            </tr>
          ) : (
            layout.rows.map((row) => (
              <tr key={row.key} className="break-inside-avoid">
                {row.cells.map((cell, i) => (
                  <td
                    key={layout.columns[i].id}
                    className={`${CELL} ${ALIGN[layout.columns[i].align]} wrap-break-word`}
                  >
                    {cell.text}
                    {cell.sub && <span className="block text-[0.5625rem] text-paper-muted">{cell.sub}</span>}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {hidden > 0 && (
        <p className="text-center text-[0.625rem] text-paper-muted">
          Preview shows the first {layout.rows.length} of {layout.totalRows} records. The file includes all of them.
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-paper-line pt-2 text-[0.5625rem] text-paper-muted">
        <span>{layout.footer.generated}</span>
        <span>{layout.footer.reference}</span>
      </div>
    </article>
  )
}
