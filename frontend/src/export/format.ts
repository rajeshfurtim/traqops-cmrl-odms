import type { CellValue, ColumnType, ExportColumn } from './types'

const pad = (n: number) => String(n).padStart(2, '0')

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** "2026-09-24" → "24/09/2026" */
export function formatFormDate(isoDate: string): string {
  const [y, m, d] = isoDate.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

/** ISO timestamp → "24/09/2026 14:02:10". Exports always carry date and time. */
export function formatStampSeconds(iso: string): string {
  const date = new Date(iso)
  return `${formatFormDate(toISODate(date))} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export function formatCell(value: CellValue, type: ColumnType = 'text'): string {
  if (value === null || value === undefined || value === '') return ''
  if (type === 'date') return formatFormDate(String(value))
  if (type === 'datetime') return formatStampSeconds(String(value))
  return String(value)
}

export const cellText = <T>(column: ExportColumn<T>, row: T) => formatCell(column.value(row), column.type)

/** "01/09/2026 to 25/09/2026"; an open end reads "From …" / "Up to …". */
export function formatPeriod(period: { from?: string; to?: string }): string {
  if (!period.from && !period.to) return 'All dates'
  if (!period.to) return `From ${formatFormDate(period.from!)}`
  if (!period.from) return `Up to ${formatFormDate(period.to)}`
  return `${formatFormDate(period.from)} to ${formatFormDate(period.to)}`
}
