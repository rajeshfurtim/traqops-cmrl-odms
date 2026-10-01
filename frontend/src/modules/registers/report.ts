import { defineReport, type ExportColumn, type ReportDefinition } from '@/export'
import { stateOf } from './definitions'
import { resolveColumns } from './columns'
import { recordDate } from './fields'
import type { RegisterDefinition, RegisterRecord } from './types'

const cache = new Map<string, ReportDefinition<RegisterRecord>>()

/** The export report for a register, generated from its list columns: reference, date, columns, recorded by, status. */
export function registerReport(register: RegisterDefinition): ReportDefinition<RegisterRecord> {
  const cached = cache.get(register.id)
  if (cached) return cached

  const columns: ExportColumn<RegisterRecord>[] = resolveColumns(register).map((c) => ({
    id: c.id,
    header: c.label,
    value: c.value,
    sub: c.sub,
    width: c.wide ? 22 : 13,
  }))

  const report = defineReport<RegisterRecord>({
    id: register.id,
    name: register.label,
    code: register.code,
    header: register.report?.header,
    defaultHeader: register.report?.defaultHeader,
    columns: [
      { id: 'ref', header: 'Reference', value: (r) => r.ref, width: 16 },
      { id: 'date', header: 'Date & time', type: 'datetime', value: (r) => recordDate(register, r), width: 12 },
      ...columns,
      {
        id: 'raisedBy',
        header: 'Recorded by',
        value: (r) => r.raisedBy.name,
        sub: (r) => r.raisedBy.employeeId,
        width: 11,
      },
      {
        id: 'status',
        header: 'Status',
        value: (r) => stateOf(register, r.state).label,
        sub: (r) => (r.diaryLabel ? `Linked: ${r.diaryLabel}` : undefined),
        width: 9,
      },
    ],
    fileName: (ctx) => `${ctx.station.code}_${register.code}_${register.label}_${ctx.generatedAt.slice(0, 10)}`,
  })
  cache.set(register.id, report)
  return report
}
