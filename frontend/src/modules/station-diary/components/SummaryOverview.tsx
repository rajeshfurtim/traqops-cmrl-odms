import { Card, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SHIFT_ORDER, STATUS_LABELS, STATUS_TONES } from '../constants'
import type { ShiftDiary } from '../types'
import { addDays, formatShortDate } from '../utils'

function DayStatus({ title, date, diaries }: { title: string; date: string; diaries: ShiftDiary[] }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <CardHeader title={title} aside={<span className="text-caption text-ink-muted">{formatShortDate(date)}</span>} />
      <ul className="grid grid-cols-4 gap-2">
        {SHIFT_ORDER.map((code) => {
          const diary = diaries.find((d) => d.date === date && d.shift === code)
          const status = diary?.status ?? 'upcoming'
          return (
            <li key={code} className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-body font-semibold text-ink">Shift {code}</span>
              <Badge tone={STATUS_TONES[status]} className="h-auto py-0.5 whitespace-normal">
                {STATUS_LABELS[status]}
              </Badge>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

const CHART_DAYS = 7
const W = 300
const H = 120
const PLOT = { left: 26, right: 6, top: 10, bottom: 22 }

function EntriesChart({ diaries, today }: { diaries: ShiftDiary[]; today: string }) {
  const days = Array.from({ length: CHART_DAYS }, (_, i) => addDays(today, i - (CHART_DAYS - 1)))
  const counts = days.map((day) => diaries.filter((d) => d.date === day).reduce((n, d) => n + d.entries.length, 0))
  const max = Math.max(10, Math.ceil(Math.max(...counts) / 10) * 10)
  const plotW = W - PLOT.left - PLOT.right
  const plotH = H - PLOT.top - PLOT.bottom
  const step = plotW / CHART_DAYS
  const barW = Math.min(22, step * 0.6)
  const y = (v: number) => PLOT.top + plotH - (v / max) * plotH
  const importantToday = diaries
    .filter((d) => d.date === today)
    .flatMap((d) => d.entries)
    .filter((e) => e.important).length

  return (
    <Card className="flex flex-col gap-2 p-4">
      <CardHeader
        title="Entries per day"
        aside={
          <span className="text-caption text-ink-muted tabular-nums">
            Today {counts[counts.length - 1]} · {importantToday} ★
          </span>
        }
      />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Diary entries per day for the last ${CHART_DAYS} days`}
        className="h-auto w-full"
      >
        {[0, max / 2, max].map((v) => (
          <g key={v}>
            <line x1={PLOT.left} x2={W - PLOT.right} y1={y(v)} y2={y(v)} className="stroke-border" strokeWidth={1} />
            <text x={PLOT.left - 5} y={y(v) + 3} textAnchor="end" className="fill-ink-muted text-[0.5625rem]">
              {v}
            </text>
          </g>
        ))}
        {counts.map((count, i) => {
          const x = PLOT.left + step * i + (step - barW) / 2
          const isToday = i === counts.length - 1
          return (
            <g key={days[i]}>
              <title>{`${formatShortDate(days[i])}: ${count} entries`}</title>
              <rect
                x={x}
                y={y(count)}
                width={barW}
                height={Math.max(0, PLOT.top + plotH - y(count))}
                rx={3}
                className={isToday ? 'fill-primary' : 'fill-primary/45'}
              />
              <text x={x + barW / 2} y={H - 8} textAnchor="middle" className="fill-ink-muted text-[0.5625rem]">
                {formatShortDate(days[i]).split(' ')[0]}
              </text>
            </g>
          )
        })}
      </svg>
    </Card>
  )
}

/** Yesterday/today shift status and recent activity, above the Shift Summary list. */
export function SummaryOverview({ diaries, today }: { diaries: ShiftDiary[]; today: string }) {
  return (
    <div className="grid items-start gap-4 lg:grid-cols-3">
      <DayStatus title="Yesterday" date={addDays(today, -1)} diaries={diaries} />
      <DayStatus title="Today" date={today} diaries={diaries} />
      <EntriesChart diaries={diaries} today={today} />
    </div>
  )
}
