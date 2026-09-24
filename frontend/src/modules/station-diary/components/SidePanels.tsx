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

export function TasksPanel({ diary, actor, editable }: PanelProps) {
  const open = diary.tasks.filter((t) => t.status !== 'completed').length
  return (
    <Card className="flex flex-col gap-3 p-4">
      <CardHeader title="Tasks & events" aside={open > 0 && <Badge tone="info">{open} open</Badge>} />
      {diary.tasks.length === 0 && <p className="text-secondary text-ink-muted">No tasks for this shift.</p>}
      {diary.tasks.map((task) => (
        <article key={task.id} className="flex flex-col gap-1.5 rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <Badge tone={task.kind === 'circular' ? 'danger' : 'primary'}>
              {task.kind === 'circular' ? 'Circular' : 'Task'}
            </Badge>
            <span className="text-caption text-ink-muted tabular-nums">Due {formatStamp(task.dueAt)}</span>
          </div>
          <h3 className="text-body font-semibold text-ink">{task.title}</h3>
          <p className="line-clamp-3 text-secondary text-ink-secondary">{task.body}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
            <span className="text-caption text-ink-muted">From {task.from}</span>
            {editable && task.status !== 'completed' ? (
              <div className="flex gap-1.5">
                {task.status === 'open' && (
                  <Button size="sm" onClick={() => setTaskStatus(diary.id, task.id, 'acknowledged', actor)}>
                    Acknowledge
                  </Button>
                )}
                <Button size="sm" onClick={() => setTaskStatus(diary.id, task.id, 'completed', actor)}>
                  Mark done
                </Button>
              </div>
            ) : (
              <Badge tone={TASK_STATUS_TONES[task.status]}>{TASK_STATUS_LABELS[task.status]}</Badge>
            )}
          </div>
        </article>
      ))}
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
