import { useId, useState, type FormEvent } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Label, Select } from '@/components/ui/Field'
import { formatDateTime } from '@/utils/format'
import { addRemark, changeStatus } from '../data/registerStore'
import { NEXT_STATUSES, STATUS_LABELS, STATUS_TONES } from '../definitions'
import type { RecordStatus, RegisterDefinition, RegisterRecord } from '../types'

interface RecordPanelProps {
  register: RegisterDefinition
  record: RegisterRecord
  actor: string
}

export function RecordPanel({ register, record, actor }: RecordPanelProps) {
  const ids = useId()
  const next = NEXT_STATUSES[record.status]
  const [status, setStatus] = useState<RecordStatus | ''>('')
  const [remark, setRemark] = useState('')
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const text = remark.trim()
    if (!status && !text) return setError('Choose a new status or type a remark.')
    if (status === 'closed' && !text) return setError('Add a closing remark, e.g. how the issue was resolved.')
    if (status) changeStatus(record.id, status, actor, text)
    else addRemark(record.id, actor, text)
    setStatus('')
    setRemark('')
    setError('')
  }

  return (
    <Card as="article" aria-labelledby={`${ids}-title`} className="flex flex-col gap-4 p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-caption text-ink-muted">{record.ref}</p>
          <h2 id={`${ids}-title`} className="text-heading text-ink">
            {record.values[register.titleField] || register.label}
          </h2>
        </div>
        <Badge tone={STATUS_TONES[record.status]}>{STATUS_LABELS[record.status]}</Badge>
      </header>

      <dl className="grid gap-x-6 gap-y-2 text-secondary sm:grid-cols-2">
        {register.fields.map((f) => (
          <div key={f.key} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
            <dt className="text-caption text-ink-muted">{f.label}</dt>
            <dd className="whitespace-pre-line text-ink">{record.values[f.key] || '—'}</dd>
          </div>
        ))}
        <div>
          <dt className="text-caption text-ink-muted">Raised</dt>
          <dd className="text-ink tabular-nums">
            {formatDateTime(new Date(record.raisedAt))} · {record.raisedBy}
          </dd>
        </div>
        {record.diaryLabel && (
          <div>
            <dt className="text-caption text-ink-muted">Source</dt>
            <dd className="text-ink">{record.diaryLabel}</dd>
          </div>
        )}
      </dl>

      <section aria-labelledby={`${ids}-history`}>
        <h3 id={`${ids}-history`} className="mb-2 text-label text-ink-muted uppercase">
          History
        </h3>
        <ol className="flex flex-col gap-2">
          {record.history.map((event, i) => (
            <li key={i} className="flex gap-2.5 text-secondary">
              <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-border-strong" />
              <span>
                <span className="text-ink">{event.text}</span>
                <span className="block text-caption text-ink-muted tabular-nums">
                  {formatDateTime(new Date(event.at))} · {event.by}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {record.status !== 'closed' ? (
        <form onSubmit={submit} className="flex flex-col gap-2 border-t border-border pt-4" noValidate>
          <div className="grid gap-2 sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-end">
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${ids}-status`}>Change status</Label>
              <Select
                id={`${ids}-status`}
                value={status}
                onChange={(e) => setStatus(e.target.value as RecordStatus | '')}
              >
                <option value="">Keep {STATUS_LABELS[record.status]}</option>
                {next.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${ids}-remark`}>Remark</Label>
              <Input
                id={`${ids}-remark`}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="What happened?"
              />
            </div>
            <Button type="submit" variant="primary">
              {status ? 'Update' : 'Add remark'}
            </Button>
          </div>
          {error && (
            <p role="alert" className="text-caption text-danger">
              {error}
            </p>
          )}
        </form>
      ) : (
        <p className="border-t border-border pt-3 text-caption text-ink-muted">
          Closed records can't be changed. Raise a new entry if the issue comes back.
        </p>
      )}
    </Card>
  )
}
