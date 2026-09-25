import { useId, useRef, type FocusEvent } from 'react'
import { Input, Label } from '@/components/ui/Field'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { MAX_FIELD_LENGTH, PLACEHOLDERS, type HeaderTextField } from '../header/placeholders'
import type { HeaderContent, HeaderLayout } from '../types'

const CHIP =
  'h-7 rounded-full border border-border bg-surface px-2.5 font-mono text-caption text-ink-secondary transition-colors hover:border-primary hover:text-primary-ink disabled:opacity-50'

const LAYOUTS: { value: HeaderLayout; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'compact', label: 'Compact' },
]

const FIELDS: { field: HeaderTextField; label: string; placeholder: string }[] = [
  { field: 'title', label: 'Register title', placeholder: '{register.name}' },
  { field: 'subtitle', label: 'Subtitle', placeholder: 'e.g. Station Operations Register' },
  { field: 'department', label: 'Department / section', placeholder: 'e.g. Operations & Maintenance' },
]

interface HeaderFieldsProps {
  value: HeaderContent
  onChange: (next: HeaderContent) => void
  problems: Partial<Record<HeaderTextField, string[]>>
  readOnly?: boolean
}

/**
 * The user-editable parts of a report header: layout, title, subtitle and department / section. Everything else on
 * the header is common to all documents. Used by the template editor and the export preview.
 */
export function HeaderFields({ value, onChange, problems, readOnly = false }: HeaderFieldsProps) {
  const ids = useId()
  // The field a placeholder button inserts into, and where its cursor was.
  const target = useRef<{ field: HeaderTextField; el: HTMLInputElement } | null>(null)

  const track = (field: HeaderTextField) => (event: FocusEvent<HTMLInputElement>) => {
    target.current = { field, el: event.currentTarget }
  }

  const insert = (key: string) => {
    const field = target.current?.field ?? 'title'
    const el = target.current?.el
    const token = `{${key}}`
    const text = value[field]
    const start = el?.selectionStart ?? text.length
    const end = el?.selectionEnd ?? text.length
    onChange({ ...value, [field]: text.slice(0, start) + token + text.slice(end) })
    if (el) {
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(start + token.length, start + token.length)
      })
    }
  }

  return (
    <fieldset disabled={readOnly} className="flex min-w-0 flex-col gap-4">
      <legend className="sr-only">Report header</legend>

      <div className="flex flex-col gap-1">
        <span className="text-label text-ink-muted uppercase">Layout</span>
        <SegmentedControl
          size="sm"
          label="Header layout"
          value={value.layout}
          options={LAYOUTS}
          onChange={(layout) => onChange({ ...value, layout })}
          className="self-start"
        />
      </div>

      {FIELDS.map(({ field, label, placeholder }) => {
        const id = `${ids}-${field}`
        const fieldProblems = problems[field]
        return (
          <div key={field} className="flex min-w-0 flex-col gap-1">
            <Label htmlFor={id}>{label}</Label>
            <Input
              id={id}
              fieldSize="sm"
              value={value[field]}
              placeholder={placeholder}
              maxLength={MAX_FIELD_LENGTH}
              aria-invalid={fieldProblems ? true : undefined}
              aria-describedby={fieldProblems ? `${id}-problem` : undefined}
              onFocus={track(field)}
              onChange={(e) => onChange({ ...value, [field]: e.target.value })}
              className={fieldProblems ? 'border-danger' : ''}
            />
            {fieldProblems && (
              <p id={`${id}-problem`} className="text-caption text-danger">
                {fieldProblems.join(' ')}
              </p>
            )}
          </div>
        )
      })}

      <div className="flex flex-col gap-1.5">
        <span className="text-label text-ink-muted uppercase">Insert placeholder</span>
        <p className="text-caption text-ink-muted">Goes into the field you used last. Filled in when you export.</p>
        <div className="flex flex-wrap gap-1.5">
          {PLACEHOLDERS.map((p) => (
            <button
              key={p.key}
              type="button"
              title={p.label}
              aria-label={`Insert ${p.label}`}
              className={CHIP}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => insert(p.key)}
            >
              {`{${p.key}}`}
            </button>
          ))}
        </div>
      </div>

      <p className="text-caption text-ink-muted">
        The CMRL logo, organisation name, form reference, run details and ODMS footer are the same on every document and
        can’t be changed here.
      </p>
    </fieldset>
  )
}
