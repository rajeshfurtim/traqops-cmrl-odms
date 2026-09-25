import { BookOpen, Check, Copy, FileSpreadsheet, FileText, Printer, Table2 } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, Label, Select } from '@/components/ui/Field'
import { Pagination } from '@/components/ui/Pagination'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { DiaryFormSheet } from '../components/DiaryFormSheet'
import { DiaryTabs } from '../components/DiaryTabs'
import { ExportPdfDialog } from '../components/ExportPdfDialog'
import { ExportTablePdfDialog } from '../components/ExportTablePdfDialog'
import { SummaryOverview } from '../components/SummaryOverview'
import { SummaryTableSheet } from '../components/SummaryTableSheet'
import { SHIFT_ORDER, STATUS_LABELS, STATUS_TONES } from '../constants'
import { useDiaries } from '../data/diaryStore'
import { useActor } from '../hooks'
import { downloadCsv, toTsv } from '../tableExport'
import type { DiaryStatus, ShiftCode, ShiftDiary } from '../types'
import { addDays, compareDiariesAsc, compareDiariesDesc, formatFormDate, formatStamp, toISODate } from '../utils'

type Mode = 'table' | 'booklet'

const TABLE_PAGE_SIZE = 10
const BOOKLET_PAGE_SIZES = [2, 4, 10]
const FILTER_STATUSES: DiaryStatus[] = ['submitted', 'in-progress', 'no-attendance']

const TH =
  'border-b border-border bg-canvas px-3 py-2 text-left text-caption font-medium whitespace-nowrap text-ink-muted'
const TD = 'border-b border-border px-3 py-2.5 align-middle'

