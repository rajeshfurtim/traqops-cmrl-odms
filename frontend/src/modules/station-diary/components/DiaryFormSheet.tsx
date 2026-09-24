import type { ReactNode } from 'react'
import logo from '@/assets/cmrl-logo.png'
import { FORM_DATE, FORM_NUMBER, FORM_REVISION } from '../constants'
import type { Person, ShiftDiary } from '../types'
import { diaryReference, formatFormDate, formatStamp, formatStampSeconds, sortEntriesAsc } from '../utils'
import { RichText } from './RichText'

export interface SheetOptions {
  importantOnly?: boolean
  includeTasks?: boolean
  includeImages?: boolean
}

const CELL = 'border border-paper-line px-2 py-1 align-top'
const KEY = `${CELL} w-[18%] bg-paper-head font-semibold whitespace-nowrap`
const HEAD = 'mt-1 text-[0.625rem] font-semibold tracking-wide uppercase'

function Signature({ person, at }: { person?: Person; at?: string }) {
  if (!person || !at) return <span className="text-[0.625rem] text-paper-muted">Not signed yet</span>
  return (
    <>
      <span className="font-[cursive] text-[0.9375rem] leading-none text-paper-sign">{person.name}</span>
      <span className="block text-[0.5625rem] text-paper-muted">Signed digitally · {formatStamp(at)}</span>
    </>
  )
}

function Row({ k1, v1, k2, v2 }: { k1: string; v1: ReactNode; k2: string; v2: ReactNode }) {
  return (
    <tr>
      <td className={KEY}>{k1}</td>
      <td className={CELL}>{v1}</td>
      <td className={KEY}>{k2}</td>
      <td className={CELL}>{v2}</td>
    </tr>
  )
}

/**
 * One shift on the official Station Diary form (CMRL/OPER/SO/F-01).
 * Used by the booklet view and the PDF preview; `pdf/DiaryPdfDocument` draws the same layout.
 */
export function DiaryFormSheet({
  diary,
  options = {},
  footer,
}: {
  diary: ShiftDiary
  options?: SheetOptions
  /** e.g. "Page 2 of 5" */
  footer?: string
}) {
  const entries = sortEntriesAsc(diary.entries).filter((e) => !options.importantOnly || e.important)
  const draft = diary.status === 'in-progress'
  const { handedBy, handedAt, takenBy, takenAt } = diary.handover

  return (
    <article
      aria-label={`Station Diary, ${formatFormDate(diary.date)}, Shift ${diary.shift}`}
      className="relative isolate flex w-full max-w-[51.25rem] flex-col gap-2 overflow-hidden border border-paper-line/60 bg-paper px-4 py-4 text-[0.6875rem] leading-snug text-paper-ink shadow-sm sm:px-5"
    >
      {/* CMRL roundel watermark, as on the printed form */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 grid place-items-center">
        <img src={logo} alt="" className="w-1/2 max-w-80 opacity-[0.06]" />
      </div>

      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className={`${CELL} w-[10%] text-center align-middle`}>
              <img src={logo} alt="CMRL" className="mx-auto size-9 object-contain" />
            </td>
            <td className={`${CELL} text-center align-middle`}>
              <p className="text-[0.8125rem] font-bold tracking-wide">CHENNAI METRO RAIL LIMITED</p>
              <p className="text-[0.625rem] text-paper-muted">STATION DIARY</p>
              <p className="font-semibold">
                {diary.stationName} ({diary.stationCode})
              </p>
            </td>
            <td className={`${CELL} w-[22%] align-middle text-[0.5625rem] whitespace-nowrap`}>
              {FORM_NUMBER}
              <br />
              {FORM_REVISION}
              <br />
              {FORM_DATE}
              {draft && <span className="mt-0.5 block font-semibold text-paper-alert">DRAFT · not handed over</span>}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="w-full border-collapse">
        <tbody>
          <Row k1="Date" v1={formatFormDate(diary.date)} k2="Shift" v2={diary.shift} />
          <Row k1="Emp Name" v1={diary.controller?.name ?? '—'} k2="Emp ID" v2={diary.controller?.employeeId ?? '—'} />
          <Row
            k1="Sign-in"
            v1={diary.signInAt ? formatStampSeconds(diary.signInAt) : '—'}
            k2="Sign-out"
            v2={diary.signOutAt ? formatStampSeconds(diary.signOutAt) : '—'}
          />
        </tbody>
      </table>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={`${CELL} w-[20%] bg-paper-head text-left font-semibold`}>Date &amp; time</th>
            <th className={`${CELL} bg-paper-head text-left font-semibold`}>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 && (
            <tr>
              <td colSpan={2} className={`${CELL} text-paper-muted`}>
                {diary.status === 'no-attendance' ? 'No attendance recorded for this shift.' : 'No entries.'}
              </td>
            </tr>
          )}
          {entries.map((e) => (
            <tr key={e.id}>
              <td className={`${CELL} whitespace-nowrap tabular-nums`}>{formatStampSeconds(e.at)}</td>
              <td className={CELL}>
                <div className="flex gap-1">
                  {e.important && <span aria-label="Important">★</span>}
                  <RichText text={e.text} />
                </div>
                {e.editedAt && <span className="block text-paper-muted">Edited {formatStampSeconds(e.editedAt)}</span>}
                {e.registerRecord && <span className="text-paper-muted">Register ref: {e.registerRecord.ref}</span>}
                {options.includeImages && e.attachments && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {e.attachments.map((a) => (
                      <img key={a.id} src={a.url} alt={a.name} className="h-16 border border-paper-line object-cover" />
                    ))}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {options.includeTasks && diary.tasks.length > 0 && (
        <>
          <p className={HEAD}>Tasks &amp; events</p>
          <table className="w-full border-collapse">
            <tbody>
              {diary.tasks.map((t) => (
                <tr key={t.id}>
                  <td className={`${CELL} w-[14%]`}>{t.kind === 'circular' ? 'Circular' : 'Task'}</td>
                  <td className={CELL}>{t.title}</td>
                  <td className={`${CELL} w-[18%] capitalize`}>{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <p className={HEAD}>Shift handover details</p>
      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className={KEY}>Handed Over By</td>
            <td className={CELL}>{handedBy ? `${handedBy.name} (${handedBy.employeeId})` : '—'}</td>
            <td className={KEY}>Signature</td>
            <td className={CELL}>
              <Signature person={handedBy} at={handedAt} />
            </td>
          </tr>
          <tr>
            <td className={KEY}>Taken Over By</td>
            <td className={CELL}>{takenBy ? `${takenBy.name} (${takenBy.employeeId})` : '—'}</td>
            <td className={KEY}>Signature</td>
            <td className={CELL}>
              <Signature person={takenBy} at={takenAt} />
            </td>
          </tr>
        </tbody>
      </table>

      <div className="flex flex-wrap justify-between gap-2 text-[0.5625rem] text-paper-muted">
        <span>Ref {diaryReference(diary)}</span>
        {footer && <span>{footer}</span>}
      </div>
    </article>
  )
}
