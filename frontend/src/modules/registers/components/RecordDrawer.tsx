import { FilePen, Printer, X } from 'lucide-react'
import { useId, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Dialog } from '@/components/ui/Dialog'
import { Input, Label } from '@/components/ui/Field'
import { IconButton } from '@/components/ui/IconButton'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useSession } from '@/context/SessionContext'
import { formatStamp } from '@/modules/station-diary/utils'
import { addRemark } from '../data/registerStore'
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
  recordTitle,
  str,
  timelineOf,
} from '../fields'
import type { RegisterDefinition, RegisterField, RegisterRecord, WorkflowAction } from '../types'
import { ActionDialog } from './ActionDialog'
import { RecordPrint } from './RecordPrint'
import { RecordSheet } from './RecordSheet'

const SECTION = 'flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-card'
const SECTION_TITLE = 'text-label text-ink-muted uppercase'

interface RecordDrawerProps {
  register: RegisterDefinition
  record: RegisterRecord | undefined
  onClose: () => void
  onCorrect: (record: RegisterRecord) => void
}

type View = 'details' | 'form'

/** The chosen record in a drawer from the right, over the register table. */
export function RecordDrawer({ register, record, onClose, onCorrect }: RecordDrawerProps) {
  return (
    <Dialog
      open={Boolean(record)}
      onClose={onClose}
      aria-label={record ? `${recordTitle(register, record)}, ${record.ref}` : register.label}
      className="odms-drawer odms-drawer-end fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-[36rem] max-w-full flex-col bg-canvas text-ink shadow-overlay open:flex"
    >
      {record && (
        <DrawerBody key={record.id} register={register} record={record} onClose={onClose} onCorrect={onCorrect} />
      )}
    </Dialog>
  )
}

