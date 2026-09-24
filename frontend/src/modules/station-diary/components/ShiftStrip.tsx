import type { ReactNode } from 'react'
import type { ShiftDiary } from '../types'
import { formatStamp, shiftLabel } from '../utils'

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 bg-surface px-4 py-2.5">
      <dt className="text-caption text-ink-muted">{label}</dt>
      <dd className="truncate text-body font-semibold text-ink tabular-nums">{children}</dd>
    </div>
  )
}

/** Who is on duty and when: the header block of the paper diary. */
export function ShiftStrip({ diary }: { diary: ShiftDiary }) {
  const important = diary.entries.filter((e) => e.important).length
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border shadow-card sm:grid-cols-3 xl:grid-cols-6">
      <Cell label="Shift">{shiftLabel(diary.shift).replace('Shift ', '')}</Cell>
      <Cell label="Station Controller">{diary.controller?.name ?? '—'}</Cell>
      <Cell label="Emp no.">{diary.controller?.employeeId ?? '—'}</Cell>
      <Cell label="Signed in">{diary.signInAt ? formatStamp(diary.signInAt) : '—'}</Cell>
      <Cell label="Signed out">
        {diary.signOutAt ? formatStamp(diary.signOutAt) : <span className="font-normal text-ink-muted">Not yet</span>}
      </Cell>
      <Cell label="Entries">
        {diary.entries.length}
        {important > 0 && <span className="font-normal text-ink-muted"> · {important} ★</span>}
      </Cell>
    </dl>
  )
}
