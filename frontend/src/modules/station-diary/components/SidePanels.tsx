import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader } from '@/components/ui/Card'
import { TASK_STATUS_LABELS, TASK_STATUS_TONES } from '../constants'
import { setTaskStatus } from '../data/diaryStore'
import type { Person, ShiftDiary } from '../types'
import { formatStamp } from '../utils'

interface PanelProps {
  diary: ShiftDiary
  actor: Person
  /** False once the shift is handed over. */
  editable: boolean
}

import { AlertCircle, CheckCircle } from 'lucide-react'

export function TasksPanel({ diary, actor, editable }: PanelProps) {
  const open = diary.tasks.filter((t) => t.status !== 'completed').length
  return (
    <Card className="flex flex-col gap-3 p-4">
      <CardHeader title="Tasks & events" aside={open > 0 && <Badge tone="info">{open} open</Badge>} />
      {diary.tasks.length === 0 && <p className="text-secondary text-ink-muted">No tasks for this shift.</p>}
      <div className="flex flex-col gap-3">
        {diary.tasks.map((task) => {
          const isCircular = task.kind === 'circular'
          const isDone = task.status === 'completed'

          return (
            <article
              key={task.id}
              className={`group relative flex flex-col gap-2 overflow-hidden rounded-2xl p-4 shadow-sm ring-1 ring-border/50 transition-transform hover:-translate-y-0.5 ${
                isDone
                  ? 'bg-subtle/50 opacity-80'
                  : isCircular
                    ? 'bg-gradient-to-br from-danger-subtle/70 to-surface'
                    : 'bg-gradient-to-br from-info-subtle/70 to-surface'
              }`}
            >
              {/* Decorative watermark icon */}
              <div className="pointer-events-none absolute -top-3 -right-3 opacity-[0.04]">
                {isCircular ? <AlertCircle className="size-24" /> : <CheckCircle className="size-24" />}
              </div>

              <div className="relative flex items-center justify-between gap-2">
                <Badge tone={isCircular ? 'danger' : 'info'}>{isCircular ? 'Circular' : 'Task'}</Badge>
                <span className="text-caption font-medium text-ink-muted tabular-nums">
                  Due {formatStamp(task.dueAt)}
                </span>
              </div>
              <div className="relative mt-1">
                <h3 className={`text-body font-bold ${isDone ? 'text-ink-secondary' : 'text-ink'}`}>{task.title}</h3>
                <p className="mt-1 line-clamp-3 text-secondary leading-relaxed text-ink-secondary">{task.body}</p>
              </div>
              <div className="relative mt-1.5 flex flex-wrap items-center justify-between gap-3 pt-2">
                <span className="text-caption font-medium text-ink-muted">From {task.from}</span>
                {editable && !isDone ? (
                  <div className="flex gap-2">
                    {task.status === 'open' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setTaskStatus(diary.id, task.id, 'acknowledged', actor)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={isCircular ? 'danger' : 'primary'}
                      onClick={() => setTaskStatus(diary.id, task.id, 'completed', actor)}
                    >
                      Mark done
                    </Button>
                  </div>
                ) : (
                  <Badge tone={TASK_STATUS_TONES[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </Card>
  )
}

export function HandoverPanel({ diary }: { diary: ShiftDiary }) {
  const { handedBy, handedAt, takenBy, takenAt } = diary.handover
  return (
    <Card className="flex flex-col gap-2.5 p-4">
      <CardHeader title="Handover" />
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-secondary">
        <dt className="text-ink-muted">Handed over by</dt>
        <dd className="font-medium text-ink">
          {handedBy ? `${handedBy.name} · ${handedBy.employeeId}` : '—'}
          {handedAt && (
            <span className="block text-caption font-normal text-ink-muted">Signed {formatStamp(handedAt)}</span>
          )}
        </dd>
        <dt className="text-ink-muted">Taken over by</dt>
        <dd className="font-medium text-ink">
          {takenBy ? (
            `${takenBy.name} · ${takenBy.employeeId}`
          ) : (
            <span className="font-normal text-ink-muted">Pending</span>
          )}
          {takenBy && (
            <span className="block text-caption font-normal text-ink-muted">
              {takenAt ? `Acknowledged ${formatStamp(takenAt)}` : 'Awaiting acknowledgement'}
            </span>
          )}
        </dd>
      </dl>
    </Card>
  )
}
