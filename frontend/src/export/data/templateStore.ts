import { useSyncExternalStore } from 'react'
import {
  type ExportFormat,
  type ExportPerson,
  type HeaderContent,
  type HeaderTemplate,
  type TemplateSource,
} from '../types'

// In-memory mock shaped like the future API: templates are append-only versions.
let templates: HeaderTemplate[] = []
let exportLog: ExportLogEntry[] = []
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function commit(next: HeaderTemplate[]) {
  templates = next
  listeners.forEach((l) => l())
}

/** Every version of every template; filter with the helpers below. */
export function useHeaderTemplates(): HeaderTemplate[] {
  return useSyncExternalStore(subscribe, () => templates)
}

/** All versions for one scope, newest first. */
export function versionsOf(list: HeaderTemplate[], reportId: string, stationCode: string | null): HeaderTemplate[] {
  return list
    .filter((t) => t.reportId === reportId && t.stationCode === stationCode)
    .sort((a, b) => b.version - a.version)
}

/** The version in force for a scope, or undefined when none is saved (or the override was removed). */
export function currentTemplate(
  list: HeaderTemplate[],
  reportId: string,
  stationCode: string | null,
): HeaderTemplate | undefined {
  const latest = versionsOf(list, reportId, stationCode)[0]
  return latest && !latest.retired ? latest : undefined
}

export interface SaveTemplateInput {
  reportId: string
  stationCode: string | null
  content: HeaderContent
  by: ExportPerson
  note?: string
  basedOn?: number
}

export function saveTemplate(input: SaveTemplateInput): HeaderTemplate {
  const version = (versionsOf(templates, input.reportId, input.stationCode)[0]?.version ?? 0) + 1
  const template: HeaderTemplate = {
    id: `${input.reportId}:${input.stationCode ?? 'default'}:v${version}`,
    reportId: input.reportId,
    stationCode: input.stationCode,
    version,
    // Only the user-editable fields are ever stored; the rest of the header is fixed in code.
    content: {
      layout: input.content.layout,
      title: input.content.title.trim(),
      subtitle: input.content.subtitle.trim(),
      department: input.content.department.trim(),
    },
    basedOn: input.basedOn,
    updatedBy: input.by,
    updatedAt: new Date().toISOString(),
    note: input.note?.trim() || undefined,
  }
  commit([...templates, template])
  return template
}

/** Stops a station override; the register default applies again. The history stays. */
export function removeStationOverride(reportId: string, stationCode: string, by: ExportPerson) {
  const latest = currentTemplate(templates, reportId, stationCode)
  if (!latest) return
  const version = latest.version + 1
  commit([
    ...templates,
    {
      ...latest,
      id: `${reportId}:${stationCode}:v${version}`,
      version,
      retired: true,
      updatedBy: by,
      updatedAt: new Date().toISOString(),
      note: 'Station override removed',
    },
  ])
}

export interface ExportLogEntry {
  at: string
  by: ExportPerson
  reportId: string
  stationCode: string
  format: ExportFormat
  records: number
  template: TemplateSource
}

/** Which header version went into which export. Becomes one API call when the backend arrives. */
export function recordExport(entry: Omit<ExportLogEntry, 'at'>) {
  exportLog = [{ ...entry, at: new Date().toISOString() }, ...exportLog]
}

export const getExportLog = () => exportLog
