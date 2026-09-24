import {
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FilePlus2,
  Flag,
  ImageIcon,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react'
import { useId, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Checkbox, Label, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { addFollowUp, closeFollowUp, deleteEntry, editEntry, type EntryChange } from '../data/diaryStore'
import { toPlainText } from '../richText'
import type { DiaryEntry, FollowUp, Person, ShiftDiary } from '../types'
import { formatFormDate, formatShortDate, formatStamp, formatTime, toISODate } from '../utils'
import { DiaryEditor } from './DiaryEditor'
import { RichText } from './RichText'

type Filter = 'all' | 'important'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'important', label: '★ Important' },
]

const CHIP = 'h-7 rounded-full border px-3 text-caption font-medium transition-colors duration-150'
const NAV_BUTTON =
  'inline-flex size-8 items-center justify-center rounded-md border border-border bg-surface text-ink-secondary hover:bg-subtle hover:text-ink aria-disabled:pointer-events-none aria-disabled:opacity-40'
const ACTION = 'inline-flex items-center gap-1 rounded font-medium text-primary-ink hover:underline'
const DANGER_ACTION = 'inline-flex items-center gap-1 rounded font-medium text-danger hover:underline'
const CLOSE_ACTION =
  'inline-flex h-6 items-center gap-1 rounded-md border border-success/40 bg-surface px-2 font-medium text-success hover:bg-success-subtle'

interface DiaryTimelineProps {
  diary: ShiftDiary
  previousId?: string
  nextId?: string
  /** The signed-in controller's open shift: entries can be edited, deleted, followed up and raise records. */
  editable: boolean
  actor: Person
}

type Pending = { kind: 'delete' | 'follow-up'; entry: DiaryEntry } | null

