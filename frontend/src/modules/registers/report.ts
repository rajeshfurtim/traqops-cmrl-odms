import { defineReport, type ExportColumn, type ReportDefinition } from '@/export'
import { STATUS_LABELS } from './definitions'
import type { RegisterDefinition, RegisterRecord } from './types'

const cache = new Map<string, ReportDefinition<RegisterRecord>>()

/** The export report for a register, generated from its definition: reference, every field, raised, status. */
export function registerReport(register: RegisterDefinition): ReportDefinition<RegisterRecord> {
  const cached = cache.get(register.id)
  if (cached) return cached

  const fields: ExportColumn<RegisterRecord>[] = register.fields.map((f) => ({
    id: f.key,
    header: f.label,
    value: (r) => r.values[f.key],
    width: f.type === 'textarea' ? 23 : f.type === 'select' ? 9 : 14,
  }))

  const report = defineReport<RegisterRecord>({
    id: register.id,
    name: register.label,
    code: register.code,
    header: register.report?.header,
    defaultHeader: register.report?.defaultHeader,
    columns: [
      { id: 'ref', header: 'Reference', value: (r) => r.ref, width: 17 },
      ...fields,
      { id: 'raisedAt', header: 'Raised at', type: 'datetime', value: (r) => r.raisedAt, width: 13 },
      { id: 'raisedBy', header: 'Raised by', value: (r) => r.raisedBy, width: 11 },
      {
        id: 'status',
        header: 'Status',
        value: (r) => STATUS_LABELS[r.status],
        sub: (r) => (r.diaryLabel ? `Linked: ${r.diaryLabel}` : undefined),
        width: 10,
      },
    ],
    fileName: (ctx) => `${ctx.station.code}_${register.code}_${register.label}_${ctx.generatedAt.slice(0, 10)}`,
  })
  cache.set(register.id, report)
  return report
}
