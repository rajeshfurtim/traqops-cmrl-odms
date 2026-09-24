import { Download, LoaderCircle, Printer } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { DiaryStatus, Person, ShiftCode, ShiftDiary } from '../types'
import { formatFormDate } from '../utils'
import { SummaryTableSheet } from './SummaryTableSheet'

export interface ExportTablePdfDialogProps {
  open: boolean
  onClose: () => void
  diaries: ShiftDiary[]
  stationName: string
  stationCode: string
  from: string
  to: string
  shift: ShiftCode | ''
  status: DiaryStatus | ''
  actor: Person
}

export function ExportTablePdfDialog({
  open,
  onClose,
  diaries,
  stationName,
  stationCode,
  from,
  to,
  shift,
  status,
  actor,
}: ExportTablePdfDialogProps) {
  const [downloading, setDownloading] = useState(false)
  const fileName = `${stationCode}_ShiftSummary_${from}_to_${to}.pdf`

  const handleDownload = async () => {
    if (downloading || !diaries.length) return
    setDownloading(true)
    try {
      const { downloadSummaryPdf } = await import('../pdf/downloadSummaryPdf')
      await downloadSummaryPdf({
        diaries,
        stationName,
        stationCode,
        from,
        to,
        shift,
        status,
        generatedBy: actor,
        fileName,
      })
      setDownloading(false)
      onClose()
    } catch (err) {
      console.error('[ODMS] Summary PDF download failed', err)
      setDownloading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="xl" title="Export Shift Summary Table as PDF">
      <div className="grid min-h-0 md:grid-cols-[19rem_minmax(0,1fr)]">
        {/* Left Options / Info Panel */}
        <div className="flex flex-col gap-5 border-b border-border p-5 md:border-r md:border-b-0">
          <div className="flex flex-col gap-1.5 text-secondary">
            <span className="text-label text-ink-muted uppercase">Template Format</span>
            <p className="font-semibold text-ink">Official CMRL Register Template</p>
            <p className="text-caption text-ink-muted">Form Ref: CMRL/OPER/SO/R-01 · A4 Portrait</p>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-border bg-canvas/60 p-3 text-caption">
            <div>
              <span className="font-medium text-ink-muted">Station:</span>{' '}
              <span className="font-semibold text-ink">
                {stationName} ({stationCode})
              </span>
            </div>
            <div>
              <span className="font-medium text-ink-muted">Period:</span>{' '}
              <span className="font-medium text-ink">
                {formatFormDate(from)} to {formatFormDate(to)}
              </span>
            </div>
            <div>
              <span className="font-medium text-ink-muted">Shift:</span>{' '}
              <span className="text-ink">{shift ? `Shift ${shift}` : 'All shifts'}</span>
            </div>
            <div>
              <span className="font-medium text-ink-muted">Records:</span>{' '}
              <span className="font-semibold text-ink">
                {diaries.length} shift{diaries.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-label text-ink-muted uppercase">File Name</p>
            <p className="font-mono text-caption break-all text-ink">{fileName}</p>
          </div>

          <div className="mt-auto flex flex-col gap-2">
            <Button
              variant="primary"
              icon={downloading ? LoaderCircle : Download}
              className={downloading ? '[&>svg]:animate-spin' : ''}
              disabled={!diaries.length || downloading}
              onClick={handleDownload}
            >
              {downloading ? 'Preparing PDF…' : 'Download PDF'}
            </Button>
            <Button
              variant="secondary"
              icon={Printer}
              disabled={!diaries.length}
              onClick={() => {
                onClose()
                window.setTimeout(() => window.print(), 100)
              }}
            >
              Print
            </Button>
          </div>

          <p className="text-caption text-ink-muted">
            Includes the CMRL watermark, official station header, filter summary, and full tabular register records.
          </p>
        </div>

        {/* Right Live Template Preview */}
        <div className="max-h-[75vh] min-w-0 overflow-y-auto bg-muted p-4 sm:p-6">
          <div className="flex flex-col items-center">
            <SummaryTableSheet
              diaries={diaries}
              stationName={stationName}
              stationCode={stationCode}
              from={from}
              to={to}
              shift={shift}
              status={status}
              generatedBy={actor}
            />
          </div>
        </div>
      </div>
    </Modal>
  )
}
