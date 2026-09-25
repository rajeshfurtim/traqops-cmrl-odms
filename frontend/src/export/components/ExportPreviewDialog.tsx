import { ChevronDown, Download, FileSpreadsheet, LoaderCircle, Printer, Save, type LucideIcon } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { useSession } from '@/context/SessionContext'
import { can } from '@/utils/permissions'
import { recordExport, saveTemplate, useHeaderTemplates } from '../data/templateStore'
import { safeFileName } from '../download'
import { validateHeader } from '../header/placeholders'
import { resolveTemplate, sameContent, sourceLabel } from '../header/resolveHeader'
import { buildReportLayout, type ReportLayout } from '../layout'
import { SheetPreview } from '../sheet/SheetPreview'
import type { ExportContext, HeaderContent, ReportDefinition } from '../types'
import { HeaderFields } from './HeaderFields'

export type FileAction = 'pdf' | 'xlsx' | 'print'

const PREVIEW_ROWS = 25
const NOTICE = 'rounded-lg border px-3 py-2.5 text-secondary'

const ACTIONS: Record<FileAction, { label: string; busyLabel: string; icon: LucideIcon }> = {
  pdf: { label: 'Download PDF', busyLabel: 'Preparing PDF…', icon: Download },
  xlsx: { label: 'Download Excel', busyLabel: 'Preparing Excel…', icon: FileSpreadsheet },
  print: { label: 'Print', busyLabel: 'Print', icon: Printer },
}

interface ExportPreviewDialogProps<T> {
  report: ReportDefinition<T>
  rows: T[]
  rowKey: (row: T) => string
  /** Everything but the moment of export, which is set when the file is made. */
  context: Omit<ExportContext, 'generatedAt'>
  /** The button the user clicked; it becomes the main action. */
  intent: FileAction
  onPrint: (layout: ReportLayout) => void
  onClose: () => void
}

