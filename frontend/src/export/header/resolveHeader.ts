import { currentTemplate } from '../data/templateStore'
import {
  HEADER_TEXT_FIELDS,
  type HeaderContent,
  type HeaderTemplate,
  type ReportDefinition,
  type TemplateSource,
} from '../types'

/** Used when a register declares nothing. */
export const SYSTEM_HEADER: HeaderContent = {
  layout: 'standard',
  title: '{register.name}',
  subtitle: '',
  department: '',
}

type ReportRef = Pick<ReportDefinition<unknown>, 'id' | 'code' | 'defaultHeader'>

export interface ResolvedTemplate {
  content: HeaderContent
  source: TemplateSource
  /** The register default in force, to compare a station override against. */
  registerDefault: { content: HeaderContent; version: number }
  /** Station override was copied from an older register default. */
  outdated: boolean
}

export function builtInHeader(report: ReportRef): HeaderContent {
  return { ...SYSTEM_HEADER, ...report.defaultHeader }
}

/**
 * Picks the header in force: station override → saved register default → the register's built-in default.
 * A station override replaces the register default as a whole; fields are never mixed from two templates.
 */
export function resolveTemplate(report: ReportRef, list: HeaderTemplate[], stationCode: string): ResolvedTemplate {
  const saved = currentTemplate(list, report.id, null)
  const registerDefault = saved
    ? { content: saved.content, version: saved.version }
    : { content: builtInHeader(report), version: 0 }
  const override = currentTemplate(list, report.id, stationCode)
  if (override) {
    return {
      content: override.content,
      source: { scope: 'station', version: override.version, stationCode, edited: false },
      registerDefault,
      outdated: (override.basedOn ?? 0) < registerDefault.version,
    }
  }
  return {
    content: registerDefault.content,
    source: { scope: saved ? 'register' : 'system', version: registerDefault.version, edited: false },
    registerDefault,
    outdated: false,
  }
}

/** Same header, ignoring surrounding spaces (saved templates are trimmed). */
export const sameContent = (a: HeaderContent, b: HeaderContent) =>
  a.layout === b.layout && HEADER_TEXT_FIELDS.every((f) => a[f].trim() === b[f].trim())

/** "Station override · CEN01 · v3" */
export function sourceLabel(source: TemplateSource): string {
  const base =
    source.scope === 'station'
      ? `Station override · ${source.stationCode} · v${source.version}`
      : source.scope === 'register'
        ? `Register default · v${source.version}`
        : 'Built-in default'
  return source.edited ? `${base} · changed for this export` : base
}

/** Short reference printed in every export's footer: "Header OCC/CEN01 v3". */
export function sourceReference(reportCode: string, source: TemplateSource): string {
  const scope = source.scope === 'station' ? source.stationCode : 'default'
  const version = source.scope === 'system' ? 'built-in' : `v${source.version}`
  return `Header ${reportCode}/${scope} ${version}${source.edited ? ' (changed for this export)' : ''}`
}
