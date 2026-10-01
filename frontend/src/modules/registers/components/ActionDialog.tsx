import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useSession } from '@/context/SessionContext'
import { runAction } from '../data/registerStore'
import { fieldId, initialValues, validateFields, withComputed } from '../fields'
import type { FieldValue, RegisterDefinition, RegisterRecord, Values, WorkflowAction } from '../types'
import { FieldInput } from './FieldInput'

interface ActionDialogProps {
  register: RegisterDefinition
  record: RegisterRecord
  action: WorkflowAction | null
  onClose: () => void
}

/** One workflow step, e.g. "Record key return": the step's own fields plus an optional remark. */
export function ActionDialog({ register, record, action, onClose }: ActionDialogProps) {
  return (
    <Modal open={Boolean(action)} onClose={onClose} size="lg" title={action?.label ?? ''} description={record.ref}>
      {action && <ActionForm register={register} record={record} action={action} onClose={onClose} />}
    </Modal>
  )
}

function ActionForm({ record, action, onClose }: ActionDialogProps & { action: WorkflowAction }) {
  const idBase = useId()
  const { user, station, shift } = useSession()
  const ctx = { stationCode: station.code }
  const fields = action.fields ?? []
  // Computed step fields (e.g. days parked) read the record's own values too.
  const [values, setValues] = useState<Values>(() => ({
    ...record.values,
    ...initialValues(fields, { ...ctx, now: new Date(), shift: shift.code }, action.prefill?.(record.values)),
  }))
  const [remark, setRemark] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const refreshed = withComputed(fields, values, ctx)

  const change = (key: string, value: FieldValue) => setValues((v) => withComputed(fields, { ...v, [key]: value }, ctx))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const found = validateFields(fields, refreshed, ctx)
    setErrors(found)
    const first = fields.find((f) => found[f.key])
    if (first) return document.getElementById(fieldId(idBase, first.key))?.focus()
    runAction(
      record.id,
      action.id,
      Object.fromEntries(fields.map((f) => [f.key, refreshed[f.key]])),
      { name: user.name, employeeId: user.employeeId },
      remark.trim(),
    )
    onClose()
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid gap-4 px-5 py-4 sm:grid-cols-2">
        {fields.map((f) => (
          <FieldInput
            key={f.key}
            field={f}
            values={refreshed}
            onChange={change}
            error={errors[f.key]}
            ctx={ctx}
            idBase={idBase}
          />
        ))}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor={`${idBase}-remark`}>Remark</Label>
          <Input
            id={`${idBase}-remark`}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Optional"
          />
        </div>
      </div>
      <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-border bg-canvas px-5 py-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {action.label}
        </Button>
      </footer>
    </form>
  )
}
