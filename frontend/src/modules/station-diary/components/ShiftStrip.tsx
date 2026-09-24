import type { ReactNode } from 'react'
import type { ShiftDiary } from '../types'
import { formatStamp, shiftLabel } from '../utils'

import { Clock, User, Hash, LogIn, LogOut, FileText } from 'lucide-react'

function Cell({
  label,
  icon: Icon,
  iconColor,
  children,
}: {
  label: string
  icon: any
  iconColor: string
  children: ReactNode
}) {
  return (
    <div className="relative flex min-w-0 items-center gap-3 px-4 py-3.5">
      <div className={`shrink-0 rounded-lg p-2 ${iconColor} shadow-xs ring-1 ring-border/50`}>
        <Icon className="size-4" strokeWidth={2.5} />
      </div>
      <div className="min-w-0 flex-1">
        <dt className="mb-1 text-caption leading-none text-ink-muted">{label}</dt>
        <dd className="truncate font-display text-body leading-none font-bold text-ink tabular-nums">{children}</dd>
      </div>
    </div>
  )
}

/** Who is on duty and when: the header block of the paper diary. */
export function ShiftStrip({ diary }: { diary: ShiftDiary }) {
  const important = diary.entries.filter((e) => e.important).length

  const gridClasses = [
    'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6',
    'overflow-hidden rounded-xl border border-border bg-surface shadow-card',
    // Base cell borders
    '[&>div]:border-border/60 [&>div]:border-b [&>div]:border-r',
    // Right borders per breakpoint
    'even:[&>div]:border-r-0',
    'sm:even:[&>div]:border-r sm:[&>div:nth-child(3n)]:border-r-0',
    'xl:[&>div:nth-child(3n)]:border-r xl:[&>div:nth-child(6n)]:border-r-0',
    // Bottom borders per breakpoint
    '[&>div:nth-child(n+5)]:border-b-0',
    'sm:[&>div:nth-child(n+4)]:border-b-0',
    'xl:[&>div]:border-b-0',
  ].join(' ')

  return (
    <dl className={gridClasses}>
      <Cell label="Shift" icon={Clock} iconColor="text-primary bg-primary-subtle">
        {shiftLabel(diary.shift).replace('Shift ', '')}
      </Cell>
      <Cell label="Station Controller" icon={User} iconColor="text-info bg-info-subtle">
        {diary.controller?.name ?? '—'}
      </Cell>
      <Cell label="Emp no." icon={Hash} iconColor="text-ink-secondary bg-canvas">
        {diary.controller?.employeeId ?? '—'}
      </Cell>
      <Cell label="Signed in" icon={LogIn} iconColor="text-success bg-success-subtle">
        {diary.signInAt ? formatStamp(diary.signInAt) : '—'}
      </Cell>
      <Cell label="Signed out" icon={LogOut} iconColor="text-warning bg-warning-subtle">
        {diary.signOutAt ? formatStamp(diary.signOutAt) : <span className="font-normal text-ink-muted">Not yet</span>}
      </Cell>
      <Cell label="Entries" icon={FileText} iconColor="text-accent-hover bg-accent-subtle">
        {diary.entries.length}
        {important > 0 && <span className="font-normal text-warning-dot"> · {important} ★</span>}
      </Cell>
    </dl>
  )
}