export function ExportPreviewDialog<T>({
  report,
  rows,
  rowKey,
  context,
  intent,
  onPrint,
  onClose,
}: ExportPreviewDialogProps<T>) {
  const { user, station } = useSession()
  const ids = useId()
  const templates = useHeaderTemplates()
  const resolved = resolveTemplate(report, templates, station.code)
  // One-time changes live here only; the saved template is untouched until "Save as template".
  const [draft, setDraft] = useState<HeaderContent>(() => structuredClone(resolved.content))
  const [openedAt] = useState(() => new Date().toISOString())
  const [busy, setBusy] = useState<FileAction | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveScope, setSaveScope] = useState<'station' | 'register'>('station')
  const [note, setNote] = useState('')
  const [savedMessage, setSavedMessage] = useState('')

  const edited = !sameContent(draft, resolved.content)
  const source = { ...resolved.source, edited }
  const problems = validateHeader(draft)
  const hasProblems = Object.keys(problems).length > 0
  const scopes = [
    can(user, 'report-header.edit-station') && ('station' as const),
    can(user, 'report-header.edit-register') && ('register' as const),
  ].filter((s) => s !== false)

  const layoutAt = (generatedAt: string, rowLimit?: number) =>
    buildReportLayout({ report, rows, rowKey, context: { ...context, generatedAt }, content: draft, source, rowLimit })
  const preview = layoutAt(openedAt, PREVIEW_ROWS)

  const run = async (action: FileAction) => {
    if (busy || hasProblems) return
    const generatedAt = new Date().toISOString()
    const layout = layoutAt(generatedAt)
    const fileName = safeFileName(report.fileName({ ...context, generatedAt }))
    recordExport({
      by: user,
      reportId: report.id,
      stationCode: station.code,
      format: action,
      records: rows.length,
      template: source,
    })
    if (action === 'print') {
      onPrint(layout)
      return
    }
    setBusy(action)
    setError('')
    try {
      if (action === 'pdf') {
        const { downloadReportPdf } = await import('../formats/pdf')
        await downloadReportPdf(layout, user.name, `${fileName}.pdf`)
      } else {
        const { downloadReportXlsx } = await import('../formats/xlsx')
        await downloadReportXlsx({
          layout,
          columns: report.columns,
          rows,
          author: user.name,
          fileName: `${fileName}.xlsx`,
        })
      }
      onClose()
    } catch (err) {
      console.error('[ODMS] Export failed', err)
      setError('The file could not be made. Try again; if it keeps failing, use Print instead.')
      setBusy(null)
    }
  }

  const saveAsTemplate = () => {
    const scope = scopes.includes(saveScope) ? saveScope : scopes[0]
    if (!scope || hasProblems) return
    const saved = saveTemplate({
      reportId: report.id,
      stationCode: scope === 'register' ? null : station.code,
      content: draft,
      by: user,
      note,
      basedOn: scope === 'station' ? resolved.registerDefault.version : undefined,
    })
    setSaving(false)
    setNote('')
    setSavedMessage(
      scope === 'register'
        ? `Saved as register default v${saved.version}.`
        : `Saved as ${station.code} override v${saved.version}.`,
    )
  }

  const order: FileAction[] = [intent, ...(['pdf', 'xlsx', 'print'] as const).filter((a) => a !== intent)]

  return (
    <Modal open onClose={onClose} size="xl" title={`Export · ${report.name}`}>
      <div className="grid min-h-0 md:grid-cols-[22rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 border-b border-border p-5 md:border-r md:border-b-0">
          <div className="flex flex-col gap-1 text-secondary">
            <span className="text-label text-ink-muted uppercase">Header template</span>
            <p className="font-semibold text-ink">{sourceLabel(source)}</p>
            <p className="text-caption text-ink-muted">
              {rows.length} record{rows.length === 1 ? '' : 's'} · A4 {preview.orientation}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {order.map((action, i) => {
              const a = ACTIONS[action]
              const isBusy = busy === action
              return (
                <Button
                  key={action}
                  variant={i === 0 ? 'primary' : 'secondary'}
                  icon={isBusy ? LoaderCircle : a.icon}
                  className={isBusy ? '[&>svg]:animate-spin' : ''}
                  disabled={Boolean(busy) || hasProblems}
                  onClick={() => run(action)}
                >
                  {isBusy ? a.busyLabel : a.label}
                </Button>
              )
            })}
            {hasProblems && (
              <p className="text-caption text-danger">Fix the header fields marked below before exporting.</p>
            )}
            {error && (
              <p role="alert" className="text-caption text-danger">
                {error}
              </p>
            )}
          </div>

          <details className="group rounded-lg border border-border" open={edited || hasProblems || undefined}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-3 py-2.5 text-secondary font-medium text-ink">
              Change header for this export
              <ChevronDown aria-hidden className="size-4 text-ink-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="flex flex-col gap-4 border-t border-border p-3">
              <HeaderFields value={draft} onChange={setDraft} problems={problems} />
            </div>
          </details>

          {edited && (
            <div className={`${NOTICE} flex flex-col gap-2 border-info/40 bg-info-subtle text-info`}>
              <p>These changes apply to this export only. The saved template stays as it is.</p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => setDraft(structuredClone(resolved.content))}>
                  Discard changes
                </Button>
                {scopes.length > 0 && !saving && (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Save}
                    disabled={hasProblems}
                    onClick={() => setSaving(true)}
                  >
                    Save as template…
                  </Button>
                )}
              </div>
            </div>
          )}

          {saving && edited && (
            <fieldset className="flex flex-col gap-2 rounded-lg border border-border p-3">
              <legend className="px-1 text-secondary font-semibold text-ink">Save as template</legend>
              {scopes.map((scope) => (
                <label key={scope} className="flex items-start gap-2 text-secondary text-ink">
                  <input
                    type="radio"
                    name={`${ids}-scope`}
                    className="mt-0.5 accent-primary"
                    checked={(scopes.includes(saveScope) ? saveScope : scopes[0]) === scope}
                    onChange={() => setSaveScope(scope)}
                  />
                  <span>
                    {scope === 'station' ? `${station.code} override` : 'Register default'}
                    <span className="block text-caption text-ink-muted">
                      {scope === 'station'
                        ? `Only ${station.name} uses it.`
                        : 'Every station without its own override uses it.'}
                    </span>
                  </span>
                </label>
              ))}
              <div className="flex flex-col gap-1">
                <Label htmlFor={`${ids}-note`}>What changed (optional)</Label>
                <Input
                  id={`${ids}-note`}
                  fieldSize="sm"
                  value={note}
                  maxLength={160}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="primary" onClick={saveAsTemplate}>
                  Save template
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSaving(false)}>
                  Cancel
                </Button>
              </div>
            </fieldset>
          )}

          {savedMessage && (
            <p role="status" className="text-secondary text-success">
              {savedMessage}
            </p>
          )}
        </div>

        <div className="min-w-0 bg-muted p-4 sm:p-6">
          <div className="flex flex-col items-center">
            <SheetPreview layout={preview} />
          </div>
        </div>
      </div>
    </Modal>
  )
}
