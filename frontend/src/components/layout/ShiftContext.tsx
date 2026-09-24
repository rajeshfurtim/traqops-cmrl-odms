import { StatusDot, type StatusTone } from '@/components/ui/StatusDot'
import { useSession } from '@/context/SessionContext'
import type { ShiftStatus } from '@/types'
import { formatShiftRange } from '@/utils/format'

const STATUS: Record<ShiftStatus, { label: string; tone: StatusTone; text: string }> = {
  active: { label: 'Active', tone: 'success', text: 'text-success' },
  upcoming: { label: 'Upcoming', tone: 'info', text: 'text-info' },
  closed: { label: 'Closed', tone: 'warning', text: 'text-warning' },
}

interface ShiftContextProps {
  variant?: 'full' | 'compact'
  className?: string
}

export function ShiftContext({ variant = 'full', className = '' }: ShiftContextProps) {
  const { shift } = useSession()
  const status = STATUS[shift.status]
  const range = formatShiftRange(shift.start, shift.end)

  if (variant === 'compact') {
    return (
      <div className={`flex shrink-0 items-center gap-1.5 ${className}`}>
        <StatusDot tone={status.tone} halo={false} live={shift.status === 'active'} />
        <span className="sr-only">
          Shift {range}, {status.label}
        </span>
        <span aria-hidden className="font-medium text-ink tabular-nums">
          {range}
        </span>
      </div>
    )
  }

  return (
    <div className={`shrink-0 leading-tight ${className}`}>
      <p className="text-caption text-ink-muted">Shift</p>
      <p className="flex items-center gap-2 text-secondary">
        <span className="font-semibold text-ink tabular-nums">{range}</span>
        <span className={`flex items-center gap-1.5 font-medium ${status.text}`}>
          <StatusDot tone={status.tone} live={shift.status === 'active'} />
          {status.label}
        </span>
      </p>
    </div>
  )
}