function DrawerBody({
  register,
  record,
  onClose,
  onCorrect,
}: {
  register: RegisterDefinition
  record: RegisterRecord
  onClose: () => void
  onCorrect: (record: RegisterRecord) => void
}) {
  const ids = useId()
  const { user, station } = useSession()
  const [view, setView] = useState<View>('details')
  const [action, setAction] = useState<WorkflowAction | null>(null)
  const [printing, setPrinting] = useState(false)
  const [remark, setRemark] = useState('')
  const [error, setError] = useState('')
  const Icon = register.icon
  const state = stateOf(register, record.state)
  const actions = register.workflow?.actions.filter((a) => a.from.includes(record.state)) ?? []
  // Only the person who recorded an entry can correct it; everyone can add remarks.
  const canCorrect = record.raisedBy.employeeId === user.employeeId
  const stationName = record.stationCode === station.code ? station.name : record.stationCode
  // The register's sections, then the values each completed workflow step added (e.g. "Returned").
  const sections = [
    ...register.sections,
    ...(register.workflow?.actions ?? [])
      .filter((a) => a.fields?.some((f) => record.values[f.key]))
      .map((a) => ({ title: stateOf(register, a.to).label, fields: a.fields ?? [] })),
  ]

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!remark.trim()) return setError('Type a remark first.')
    addRemark(record.id, user.name, remark.trim())
    setRemark('')
    setError('')
  }

  const sheet = <RecordSheet register={register} record={record} stationName={stationName} />
  const formLabel = register.form
    ? `Official form (${register.form.number.replace('CMRL/OPER/SO/', '')})`
    : 'Official form'

  return (
    <>
      <header className="on-header flex shrink-0 items-start gap-3 border-l-[0.375rem] border-accent bg-header py-4 pr-2 pl-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent text-on-accent">
          <Icon aria-hidden className="size-5" strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-caption text-ink-muted">{record.ref}</p>
          <h2 className="font-display text-title leading-snug font-extrabold text-ink">
            {recordTitle(register, record)}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-caption text-ink-muted">
            <Badge tone={state.tone} dot>
              {state.label}
            </Badge>
            {record.revision > 0 && <Badge>Revision {record.revision}</Badge>}
            <span>{register.label}</span>
          </div>
        </div>
        <IconButton icon={X} label="Close" tooltip={false} onClick={onClose} />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col gap-3 p-4">
          <dl className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-surface shadow-card">
            <Fact label="Recorded at">{formatStamp(record.raisedAt)}</Fact>
            <Fact label="Shift">Shift {record.shift}</Fact>
            <Fact label="Recorded by">
              {record.raisedBy.name}
              <span className="block text-caption text-ink-muted">{record.raisedBy.employeeId}</span>
            </Fact>
          </dl>
          {record.diaryLabel && (
            <Link
              to="/station-diary"
              className="rounded-lg border border-primary/25 bg-primary-subtle px-3 py-2 text-secondary font-medium text-primary-ink hover:underline"
            >
              Linked to {record.diaryLabel} ›
            </Link>
          )}

          <SegmentedControl
            label="Show"
            size="sm"
            value={view}
            onChange={setView}
            options={[
              { value: 'details', label: 'Details' },
              { value: 'form', label: formLabel },
            ]}
            className="mt-1 self-start"
          />

          {view === 'form' ? (
            <div className="overflow-x-auto rounded-xl border border-border bg-muted p-2">{sheet}</div>
          ) : (
            sections.map((section) => {
              const fields = section.fields.filter((f) => !f.hidden && isVisible(f, record.values))
              if (fields.length === 0) return null
              return (
                <section key={section.title} aria-label={section.title} className={SECTION}>
                  <h3 className={SECTION_TITLE}>{section.title}</h3>
                  <dl className="grid grid-cols-2 gap-x-5 gap-y-3.5">
                    {fields.map((f) => (
                      <Item key={f.key} label={f.label} wide={isWide(f)}>
                        <FieldView field={f} record={record} />
                      </Item>
                    ))}
                  </dl>
                </section>
              )
            })
          )}

          <section aria-labelledby={`${ids}-history`} className={SECTION}>
            <h3 id={`${ids}-history`} className={SECTION_TITLE}>
              History
            </h3>
            <Timeline
              items={record.history.map((e, i) => ({
                id: String(i),
                when: `${formatStamp(e.at)} · ${e.by}`,
                text: e.text,
              }))}
              whenBelow
            />
            <form onSubmit={submit} noValidate className="flex flex-col gap-1.5 border-t border-border pt-3">
              <Label htmlFor={`${ids}-remark`}>Add a remark</Label>
              <div className="flex gap-2">
                <Input
                  id={`${ids}-remark`}
                  value={remark}
                  aria-invalid={Boolean(error)}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="e.g. Informed E&M again; spare expected tomorrow."
                  className="min-w-0 flex-1"
                />
                <Button type="submit">Add remark</Button>
              </div>
              {error && (
                <p role="alert" className="text-caption text-danger">
                  {error}
                </p>
              )}
            </form>
          </section>
        </div>
      </div>

      <footer className="flex shrink-0 flex-wrap gap-2 border-t border-border bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {actions.map((a) => (
          <Button key={a.id} variant="primary" onClick={() => setAction(a)} className="flex-1">
            {a.label}
          </Button>
        ))}
        {canCorrect && (
          <Button icon={FilePen} onClick={() => onCorrect(record)} className={actions.length ? '' : 'ml-auto'}>
            Correct entry
          </Button>
        )}
        <Button
          icon={Printer}
          onClick={() => setPrinting(true)}
          className={actions.length || canCorrect ? '' : 'ml-auto'}
        >
          Print form
        </Button>
      </footer>

      <ActionDialog register={register} record={record} action={action} onClose={() => setAction(null)} />
      {printing && <RecordPrint onDone={() => setPrinting(false)}>{sheet}</RecordPrint>}
    </>
  )
}

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 px-3 py-2.5">
      <dt className="text-caption text-ink-muted">{label}</dt>
      <dd className="text-secondary font-semibold text-ink tabular-nums">{children}</dd>
    </div>
  )
}

function Item({ label, wide = false, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <div className={`min-w-0 ${wide ? 'col-span-2' : ''}`}>
      <dt className="text-caption text-ink-muted">{label}</dt>
      <dd className="mt-0.5 text-body break-words whitespace-pre-line text-ink">{children}</dd>
    </div>
  )
}