export default function ShiftSummaryPage() {
  const all = useDiaries()
  const actor = useActor()
  const today = toISODate(new Date())
  const ids = useId()
  const [mode, setMode] = useLocalStorage<Mode>('odms.diary.summaryMode', 'table')
  const [from, setFrom] = useState(addDays(today, -6))
  const [to, setTo] = useState(today)
  const [shift, setShift] = useState<ShiftCode | ''>('')
  const [status, setStatus] = useState<DiaryStatus | ''>('')
  const [page, setPage] = useState(0)
  const [bookletSize, setBookletSize] = useLocalStorage('odms.diary.bookletSize', 4)
  const [exportFor, setExportFor] = useState<{ diary?: ShiftDiary } | null>(null)
  const [tablePdfDialogOpen, setTablePdfDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const filtered = useMemo(
    () =>
      all
        .filter(
          (d) =>
            d.status !== 'upcoming' &&
            d.date >= from &&
            d.date <= to &&
            (!shift || d.shift === shift) &&
            (!status || d.status === status),
        )
        .sort(mode === 'booklet' ? compareDiariesAsc : compareDiariesDesc),
    [all, from, to, shift, status, mode],
  )

  const pageSize = mode === 'booklet' ? bookletSize : TABLE_PAGE_SIZE
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, pageCount - 1)
  const visible = filtered.slice(current * pageSize, current * pageSize + pageSize)

  const onFilter =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v)
      setPage(0)
    }

  const stationCode = all[0]?.stationCode ?? ''

  const exportTableExcel = () => {
    downloadCsv(filtered, `${stationCode}_ShiftSummary_${from}_to_${to}.csv`, {
      stationName: all[0]?.stationName ?? 'Station',
      stationCode,
      from,
      to,
      shift: shift ? `Shift ${shift}` : undefined,
      status: status ? STATUS_LABELS[status] : undefined,
      generatedBy: actor,
    })
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        toTsv(filtered, {
          stationName: all[0]?.stationName ?? 'Station',
          stationCode,
          from,
          to,
          shift: shift ? `Shift ${shift}` : undefined,
          status: status ? STATUS_LABELS[status] : undefined,
          generatedBy: actor,
        }),
      )
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <>
      <div className="print:hidden">
        <PageHeader
          title="Shift Summary"
          description={`All shift diaries for ${all[0]?.stationName ?? 'this station'} · Station Shift Diary Register`}
          actions={
            <SegmentedControl
              variant="header"
              label="Display mode"
              value={mode}
              onChange={(m) => {
                setMode(m)
                setPage(0)
              }}
              options={[
                { value: 'table', label: 'Table', icon: Table2 },
                { value: 'booklet', label: 'Booklet view', icon: BookOpen },
              ]}
            />
          }
        />
        <DiaryTabs />
      </div>

      <div className="flex flex-col gap-4">
        <div className="print:hidden">
          <SummaryOverview diaries={all} today={today} />
        </div>

        <Card className="flex flex-wrap items-end gap-3 px-4 py-3 print:hidden">
          <div className="flex flex-col gap-1">
            <Label htmlFor={`${ids}-from`}>From</Label>
            <Input
              id={`${ids}-from`}
              type="date"
              fieldSize="sm"
              value={from}
              max={to}
              onChange={(e) => onFilter(setFrom)(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`${ids}-to`}>To</Label>
            <Input
              id={`${ids}-to`}
              type="date"
              fieldSize="sm"
              value={to}
              min={from}
              onChange={(e) => onFilter(setTo)(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`${ids}-shift`}>Shift</Label>
            <Select
              id={`${ids}-shift`}
              fieldSize="sm"
              value={shift}
              onChange={(e) => onFilter(setShift)(e.target.value as ShiftCode | '')}
            >
              <option value="">All shifts</option>
              {SHIFT_ORDER.map((s) => (
                <option key={s} value={s}>
                  Shift {s}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor={`${ids}-status`}>Status</Label>
            <Select
              id={`${ids}-status`}
              fieldSize="sm"
              value={status}
              onChange={(e) => onFilter(setStatus)(e.target.value as DiaryStatus | '')}
            >
              <option value="">All statuses</option>
              {FILTER_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            {mode === 'table' ? (
              <>
                <Button size="sm" icon={copied ? Check : Copy} onClick={copy} disabled={!filtered.length}>
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button size="sm" icon={FileSpreadsheet} disabled={!filtered.length} onClick={exportTableExcel}>
                  Excel
                </Button>
                <Button
                  size="sm"
                  icon={FileText}
                  disabled={!filtered.length}
                  onClick={() => setTablePdfDialogOpen(true)}
                >
                  PDF
                </Button>
                <Button size="sm" icon={Printer} disabled={!filtered.length} onClick={() => window.print()}>
                  Print
                </Button>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor={`${ids}-per`}>Show</Label>
                <Select
                  id={`${ids}-per`}
                  fieldSize="sm"
                  value={bookletSize}
                  onChange={(e) => {
                    setBookletSize(Number(e.target.value))
                    setPage(0)
                  }}
                >
                  {BOOKLET_PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n} per page
                    </option>
                  ))}
                </Select>
                <Button
                  size="sm"
                  icon={FileText}
                  disabled={!filtered.length}
                  onClick={() => setTablePdfDialogOpen(true)}
                >
                  PDF
                </Button>
                <Button size="sm" icon={Printer} disabled={!filtered.length} onClick={() => window.print()}>
                  Print
                </Button>
              </div>
            )}
          </div>
        </Card>

        {filtered.length === 0 ? (
          <Card className="px-6 py-14 text-center text-body text-ink-muted">No shifts match these filters.</Card>
        ) : mode === 'table' ? (
          <>
            <Card className="overflow-hidden print:hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[56rem] border-collapse text-body tabular-nums">
                  <thead>
                    <tr>
                      {[
                        'Date',
                        'Shift',
                        'Station Controller',
                        'Entries',
                        'Status',
                        'Handed over by',
                        'Taken over by',
                      ].map((h) => (
                        <th key={h} scope="col" className={TH}>
                          {h}
                        </th>
                      ))}
                      <th scope="col" className={TH}>
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((d) => (
                      <tr key={d.id} className="hover:bg-subtle/60">
                        <td className={`${TD} whitespace-nowrap`}>{formatFormDate(d.date)}</td>
                        <td className={`${TD} font-semibold`}>{d.shift}</td>
                        <td className={TD}>
                          {d.controller?.name ?? '—'}
                          {d.controller && (
                            <span className="block text-caption text-ink-muted">{d.controller.employeeId}</span>
                          )}
                        </td>
                        <td className={TD}>{d.entries.length}</td>
                        <td className={TD}>
                          <Badge tone={STATUS_TONES[d.status]}>{STATUS_LABELS[d.status]}</Badge>
                        </td>
                        <td className={TD}>
                          {d.handover.handedAt ? d.handover.handedBy?.name : '—'}
                          {d.handover.handedAt && (
                            <span className="block text-caption text-ink-muted">
                              {formatStamp(d.handover.handedAt)}
                            </span>
                          )}
                        </td>
                        <td className={TD}>
                          {d.handover.takenBy?.name ?? '—'}
                          {d.handover.takenBy && !d.handover.takenAt && (
                            <span className="block text-caption text-warning">Awaiting acknowledgement</span>
                          )}
                        </td>
                        <td className={`${TD} text-right whitespace-nowrap`}>
                          <Link
                            to={`/station-diary/shifts/${d.id}`}
                            className="mr-1 inline-flex h-8 items-center rounded-md px-2.5 text-secondary font-medium text-primary-ink hover:bg-primary-subtle"
                          >
                            View
                          </Link>
                          {d.status !== 'no-attendance' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              icon={FileText}
                              onClick={() => setExportFor({ diary: d })}
                            >
                              PDF
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-caption text-ink-muted">
                <span className="tabular-nums">
                  Showing {current * pageSize + 1}–{current * pageSize + visible.length} of {filtered.length}
                </span>
                <Pagination page={current} pageCount={pageCount} onChange={setPage} />
              </div>
            </Card>

            <div className="hidden print:block">
              <SummaryTableSheet
                diaries={filtered}
                stationName={all[0]?.stationName ?? 'Station'}
                stationCode={stationCode}
                from={from}
                to={to}
                shift={shift}
                status={status}
                generatedBy={actor}
              />
            </div>
          </>
        ) : (
          <section aria-label="Booklet" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
              <p className="text-secondary text-ink-muted">
                Each shift on the official form ({filtered.length} shift{filtered.length > 1 ? 's' : ''}, oldest first).
              </p>
              <Pagination page={current} pageCount={pageCount} onChange={setPage} withEnds />
            </div>
            <div className="flex flex-col items-center gap-5 rounded-xl bg-muted px-3 py-5 sm:px-6 print:bg-transparent print:p-0">
              {visible.map((d, i) => (
                <DiaryFormSheet
                  key={d.id}
                  diary={d}
                  options={{ includeTasks: true }}
                  footer={`Sheet ${current * pageSize + i + 1} of ${filtered.length}`}
                />
              ))}
            </div>
            <Pagination
              page={current}
              pageCount={pageCount}
              onChange={setPage}
              withEnds
              className="self-center print:hidden"
            />
          </section>
        )}
      </div>

      <ExportTablePdfDialog
        open={tablePdfDialogOpen}
        onClose={() => setTablePdfDialogOpen(false)}
        diaries={filtered}
        stationName={all[0]?.stationName ?? 'Station'}
        stationCode={stationCode}
        from={from}
        to={to}
        shift={shift}
        status={status}
        actor={actor}
      />

      <ExportPdfDialog
        open={exportFor !== null}
        onClose={() => setExportFor(null)}
        diary={exportFor?.diary}
        defaultScope={exportFor?.diary ? 'shift' : 'range'}
        defaultRange={{ from, to }}
      />
    </>
  )
}
