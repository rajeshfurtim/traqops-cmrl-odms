import { Camera, CheckCheck, Hash, Plus, Trash2, X } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { generatePnNumber } from '@/modules/station-diary/data/diaryStore'
import {
  checklistOf,
  fieldId,
  countKey,
  countsOf,
  isWide,
  optionsFor,
  photosOf,
  str,
  timelineOf,
  toLocalDateTime,
} from '../fields'
import type { CheckItem, FieldContext, FieldValue, Photo, RegisterField, Values } from '../types'

interface FieldInputProps {
  field: RegisterField
  values: Values
  onChange: (key: string, value: FieldValue) => void
  error?: string
  ctx: FieldContext
  /** Id prefix shared by the form, so errors can focus the right control. */
  idBase: string
}

const CHIP =
  'inline-flex h-8 items-center rounded-md border px-3 text-secondary font-medium transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-primary'
const CHIP_ON = 'border-primary bg-primary-subtle text-primary-ink'
const CHIP_OFF = 'border-border-strong bg-surface text-ink-secondary hover:bg-subtle'
const MINI = 'border-b border-border px-2 py-1.5 text-left text-caption font-medium text-ink-muted'
const LABEL = 'text-secondary font-medium text-ink-secondary'

let rowSeq = 0

function toPhotos(files: FileList | null): Photo[] {
  return Array.from(files ?? [])
    .filter((f) => f.type.startsWith('image/'))
    .map((f) => ({ id: `${f.name}-${f.lastModified}`, name: f.name, url: URL.createObjectURL(f) }))
}

