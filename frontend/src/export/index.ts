// Public entry for modules. Copy · CSV · Excel · PDF · Print with a common header; users set subtitle and department.
// Heavy parts (react-pdf, ExcelJS) load only when someone exports.
import type { ReportDefinition } from './types'

export { ExportActions } from './components/ExportActions'
export { toISODate } from './format'
export type { ExportColumn, FixedHeader, HeaderContent, ReportDefinition } from './types'

/** Identity helper that keeps the row type while a module declares its report. */
export const defineReport = <T>(report: ReportDefinition<T>): ReportDefinition<T> => report
