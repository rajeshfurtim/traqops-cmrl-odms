import { ClipboardList, Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input, Label, Select } from '@/components/ui/Field'
import { Pagination } from '@/components/ui/Pagination'
import { useSession } from '@/context/SessionContext'
import { ExportActions, toISODate } from '@/export'
import { getDiaryEntry, linkRegisterRecord } from '@/modules/station-diary/data/diaryStore'
import { toPlainText } from '@/modules/station-diary/richText'
import { formatFormDate, formatStamp } from '@/modules/station-diary/utils'
import { RecordDrawer } from '../components/RecordDrawer'
import { RecordFormDialog, type FormMode } from '../components/RecordFormDialog'
import { resolveColumns } from '../columns'
import { getRecord, useRecords } from '../data/registerStore'
import { CATEGORIES, getRegister, stateOf } from '../definitions'
import { findField, optionsFor, recordDate, recordTitle, str, toLocalDateTime } from '../fields'
import { registerReport } from '../report'
import type { RegisterDefinition, Values } from '../types'

const PAGE_SIZE = 15
const TH =
  'border-b border-border bg-canvas px-3 py-2.5 text-left text-label whitespace-nowrap text-ink-muted uppercase first:pl-4'
const TD = 'border-b border-border px-3 py-3 align-top first:pl-4'
const PILL =
  'inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-secondary font-medium transition-colors duration-150'

/** Pre-fills a new record from a Station Diary entry: title from the first line, details from the full text. */
function valuesFromEntry(register: RegisterDefinition, text: string, at: string): Values {
  const plain = toPlainText(text)
  const values: Values = { [register.dateField]: toLocalDateTime(new Date(at)) }
  const title = findField(register, register.titleField)
  if (title?.type === 'text') {
    const first = toPlainText(text.split('\n')[0]).replace(/[:;,]\s*$/, '')
    values[title.key] = first.length > 120 ? `${first.slice(0, 117)}…` : first
  }
  const notes = register.notesField ? findField(register, register.notesField) : undefined
  if (notes?.type === 'textarea') values[notes.key] = plain
  if (notes?.type === 'timeline') values[notes.key] = [{ id: 'diary', at: toLocalDateTime(new Date(at)), text: plain }]
  return values
}

export default function RegisterPage() {
  const { registerId } = useParams()
  const register = getRegister(registerId)
  return register ? (
    <RegisterView key={register.id} register={register} />
  ) : (
    <>
      <PageHeader title="Registers" />
      <EmptyState
        icon={ClipboardList}
        title="Register not found"
        action={
          <Link to="/registers" className="font-medium text-primary-ink hover:underline">
            All registers
          </Link>
        }
      />
    </>
  )
}