/** Entries of one shift, newest first, with an importance filter and per-entry actions. */
export function DiaryTimeline({ diary, previousId, nextId, editable, actor }: DiaryTimelineProps) {
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<string>()
  const [pending, setPending] = useState<Pending>(null)

  const entries = useMemo(() => {
    const list = [...diary.entries].sort((a, b) => b.at.localeCompare(a.at))
    return filter === 'important' ? list.filter((e) => e.important) : list
  }, [diary.entries, filter])

  // Entries with an open follow-up are pinned to the top and highlighted until the follow-up is closed.
  const openFollowUpIds = new Set(diary.followUps.filter((f) => !f.done).map((f) => f.id))
  const pinned = entries.filter((e) => e.followUpId && openFollowUpIds.has(e.followUpId))
  const rest = entries.filter((e) => !pinned.includes(e))
  // Follow-ups carried from the previous shift have no entry here; they sit in the same band.
  const carried = filter === 'all' ? diary.followUps.filter((f) => !f.done && !f.entryId) : []
  const openCount = carried.length + pinned.length
  const close = (followUpId: string) => closeFollowUp(diary.id, followUpId, actor)

  const row = (entry: DiaryEntry, last: boolean, highlight = false) => (
    <EntryRow
      key={entry.id}
      entry={entry}
      last={last}
      highlight={highlight}
      editing={editingId === entry.id}
      manage={canManage(entry)}
      canRaiseRecords={editable}
      followUpDone={diary.followUps.find((f) => f.id === entry.followUpId)?.done}
      onEdit={() => setEditingId(entry.id)}
      onCancelEdit={() => setEditingId(undefined)}
      onSave={(change) => {
        editEntry(diary.id, entry.id, change, actor)
        setEditingId(undefined)
      }}
      onDelete={() => setPending({ kind: 'delete', entry })}
      onFollowUp={() => setPending({ kind: 'follow-up', entry })}
      onCloseFollowUp={editable && entry.followUpId ? () => close(entry.followUpId!) : undefined}
    />
  )

  // Only the controller's own entries on the open shift; entries recorded by ODMS stay as they are.
  const canManage = (entry: DiaryEntry) => editable && !entry.system && entry.author.employeeId === actor.employeeId

  return (
    <section aria-label="Diary entries" className="rounded-xl border border-border bg-surface shadow-card">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-4 py-2.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`${CHIP} ${
              filter === f.value
                ? 'border-transparent bg-primary-subtle text-primary-ink'
                : 'border-border text-ink-secondary hover:bg-subtle'
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1.5 text-caption text-ink-secondary">
          <Link
            to={previousId ? `/station-diary/shifts/${previousId}` : '#'}
            aria-label="Previous shift"
            aria-disabled={!previousId}
            className={NAV_BUTTON}
          >
            <ChevronLeft aria-hidden className="size-4" />
          </Link>
          <span className="tabular-nums">
            Shift {diary.shift}, {formatShortDate(diary.date)}
          </span>
          <Link
            to={nextId ? `/station-diary/shifts/${nextId}` : '#'}
            aria-label="Next shift"
            aria-disabled={!nextId}
            className={NAV_BUTTON}
          >
            <ChevronRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>

      {openCount > 0 && (
        <section
          aria-labelledby="pinned-follow-ups"
          className="border-b border-l-4 border-warning-dot/30 border-l-accent bg-warning-subtle"
        >
          <h3
            id="pinned-follow-ups"
            className="flex items-center gap-1.5 px-4 pt-2.5 text-label text-warning uppercase"
          >
            <Flag aria-hidden className="size-3.5" />
            Follow-ups · {openCount} open
          </h3>
          <ol className="py-1">
            {carried.map((f, i) => (
              <CarriedFollowUpRow
                key={f.id}
                followUp={f}
                last={i === carried.length - 1 && pinned.length === 0}
                onClose={editable ? () => close(f.id) : undefined}
              />
            ))}
            {pinned.map((entry, i) => row(entry, i === pinned.length - 1, true))}
          </ol>
        </section>
      )}

      {entries.length === 0 && openCount === 0 ? (
        <p className="px-4 py-10 text-center text-body text-ink-muted">
          {diary.entries.length ? 'No entries match this filter.' : 'No entries in this shift.'}
        </p>
      ) : (
        rest.length > 0 && <ol className="py-1">{rest.map((entry, i) => row(entry, i === rest.length - 1))}</ol>
      )}

      <DeleteEntryDialog
        entry={pending?.kind === 'delete' ? pending.entry : undefined}
        onClose={() => setPending(null)}
        onConfirm={(entry) => {
          deleteEntry(diary.id, entry.id, actor)
          setPending(null)
        }}
      />
      <FollowUpDialog
        entry={pending?.kind === 'follow-up' ? pending.entry : undefined}
        onClose={() => setPending(null)}
        onConfirm={(entry, text) => {
          addFollowUp(diary.id, entry.id, text)
          setPending(null)
        }}
      />
    </section>
  )
}

interface EntryRowProps {
  entry: DiaryEntry
  last: boolean
  /** Pinned follow-up: highlighted row. */
  highlight?: boolean
  editing: boolean
  manage: boolean
  canRaiseRecords: boolean
  followUpDone?: boolean
  onEdit: () => void
  onCancelEdit: () => void
  onSave: (change: EntryChange) => void
  onDelete: () => void
  onFollowUp: () => void
  /** Shown on an open follow-up when the shift is editable. */
  onCloseFollowUp?: () => void
}

function EntryRow({
  entry,
  last,
  highlight = false,
  editing,
  manage,
  canRaiseRecords,
  followUpDone,
  onEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onFollowUp,
  onCloseFollowUp,
}: EntryRowProps) {
  // Dot: amber for important, grey for entries recorded by ODMS, blue otherwise.
  const dot = entry.important ? 'bg-warning-dot' : entry.system ? 'bg-ink-muted' : 'bg-primary'

  return (
    <li
      className={`grid grid-cols-[4.75rem_0.875rem_minmax(0,1fr)] gap-x-3 px-4 py-2.5 ${highlight ? '' : 'hover:bg-subtle/60'}`}
    >
      <time dateTime={entry.at} className="pt-0.5 tabular-nums">
        <span className="block text-secondary font-semibold text-ink-secondary">{formatTime(entry.at)}</span>
        <span className="block text-caption text-ink-muted">{formatFormDate(toISODate(new Date(entry.at)))}</span>
      </time>
      <span aria-hidden className="relative flex justify-center">
        {!last && <span className="absolute top-3 -bottom-6 w-px bg-border-strong" />}
        <span className={`relative mt-1.5 size-2.5 rounded-full ring-2 ring-surface ${dot}`} />
      </span>
      <div className="min-w-0">
        {entry.system && <p className="mb-0.5 text-caption text-ink-muted">Recorded by ODMS</p>}

        {editing ? (
          <EditEntryForm entry={entry} onSave={onSave} onCancel={onCancelEdit} />
        ) : (
          <div className="flex gap-1.5">
            {entry.important && (
              <Star aria-label="Important" className="mt-1 size-3.5 shrink-0 fill-warning-dot text-warning-dot" />
            )}
            <RichText text={entry.text} className="min-w-0 text-body text-ink" />
          </div>
        )}

        {entry.attachments && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {entry.attachments.map((a) => (
              <li key={a.id}>
                <a href={a.url} target="_blank" rel="noreferrer" title={a.name}>
                  <img src={a.url} alt={a.name} className="size-14 rounded-md border border-border object-cover" />
                </a>
              </li>
            ))}
          </ul>
        )}

        {!editing && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-muted">
            <span>By {entry.author.name}</span>
            {entry.editedAt && (
              <span className="tabular-nums" title="Earlier wording is kept for audit.">
                Edited {formatStamp(entry.editedAt)}
              </span>
            )}
            {entry.attachments && (
              <span className="inline-flex items-center gap-1">
                <ImageIcon aria-hidden className="size-3" /> {entry.attachments.length}
              </span>
            )}
            {entry.followUpId && (
              <span
                className={`inline-flex items-center gap-1 font-medium ${followUpDone ? 'text-success' : 'text-warning'}`}
              >
                <Flag aria-hidden className="size-3" />
                {followUpDone ? 'Follow-up closed' : 'Follow-up open'}
              </span>
            )}
            {entry.followUpId && !followUpDone && onCloseFollowUp && (
              <button type="button" className={CLOSE_ACTION} onClick={onCloseFollowUp}>
                <Check aria-hidden className="size-3" strokeWidth={2.5} />
                Close follow-up
              </button>
            )}
            {entry.registerRecord ? (
              <Link
                to={`/registers/${entry.registerRecord.registerId}?record=${encodeURIComponent(entry.registerRecord.ref)}`}
                className={ACTION}
              >
                <ExternalLink aria-hidden className="size-3" />
                {entry.registerRecord.ref}
              </Link>
            ) : (
              canRaiseRecords &&
              !entry.system && (
                <Link to={`/registers?fromEntry=${entry.id}`} className={ACTION}>
                  <FilePlus2 aria-hidden className="size-3" />
                  Create register entry
                </Link>
              )
            )}
            {manage && (
              <span className="flex items-center gap-3 sm:ml-auto">
                <button type="button" className={ACTION} onClick={onEdit}>
                  <Pencil aria-hidden className="size-3" />
                  Edit
                </button>
                {!entry.followUpId && (
                  <button type="button" className={ACTION} onClick={onFollowUp}>
                    <Flag aria-hidden className="size-3" />
                    Follow-up
                  </button>
                )}
                <button type="button" className={DANGER_ACTION} onClick={onDelete}>
                  <Trash2 aria-hidden className="size-3" />
                  Delete
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

/** A follow-up carried from the previous shift, closed from the same band as entry follow-ups. */
function CarriedFollowUpRow({ followUp, last, onClose }: { followUp: FollowUp; last: boolean; onClose?: () => void }) {
  return (
    <li className="grid grid-cols-[4.75rem_0.875rem_minmax(0,1fr)] gap-x-3 px-4 py-2.5">
      <span className="pt-0.5 text-caption leading-tight text-warning">Previous shift</span>
      <span aria-hidden className="relative flex justify-center">
        {!last && <span className="absolute top-3 -bottom-6 w-px bg-border-strong" />}
        <span className="relative mt-1.5 size-2.5 rounded-full bg-warning-dot ring-2 ring-surface" />
      </span>
      <div className="min-w-0">
        <p className="text-body text-ink">{followUp.text}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-ink-muted">
          <span className="inline-flex items-center gap-1 font-medium text-warning">
            <Flag aria-hidden className="size-3" />
            Carried from previous shift
          </span>
          {onClose && (
            <button type="button" className={CLOSE_ACTION} onClick={onClose}>
              <Check aria-hidden className="size-3" strokeWidth={2.5} />
              Close follow-up
            </button>
          )}
        </div>
      </div>
    </li>
  )
}

function EditEntryForm({
  entry,
  onSave,
  onCancel,
}: {
  entry: DiaryEntry
  onSave: (change: EntryChange) => void
  onCancel: () => void
}) {
  const ids = useId()
  const [text, setText] = useState(entry.text)
  const [important, setImportant] = useState(entry.important)
  const [error, setError] = useState('')

  const submit = (event?: FormEvent) => {
    event?.preventDefault()
    if (!text.trim()) return setError("An entry can't be empty. Use Delete to remove it.")
    onSave({ text, important })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2" noValidate>
      <div className="overflow-hidden rounded-md border border-border-strong bg-surface">
        <DiaryEditor
          value={text}
          onChange={(markup) => {
            setText(markup)
            setError('')
          }}
          onSubmit={() => submit()}
          onCancel={onCancel}
          label="Edit entry"
          autoFocus
          invalid={Boolean(error)}
        />
      </div>
      {error && (
        <p id={`${ids}-error`} className="text-caption text-danger">
          {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label className="mr-auto flex items-center gap-2 text-secondary text-ink-secondary">
          <Checkbox checked={important} onChange={(e) => setImportant(e.target.checked)} />
          <Star aria-hidden className={`size-3.5 ${important ? 'fill-warning-dot text-warning-dot' : ''}`} />
          Important
        </label>
        <span className="text-caption text-ink-muted">The logged date and time stay the same.</span>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" variant="primary" type="submit">
          Save changes
        </Button>
      </div>
    </form>
  )
}

function Quote({ entry }: { entry: DiaryEntry }) {
  return (
    <blockquote className="rounded-lg border border-border bg-canvas px-3 py-2 text-secondary text-ink-secondary">
      <span className="mb-0.5 block text-caption text-ink-muted tabular-nums">{formatStamp(entry.at)}</span>
      <RichText text={entry.text} />
    </blockquote>
  )
}

function DeleteEntryDialog({
  entry,
  onClose,
  onConfirm,
}: {
  entry?: DiaryEntry
  onClose: () => void
  onConfirm: (entry: DiaryEntry) => void
}) {
  return (
    <Modal
      open={Boolean(entry)}
      onClose={onClose}
      title="Delete this entry?"
      description="It will be removed from the diary, booklet and PDF. ODMS keeps a record of the deletion."
      footer={
        <>
          <Button variant="ghost" onClick={onClose} data-autofocus>
            Keep entry
          </Button>
          <Button variant="danger" icon={Trash2} onClick={() => entry && onConfirm(entry)}>
            Delete entry
          </Button>
        </>
      }
    >
      {entry && (
        <div className="flex flex-col gap-2 px-5 py-4">
          <Quote entry={entry} />
          {entry.followUpId && <p className="text-caption text-ink-muted">Its open follow-up is removed too.</p>}
        </div>
      )}
    </Modal>
  )
}

function FollowUpDialog({
  entry,
  onClose,
  onConfirm,
}: {
  entry?: DiaryEntry
  onClose: () => void
  onConfirm: (entry: DiaryEntry, text: string) => void
}) {
  return (
    <Modal
      open={Boolean(entry)}
      onClose={onClose}
      title="Add follow-up"
      description="Open follow-ups are listed on this shift and carried to the next shift at handover."
    >
      {entry && <FollowUpForm entry={entry} onClose={onClose} onConfirm={onConfirm} />}
    </Modal>
  )
}

function FollowUpForm({
  entry,
  onClose,
  onConfirm,
}: {
  entry: DiaryEntry
  onClose: () => void
  onConfirm: (entry: DiaryEntry, text: string) => void
}) {
  const ids = useId()
  const plain = toPlainText(entry.text)
  const [text, setText] = useState(plain.length > 140 ? `${plain.slice(0, 137)}…` : plain)
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!text.trim()) return setError('Describe what needs following up.')
    onConfirm(entry, text)
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex flex-col gap-3 px-5 py-4">
        <Quote entry={entry} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${ids}-text`}>What needs following up</Label>
          <Textarea
            id={`${ids}-text`}
            rows={3}
            value={text}
            data-autofocus
            onChange={(e) => {
              setText(e.target.value)
              setError('')
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${ids}-error` : undefined}
          />
          {error && (
            <p id={`${ids}-error`} className="text-caption text-danger">
              {error}
            </p>
          )}
        </div>
      </div>
      <footer className="flex justify-end gap-2 border-t border-border bg-canvas px-5 py-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" icon={Flag}>
          Add follow-up
        </Button>
      </footer>
    </form>
  )
}
