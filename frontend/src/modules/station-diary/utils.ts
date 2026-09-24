import { SHIFT_ORDER, SHIFTS } from './constants'
import type { DiaryEntry, ShiftCode, ShiftDiary } from './types'

const pad = (n: number) => String(n).padStart(2, '0')

export function toISODate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return toISODate(new Date(y, m - 1, d + days))
}

/** "2026-09-24" → "24/09/2026" (the format on CMRL forms). */
export function formatFormDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-')
  return `${d}/${m}/${y}`
}

/** "2026-09-24" → "Wed, 24 Sep 2026" */
export function formatLongDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** "2026-09-24" → "24 Sep" */
export function formatShortDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

/** ISO timestamp → "14:02" */
export function formatTime(iso: string): string {
  const date = new Date(iso)
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** ISO timestamp → "14:02:10" */
export function formatTimeSeconds(iso: string): string {
  const date = new Date(iso)
  return `${formatTime(iso)}:${pad(date.getSeconds())}`
}

/** ISO timestamp → "24/09/2026 14:02". Every logged moment shows its date, since Shift C runs past midnight. */
export function formatStamp(iso: string): string {
  return `${formatFormDate(toISODate(new Date(iso)))} ${formatTime(iso)}`
}

/** ISO timestamp → "24/09/2026 14:02:10" (diary forms and PDF). */
export function formatStampSeconds(iso: string): string {
  return `${formatFormDate(toISODate(new Date(iso)))} ${formatTimeSeconds(iso)}`
}

export function shiftId(stationCode: string, date: string, shift: ShiftCode): string {
  return `${stationCode}-${date}-${shift}`
}

/** "Shift B · 14:00–22:00" */
export function shiftLabel(shift: ShiftCode): string {
  const s = SHIFTS[shift]
  return `${s.label} · ${s.start}–${s.end}`
}

/** Form reference, e.g. "CEN01/SD/2026-09-24/B". */
export function diaryReference(diary: ShiftDiary): string {
  return `${diary.stationCode}/SD/${diary.date}/${diary.shift}`
}

/** Sort key: date, then shift order within the day. */
export function diarySortKey(diary: ShiftDiary): string {
  return `${diary.date}-${SHIFT_ORDER.indexOf(diary.shift)}`
}

/** Newest shift first. */
export function compareDiariesDesc(a: ShiftDiary, b: ShiftDiary): number {
  return diarySortKey(b).localeCompare(diarySortKey(a))
}

/** Oldest shift first (booklet and PDF order). */
export function compareDiariesAsc(a: ShiftDiary, b: ShiftDiary): number {
  return diarySortKey(a).localeCompare(diarySortKey(b))
}

export function sortEntriesAsc(entries: DiaryEntry[]): DiaryEntry[] {
  return [...entries].sort((a, b) => a.at.localeCompare(b.at))
}

/** "CEN01_StationDiary_2026-09-24_ShiftB.pdf" */
export function pdfFileName(stationCode: string, diaries: ShiftDiary[], booklet: boolean): string {
  if (diaries.length === 1) return `${stationCode}_StationDiary_${diaries[0].date}_Shift${diaries[0].shift}.pdf`
  const dates = diaries.map((d) => d.date).sort()
  const first = dates[0]
  const last = dates[dates.length - 1]
  if (first === last && !booklet) return `${stationCode}_StationDiary_${first}_AllShifts.pdf`
  return `${stationCode}_StationDiary_Booklet_${first}_to_${last}.pdf`
}
