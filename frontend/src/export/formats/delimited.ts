import { downloadBlob } from '../download'
import { cellText } from '../format'
import type { ExportColumn } from '../types'

// CSV and Copy carry data only (a header row, then rows), so they sort, filter and paste cleanly.

function table<T>(columns: ExportColumn<T>[], rows: T[]): string[][] {
  return [columns.map((c) => c.header), ...rows.map((row) => columns.map((c) => cellText(c, row)))]
}

const csvCell = (value: string) => (/[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value)
const tsvCell = (value: string) => value.replace(/[\t\r\n]+/g, ' ')

export function downloadCsv<T>(columns: ExportColumn<T>[], rows: T[], fileName: string) {
  const csv = table(columns, rows)
    .map((r) => r.map(csvCell).join(','))
    .join('\r\n')
  // The BOM makes Excel open UTF-8 (₹, Tamil names) correctly.
  downloadBlob(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }), fileName)
}

/** Tab-separated, so it pastes into Excel or an email as a table. */
export function toTsv<T>(columns: ExportColumn<T>[], rows: T[]): string {
  return table(columns, rows)
    .map((r) => r.map(tsvCell).join('\t'))
    .join('\n')
}
