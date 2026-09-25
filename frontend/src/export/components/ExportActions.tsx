import { Check, Copy, Download, FileSpreadsheet, FileText, Printer, Settings2, Sheet } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { useSession } from '@/context/SessionContext'
import { recordExport, useHeaderTemplates } from '../data/templateStore'
import { safeFileName } from '../download'
import { downloadCsv, toTsv } from '../formats/delimited'
import { resolveTemplate } from '../header/resolveHeader'
import { buildReportLayout, type ReportLayout } from '../layout'
import { PrintPortal } from '../sheet/PrintPortal'
import type { ExportContext, ReportDefinition } from '../types'
import { ExportPreviewDialog, type FileAction } from './ExportPreviewDialog'
import { HeaderTemplateDialog } from './HeaderTemplateDialog'

interface ExportActionsProps<T> {
  report: ReportDefinition<T>
  /** Every row that matches the page's filters, not just the visible page. */
  rows: T[]
  rowKey: (row: T) => string
  period: ExportContext['period']
  filters: ExportContext['filters']
  className?: string
}

/**
 * Copy · CSV · Excel · PDF · Print for any report, plus the report header settings.
 * Copy and CSV are data only; Excel, PDF and Print open a preview with the header template.
 */
export function ExportActions<T>({ report, rows, rowKey, period, filters, className = '' }: ExportActionsProps<T>) {
  const { user, station } = useSession()
  const templates = useHeaderTemplates()
  const [intent, setIntent] = useState<FileAction | null>(null)
  const [headerOpen, setHeaderOpen] = useState(false)
  const [printing, setPrinting] = useState<ReportLayout | null>(null)
  const [copied, setCopied] = useState(false)

  const context: Omit<ExportContext, 'generatedAt'> = {
    station: { name: station.name, code: station.code },
    period,
    filters,
    generatedBy: { name: user.name, employeeId: user.employeeId },
    records: rows.length,
  }
  const empty = rows.length === 0

  const logDataExport = (format: 'csv' | 'copy') =>
    recordExport({
      by: user,
      reportId: report.id,
      stationCode: station.code,
      format,
      records: rows.length,
      template: resolveTemplate(report, templates, station.code).source,
    })

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toTsv(report.columns, rows))
      logDataExport('copy')
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const csv = () => {
    const generatedAt = new Date().toISOString()
    downloadCsv(report.columns, rows, `${safeFileName(report.fileName({ ...context, generatedAt }))}.csv`)
    logDataExport('csv')
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <div className="hidden flex-wrap gap-2 sm:flex">
        <Button size="sm" icon={copied ? Check : Copy} disabled={empty} onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button size="sm" icon={Sheet} disabled={empty} onClick={csv}>
          CSV
        </Button>
        <Button size="sm" icon={FileSpreadsheet} disabled={empty} onClick={() => setIntent('xlsx')}>
          Excel
        </Button>
        <Button size="sm" icon={FileText} disabled={empty} onClick={() => setIntent('pdf')}>
          PDF
        </Button>
        <Button size="sm" icon={Printer} disabled={empty} onClick={() => setIntent('print')}>
          Print
        </Button>
      </div>
      <div className="flex gap-2 sm:hidden">
        <Button size="sm" icon={Download} disabled={empty} onClick={() => setIntent('pdf')}>
          Export
        </Button>
        <Button size="sm" icon={copied ? Check : Copy} disabled={empty} onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <IconButton icon={Settings2} label="Report header" onClick={() => setHeaderOpen(true)} />

      {intent && (
        <ExportPreviewDialog
          report={report}
          rows={rows}
          rowKey={rowKey}
          context={context}
          intent={intent}
          onPrint={(layout) => {
            setIntent(null)
            setPrinting(layout)
          }}
          onClose={() => setIntent(null)}
        />
      )}

      {headerOpen && (
        <HeaderTemplateDialog
          report={report}
          preview={(content, source) =>
            buildReportLayout({
              report,
              rows,
              rowKey,
              context: { ...context, generatedAt: new Date().toISOString() },
              content,
              source,
              rowLimit: 5,
            })
          }
          onClose={() => setHeaderOpen(false)}
        />
      )}

      {printing && <PrintPortal layout={printing} onDone={() => setPrinting(null)} />}
    </div>
  )
}
