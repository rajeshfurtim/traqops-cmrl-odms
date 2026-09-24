import { Download, LoaderCircle } from 'lucide-react'
import { useId, useMemo, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Checkbox, Input, Label } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useDiaries } from '../data/diaryStore'
import { useActor } from '../hooks'
import type { ShiftDiary } from '../types'
import { compareDiariesAsc, formatFormDate, pdfFileName, shiftLabel } from '../utils'
import { DiaryFormSheet } from './DiaryFormSheet'

export type ExportScope = 'shift' | 'day' | 'range'

interface ExportPdfDialogProps {
  open: boolean
  onClose: () => void

  diary?: ShiftDiary
  defaultScope: ExportScope
  defaultRange: { from: string; to: string }
}

const PREVIEW_SHEETS = 2

const RADIO =
  'flex cursor-pointer items-start gap-2.5 rounded-lg border px-3 py-2.5 text-secondary transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-subtle'

function ScopeOption({
  value,
  scope,
  onChange,
  title,
  children,
}: {
  value: ExportScope
  scope: ExportScope
  onChange: (s: ExportScope) => void
  title: string
  children: ReactNode
}) {
  return (
    <label className={`${RADIO} border-border`}>
      <input
        type="radio"
        name="export-scope"
        className="mt-0.5 accent-primary"
        checked={scope === value}
        onChange={() => onChange(value)}
      />
      <span>
        <span className="block font-medium text-ink">{title}</span>
        <span className="text-ink-muted">{children}</span>
      </span>
    </label>
  )
}

/** Choose what to export, see it on the official form, and download a real PDF file. */
export function ExportPdfDialog({ open, onClose, diary, defaultScope, defaultRange }: ExportPdfDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="xl" title="Export Station Diary as PDF">
      {open && <ExportBody diary={diary} defaultScope={defaultScope} defaultRange={defaultRange} onDone={onClose} />}
    </Modal>
  )
}

function ExportBody({
  diary,
  defaultScope,
  defaultRange,
  onDone,
}: Omit<ExportPdfDialogProps, 'open' | 'onClose'> & { onDone: () => void }) {
  const all = useDiaries()
  const actor = useActor()
  const ids = useId()
  const [scope, setScope] = useState<ExportScope>(diary ? defaultScope : 'range')
  const [from, setFrom] = useState(defaultRange.from)
  const [to, setTo] = useState(defaultRange.to)
  const [importantOnly, setImportantOnly] = useState(false)
  const [includeTasks, setIncludeTasks] = useState(true)
  const [includeImages, setIncludeImages] = useState(false)
  const [state, setState] = useState<'idle' | 'working' | 'error'>('idle')

  const selected = useMemo(() => {
    const stationCode = diary?.stationCode ?? all[0]?.stationCode
    const rows = all.filter((d) => d.stationCode === stationCode && d.status !== 'upcoming')
    if (scope === 'shift' && diary) return [diary]
    if (scope === 'day' && diary) return rows.filter((d) => d.date === diary.date).sort(compareDiariesAsc)
    return rows.filter((d) => d.date >= from && d.date <= to).sort(compareDiariesAsc)
  }, [all, diary, scope, from, to])

  const booklet = scope === 'range' && selected.length > 1
  const stationCode = selected[0]?.stationCode ?? diary?.stationCode ?? ''
  const fileName = selected.length ? pdfFileName(stationCode, selected, booklet) : ''
  const options = { importantOnly, includeTasks, includeImages }
  const rangeInvalid = scope === 'range' && from > to

  const download = async () => {
    if (!selected.length || rangeInvalid) return
    setState('working')
    try {
      const { downloadDiaryPdf } = await import('../pdf/downloadDiaryPdf')
      await downloadDiaryPdf({ diaries: selected, options, generatedBy: actor, fileName, withIndex: booklet })
      setState('idle')
      onDone()
    } catch (error) {
      console.error('[ODMS] PDF export failed', error)
      setState('error')
    }
  }

  return (
    <div className="grid min-h-0 md:grid-cols-[19rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-5 border-b border-border p-5 md:border-r md:border-b-0">
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-label text-ink-muted uppercase">What to export</legend>
          {diary && (
            <>
              <ScopeOption value="shift" scope={scope} onChange={setScope} title="This shift">
                {shiftLabel(diary.shift)} · {formatFormDate(diary.date)}
              </ScopeOption>
              <ScopeOption value="day" scope={scope} onChange={setScope} title="Whole day">
                All shifts on {formatFormDate(diary.date)}
              </ScopeOption>
            </>
          )}
          <ScopeOption value="range" scope={scope} onChange={setScope} title="Date range (booklet)">
            One shift per page, with an index page
          </ScopeOption>
          {scope === 'range' && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="flex flex-col gap-1">
                <Label htmlFor={`${ids}-from`}>From</Label>
                <Input
                  id={`${ids}-from`}
                  type="date"
                  fieldSize="sm"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor={`${ids}-to`}>To</Label>
                <Input id={`${ids}-to`} type="date" fieldSize="sm" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              {rangeInvalid && <p className="col-span-2 text-caption text-danger">"From" must be on or before "To".</p>}
            </div>
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-2 text-secondary text-ink-secondary">
          <legend className="mb-2 text-label text-ink-muted uppercase">Include</legend>
          <label className="flex items-center gap-2.5">
            <Checkbox checked={importantOnly} onChange={(e) => setImportantOnly(e.target.checked)} />
            Only important ★ entries
          </label>
          <label className="flex items-center gap-2.5">
            <Checkbox checked={includeTasks} onChange={(e) => setIncludeTasks(e.target.checked)} />
            Tasks &amp; events
          </label>
          <label className="flex items-center gap-2.5">
            <Checkbox checked={includeImages} onChange={(e) => setIncludeImages(e.target.checked)} />
            Attached images
          </label>
        </fieldset>

        <div className="flex flex-col gap-1">
          <p className="text-label text-ink-muted uppercase">File</p>
          <p className="font-mono text-caption break-all text-ink">{fileName || '—'}</p>
          <p className="text-caption text-ink-muted">
            A4 portrait · {selected.length} shift{selected.length === 1 ? '' : 's'}
            {booklet ? ' + index page' : ''}
          </p>
        </div>

        <Button
          variant="primary"
          icon={state === 'working' ? LoaderCircle : Download}
          className={state === 'working' ? '[&>svg]:animate-spin' : ''}
          disabled={!selected.length || rangeInvalid || state === 'working'}
          onClick={download}
        >
          {state === 'working' ? 'Preparing PDF…' : 'Download PDF'}
        </Button>
        {state === 'error' && (
          <p role="alert" className="text-caption text-danger">
            The PDF couldn't be created. Try again; if it keeps failing, export fewer days at a time.
          </p>
        )}
        <p className="text-caption text-ink-muted">
          Every page carries the CMRL logo watermark. A shift that isn't handed over yet is marked DRAFT. After handover
          the PDF is the official copy.
        </p>
      </div>

      <div className="min-w-0 bg-muted p-4 sm:p-6">
        {selected.length === 0 ? (
          <p className="py-16 text-center text-body text-ink-muted">No shifts in this range.</p>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {selected.slice(0, PREVIEW_SHEETS).map((d, i) => (
              <DiaryFormSheet key={d.id} diary={d} options={options} footer={`Sheet ${i + 1} of ${selected.length}`} />
            ))}
            {selected.length > PREVIEW_SHEETS && (
              <p className="text-caption text-ink-muted">
                …and {selected.length - PREVIEW_SHEETS} more shift{selected.length - PREVIEW_SHEETS > 1 ? 's' : ''} in
                the file
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
