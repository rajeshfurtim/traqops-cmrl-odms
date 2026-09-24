import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { createRecord } from '../data/registerStore'
import type { RegisterDefinition, RegisterRecord } from '../types'

interface NewRecordDialogProps {
  register: RegisterDefinition
  open: boolean
  onClose: () => void
  onCreated: (record: RegisterRecord) => void
  raisedBy: string
  initialValues?: Record<string, string>

  source?: { entryId: string; label: string }
}

export function NewRecordDialog(props: NewRecordDialogProps) {
  return (
    <Modal
      open={props.open}
      onClose={props.onClose}
      size="lg"
      title={`New entry · ${props.register.label}`}
      description={props.source ? `From ${props.source.label}` : props.register.description}
    >
      {props.open && <RecordForm {...props} />}
    </Modal>
  )
}

function RecordForm({ register, onClose, onCreated, raisedBy, initialValues = {}, source }: NewRecordDialogProps) {
  const ids = useId()
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(register.fields.map((f) => [f.key, initialValues[f.key] ?? ''])),
  )
  const [errors, setErrors] = useState<Record<string, string>>({})

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const missing = Object.fromEntries(
      register.fields
        .filter((f) => f.required && !values[f.key]?.trim())
        .map((f) => [f.key, `Enter ${f.label.toLowerCase()}.`]),
    )
    setErrors(missing)
    if (Object.keys(missing).length) {
      document.getElementById(`${ids}-${Object.keys(missing)[0]}`)?.focus()
      return
    }
    const record = createRecord({
      registerId: register.id,
      values: Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])),
      raisedBy,
      diaryEntryId: source?.entryId,
      diaryLabel: source?.label,
    })
    onCreated(record)
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
        {register.fields.map((field) => {
          const id = `${ids}-${field.key}`
          const error = errors[field.key]
          const common = {
            id,
            value: values[field.key],
            'aria-invalid': Boolean(error),
            'aria-describedby': error ? `${id}-error` : undefined,
          }
          const set = (v: string) => setValues((current) => ({ ...current, [field.key]: v }))
          return (
            <div
              key={field.key}
              className={`flex flex-col gap-1.5 ${field.type === 'textarea' ? 'sm:col-span-2' : ''}`}
            >
              <Label htmlFor={id}>
                {field.label}
                {field.required && <span className="text-danger"> *</span>}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea {...common} rows={3} onChange={(e) => set(e.target.value)} />
              ) : field.type === 'select' ? (
                <Select {...common} onChange={(e) => set(e.target.value)}>
                  <option value="">Choose…</option>
                  {field.options?.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </Select>
              ) : (
                <Input {...common} onChange={(e) => set(e.target.value)} />
              )}
              {error && (
                <p id={`${id}-error`} className="text-caption text-danger">
                  {error}
                </p>
              )}
            </div>
          )
        })}
      </div>
      <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-canvas px-5 py-3">
        <p className="mr-auto text-caption text-ink-muted">A reference number is assigned when you save.</p>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save entry
        </Button>
      </footer>
    </form>
  )
}
