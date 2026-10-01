import type { LucideIcon } from 'lucide-react'
import type { BadgeTone } from '@/components/ui/Badge'
import type { FixedHeader, HeaderContent } from '@/export'
import type { ShiftCode } from '@/types'

export type RegisterCategory = 'operations' | 'services'

export interface Person {
  name: string
  employeeId: string
}

export interface Photo {
  id: string
  name: string
  url: string
}

/** One row of a timeline field. `at` is a local date-time, "2026-09-24T14:58". */
export interface TimelineRow {
  id: string
  at: string
  text: string
}

export type CheckStatus = 'Working' | 'Not working'

export interface CheckItem {
  status?: CheckStatus
  remarks?: string
  photo?: Photo
}

/**
 * What a field stores. Text, numbers, dates and choices are strings (dates as "2026-09-24", date-times as
 * "2026-09-24T14:58"); the structured fields store their own shapes.
 */
export type FieldValue = string | Record<string, number> | TimelineRow[] | Photo[] | Record<string, CheckItem>

export type Values = Record<string, FieldValue | undefined>

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime'
  | 'select'
  | 'choice'
  | 'yesno'
  /** Private number exchanged with OCC or another station; offers "Generate PN". */
  | 'pn'
  /** Grid of whole numbers, e.g. gender × entry/exit/interchange. */
  | 'counts'
  /** Repeating date-time + text rows (incident timeline, observations). */
  | 'timeline'
  | 'photos'
  /** Working / Not working per item, with remarks and a photo. */
  | 'checklist'
  /** Worked out from other fields; shown read-only and stored with the record. */
  | 'computed'

export interface FieldContext {
  stationCode: string
}

export interface RegisterField {
  key: string
  label: string
  type: FieldType
  required?: boolean
  hint?: string
  placeholder?: string
  /** Takes the full form width. Textareas, timelines, grids and checklists always do. */
  wide?: boolean
  /** Shown (and required) only while another field has one of these values. */
  when?: { field: string; is: string | string[] }
  /** Choices for select / choice. A function covers dependent lists and station masters. */
  options?: string[] | ((values: Values, ctx: FieldContext) => string[])
  /** Pre-filled value for a new record. */
  initial?: (ctx: FieldContext & { now: Date; shift: ShiftCode }) => string
  unit?: string
  min?: number
  /** counts: row and column labels. */
  rows?: string[]
  cols?: string[]
  /** checklist: the items to check. */
  items?: (ctx: FieldContext) => string[]
  /** computed: the stored text, or '' while it can't be worked out yet. */
  compute?: (values: Values, ctx: FieldContext) => string
  /** Stored and used in lists, but not shown on the form (e.g. a title worked out from other fields). */
  hidden?: boolean
  /** Not yet confirmed against CMRL's form: taken from the old system's list columns or printed form. */
  inferred?: boolean
}

export interface FormSection {
  title: string
  fields: RegisterField[]
}

export interface WorkflowState {
  label: string
  tone: BadgeTone
  /** Done states end the workflow: no more actions, and the record doesn't count as open. */
  done?: boolean
}

export interface WorkflowAction {
  id: string
  label: string
  from: string[]
  to: string
  /** Extra fields captured by this step, stored on the record (e.g. return time and who returned the key). */
  fields?: RegisterField[]
  /** Starting values for the step's fields from the record, e.g. the person the key was issued to. */
  prefill?: (values: Values) => Values
  /** History line, e.g. "Key returned." */
  logText: string
}

export interface Workflow {
  initial: string
  states: Record<string, WorkflowState>
  actions: WorkflowAction[]
}

export interface RegisterColumn {
  id: string
  label: string
  value: (record: RegisterRecord) => string
  sub?: (record: RegisterRecord) => string | undefined
  mono?: boolean
}

/** A summary tile above the table. Clicking one with `match` filters the table to those records. */
export interface RegisterKpi {
  id: string
  label: string
  match?: (record: RegisterRecord) => boolean
  /** How much one record adds (default 1), e.g. people assisted. */
  count?: (record: RegisterRecord) => number
  tone?: BadgeTone
}

/** The official paper form a record prints as. */
export interface OfficialForm {
  title: string
  number: string
  revision: string
  date: string
}

export interface RegisterDefinition {
  id: string
  label: string
  icon: LucideIcon
  category: RegisterCategory
  description: string
  code: string
  retention: string
  statutory: boolean
  form?: OfficialForm

  sections: FormSection[]
  /** Field that names a record in lists and headings. */
  titleField: string
  /** Date-time field that says when it happened; list dates and date filters use it. */
  dateField: string
  /** Long text field a Station Diary entry pre-fills. */
  notesField?: string
  /** List columns after reference and date. Strings are field keys. */
  columns: (string | RegisterColumn)[]
  /** Select / choice fields offered as filters. */
  filters?: string[]
  kpis?: RegisterKpi[]
  workflow?: Workflow
  /** Cross-field checks; return a message that says how to fix it. */
  validate?: (values: Values) => { field: string; message: string } | undefined
  reference?: (ctx: { stationCode: string; year: number; seq: number }) => string
  /** Short line for the Registers home page, e.g. "2 keys not returned". */
  attention?: (records: RegisterRecord[], now: Date) => string | undefined

  /**
   * Opts the register into the shared export (Copy · CSV · Excel · PDF · Print). `header` is fixed in code;
   * users can only change the subtitle and department, starting from `defaultHeader`.
   */
  report?: { header?: FixedHeader; defaultHeader?: Partial<HeaderContent> }
}

export interface RecordEvent {
  at: string
  by: string
  text: string
}

export interface RecordRevision {
  revision: number
  at: string
  by: Person
  values: Values
}

export interface RegisterRecord {
  id: string
  registerId: string
  ref: string
  values: Values
  state: string
  stationCode: string
  shift: ShiftCode
  raisedAt: string
  raisedBy: Person
  /** 0 until the record is edited; each edit keeps the earlier values in `revisions`. */
  revision: number
  revisedAt?: string
  revisions: RecordRevision[]

  diaryEntryId?: string
  diaryLabel?: string
  history: RecordEvent[]
}
