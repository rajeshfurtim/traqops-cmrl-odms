import ExcelJS from 'exceljs'
import logoUrl from '@/assets/cmrl-logo.png'
import { downloadBlob } from '../download'
import type { ReportLayout } from '../layout'
import type { ExportColumn } from '../types'

// Loaded on demand. The header comes from the same ReportLayout as the PDF; the table keeps real dates and
// numbers, with a frozen, filterable header row.

// Same values as the paper-* tokens in index.css (ARGB).
const BRAND = 'FF0B1F3A'
const MUTED = 'FF6B7280'
const LINE = 'FF9CA3AF'
const HEAD = 'FFEEF2F8'

const border = { style: 'thin', color: { argb: LINE } } as const
const BOX: Partial<ExcelJS.Borders> = { top: border, left: border, bottom: border, right: border }

/** Excel stores dates without a time zone; build the date from local parts so 14:02 IST stays 14:02. */
function excelDate(iso: string, withTime: boolean): Date {
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso)
  return withTime
    ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()))
    : new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
}

async function logoBase64(): Promise<string | undefined> {
  try {
    const bytes = new Uint8Array(await (await fetch(logoUrl)).arrayBuffer())
    let binary = ''
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return `data:image/png;base64,${btoa(binary)}`
  } catch {
    return undefined
  }
}

export interface XlsxRequest<T> {
  layout: ReportLayout
  columns: ExportColumn<T>[]
  rows: T[]
  author: string
  fileName: string
}

export async function downloadReportXlsx<T>({ layout, columns, rows, author, fileName }: XlsxRequest<T>) {
  const { header } = layout
  const workbook = new ExcelJS.Workbook()
  workbook.creator = author
  workbook.title = layout.documentTitle
  workbook.subject = layout.footer.reference
  workbook.keywords = layout.footer.reference
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(header.title.slice(0, 31).replace(/[\\/?*[\]:]/g, ' ') || 'Report', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: layout.orientation,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.6, header: 0.2, footer: 0.3 },
    },
    headerFooter: {
      oddFooter: `&L&8${layout.footer.generated}&C&8${layout.footer.reference}&R&8Page &P of &N`,
    },
  })

  const width = Math.max(columns.length, 2)
  sheet.columns = layout.columns.map((c) => ({ key: c.id, width: Math.max(10, Math.round(c.weight * 1.7)) }))

  // A full-width line of text, merged across the table.
  const banner = (text: string, font: Partial<ExcelJS.Font>, height = 16) => {
    const row = sheet.addRow([text])
    sheet.mergeCells(row.number, 1, row.number, width)
    row.height = height
    row.getCell(1).font = { name: 'Calibri', ...font }
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
    return row
  }

  const compact = header.layout === 'compact'
  banner(header.organisation, { bold: true, size: compact ? 11 : 14, color: { argb: BRAND } }, compact ? 18 : 22)
  if (compact) {
    banner([header.title, header.subtitle].filter(Boolean).join(' · '), { bold: true, size: 11 }, 18)
  } else {
    banner(header.title.toUpperCase(), { bold: true, size: 12 }, 18)
    if (header.subtitle) banner(header.subtitle.toUpperCase(), { size: 9, color: { argb: MUTED } })
  }
  if (header.department) banner(header.department, { size: compact ? 9 : 10 })
  if (header.docControl.length) {
    banner(header.docControl.map((d) => `${d.label}: ${d.value}`).join('    ·    '), {
      size: 9,
      color: { argb: MUTED },
    })
  }

  const logo = await logoBase64()
  if (logo) {
    sheet.addImage(workbook.addImage({ base64: logo, extension: 'png' }), {
      tl: { col: 0.15, row: 0.15 },
      ext: compact ? { width: 30, height: 30 } : { width: 46, height: 46 },
    })
  }

  if (compact) {
    const row = sheet.addRow([header.runDetails.map((d) => `${d.label}: ${d.value}`).join('   ·   ')])
    sheet.mergeCells(row.number, 1, row.number, width)
    row.height = 30
    row.getCell(1).font = { size: 9 }
    row.getCell(1).alignment = { wrapText: true, vertical: 'middle' }
  } else {
    sheet.addRow([])
    for (const detail of header.runDetails) {
      const row = sheet.addRow([detail.label, detail.value])
      sheet.mergeCells(row.number, 2, row.number, width)
      row.getCell(1).font = { bold: true, size: 9 }
      row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD } }
      row.getCell(2).font = { size: 9 }
      row.getCell(2).alignment = { wrapText: true, vertical: 'middle' }
      row.getCell(1).border = BOX
      row.getCell(2).border = BOX
    }
  }

  sheet.addRow([])
  const headRow = sheet.addRow(layout.columns.map((c) => c.header))
  headRow.height = 20
  headRow.eachCell((cell, i) => {
    cell.font = { bold: true, size: 10 }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEAD } }
    cell.border = BOX
    cell.alignment = { vertical: 'middle', horizontal: layout.columns[i - 1].align, wrapText: true }
  })

  for (const record of rows) {
    const row = sheet.addRow(
      columns.map((c) => {
        const value = c.value(record)
        if (value === null || value === undefined || value === '') return null
        if (c.type === 'date' || c.type === 'datetime') return excelDate(String(value), c.type === 'datetime')
        if (c.type === 'number') return Number(value)
        return String(value)
      }),
    )
    columns.forEach((c, i) => {
      const cell = row.getCell(i + 1)
      cell.border = BOX
      cell.alignment = { vertical: 'top', horizontal: c.align ?? 'left', wrapText: true }
      if (c.type === 'date') cell.numFmt = 'dd/mm/yyyy'
      if (c.type === 'datetime') cell.numFmt = 'dd/mm/yyyy hh:mm:ss'
    })
  }

  sheet.views = [{ state: 'frozen', ySplit: headRow.number }]
  sheet.autoFilter = {
    from: { row: headRow.number, column: 1 },
    to: { row: headRow.number + Math.max(rows.length, 1), column: columns.length },
  }
  sheet.pageSetup.printTitlesRow = `${headRow.number}:${headRow.number}`

  sheet.addRow([])
  for (const text of [layout.footer.generated, layout.footer.reference]) {
    const row = sheet.addRow([text])
    sheet.mergeCells(row.number, 1, row.number, width)
    row.getCell(1).font = { size: 8, italic: true, color: { argb: MUTED } }
  }

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    fileName,
  )
}