/** Dots on a line, oldest first. `whenBelow` puts the date under the text (history) instead of before it. */
function Timeline({
  items,
  whenBelow = false,
}: {
  items: { id: string; when: string; text: string }[]
  whenBelow?: boolean
}) {
  return (
    <ol className="flex flex-col">
      {items.map((item) => (
        <li
          key={item.id}
          // The line joins each dot to the next one; the last has none.
          className="relative flex gap-3 pb-3 before:absolute before:top-3 before:bottom-0 before:left-1 before:w-0.5 before:bg-primary/25 last:pb-0 last:before:hidden"
        >
          <span
            aria-hidden
            className="relative mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-surface bg-primary ring-1 ring-primary/30"
          />
          <span className="min-w-0 text-secondary">
            {!whenBelow && (
              <span className="block text-caption font-medium text-ink-muted tabular-nums">{item.when}</span>
            )}
            <span className="text-ink">{item.text}</span>
            {whenBelow && <span className="block text-caption text-ink-muted tabular-nums">{item.when}</span>}
          </span>
        </li>
      ))}
    </ol>
  )
}

/** A field's value for reading on screen; grids, timelines, checklists and photos keep their structure. */
function FieldView({ field, record }: { field: RegisterField; record: RegisterRecord }) {
  const values = record.values
  if (field.type === 'timeline') {
    const rows = timelineOf(values, field.key)
    if (rows.length === 0) return <span className="text-ink-disabled">None</span>
    return <Timeline items={rows.map((r) => ({ id: r.id, when: formatWhen(r.at), text: r.text }))} />
  }
  if (field.type === 'yesno') {
    const v = str(values, field.key)
    return v ? <Badge tone={v === 'Yes' ? 'info' : 'neutral'}>{v}</Badge> : <>—</>
  }
  if (field.type === 'counts') {
    const counts = countsOf(values, field.key)
    const cols = field.cols ?? []
    const parts = (field.rows ?? []).flatMap((row) =>
      cols.flatMap((col) => {
        const n = counts[countKey(row, col)]
        return n ? [`${row}${cols.length > 1 ? ` ${col.toLowerCase()}` : ''} ${n}`] : []
      }),
    )
    return (
      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-title font-extrabold tabular-nums">{displayValue(field, values) || 0}</span>
        {parts.map((p) => (
          <span key={p} className="rounded bg-muted px-1.5 text-caption text-ink-secondary">
            {p}
          </span>
        ))}
      </span>
    )
  }
  if (field.type === 'checklist') {
    const checks = checklistOf(values, field.key)
    const bad = Object.entries(checks).filter(([, c]) => c.status === 'Not working')
    const good = Object.keys(checks).length - bad.length
    return (
      <span className="flex flex-col gap-2">
        <span className="flex gap-2">
          <Badge tone="success" dot>
            {good} working
          </Badge>
          {bad.length > 0 && (
            <Badge tone="danger" dot>
              {bad.length} not working
            </Badge>
          )}
        </span>
        {bad.map(([item, c]) => (
          <span key={item} className="flex items-start gap-2 rounded-lg bg-danger-subtle px-3 py-2 text-secondary">
            <span className="min-w-0 flex-1">
              <span className="font-semibold text-danger">{item}</span>
              {c.remarks && <span className="block text-ink">{c.remarks}</span>}
            </span>
            {c.photo && (
              <img src={c.photo.url} alt={`${item}: ${c.photo.name}`} className="size-12 rounded object-cover" />
            )}
          </span>
        ))}
      </span>
    )
  }
  if (field.type === 'photos') {
    const photos = photosOf(values, field.key)
    if (photos.length === 0) return <span className="text-ink-disabled">None</span>
    return (
      <span className="flex flex-wrap gap-1.5">
        {photos.map((p) => (
          <img key={p.id} src={p.url} alt={p.name} className="size-20 rounded-md border border-border object-cover" />
        ))}
      </span>
    )
  }
  const text = displayValue(field, values)
  if (!text) return <span className="text-ink-disabled">—</span>
  if (field.type === 'pn') return <span className="font-mono text-secondary">{text}</span>
  return <>{text}</>
}
