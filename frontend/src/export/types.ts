export type CellValue = string | number | null | undefined

/** `date` / `datetime` columns hold ISO strings; they are formatted per output and written as real dates in Excel. */
export type ColumnType = 'text' | 'number' | 'date' | 'datetime'

export interface ExportColumn<T> {
  id: string
  header: string
  value: (row: T) => CellValue
  /** Second, smaller line under the value in PDF and print (e.g. an employee ID). */
  sub?: (row: T) => string | undefined
  type?: ColumnType
  /** Relative width weight in PDF and print; also sets the Excel column width. */
  width?: number
  align?: 'left' | 'center' | 'right'
}

export type Orientation = 'portrait' | 'landscape'
export type HeaderLayout = 'standard' | 'compact'

/**
 * The only parts of a report header a user can change. Text is plain; `{…}` placeholders are filled at export.
 * Everything else (logo, organisation, run details, footer) is fixed and the same on every document.
 */
export interface HeaderContent {
  layout: HeaderLayout
  title: string
  subtitle: string
  department: string
}

/** Header fields that hold text (and placeholders). */
export const HEADER_TEXT_FIELDS = ['title', 'subtitle', 'department'] as const satisfies (keyof HeaderContent)[]

/** Set in code per report, never by users. */
export interface FixedHeader {
  formRef?: string
  revision?: string
  /** ISO date. */
  issueDate?: string
  orientation?: Orientation
}

/** One saved version. Saving never edits a version in place; it adds the next one. */
export interface HeaderTemplate {
  id: string
  reportId: string
  /** null = the register default; a code = that station's override. */
  stationCode: string | null
  version: number
  content: HeaderContent
  /** Station override: the register-default version it was copied from. */
  basedOn?: number
  /** "Remove station override" adds a retired version, so history is kept. */
  retired?: boolean
  updatedBy: ExportPerson
  updatedAt: string
  note?: string
}

export type TemplateScope = 'system' | 'register' | 'station'

export interface TemplateSource {
  scope: TemplateScope
  version: number
  stationCode?: string
  /** Changed in the preview for this export only. */
  edited: boolean
}

export interface ExportPerson {
  name: string
  employeeId: string
}

/** What the export is about; fills the placeholders and run details. */
export interface ExportContext {
  station: { name: string; code: string }
  /** ISO dates. Missing ends read "All dates". */
  period: { from?: string; to?: string }
  filters: { label: string; value: string }[]
  generatedBy: ExportPerson
  generatedAt: string
  records: number
}

export interface ReportDefinition<T> {
  /** Key for saved header templates, e.g. the register id. */
  id: string
  /** Fills `{register.name}`. */
  name: string
  /** Fills `{register.code}`. */
  code: string
  columns: ExportColumn<T>[]
  /** Fixed parts of the header for this report. */
  header?: FixedHeader
  /** Starting header until someone saves a template. */
  defaultHeader?: Partial<HeaderContent>
  /** File name without extension. */
  fileName: (context: ExportContext) => string
}

export type ExportFormat = 'pdf' | 'xlsx' | 'csv' | 'copy' | 'print'
