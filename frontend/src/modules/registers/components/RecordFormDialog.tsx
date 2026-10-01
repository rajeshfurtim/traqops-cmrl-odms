import { Info } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Label, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useSession } from '@/context/SessionContext'
import { createRecord, reviseRecord } from '../data/registerStore'
import { fieldId, initialValues, isVisible, optionsFor, str, validateFields, withComputed } from '../fields'
import type { FieldValue, RegisterDefinition, RegisterRecord, Values } from '../types'
import { FieldInput } from './FieldInput'

export type FormMode =
  | { kind: 'new'; preset?: Values; source?: { entryId: string; label: string } }
  | { kind: 'edit'; record: RegisterRecord }

interface RecordFormDialogProps {
  register: RegisterDefinition
  mode: FormMode | null
  onClose: () => void
  onSaved: (recordId: string) => void
}

export function RecordFormDialog({ register, mode, onClose, onSaved }: RecordFormDialogProps) {
  const title = mode?.kind === 'edit' ? `Correct ${mode.record.ref}` : `New entry · ${register.label}`
  const description =
    mode?.kind === 'edit'
      ? 'The earlier version is kept in the record history.'
      : mode?.source
        ? `From ${mode.source.label}`
        : register.description
  return (
    <Modal open={Boolean(mode)} onClose={onClose} size="xl" title={title} description={description}>
      {mode && <RecordForm register={register} mode={mode} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  )
}

function RecordForm({ register, mode, onClose, onSaved }: RecordFormDialogProps & { mode: FormMode }) {
  const idBase = useId()
  const { user, station, shift } = useSession()
  const ctx = { stationCode: station.code }
  const fields = register.sections.flatMap((s) => s.fields)
  const [values, setValues] = useState<Values>(() =>
    mode.kind === 'edit'
      ? mode.record.values
      : initialValues(fields, { ...ctx, now: new Date(), shift: shift.code }, mode.preset),
  )
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const inferred = fields.some((f) => f.inferred)

  const change = (key: string, value: FieldValue) => {
    setValues((current) => {
      const next: Values = { ...current, [key]: value }
      // A dependent list (e.g. sub-class) drops a choice that its parent no longer offers.
      for (const f of fields) {
        if (f.type === 'select' && typeof f.options === 'function' && str(next, f.key)) {
          if (!optionsFor(f, next, ctx).includes(str(next, f.key))) next[f.key] = ''
        }
      }
      return withComputed(fields, next, ctx)
    })
    setErrors((current) => {
      if (!current[key]) return current
      const rest = { ...current }
      delete rest[key]
      return rest
    })
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found = validateFields(fields, values, ctx)
    const cross = register.validate?.(values)
    if (cross && !found[cross.field]) found[cross.field] = cross.message
    if (mode.kind === 'edit' && !reason.trim()) found.__reason = 'Say what you corrected and why.'
    setErrors(found)
    const first = fields.find((f) => found[f.key])?.key ?? (found.__reason ? '__reason' : undefined)
    if (first) {
      document.getElementById(fieldId(idBase, first))?.focus()
      return
    }
    // Hidden fields (answers to questions now "No") are not saved.
    const kept: Values = Object.fromEntries(
      fields
        .filter((f) => isVisible(f, values))
        .map((f) => [f.key, typeof values[f.key] === 'string' ? str(values, f.key).trim() : values[f.key]]),
    )
    const by = { name: user.name, employeeId: user.employeeId }
    if (mode.kind === 'edit') {
      reviseRecord(mode.record.id, kept, by, reason.trim())
      onSaved(mode.record.id)
    } else {
      const record = createRecord({
        registerId: register.id,
        values: kept,
        stationCode: station.code,
        shift: shift.code,
        raisedBy: by,
        diaryEntryId: mode.source?.entryId,
        diaryLabel: mode.source?.label,
      })
      onSaved(record.id)
    }
  }

  const errorCount = Object.keys(errors).length

  return (
    <form onSubmit={submit} noValidate className="flex min-h-full flex-col bg-canvas">
      <div className="flex flex-col gap-3 px-4 py-4 sm:px-5">
        <p className="flex flex-wrap gap-x-4 gap-y-1 rounded-lg border border-border bg-surface px-3 py-2 text-caption text-ink-muted">
          <span>
            Station{' '}
            <span className="font-medium text-ink">
              {station.name} ({station.code})
            </span>
          </span>
          <span>
            Shift <span className="font-medium text-ink">{mode.kind === 'edit' ? mode.record.shift : shift.code}</span>
          </span>
          <span>
            Recorded by{' '}
            <span className="font-medium text-ink">{mode.kind === 'edit' ? mode.record.raisedBy.name : user.name}</span>
          </span>
        </p>

        {register.sections.map((section) => {
          const visible = section.fields.filter((f) => !f.hidden && isVisible(f, values))
          if (visible.length === 0) return null
          return (
            <section
              key={section.title}
              aria-label={section.title}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-card"
            >
              <h3 className="text-label text-ink-muted uppercase">{section.title}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {visible.map((f) => (
                  <FieldInput
                    key={f.key}
                    field={f}
                    values={values}
                    onChange={change}
                    error={errors[f.key]}
                    ctx={ctx}
                    idBase={idBase}
                  />
                ))}
              </div>
            </section>
          )
        })}

        {mode.kind === 'edit' && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={fieldId(idBase, '__reason')}>
              What did you correct? <span className="text-danger">*</span>
            </Label>
            <Textarea
              id={fieldId(idBase, '__reason')}
              rows={2}
              value={reason}
              aria-invalid={Boolean(errors.__reason)}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Corrected the normalised time; OCC PN was mistyped."
            />
            {errors.__reason && <p className="text-caption text-danger">{errors.__reason}</p>}
          </div>
        )}

        {inferred && (
          <p className="flex gap-2 text-caption text-ink-muted">
            <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
            Some fields follow the old system's register columns and are still to be confirmed with CMRL.
          </p>
        )}
      </div>

      <footer className="sticky bottom-0 mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-border bg-surface px-5 py-3">
        <p role="status" className={`mr-auto text-caption ${errorCount ? 'text-danger' : 'text-ink-muted'}`}>
          {errorCount
            ? `${errorCount} field${errorCount === 1 ? ' needs' : 's need'} attention.`
            : mode.kind === 'edit'
              ? `Saves revision ${mode.record.revision + 1}.`
              : 'A reference number is assigned when you save.'}
        </p>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {mode.kind === 'edit' ? 'Save correction' : 'Save entry'}
        </Button>
      </footer>
    </form>
  )
}
