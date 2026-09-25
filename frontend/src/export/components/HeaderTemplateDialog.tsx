import { History, Lock } from 'lucide-react'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useSession } from '@/context/SessionContext'
import { can } from '@/utils/permissions'
import {
  currentTemplate,
  removeStationOverride,
  saveTemplate,
  useHeaderTemplates,
  versionsOf,
} from '../data/templateStore'
import { validateHeader } from '../header/placeholders'
import { resolveTemplate, sameContent } from '../header/resolveHeader'
import type { ReportLayout } from '../layout'
import { SheetPreview } from '../sheet/SheetPreview'
import type { HeaderContent, ReportDefinition, TemplateSource } from '../types'
import { HeaderFields } from './HeaderFields'
import { TemplateHistory } from './TemplateHistory'

type Scope = 'register' | 'station'

const NOTICE = 'rounded-lg border px-3 py-2.5 text-secondary'

interface HeaderTemplateDialogProps {
  report: Pick<ReportDefinition<unknown>, 'id' | 'name' | 'code' | 'defaultHeader'>
  /** Draws the report with a given header, using the page's current rows and filters. */
  preview: (content: HeaderContent, source: TemplateSource) => ReportLayout
  onClose: () => void
}

/** Edits the saved header templates of one report: the register default and this station's override. */
export function HeaderTemplateDialog({ report, preview, onClose }: HeaderTemplateDialogProps) {
  const { user, station } = useSession()
  const ids = useId()
  const templates = useHeaderTemplates()
  const resolved = resolveTemplate(report, templates, station.code)
  const override = currentTemplate(templates, report.id, station.code)
  const registerBase = resolved.registerDefault

  const [scope, setScope] = useState<Scope>(override ? 'station' : 'register')
  // Unsaved work per scope; null = not touched yet, so the saved template shows.
  const [drafts, setDrafts] = useState<Record<Scope, HeaderContent | null>>({ register: null, station: null })
  const [note, setNote] = useState('')
  const [showHistory, setShowHistory] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  const base = scope === 'register' ? registerBase.content : override?.content
  const draft = drafts[scope] ?? base ?? null
  const dirty = draft !== null && (!base || !sameContent(draft, base))
  const problems = draft ? validateHeader(draft) : {}
  const hasProblems = Object.keys(problems).length > 0
  const allowed = can(user, scope === 'register' ? 'report-header.edit-register' : 'report-header.edit-station')
  const versions = versionsOf(templates, report.id, scope === 'register' ? null : station.code)

  const setDraft = (content: HeaderContent | null) => {
    setDrafts((d) => ({ ...d, [scope]: content }))
    setSavedMessage('')
  }

  const save = () => {
    if (!draft || hasProblems || !allowed) return
    const saved = saveTemplate({
      reportId: report.id,
      stationCode: scope === 'register' ? null : station.code,
      content: draft,
      by: user,
      note,
      basedOn: scope === 'station' ? registerBase.version : undefined,
    })
    setDrafts((d) => ({ ...d, [scope]: null }))
    setNote('')
    setSavedMessage(`Saved as v${saved.version}. Exports use it from now on.`)
  }

  // The preview footer shows the version that saving will create.
  const savedVersion = scope === 'station' ? (override?.version ?? 0) : registerBase.version
  const previewVersion = dirty ? (versions[0]?.version ?? 0) + 1 : savedVersion
  const previewSource: TemplateSource =
    scope === 'station'
      ? { scope: 'station', version: previewVersion, stationCode: station.code, edited: false }
      : { scope: previewVersion ? 'register' : 'system', version: previewVersion, edited: false }
  const layout = draft ? preview(draft, previewSource) : null

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={`Report header · ${report.name}`}
      description="Set the layout, title, subtitle and department / section printed on this register's PDF, Excel and printouts. Everything else on the header is the same on every document."
      footer={
        <>
          {savedMessage && (
            <p role="status" className="mr-auto text-secondary text-success">
              {savedMessage}
            </p>
          )}
          {!savedMessage && dirty && <p className="mr-auto text-secondary text-ink-muted">Unsaved changes</p>}
          <Button variant="ghost" onClick={onClose}>
            {dirty ? 'Close without saving' : 'Close'}
          </Button>
          {allowed && draft && (
            <Button variant="primary" disabled={!dirty || hasProblems} onClick={save}>
              {scope === 'register' ? 'Save register default' : `Save ${station.code} override`}
            </Button>
          )}
        </>
      }
    >
      <div className="grid min-h-0 md:grid-cols-[24rem_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 border-b border-border p-5 md:border-r md:border-b-0">
          <SegmentedControl
            label="Which template"
            value={scope}
            onChange={(next) => {
              setScope(next)
              setConfirmRemove(false)
              setSavedMessage('')
            }}
            options={[
              { value: 'register', label: 'Register default' },
              { value: 'station', label: `${station.code} override` },
            ]}
            className="self-start"
          />

          <p className="text-caption text-ink-muted">
            {scope === 'register'
              ? `Used by every station that has no override. ${registerBase.version ? `Now v${registerBase.version}.` : 'Now the built-in default.'}`
              : override
                ? `Used only for ${station.name}, in place of the register default. Now v${override.version}.`
                : `${station.name} uses the register default. Create an override to give this station its own header.`}
          </p>

          {!allowed && (
            <p className={`${NOTICE} flex items-start gap-2 border-border bg-canvas text-ink-secondary`}>
              <Lock aria-hidden className="mt-0.5 size-4 shrink-0" />
              {scope === 'register'
                ? 'Only a Station Supervisor or Administrator can change the register default.'
                : 'Your role cannot change this station’s header.'}
            </p>
          )}

          {scope === 'station' && override && resolved.outdated && (
            <div className={`${NOTICE} border-warning/40 bg-warning-subtle text-warning`}>
              The register default has changed (now v{registerBase.version}) since this override was made
              {override.basedOn ? ` from v${override.basedOn}` : ''}.
              {allowed && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-2"
                  onClick={() => setDraft({ ...registerBase.content })}
                >
                  Start again from the register default
                </Button>
              )}
            </div>
          )}

          {draft ? (
            <HeaderFields value={draft} onChange={setDraft} problems={problems} readOnly={!allowed} />
          ) : (
            allowed && (
              <Button
                variant="secondary"
                className="self-start"
                onClick={() => setDraft(structuredClone(registerBase.content))}
              >
                Create {station.code} override
              </Button>
            )
          )}

          {allowed && dirty && (
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${ids}-note`}>What changed (optional)</Label>
              <Input
                id={`${ids}-note`}
                fieldSize="sm"
                value={note}
                maxLength={160}
                placeholder="e.g. Form revised to Rev 01"
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            <Button size="sm" variant="ghost" icon={History} onClick={() => setShowHistory((v) => !v)}>
              {showHistory ? 'Hide version history' : `Version history (${versions.length})`}
            </Button>
            {dirty && base && (
              <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>
                Discard changes
              </Button>
            )}
            {scope === 'station' && override && allowed && !confirmRemove && (
              <Button size="sm" variant="ghost" className="text-danger" onClick={() => setConfirmRemove(true)}>
                Remove override
              </Button>
            )}
          </div>

          {confirmRemove && (
            <div role="alert" className={`${NOTICE} border-danger/40 bg-danger-subtle text-danger`}>
              Remove the {station.code} override? {station.name} will use the register default again. Its versions stay
              in the history.
              <div className="mt-2 flex gap-2">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    removeStationOverride(report.id, station.code, user)
                    setDrafts((d) => ({ ...d, station: null }))
                    setConfirmRemove(false)
                    setSavedMessage('Override removed. The register default applies.')
                  }}
                >
                  Remove override
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setConfirmRemove(false)}>
                  Keep it
                </Button>
              </div>
            </div>
          )}

          {showHistory && (
            <TemplateHistory
              versions={versions}
              onRestore={
                allowed
                  ? (v) => {
                      setDraft(structuredClone(v.content))
                      setNote(`Restored v${v.version}`)
                    }
                  : undefined
              }
            />
          )}
        </div>

        <div className="min-w-0 bg-muted p-4 sm:p-6">
          <p className="mb-3 text-label text-ink-muted uppercase">Preview · as it will print</p>
          <div className="flex flex-col items-center">
            {layout ? (
              <SheetPreview layout={layout} />
            ) : (
              <SheetPreview layout={preview(registerBase.content, resolved.source)} />
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
