import { useId, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Label, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { HOT_KEY_NAME_MAX } from '../constants'
import { addHotKey } from '../data/diaryStore'

export interface HotKeyDraft {
  template: string
}

interface HotKeyDialogProps {
  open: boolean
  onClose: () => void
  stationCode: string
  /** Pre-filled from the editor ("Save as hot key"); empty for "Add hot key". */
  initial?: HotKeyDraft
  onSaved: (label: string) => void
}

/** Saves a reusable message as a station hot key. */
export function HotKeyDialog({ open, onClose, stationCode, initial, onSaved }: HotKeyDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Save as hot key' : 'Add hot key'}
      description="Clicking the hot key puts this message in the editor. Available to everyone at this station."
    >
      {open && <HotKeyForm stationCode={stationCode} initial={initial} onClose={onClose} onSaved={onSaved} />}
    </Modal>
  )
}

/** Suggests a short name from the first words of the message. */
function suggestName(template: string): string {
  const words = template.replace(/[*_]/g, '').replace(/__/g, '').trim().split(/\s+/).slice(0, 3).join(' ')
  return words.length > HOT_KEY_NAME_MAX ? words.slice(0, HOT_KEY_NAME_MAX).trim() : words.replace(/[.,:;]$/, '')
}

function HotKeyForm({ stationCode, initial, onClose, onSaved }: Omit<HotKeyDialogProps, 'open'>) {
  const ids = useId()
  const [label, setLabel] = useState(() => (initial ? suggestName(initial.template) : ''))
  const [template, setTemplate] = useState(initial?.template ?? '')
  const [error, setError] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const problem = addHotKey(stationCode, { label, template })
    if (problem) return setError(problem)
    onSaved(label.trim())
    onClose()
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${ids}-label`}>Hot key name</Label>
          <Input
            id={`${ids}-label`}
            value={label}
            maxLength={HOT_KEY_NAME_MAX}
            placeholder="e.g. Ticket counter"
            onChange={(e) => {
              setLabel(e.target.value)
              setError('')
            }}
            data-autofocus
          />
          <p className="text-caption text-ink-muted">Shown on the button, up to {HOT_KEY_NAME_MAX} characters.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${ids}-template`}>Message</Label>
          <Textarea
            id={`${ids}-template`}
            rows={4}
            value={template}
            placeholder="e.g. Ticket counter __ closed at __. Passengers directed to TVMs."
            onChange={(e) => {
              setTemplate(e.target.value)
              setError('')
            }}
          />
          <p className="text-caption text-ink-muted">
            Use <span className="font-mono">__</span> for details to fill in each time. The cursor jumps to the first
            one.
          </p>
        </div>
        {error && (
          <p role="alert" className="text-secondary text-danger">
            {error}
          </p>
        )}
      </div>
      <footer className="flex justify-end gap-2 border-t border-border bg-canvas px-5 py-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          Save hot key
        </Button>
      </footer>
    </form>
  )
}
