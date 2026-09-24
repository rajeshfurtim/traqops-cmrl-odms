import { ClipboardList, Plus, Search } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Field'
import { Pagination } from '@/components/ui/Pagination'
import { useSession } from '@/context/SessionContext'
import { getDiaryEntry, linkRegisterRecord } from '@/modules/station-diary/data/diaryStore'
import { toPlainText } from '@/modules/station-diary/richText'
import { formatDateTime } from '@/utils/format'
import { NewRecordDialog } from '../components/NewRecordDialog'
import { RecordPanel } from '../components/RecordPanel'
import { RegisterNav } from '../components/RegisterNav'
import { useRecords } from '../data/registerStore'
import { CATEGORIES, getRegister, STATUS_LABELS, STATUS_TONES } from '../definitions'
import type { RecordStatus, RegisterDefinition } from '../types'

type StatusFilter = 'active' | RecordStatus | 'all'

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'active', label: 'Not closed' },
  { value: 'open', label: 'Open' },
  { value: 'pending-verification', label: 'Pending verification' },
  { value: 'closed', label: 'Closed' },
  { value: 'all', label: 'All' },
]

const PAGE_SIZE = 10
const CHIP = 'h-7 rounded-full border px-3 text-caption font-medium transition-colors duration-150'
const TH =
  'border-b border-border bg-canvas px-3 py-2 text-left text-caption font-medium whitespace-nowrap text-ink-muted'
const TD = 'border-b border-border px-3 py-2.5 align-top'

function valuesFromEntry(register: RegisterDefinition, text: string): Record<string, string> {
  const firstLine = toPlainText(text.split('\n')[0]).replace(/[:;,]\s*$/, '')
  const values: Record<string, string> = {
    [register.titleField]: firstLine.length > 120 ? `${firstLine.slice(0, 117)}…` : firstLine,
  }
  const long = register.fields.find((f) => f.type === 'textarea')
  if (long) values[long.key] = toPlainText(text)
  return values
}

export default function RegisterPage() {
  const { registerId } = useParams()
  const register = getRegister(registerId)
  const [params, setParams] = useSearchParams()
  const records = useRecords()
  const { user } = useSession()
  const ids = useId()
  const recordRef = params.get('record')
  const [filter, setFilter] = useState<StatusFilter>(() => (recordRef ? 'all' : 'active'))
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [selectedId, setSelectedId] = useState<string>()
  const [manualOpen, setManualOpen] = useState(false)

  const fromEntryId = params.get('fromEntry')
  const fromEntry = fromEntryId ? getDiaryEntry(fromEntryId) : undefined
  // Arriving from the diary opens the entry form straight away.
  const dialogOpen = manualOpen || Boolean(fromEntry && !fromEntry.entry.registerRecord)
  // A deep link (?record=REF) selects that record until the user picks another.
  const activeId = selectedId ?? records.find((r) => r.ref === recordRef)?.id

  const rows = useMemo(() => {
    if (!register) return []
    const q = query.trim().toLowerCase()
    return records.filter(
      (r) =>
        r.registerId === register.id &&
        (filter === 'all' || (filter === 'active' ? r.status !== 'closed' : r.status === filter)) &&
        (!q || [r.ref, ...Object.values(r.values)].some((v) => v.toLowerCase().includes(q))),
    )
  }, [records, register, filter, query])

  if (!register) {
    return (
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

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const current = Math.min(page, pageCount - 1)
  const visible = rows.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE)
  const selected = records.find((r) => r.id === activeId && r.registerId === register.id) ?? visible[0]
  const columns = register.fields.filter((f) => f.column)

  const closeDialog = () => {
    setManualOpen(false)
    if (fromEntryId) setParams({}, { replace: true })
  }

  return (
    <>
      <PageHeader
        title={register.label}
        description={`${CATEGORIES[register.category].label} · ${register.statutory ? 'Statutory · ' : ''}${register.retention}`}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setManualOpen(true)}>
            New entry
          </Button>
        }
      />

      <div className="grid items-start gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <RegisterNav records={records} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-4 py-2.5">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={filter === f.value}
                  onClick={() => {
                    setFilter(f.value)
                    setPage(0)
                  }}
                  className={`${CHIP} ${
                    filter === f.value
                      ? 'border-transparent bg-primary-subtle text-primary-ink'
                      : 'border-border text-ink-secondary hover:bg-subtle'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <div className="relative ml-auto w-full sm:w-56">
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
                  placeholder="Search reference or text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setPage(0)
                  }}
                  className="w-full pl-8"
                />
              </div>
            </div>

            {rows.length === 0 ? (
              <p className="px-4 py-12 text-center text-body text-ink-muted">No records match.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[44rem] border-collapse text-body">
                    <thead>
                      <tr>
                        <th scope="col" className={TH}>
                          Reference
                        </th>
                        {columns.map((c) => (
                          <th key={c.key} scope="col" className={TH}>
                            {c.label}
                          </th>
                        ))}
                        <th scope="col" className={TH}>
                          Raised
                        </th>
                        <th scope="col" className={TH}>
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((r) => {
                        const isSelected = r.id === selected?.id
                        return (
                          <tr
                            key={r.id}
                            aria-selected={isSelected}
                            className={`cursor-pointer ${isSelected ? 'bg-primary-subtle' : 'hover:bg-subtle/60'}`}
                            onClick={() => setSelectedId(r.id)}
                          >
                            <td className={`${TD} font-mono text-caption whitespace-nowrap`}>
                              <button
                                type="button"
                                className="text-left text-primary-ink hover:underline"
                                onClick={() => setSelectedId(r.id)}
                              >
                                {r.ref}
                              </button>
                            </td>
                            {columns.map((c) => (
                              <td key={c.key} className={TD}>
                                {r.values[c.key] || '—'}
                              </td>
                            ))}
                            <td className={`${TD} whitespace-nowrap tabular-nums`}>
                              {formatDateTime(new Date(r.raisedAt))}
                              <span className="block text-caption text-ink-muted">{r.raisedBy}</span>
                            </td>
                            <td className={TD}>
                              <Badge tone={STATUS_TONES[r.status]}>{STATUS_LABELS[r.status]}</Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-caption text-ink-muted">
                  <span className="tabular-nums">
                    {rows.length} record{rows.length === 1 ? '' : 's'}
                  </span>
                  {pageCount > 1 && <Pagination page={current} pageCount={pageCount} onChange={setPage} />}
                </div>
              </>
            )}
          </Card>

          {selected && <RecordPanel key={selected.id} register={register} record={selected} actor={user.name} />}
        </div>
      </div>

      <NewRecordDialog
        register={register}
        open={dialogOpen}
        onClose={closeDialog}
        raisedBy={user.name}
        initialValues={fromEntry ? valuesFromEntry(register, fromEntry.entry.text) : undefined}
        source={
          fromEntry
            ? {
                entryId: fromEntry.entry.id,
                label: `Station Diary, Shift ${fromEntry.diary.shift}, ${fromEntry.diary.date}`,
              }
            : undefined
        }
        onCreated={(record) => {
          if (fromEntry) linkRegisterRecord(fromEntry.entry.id, register.id, record.ref)
          setSelectedId(record.id)
          setFilter('active')
          closeDialog()
        }}
      />
    </>
  )
}