function RegisterView({ register }: { register: RegisterDefinition }) {
  const [params, setParams] = useSearchParams()
  const allRecords = useRecords()
  const { station } = useSession()
  const ids = useId()
  const [state, setState] = useState('all')
  const [kpi, setKpi] = useState('all')
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [query, setQuery] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(0)
  const [openId, setOpenId] = useState<string>()
  const [form, setForm] = useState<FormMode | null>(null)

  const fromEntryId = params.get('fromEntry')
  const fromEntry = fromEntryId ? getDiaryEntry(fromEntryId) : undefined
  const recordRef = params.get('record')
  const wantsNew = params.get('new') === '1'

  // Arriving from the diary or with ?new=1 opens the entry form straight away.
  const activeForm: FormMode | null =
    form ??
    (fromEntry && !fromEntry.entry.registerRecord
      ? {
          kind: 'new',
          preset: valuesFromEntry(register, fromEntry.entry.text, fromEntry.entry.at),
          source: {
            entryId: fromEntry.entry.id,
            label: `Station Diary, Shift ${fromEntry.diary.shift}, ${formatFormDate(fromEntry.diary.date)}`,
          },
        }
      : wantsNew
        ? { kind: 'new' }
        : null)

  const records = useMemo(
    () =>
      allRecords
        .filter((r) => r.registerId === register.id)
        .sort((a, b) => recordDate(register, b).localeCompare(recordDate(register, a))),
    [allRecords, register],
  )
  // A deep link (?record=REF) opens that record until the drawer is closed.
  const openRecord = records.find((r) => (openId ? r.id === openId : recordRef ? r.ref === recordRef : false))

  const inPeriod = useMemo(
    () =>
      records.filter((r) => {
        const day = toISODate(new Date(recordDate(register, r)))
        return (!from || day >= from) && (!to || day <= to)
      }),
    [records, register, from, to],
  )

  const kpiDef = register.kpis?.find((k) => k.id === kpi)
  const columns = resolveColumns(register)
  const filterFields = (register.filters ?? []).map((key) => findField(register, key)).filter((f) => f !== undefined)
  const workflowStates = register.workflow ? Object.entries(register.workflow.states) : []
  const q = query.trim().toLowerCase()

  const rows = inPeriod.filter(
    (r) =>
      (state === 'all' || r.state === state) &&
      (!kpiDef?.match || kpiDef.match(r)) &&
      Object.entries(picks).every(([key, value]) => !value || str(r.values, key) === value) &&
      (!q || [r.ref, r.raisedBy.name, ...columns.map((c) => c.value(r))].some((v) => v.toLowerCase().includes(q))),
  )

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pageCount - 1)
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)
  const activeFilters =
    (state !== 'all' ? 1 : 0) + Object.values(picks).filter(Boolean).length + (from ? 1 : 0) + (to ? 1 : 0)
  const filtered = activeFilters > 0 || kpi !== 'all' || q

  const reset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v)
      setPage(0)
    }
  const clearAll = () => {
    setState('all')
    setKpi('all')
    setPicks({})
    setQuery('')
    setFrom('')
    setTo('')
    setPage(0)
  }

  const closeForm = () => {
    setForm(null)
    if (fromEntryId || wantsNew) setParams({}, { replace: true })
  }

  const closeRecord = () => {
    setOpenId(undefined)
    if (recordRef) setParams({}, { replace: true })
  }

  return (
    <>
      <PageHeader
        title={register.label}
        description={`${CATEGORIES[register.category].label} · ${register.statutory ? 'Statutory · ' : ''}${register.retention}${register.form ? ` · Form ${register.form.number}` : ''}`}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setForm({ kind: 'new' })}>
            New entry
          </Button>
        }
      />

      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {register.kpis && (
            <div role="group" aria-label="Show" className="flex flex-wrap gap-1.5">
              {register.kpis.map((k) => {
                const matching = k.match ? inPeriod.filter(k.match) : inPeriod
                const total = matching.reduce((s, r) => s + (k.count ? k.count(r) : 1), 0)
                const active = kpi === k.id
                return (
                  <button
                    key={k.id}
                    type="button"
                    aria-pressed={active}
                    // "All" and tiles without a filter reset; others filter the table.
                    onClick={() => reset(setKpi)(!k.match || active ? 'all' : k.id)}
                    className={`${PILL} ${active ? 'border-primary bg-primary text-on-primary' : 'border-border bg-surface text-ink hover:bg-subtle'}`}
                  >
                    {k.tone && total > 0 && !active && (
                      <span aria-hidden className={`size-1.5 rounded-full ${TONE_DOT[k.tone] ?? 'bg-border-strong'}`} />
                    )}
                    {k.label}
                    <span className={`tabular-nums ${active ? 'text-on-primary/80' : 'text-ink-muted'}`}>{total}</span>
                  </button>
                )
              })}
            </div>
          )}
          <div className="ml-auto flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <div className="relative w-full sm:w-60">
              <label htmlFor={`${ids}-q`} className="sr-only">
                Search this register
              </label>
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-ink-muted"
              />
              <Input
                id={`${ids}-q`}
                fieldSize="sm"
                type="search"
                placeholder="Reference, name or text"
                value={query}
                onChange={(e) => reset(setQuery)(e.target.value)}
                className="w-full pl-8"
              />
            </div>
            <Button
              size="sm"
              icon={SlidersHorizontal}
              aria-expanded={showFilters}
              aria-controls={`${ids}-filters`}
              onClick={() => setShowFilters((v) => !v)}
            >
              Filters{activeFilters ? ` (${activeFilters})` : ''}
            </Button>
            {register.report && (
              <ExportActions
                report={registerReport(register)}
                rows={rows}
                rowKey={(r) => r.id}
                period={{ from: from || undefined, to: to || undefined }}
                filters={[
                  ...(workflowStates.length
                    ? [{ label: 'Status', value: state === 'all' ? 'All' : stateOf(register, state).label }]
                    : []),
                  ...(kpiDef && kpi !== 'all' ? [{ label: 'Showing', value: kpiDef.label }] : []),
                  ...filterFields.filter((f) => picks[f.key]).map((f) => ({ label: f.label, value: picks[f.key] })),
                  ...(q ? [{ label: 'Search', value: `“${query.trim()}”` }] : []),
                ]}
              />
            )}
          </div>
        </div>

        {showFilters && (
          <Card id={`${ids}-filters`} className="flex flex-wrap items-end gap-3 px-4 py-3">
            {workflowStates.length > 0 && (
              <div className="flex flex-col gap-1">
                <Label htmlFor={`${ids}-state`}>Status</Label>
                <Select
                  id={`${ids}-state`}
                  fieldSize="sm"
                  value={state}
                  onChange={(e) => reset(setState)(e.target.value)}
                >
                  <option value="all">All</option>
                  {workflowStates.map(([id, st]) => (
                    <option key={id} value={id}>
                      {st.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}
            {filterFields.map((f) => (
              <div key={f.key} className="flex max-w-56 min-w-0 flex-col gap-1">
                <Label htmlFor={`${ids}-${f.key}`}>{f.label}</Label>
                <Select
                  id={`${ids}-${f.key}`}
                  fieldSize="sm"
                  value={picks[f.key] ?? ''}
                  onChange={(e) => reset(setPicks)({ ...picks, [f.key]: e.target.value })}
                  className="w-full"
                >
                  <option value="">All</option>
                  {(f.type === 'yesno' ? ['Yes', 'No'] : optionsFor(f, {}, { stationCode: station.code })).map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </Select>
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${ids}-from`}>From</Label>
              <Input
                id={`${ids}-from`}
                type="date"
                fieldSize="sm"
                value={from}
                max={to || undefined}
                onChange={(e) => reset(setFrom)(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor={`${ids}-to`}>To</Label>
              <Input
                id={`${ids}-to`}
                type="date"
                fieldSize="sm"
                value={to}
                min={from || undefined}
                onChange={(e) => reset(setTo)(e.target.value)}
              />
            </div>
            {filtered && (
              <Button size="sm" variant="ghost" icon={X} onClick={clearAll}>
                Clear filters
              </Button>
            )}
          </Card>
        )}

        <Card className="overflow-hidden">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
              <p className="text-body text-ink-muted">
                {records.length === 0 ? 'No entries in this register yet.' : 'No entries match these filters.'}
              </p>
              {records.length === 0 ? (
                <Button variant="primary" icon={Plus} onClick={() => setForm({ kind: 'new' })}>
                  Add the first entry
                </Button>
              ) : (
                <Button icon={X} onClick={clearAll}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Phones get a compact list; the full table starts at tablet width. */}
              <ul className="divide-y divide-border sm:hidden">
                {visible.map((r) => {
                  const st = stateOf(register, r.state)
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        onClick={() => setOpenId(r.id)}
                        className="flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-subtle/60"
                      >
                        <span className="flex items-start gap-2">
                          <span className="min-w-0 flex-1 text-body font-medium text-ink">
                            {recordTitle(register, r)}
                          </span>
                          {register.workflow && <Badge tone={st.tone}>{st.label}</Badge>}
                        </span>
                        <span className="text-caption text-ink-muted tabular-nums">
                          {formatStamp(recordDate(register, r))} · Shift {r.shift} · {r.raisedBy.name}
                        </span>
                        <span className="font-mono text-caption text-ink-muted">{r.ref}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full min-w-[52rem] border-collapse text-body">
                  <thead>
                    <tr>
                      <th scope="col" className={TH}>
                        Reference
                      </th>
                      <th scope="col" className={TH}>
                        Date &amp; time
                      </th>
                      {columns.map((c) => (
                        <th key={c.id} scope="col" className={TH}>
                          {c.label}
                        </th>
                      ))}
                      <th scope="col" className={TH}>
                        Recorded by
                      </th>
                      {register.workflow && (
                        <th scope="col" className={TH}>
                          Status
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((r) => {
                      const st = stateOf(register, r.state)
                      const active = r.id === openRecord?.id
                      return (
                        <tr
                          key={r.id}
                          // The open row carries the yellow marker, like the active sidebar item.
                          className={`cursor-pointer transition-colors ${active ? 'bg-primary-subtle shadow-[inset_0.25rem_0_0_var(--color-accent)]' : 'hover:bg-subtle/70'}`}
                          onClick={() => setOpenId(r.id)}
                        >
                          <td className={`${TD} font-mono text-caption whitespace-nowrap`}>
                            {/* The reference is the keyboard way in; the whole row is the mouse way. */}
                            <button
                              type="button"
                              className="text-left font-medium text-primary-ink hover:underline"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenId(r.id)
                              }}
                            >
                              {r.ref}
                            </button>
                            {r.revision > 0 && <span className="block text-ink-muted">Rev {r.revision}</span>}
                          </td>
                          <td className={`${TD} whitespace-nowrap tabular-nums`}>
                            {formatStamp(recordDate(register, r))}
                            <span className="block text-caption text-ink-muted">Shift {r.shift}</span>
                          </td>
                          {columns.map((c) => {
                            const value = c.value(r)
                            const sub = c.sub?.(r)
                            return (
                              <td key={c.id} className={`${TD} ${c.wide ? 'max-w-72' : ''}`}>
                                <span className={c.wide ? 'line-clamp-2' : ''}>{value || '—'}</span>
                                {sub && <span className="block text-caption text-ink-muted">{sub}</span>}
                              </td>
                            )
                          })}
                          <td className={`${TD} whitespace-nowrap`}>
                            {r.raisedBy.name}
                            <span className="block text-caption text-ink-muted">{r.raisedBy.employeeId}</span>
                          </td>
                          {register.workflow && (
                            <td className={TD}>
                              <Badge tone={st.tone}>{st.label}</Badge>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-caption text-ink-muted">
                <span className="tabular-nums">
                  {rows.length} of {records.length} entr{records.length === 1 ? 'y' : 'ies'}
                </span>
                {pageCount > 1 && <Pagination page={current} pageCount={pageCount} onChange={setPage} />}
              </div>
            </>
          )}
        </Card>
      </div>

      <RecordDrawer
        register={register}
        record={openRecord}
        onClose={closeRecord}
        onCorrect={(record) => setForm({ kind: 'edit', record })}
      />

      <RecordFormDialog
        register={register}
        mode={activeForm}
        onClose={closeForm}
        onSaved={(recordId) => {
          const saved = getRecord(recordId)
          if (fromEntry && saved) linkRegisterRecord(fromEntry.entry.id, register.id, saved.ref)
          closeForm()
          setOpenId(recordId)
        }}
      />
    </>
  )
}

const TONE_DOT: Record<string, string> = {
  warning: 'bg-warning-dot',
  danger: 'bg-danger-dot',
  success: 'bg-success-dot',
  info: 'bg-info-dot',
}
