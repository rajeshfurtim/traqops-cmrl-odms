import { formatFormDate, formatStamp } from '@/modules/station-diary/utils'
import type {
  CheckItem,
  FieldContext,
  Photo,
  RegisterDefinition,
  RegisterField,
  RegisterRecord,
  TimelineRow,
  Values,
} from './types'

const pad = (n: number) => String(n).padStart(2, '0')

/** Date → "2026-09-24T14:58", the value of a datetime field. */
export function toLocalDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Id of a form control, so validation can focus the first field with an error. */
export const fieldId = (idBase: string, key: string) => `${idBase}-${key}`

export const str = (values: Values, key: string): string => {
  const v = values[key]
  return typeof v === 'string' ? v : ''
}

export const countsOf = (values: Values, key: string): Record<string, number> => {
  const v = values[key]
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, number>) : {}
}

export const timelineOf = (values: Values, key: string): TimelineRow[] => {
  const v = values[key]
  return Array.isArray(v) ? (v as TimelineRow[]) : []
}

export const photosOf = (values: Values, key: string): Photo[] => {
  const v = values[key]
  return Array.isArray(v) ? (v as Photo[]) : []
}

export const checklistOf = (values: Values, key: string): Record<string, CheckItem> => {
  const v = values[key]
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, CheckItem>) : {}
}

export const countKey = (row: string, col: string) => `${row}|${col}`

export function countTotal(values: Values, key: string): number {
  return Object.values(countsOf(values, key)).reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0)
}

export function allFields(register: RegisterDefinition): RegisterField[] {
  return [
    ...register.sections.flatMap((s) => s.fields),
    ...(register.workflow?.actions.flatMap((a) => a.fields ?? []) ?? []),
  ]
}

export function findField(register: RegisterDefinition, key: string): RegisterField | undefined {
  return allFields(register).find((f) => f.key === key)
}

export function isVisible(field: RegisterField, values: Values): boolean {
  if (!field.when) return true
  const current = str(values, field.when.field)
  return Array.isArray(field.when.is) ? field.when.is.includes(current) : current === field.when.is
}

export function optionsFor(field: RegisterField, values: Values, ctx: FieldContext): string[] {
  if (!field.options) return []
  return typeof field.options === 'function' ? field.options(values, ctx) : field.options
}

export const isWide = (field: RegisterField) =>
  field.wide || ['textarea', 'timeline', 'counts', 'checklist', 'photos'].includes(field.type)

/** "2026-09-24T14:58" (or an ISO stamp) → "24/09/2026 14:58"; "2026-09-24" → "24/09/2026". */
export function formatWhen(value: string): string {
  if (!value) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return formatFormDate(value)
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : formatStamp(date.toISOString())
}

/** Minutes between two local date-times, or undefined when either is missing or the end is not after the start. */
export function minutesBetween(start: string, end: string): number | undefined {
  if (!start || !end) return undefined
  const ms = new Date(end).getTime() - new Date(start).getTime()
  return Number.isFinite(ms) && ms > 0 ? Math.round(ms / 60_000) : undefined
}

/** 95 → "1 h 35 min" */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`
}

/** A field's value as one line of text, for tables, exports and the form view. */
export function displayValue(field: RegisterField, values: Values): string {
  switch (field.type) {
    case 'date':
    case 'datetime':
      return formatWhen(str(values, field.key))
    case 'number': {
      const v = str(values, field.key)
      return v && field.unit ? (field.unit === '₹' ? `₹${v}` : `${v} ${field.unit}`) : v
    }
    case 'counts': {
      const total = countTotal(values, field.key)
      return total ? String(total) : ''
    }
    case 'timeline': {
      const rows = timelineOf(values, field.key)
      return rows.map((r) => `${formatWhen(r.at)} ${r.text}`).join('\n')
    }
    case 'photos': {
      const n = photosOf(values, field.key).length
      return n ? `${n} photo${n === 1 ? '' : 's'}` : ''
    }
    case 'checklist': {
      const items = Object.values(checklistOf(values, field.key))
      const bad = items.filter((i) => i.status === 'Not working').length
      return items.length ? `${items.length - bad} working, ${bad} not working` : ''
    }
    default:
      return str(values, field.key)
  }
}

export function recordTitle(register: RegisterDefinition, record: RegisterRecord): string {
  const field = findField(register, register.titleField)
  return (field && displayValue(field, record.values)) || register.label
}

/** When the record's event happened (the register's date field), falling back to when it was logged. */
export function recordDate(register: RegisterDefinition, record: RegisterRecord): string {
  const v = str(record.values, register.dateField)
  if (!v) return record.raisedAt
  const date = new Date(v)
  return Number.isNaN(date.getTime()) ? record.raisedAt : date.toISOString()
}

/** Fills computed fields from the other values. */
export function withComputed(fields: RegisterField[], values: Values, ctx: FieldContext): Values {
  const next = { ...values }
  for (const f of fields) if (f.type === 'computed' && f.compute) next[f.key] = f.compute(next, ctx)
  return next
}

function isEmpty(field: RegisterField, values: Values): boolean {
  switch (field.type) {
    case 'counts':
      return countTotal(values, field.key) === 0
    case 'timeline':
      return !timelineOf(values, field.key).some((r) => r.at && r.text.trim())
    case 'photos':
      return photosOf(values, field.key).length === 0
    case 'checklist':
      return false
    default:
      return !str(values, field.key).trim()
  }
}

const EMPTY_MESSAGES: Partial<Record<RegisterField['type'], (label: string) => string>> = {
  select: (l) => `Choose ${l.toLowerCase()}.`,
  choice: (l) => `Choose ${l.toLowerCase()}.`,
  yesno: () => 'Choose Yes or No.',
  counts: () => 'Enter at least one person in the table.',
  timeline: () => 'Add at least one row with a date, time and details.',
  photos: () => 'Attach at least one photo.',
}

/** Required-field and checklist errors, keyed by field. Hidden fields are skipped. */
export function validateFields(fields: RegisterField[], values: Values, ctx: FieldContext): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const f of fields) {
    if (!isVisible(f, values) || f.type === 'computed') continue
    if (f.required && isEmpty(f, values)) {
      errors[f.key] = EMPTY_MESSAGES[f.type]?.(f.label) ?? `Enter ${f.label.toLowerCase()}.`
      continue
    }
    if (f.type === 'number' && str(values, f.key) && f.min !== undefined && Number(str(values, f.key)) < f.min) {
      errors[f.key] = `${f.label} can't be less than ${f.min}.`
    }
    if (f.type === 'checklist') {
      const items = f.items?.(ctx) ?? []
      const checks = checklistOf(values, f.key)
      const unchecked = items.filter((i) => !checks[i]?.status)
      const noPhoto = items.filter((i) => checks[i]?.status === 'Not working' && !checks[i]?.photo)
      if (unchecked.length) errors[f.key] = `Mark every item. Not checked yet: ${unchecked.join(', ')}.`
      else if (noPhoto.length) errors[f.key] = `Attach a photo for each item not working: ${noPhoto.join(', ')}.`
    }
  }
  return errors
}

export function initialValues(
  fields: RegisterField[],
  ctx: FieldContext & { now: Date; shift: RegisterRecord['shift'] },
  preset: Values = {},
): Values {
  const values: Values = {}
  for (const f of fields) values[f.key] = preset[f.key] ?? f.initial?.(ctx) ?? (f.type === 'timeline' ? [] : undefined)
  return withComputed(fields, values, ctx)
}
