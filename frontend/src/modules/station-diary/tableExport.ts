import { STATUS_LABELS } from './constants'
import type { ShiftDiary } from './types'
import { formatFormDate, formatStamp } from './utils'

const HEADERS = [
  'Date',
  'Shift',
  'Station',
  'Station Controller',
  'Emp ID',
  'Entries',
  'Status',
  'Handed over by',
  'Taken over by',
  'Handed over at',
]

function rows(diaries: ShiftDiary[]): string[][] {
  return diaries.map((d) => [
    formatFormDate(d.date),
    d.shift,
    d.stationCode,
    d.controller?.name ?? '',
    d.controller?.employeeId ?? '',
    String(d.entries.length),
    STATUS_LABELS[d.status],
    d.handover.handedBy?.name ?? '',
    d.handover.takenBy?.name ?? '',
    d.handover.handedAt ? formatStamp(d.handover.handedAt) : '',
  ])
}

/** Tab-separated, so it pastes straight into Excel or a mail. */
export function toTsv(diaries: ShiftDiary[]): string {
  return [HEADERS, ...rows(diaries)].map((r) => r.join('\t')).join('\n')
}

const csvCell = (value: string) => (/[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value)

/** Excel-compatible CSV (with BOM so ₹ and names open correctly). */
export function downloadCsv(diaries: ShiftDiary[], fileName: string) {
  const csv = [HEADERS, ...rows(diaries)].map((r) => r.map(csvCell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