/** A label, the control for the field's type, its hint and its error. */
export function FieldInput({ field, values, onChange, error, ctx, idBase }: FieldInputProps) {
  const id = fieldId(idBase, field.key)
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = [field.hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined
  const set = (value: FieldValue) => onChange(field.key, value)
  const value = str(values, field.key)
  const common = { id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy }
  const grouped = ['choice', 'yesno', 'counts', 'timeline', 'checklist', 'photos'].includes(field.type)

  const label = (
    <>
      {field.label}
      {field.required && field.type !== 'computed' && <span className="text-danger"> *</span>}
      {field.type === 'number' && field.unit && field.unit !== '₹' && (
        <span className="font-normal text-ink-muted"> ({field.unit})</span>
      )}
    </>
  )

  let control: ReactNode
  switch (field.type) {
    case 'textarea':
      control = (
        <Textarea
          {...common}
          rows={3}
          value={value}
          placeholder={field.placeholder}
          onChange={(e) => set(e.target.value)}
        />
      )
      break
    case 'select': {
      const options = optionsFor(field, values, ctx)
      control = (
        <Select
          {...common}
          value={value}
          disabled={options.length === 0}
          onChange={(e) => set(e.target.value)}
          className="w-full min-w-0"
        >
          <option value="">Choose…</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </Select>
      )
      break
    }
    case 'choice':
    case 'yesno': {
      const options = field.type === 'yesno' ? ['Yes', 'No'] : optionsFor(field, values, ctx)
      control = (
        <div className="flex flex-wrap gap-1.5">
          {options.map((o, i) => (
            <label key={o} className={`${CHIP} ${value === o ? CHIP_ON : CHIP_OFF} cursor-pointer`}>
              <input
                type="radio"
                name={id}
                id={i === 0 ? id : undefined}
                value={o}
                checked={value === o}
                onChange={() => set(o)}
                aria-describedby={describedBy}
                className="sr-only"
              />
              {o}
            </label>
          ))}
        </div>
      )
      break
    }
    case 'pn':
      control = (
        <div className="flex gap-1.5">
          <Input {...common} value={value} onChange={(e) => set(e.target.value)} className="min-w-0 flex-1 font-mono" />
          <Button size="md" icon={Hash} onClick={() => set(generatePnNumber(ctx.stationCode))}>
            Generate PN
          </Button>
        </div>
      )
      break
    case 'number':
      control = (
        <div className="flex items-center gap-1.5">
          {field.unit === '₹' && <span className="text-body text-ink-muted">₹</span>}
          <Input
            {...common}
            type="number"
            inputMode="numeric"
            min={field.min}
            value={value}
            onChange={(e) => set(e.target.value)}
            className="w-full min-w-0 tabular-nums"
          />
        </div>
      )
      break
    case 'date':
    case 'time':
      control = <Input {...common} type={field.type} value={value} onChange={(e) => set(e.target.value)} />
      break
    case 'datetime':
      control = (
        <div className="flex gap-1.5">
          <Input
            {...common}
            type="datetime-local"
            value={value}
            onChange={(e) => set(e.target.value)}
            className="min-w-0 flex-1"
          />
          <Button onClick={() => set(toLocalDateTime(new Date()))}>Now</Button>
        </div>
      )
      break
    case 'computed':
      control = (
        <output
          id={id}
          aria-describedby={describedBy}
          className="flex min-h-9 items-center rounded-md border border-dashed border-border bg-subtle/60 px-2.5 py-1.5 text-body text-ink"
        >
          {value || <span className="text-ink-disabled">Filled in automatically</span>}
        </output>
      )
      break
    case 'counts':
      control = <CountsInput field={field} values={values} set={set} id={id} describedBy={describedBy} />
      break
    case 'timeline':
      control = <TimelineInput field={field} values={values} set={set} id={id} describedBy={describedBy} />
      break
    case 'photos':
      control = <PhotosInput photos={photosOf(values, field.key)} set={set} id={id} describedBy={describedBy} />
      break
    case 'checklist':
      control = <ChecklistInput field={field} values={values} set={set} ctx={ctx} id={id} describedBy={describedBy} />
      break
    default:
      control = (
        <Input {...common} value={value} placeholder={field.placeholder} onChange={(e) => set(e.target.value)} />
      )
  }

  const Wrapper = grouped ? 'fieldset' : 'div'
  return (
    <Wrapper className={`flex min-w-0 flex-col gap-1.5 ${isWide(field) ? 'sm:col-span-2' : ''}`}>
      {grouped ? (
        <legend className={`${LABEL} mb-1.5`}>{label}</legend>
      ) : (
        <label htmlFor={id} className={LABEL}>
          {label}
        </label>
      )}
      {/* A long checklist shows its hint and error above the items, where they stay in view. */}
      {field.type !== 'checklist' && control}
      {field.hint && (
        <p id={hintId} className="text-caption text-ink-muted">
          {field.hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-caption text-danger">
          {error}
        </p>
      )}
      {field.type === 'checklist' && control}
    </Wrapper>
  )
}

interface PartProps {
  field: RegisterField
  values: Values
  set: (value: FieldValue) => void
  id: string
  describedBy?: string
}

function CountsInput({ field, values, set, id, describedBy }: PartProps) {
  const counts = countsOf(values, field.key)
  const rows = field.rows ?? []
  const cols = field.cols ?? []
  const n = (r: string, c: string) => counts[countKey(r, c)] ?? 0
  const rowTotal = (r: string) => cols.reduce((s, c) => s + n(r, c), 0)
  const total = rows.reduce((s, r) => s + rowTotal(r), 0)
  const multi = cols.length > 1

  return (
    <div className="overflow-x-auto rounded-md border border-border">
      <table className="w-full border-collapse text-body" aria-describedby={describedBy}>
        <thead className="bg-canvas">
          <tr>
            <th scope="col" className={MINI}>
              <span className="sr-only">Gender</span>
            </th>
            {cols.map((c) => (
              <th key={c} scope="col" className={MINI}>
                {c}
              </th>
            ))}
            {multi && (
              <th scope="col" className={`${MINI} text-right`}>
                Total
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={r}>
              <th
                scope="row"
                className="border-b border-border px-2 py-1.5 text-left text-secondary font-medium text-ink"
              >
                {r}
              </th>
              {cols.map((c, ci) => (
                <td key={c} className="border-b border-border px-2 py-1.5">
                  <Input
                    id={ri === 0 && ci === 0 ? id : undefined}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    fieldSize="sm"
                    aria-label={`${r}, ${c}`}
                    value={n(r, c) || ''}
                    placeholder="0"
                    onChange={(e) => set({ ...counts, [countKey(r, c)]: Math.max(0, Number(e.target.value) || 0) })}
                    className="w-16 tabular-nums"
                  />
                </td>
              ))}
              {multi && (
                <td className="border-b border-border px-2 py-1.5 text-right text-ink-muted tabular-nums">
                  {rowTotal(r)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="px-2 py-1.5 text-left text-secondary font-semibold text-ink">
              Total
            </th>
            <td
              colSpan={cols.length + (multi ? 1 : 0)}
              className="px-2 py-1.5 text-right font-semibold text-ink tabular-nums"
            >
              {total}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function TimelineInput({ field, values, set, id, describedBy }: PartProps) {
  const rows = timelineOf(values, field.key)
  const change = (i: number, patch: Partial<(typeof rows)[number]>) =>
    set(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  const add = () => set([...rows, { id: `row-${++rowSeq}`, at: toLocalDateTime(new Date()), text: '' }])

  return (
    <div className="flex flex-col gap-2" aria-describedby={describedBy}>
      {rows.length === 0 && <p className="text-secondary text-ink-muted">No rows yet.</p>}
      <ol className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <li key={r.id} className="grid gap-1.5 sm:grid-cols-[13rem_minmax(0,1fr)_auto] sm:items-start">
            <Input
              type="datetime-local"
              aria-label={`Row ${i + 1}, date and time`}
              value={r.at}
              onChange={(e) => change(i, { at: e.target.value })}
            />
            <Textarea
              rows={1}
              aria-label={`Row ${i + 1}, details`}
              value={r.text}
              onChange={(e) => change(i, { text: e.target.value })}
              className="min-h-9"
            />
            <IconButton
              icon={Trash2}
              label={`Remove row ${i + 1}`}
              tooltip={false}
              onClick={() => set(rows.filter((_, j) => j !== i))}
            />
          </li>
        ))}
      </ol>
      <div>
        <Button id={rows.length === 0 ? id : undefined} size="sm" icon={Plus} onClick={add}>
          Add row
        </Button>
      </div>
    </div>
  )
}

function PhotosInput({
  photos,
  set,
  id,
  describedBy,
  label = 'Add photos',
}: {
  photos: Photo[]
  set: (value: Photo[]) => void
  id?: string
  describedBy?: string
  label?: string
}) {
  const inputId = useId()
  return (
    <div className="flex flex-wrap items-center gap-2">
      {photos.map((p) => (
        <span key={p.id} className="relative">
          <img src={p.url} alt={p.name} className="size-16 rounded-md border border-border object-cover" />
          <button
            type="button"
            aria-label={`Remove ${p.name}`}
            onClick={() => set(photos.filter((x) => x.id !== p.id))}
            className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-ink text-surface"
          >
            <X aria-hidden className="size-3" />
          </button>
        </span>
      ))}
      <label
        htmlFor={id ?? inputId}
        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-secondary font-medium text-ink shadow-xs hover:bg-subtle has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary"
      >
        <Camera aria-hidden className="size-4" />
        {label}
        <input
          id={id ?? inputId}
          type="file"
          accept="image/*"
          multiple
          aria-describedby={describedBy}
          className="sr-only"
          onChange={(e) => {
            set([...photos, ...toPhotos(e.target.files)])
            e.target.value = ''
          }}
        />
      </label>
    </div>
  )
}

function ChecklistInput({ field, values, set, ctx, id, describedBy }: PartProps & { ctx: FieldContext }) {
  const items = field.items?.(ctx) ?? []
  const checks = checklistOf(values, field.key)
  const change = (item: string, patch: Partial<CheckItem>) => set({ ...checks, [item]: { ...checks[item], ...patch } })
  const done = items.filter((i) => checks[i]?.status).length

  return (
    <div className="flex flex-col gap-2" aria-describedby={describedBy}>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          id={id}
          size="sm"
          icon={CheckCheck}
          onClick={() =>
            set(
              Object.fromEntries(
                items.map((i): [string, CheckItem] => [
                  i,
                  checks[i]?.status ? checks[i] : { ...checks[i], status: 'Working' },
                ]),
              ),
            )
          }
        >
          Mark the rest working
        </Button>
        <span className="text-caption text-ink-muted tabular-nums">
          {done} of {items.length} checked
        </span>
      </div>
      <ul className="divide-y divide-border rounded-md border border-border">
        {items.map((item) => {
          const c = checks[item] ?? {}
          const bad = c.status === 'Not working'
          return (
            <li key={item} className={`flex flex-col gap-2 px-3 py-2 ${bad ? 'bg-danger-subtle/40' : ''}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span className="min-w-0 flex-1 text-body text-ink">{item}</span>
                <div role="radiogroup" aria-label={item} className="flex gap-1">
                  {(['Working', 'Not working'] as const).map((s) => (
                    <label
                      key={s}
                      className={`${CHIP} h-7 cursor-pointer px-2.5 ${
                        c.status === s
                          ? s === 'Working'
                            ? 'border-success bg-success-subtle text-success'
                            : 'border-danger bg-danger-subtle text-danger'
                          : CHIP_OFF
                      }`}
                    >
                      <input
                        type="radio"
                        name={`${id}-${item}`}
                        checked={c.status === s}
                        onChange={() => change(item, { status: s })}
                        className="sr-only"
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>
              {bad && (
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    fieldSize="sm"
                    aria-label={`${item}, what is wrong`}
                    placeholder="What is wrong?"
                    value={c.remarks ?? ''}
                    onChange={(e) => change(item, { remarks: e.target.value })}
                    className="min-w-0 flex-1"
                  />
                  <PhotosInput
                    photos={c.photo ? [c.photo] : []}
                    set={(p) => change(item, { photo: p[p.length - 1] })}
                    label={c.photo ? 'Replace photo' : 'Photo'}
                  />
                  {!c.photo && <span className="text-caption text-danger">Photo needed</span>}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
