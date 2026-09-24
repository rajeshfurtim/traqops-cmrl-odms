import { AlertTriangle } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Checkbox, Label, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { STAFF } from '../data/seed'
import { submitHandover } from '../data/diaryStore'
import type { Person, ShiftDiary } from '../types'
import { formatStamp, shiftLabel } from '../utils'

interface HandoverDialogProps {
  diary: ShiftDiary
  actor: Person
  open: boolean
  onClose: () => void
}

export function HandoverDialog({ diary, actor, open, onClose }: HandoverDialogProps) {
  const [incomingId, setIncomingId] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState('')
  const ids = useId()

  const openTasks = diary.tasks.filter((t) => t.status !== 'completed')
  const openFollowUps = diary.followUps.filter((f) => !f.done)
  const important = diary.entries.filter((e) => e.important).length
  const candidates = STAFF.filter((p) => p.employeeId !== actor.employeeId)

  const submit = () => {
    const incoming = candidates.find((p) => p.employeeId === incomingId)
    if (!incoming) return setError('Choose the incoming Station Controller.')
    if (!confirmed) return setError('Confirm the summary before handing over.')
    submitHandover(diary.id, incoming, actor)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Submit & hand over"
      description={`${shiftLabel(diary.shift)} · after this the diary is locked`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={submit}>
            Sign & hand over
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5 px-5 py-4">
        <section aria-labelledby={`${ids}-summary`}>
          <h3 id={`${ids}-summary`} className="mb-2 text-label text-ink-muted uppercase">
            Shift summary
          </h3>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border text-secondary sm:grid-cols-4">
            {[
              ['Entries', diary.entries.length],
              ['Important', important],
              ['Signed in', diary.signInAt ? formatStamp(diary.signInAt) : '—'],
              ['Open tasks', openTasks.length],
            ].map(([label, value]) => (
              <div key={label} className="bg-surface px-3 py-2">
                <dt className="text-caption text-ink-muted">{label}</dt>
                <dd className="font-semibold text-ink tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {(openTasks.length > 0 || openFollowUps.length > 0) && (
          <div className="flex gap-2.5 rounded-lg bg-warning-subtle px-3 py-2.5 text-secondary text-warning">
            <AlertTriangle aria-hidden className="mt-0.5 size-4 shrink-0" />
            <div>
              {openTasks.length > 0 && (
                <p>
                  {openTasks.length} task{openTasks.length > 1 ? 's are' : ' is'} still open:{' '}
                  {openTasks.map((t) => t.title).join(', ')}.
                </p>
              )}
              {openFollowUps.length > 0 && (
                <p>
                  {openFollowUps.length} follow-up{openFollowUps.length > 1 ? 's' : ''} will be carried to the next
                  shift.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${ids}-incoming`}>Incoming Station Controller</Label>
          <Select
            id={`${ids}-incoming`}
            value={incomingId}
            onChange={(e) => setIncomingId(e.target.value)}
            data-autofocus
          >
            <option value="">Choose…</option>
            {candidates.map((p) => (
              <option key={p.employeeId} value={p.employeeId}>
                {p.name} · {p.employeeId}
              </option>
            ))}
          </Select>
          <p className="text-caption text-ink-muted">They acknowledge the takeover when they sign in.</p>
        </div>

        <label className="flex items-start gap-2.5 text-secondary text-ink-secondary">
          <Checkbox className="mt-0.5" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          I, {actor.name} ({actor.employeeId}), confirm this diary is a complete record of the shift.
        </label>

        {error && (
          <p role="alert" className="text-secondary text-danger">
            {error}
          </p>
        )}
      </div>
    </Modal>
  )
}
