import type { ReactNode } from 'react'
import logo from '@/assets/cmrl-logo.png'
import { formatStampSeconds } from '@/modules/station-diary/utils'
import { stateOf } from '../definitions'
import {
  checklistOf,
  countKey,
  countsOf,
  displayValue,
  formatWhen,
  isVisible,
  isWide,
  photosOf,
  timelineOf,
} from '../fields'
import type { FieldContext, RegisterDefinition, RegisterField, RegisterRecord } from '../types'

const CELL = 'border border-paper-line px-2 py-1 align-top'
const KEY = `${CELL} w-[18%] bg-paper-head font-semibold`
const HEAD = 'mt-1 text-[0.625rem] font-semibold tracking-wide uppercase'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <p className={HEAD}>{title}</p>
      {children}
    </>
  )
}

/** Label/value pairs, two to a row; wide values get a row of their own. */
function Pairs({ fields, record }: { fields: RegisterField[]; record: RegisterRecord }) {
  const rows: RegisterField[][] = []
  for (const f of fields) {
    const last = rows[rows.length - 1]
    if (!isWide(f) && last && last.length === 1 && !isWide(last[0])) last.push(f)
    else rows.push([f])
  }
  return (
    <table className="w-full border-collapse">
      <tbody>
        {rows.map((row) => (
          <tr key={row.map((f) => f.key).join()}>
            {row.map((f) => (
              <Pair key={f.key} field={f} record={record} span={row.length === 1 ? 3 : 1} />
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Pair({ field, record, span }: { field: RegisterField; record: RegisterRecord; span: number }) {
  return (
    <>
      <td className={KEY}>{field.label}</td>
      <td colSpan={span} className={`${CELL} whitespace-pre-line`}>
        {displayValue(field, record.values) || '—'}
      </td>
    </>
  )
}

function Counts({ field, record }: { field: RegisterField; record: RegisterRecord }) {
  const counts = countsOf(record.values, field.key)
  const rows = field.rows ?? []
  const cols = field.cols ?? []
  const n = (r: string, c: string) => counts[countKey(r, c)] ?? 0
  const total = rows.reduce((s, r) => s + cols.reduce((t, c) => t + n(r, c), 0), 0)
  return (
    <table className="w-full border-collapse text-center tabular-nums">
      <thead>
        <tr>
          <th className={`${CELL} bg-paper-head text-left`}>{field.label}</th>
          {cols.map((c) => (
            <th key={c} className={`${CELL} bg-paper-head`}>
              {c}
            </th>
          ))}
          {cols.length > 1 && <th className={`${CELL} bg-paper-head`}>Total</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r}>
            <td className={`${CELL} text-left font-semibold`}>{r}</td>
            {cols.map((c) => (
              <td key={c} className={CELL}>
                {n(r, c)}
              </td>
            ))}
            {cols.length > 1 && <td className={CELL}>{cols.reduce((t, c) => t + n(r, c), 0)}</td>}
          </tr>
        ))}
        <tr>
          <td className={`${CELL} text-left font-semibold`}>Total</td>
          <td colSpan={cols.length + (cols.length > 1 ? 1 : 0)} className={`${CELL} font-semibold`}>
            {total}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

function Timeline({ field, record }: { field: RegisterField; record: RegisterRecord }) {
  const rows = timelineOf(record.values, field.key)
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className={`${CELL} w-[4%] bg-paper-head`}>#</th>
          <th className={`${CELL} w-[20%] bg-paper-head text-left`}>Date &amp; time</th>
          <th className={`${CELL} bg-paper-head text-left`}>{field.label}</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={3} className={`${CELL} text-paper-muted`}>
              None recorded.
            </td>
          </tr>
        )}
        {rows.map((r, i) => (
          <tr key={r.id}>
            <td className={`${CELL} text-center`}>{i + 1}</td>
            <td className={`${CELL} whitespace-nowrap tabular-nums`}>{formatWhen(r.at)}</td>
            <td className={`${CELL} whitespace-pre-line`}>{r.text}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Checklist({ field, record, ctx }: { field: RegisterField; record: RegisterRecord; ctx: FieldContext }) {
  const checks = checklistOf(record.values, field.key)
  const items = field.items?.(ctx) ?? Object.keys(checks)
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr>
          <th className={`${CELL} w-[5%] bg-paper-head`}>S.No</th>
          <th className={`${CELL} bg-paper-head text-left`}>Item description</th>
          <th className={`${CELL} w-[15%] bg-paper-head text-left`}>Status</th>
          <th className={`${CELL} w-[40%] bg-paper-head text-left`}>Remarks</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          const c = checks[item]
          return (
            <tr key={item}>
              <td className={`${CELL} text-center`}>{i + 1}</td>
              <td className={CELL}>{item}</td>
              <td className={`${CELL} ${c?.status === 'Not working' ? 'font-semibold text-paper-alert' : ''}`}>
                {c?.status === 'Working' ? '✓ Working' : c?.status === 'Not working' ? '✗ Not working' : '—'}
              </td>
              <td className={CELL}>
                {c?.remarks}
                {c?.photo && (
                  <img
                    src={c.photo.url}
                    alt={`${item}: ${c.photo.name}`}
                    className="mt-1 h-14 border border-paper-line object-cover"
                  />
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function Photos({ field, record }: { field: RegisterField; record: RegisterRecord }) {
  const photos = photosOf(record.values, field.key)
  if (photos.length === 0) return null
  return (
    <Section title={field.label}>
      <div className="flex flex-wrap gap-1.5">
        {photos.map((p) => (
          <img key={p.id} src={p.url} alt={p.name} className="h-24 border border-paper-line object-cover" />
        ))}
      </div>
    </Section>
  )
}

function SectionBody({ fields, record, ctx }: { fields: RegisterField[]; record: RegisterRecord; ctx: FieldContext }) {
  // Plain values go in pair tables; grids, timelines, checklists and photos get their own blocks, in order.
  const blocks: ReactNode[] = []
  let pairs: RegisterField[] = []
  const flush = () => {
    if (pairs.length) blocks.push(<Pairs key={`p-${pairs[0].key}`} fields={pairs} record={record} />)
    pairs = []
  }
  for (const f of fields) {
    const block =
      f.type === 'counts' ? (
        <Counts key={f.key} field={f} record={record} />
      ) : f.type === 'timeline' ? (
        <Timeline key={f.key} field={f} record={record} />
      ) : f.type === 'checklist' ? (
        <Checklist key={f.key} field={f} record={record} ctx={ctx} />
      ) : f.type === 'photos' ? (
        <Photos key={f.key} field={f} record={record} />
      ) : null
    if (!block) {
      pairs.push(f)
      continue
    }
    flush()
    blocks.push(block)
  }
  flush()
  return <div className="flex flex-col gap-1.5">{blocks}</div>
}

/**
 * A register record on its official CMRL form: header with form number, the register's sections, workflow steps,
 * and the sign & metadata block. Paper tokens keep it white in dark mode, like a printout.
 */
export function RecordSheet({
  register,
  record,
  stationName,
}: {
  register: RegisterDefinition
  record: RegisterRecord
  stationName: string
}) {
  const ctx = { stationCode: record.stationCode }
  const state = stateOf(register, record.state)
  const title = (register.form?.title ?? register.label).toUpperCase()
  const steps = (register.workflow?.actions ?? []).filter((a) => a.fields?.some((f) => record.values[f.key]))

  return (
    <article
      aria-label={`${register.form?.title ?? register.label} ${record.ref}`}
      className="relative isolate flex w-full max-w-[51.25rem] flex-col gap-2 overflow-hidden border border-paper-line/60 bg-paper px-4 py-4 text-[0.6875rem] leading-snug text-paper-ink shadow-sm sm:px-5"
    >
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
              <p className="text-[0.625rem] font-semibold text-paper-muted">{title}</p>
              <p className="font-semibold">
                {stationName} ({record.stationCode})
              </p>
            </td>
            <td className={`${CELL} w-[22%] align-middle text-[0.5625rem] whitespace-nowrap`}>
              {register.form ? (
                <>
                  {register.form.number}
                  <br />
                  {register.form.revision}
                  {register.form.date && (
                    <>
                      <br />
                      Date: {register.form.date}
                    </>
                  )}
                </>
              ) : (
                <>Register: {register.code}</>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      <table className="w-full border-collapse">
        <tbody>
          <tr>
            <td className={KEY}>Reference no.</td>
            <td className={`${CELL} font-mono`}>{record.ref}</td>
            <td className={KEY}>Status</td>
            <td className={CELL}>{state.label}</td>
          </tr>
          <tr>
            <td className={KEY}>Shift</td>
            <td className={CELL}>{record.shift}</td>
            <td className={KEY}>Recorded at</td>
            <td className={`${CELL} tabular-nums`}>{formatStampSeconds(record.raisedAt)}</td>
          </tr>
        </tbody>
      </table>

      {register.sections.map((section) => {
        const fields = section.fields.filter((f) => !f.hidden && isVisible(f, record.values))
        return fields.length ? (
          <Section key={section.title} title={section.title}>
            <SectionBody fields={fields} record={record} ctx={ctx} />
          </Section>
        ) : null
      })}

      {steps.map((a) => (
        <Section key={a.id} title={stateOf(register, a.to).label}>
          <SectionBody fields={a.fields ?? []} record={record} ctx={ctx} />
        </Section>
      ))}

      <Section title="Sign & metadata">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <td className={KEY}>Submitted by</td>
              <td className={CELL}>
                {record.raisedBy.name} ({record.raisedBy.employeeId})
              </td>
              <td className={KEY}>Submitted at</td>
              <td className={`${CELL} tabular-nums`}>{formatStampSeconds(record.raisedAt)}</td>
            </tr>
            <tr>
              <td className={KEY}>Revision</td>
              <td className={CELL}>{record.revision}</td>
              <td className={KEY}>Revised at</td>
              <td className={`${CELL} tabular-nums`}>
                {record.revisedAt ? formatStampSeconds(record.revisedAt) : '—'}
              </td>
            </tr>
            <tr>
              <td className={KEY}>Signature of SC/SI</td>
              <td colSpan={3} className={`${CELL} h-10`}>
                <span className="font-[cursive] text-[0.9375rem] leading-none text-paper-sign">
                  {record.raisedBy.name}
                </span>
                <span className="block text-[0.5625rem] text-paper-muted">
                  Signed digitally · {formatStampSeconds(record.raisedAt)}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>
    </article>
  )
}
