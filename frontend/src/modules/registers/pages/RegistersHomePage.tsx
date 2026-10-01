import { FilePlus2, Plus, Search, TriangleAlert } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Input } from '@/components/ui/Field'
import { getDiaryEntry } from '@/modules/station-diary/data/diaryStore'
import { toPlainText } from '@/modules/station-diary/richText'
import { formatStamp, toISODate } from '@/modules/station-diary/utils'
import { useRecords } from '../data/registerStore'
import { CATEGORIES, CATEGORY_ORDER, REGISTERS } from '../definitions'
import { recordDate } from '../fields'
import type { RegisterDefinition, RegisterRecord } from '../types'

const CARD =
  'group relative flex flex-col overflow-hidden rounded-xl border bg-surface shadow-card transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-sm before:absolute before:inset-y-0 before:left-0 before:w-1 before:transition-all before:duration-150 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-focus'
const NEW_ENTRY =
  'relative z-10 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 text-secondary font-medium text-on-primary transition-colors hover:bg-primary-hover'
const WEEK_MS = 7 * 86_400_000

interface Stats {
  today: number
  week: number
  total: number
  last?: string
}

export default function RegistersHomePage() {
  const records = useRecords()
  const ids = useId()
  const [query, setQuery] = useState('')
  const [params] = useSearchParams()
  const fromEntryId = params.get('fromEntry')
  const fromEntry = fromEntryId ? getDiaryEntry(fromEntryId) : undefined

  const { byRegister, stats } = useMemo(() => {
    const today = toISODate(new Date())
    const weekAgo = new Date().getTime() - WEEK_MS
    const byRegister = new Map<string, RegisterRecord[]>()
    const stats = new Map<string, Stats>()
    for (const register of REGISTERS) {
      const own = records
        .filter((r) => r.registerId === register.id)
        .sort((a, b) => recordDate(register, b).localeCompare(recordDate(register, a)))
      byRegister.set(register.id, own)
      const dates = own.map((r) => recordDate(register, r))
      stats.set(register.id, {
        today: dates.filter((d) => toISODate(new Date(d)) === today).length,
        week: dates.filter((d) => new Date(d).getTime() >= weekAgo).length,
        total: own.length,
        last: dates[0],
      })
    }
    return { byRegister, stats }
  }, [records])

  const notes = REGISTERS.flatMap((r) => {
    const text = r.attention?.(byRegister.get(r.id) ?? [], new Date())
    return text ? [{ register: r, text }] : []
  })

  const q = query.trim().toLowerCase()
  const matches = REGISTERS.filter(
    (r) => !q || [r.label, r.description, r.code, r.form?.number ?? ''].some((t) => t.toLowerCase().includes(q)),
  )

  return (
    <>
      <PageHeader
        title="Registers"
        description="Station registers: record, look up and print entries on the official forms."
      />

      {fromEntry && (
        <div className="mb-4 flex gap-3 rounded-lg border border-primary/30 bg-primary-subtle px-4 py-3 text-secondary">
          <FilePlus2 aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="font-semibold text-ink">Choose the register for this diary entry</p>
            <p className="truncate text-ink-secondary">{toPlainText(fromEntry.entry.text)}</p>
          </div>
          <Link to="/station-diary" className="ml-auto shrink-0 font-medium text-primary-ink hover:underline">
            Cancel
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <div className="relative max-w-xl">
          <label htmlFor={`${ids}-q`} className="sr-only">
            Find a register
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
          />
          <Input
            id={`${ids}-q`}
            type="search"
            placeholder="Find a register, e.g. key, incident, F-33"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full pl-9"
          />
        </div>

        {matches.length === 0 && (
          <p className="rounded-xl border border-dashed border-border-strong px-4 py-10 text-center text-body text-ink-muted">
            No register matches “{query.trim()}”.
          </p>
        )}

        {CATEGORY_ORDER.map((category) => {
          const list = matches.filter((r) => r.category === category)
          if (list.length === 0) return null
          const { label, icon: Icon, description } = CATEGORIES[category]
          return (
            <section key={category} aria-labelledby={`${ids}-${category}`} className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <Icon aria-hidden className="size-4 text-ink-muted" strokeWidth={2} />
                <h2 id={`${ids}-${category}`} className="text-label text-ink-secondary uppercase">
                  {label}
                </h2>
                <span className="rounded-full bg-muted px-2 text-caption font-medium text-ink-secondary tabular-nums">
                  {list.length}
                </span>
                <span className="hidden text-caption text-ink-muted sm:inline">· {description}</span>
                <span aria-hidden className="h-px flex-1 bg-border" />
              </div>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((r) => (
                  <RegisterCard
                    key={r.id}
                    register={r}
                    stats={stats.get(r.id) ?? { today: 0, week: 0, total: 0 }}
                    note={notes.find((n) => n.register.id === r.id)?.text}
                    fromEntryId={fromEntry?.entry.id}
                  />
                ))}
              </ul>
            </section>
          )
        })}
      </div>
    </>
  )
}

function RegisterCard({
  register,
  stats,
  note,
  fromEntryId,
}: {
  register: RegisterDefinition
  stats: Stats
  note?: string
  fromEntryId?: string
}) {
  const Icon = register.icon
  const target = fromEntryId ? `/registers/${register.id}?fromEntry=${fromEntryId}` : `/registers/${register.id}`
  const figures: [string, number][] = [
    ['Today', stats.today],
    ['7 days', stats.week],
    ['Total', stats.total],
  ]

  return (
    <li
      className={`${CARD} ${
        note
          ? 'border-warning-dot/60 before:bg-warning-dot before:opacity-100'
          : 'border-border before:bg-accent before:opacity-0 hover:before:opacity-100'
      }`}
    >
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-header text-accent shadow-xs transition-transform duration-150 group-hover:scale-105">
            <Icon aria-hidden className="size-5" strokeWidth={1.9} />
          </span>
          <div className="min-w-0 flex-1">
            {/* The title link covers the whole card; the New entry button sits above it. */}
            <Link
              to={target}
              className="block font-display text-heading text-ink transition-colors group-hover:text-primary after:absolute after:inset-0 focus-visible:outline-none"
            >
              {register.label}
            </Link>
            <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-caption text-ink-muted">
              <span className="rounded bg-muted px-1.5 font-mono font-medium text-ink-secondary">{register.code}</span>
              {register.form && <span>Form {register.form.number.replace('CMRL/OPER/SO/', '')}</span>}
              {register.statutory && <span>· Statutory</span>}
            </p>
          </div>
        </div>
        <p className="line-clamp-2 text-secondary text-ink-muted">{register.description}</p>
        <dl className="mt-auto flex flex-wrap items-center gap-x-1.5 text-caption text-ink-muted tabular-nums">
          {figures.map(([label, n], i) => (
            <div key={label} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden>·</span>}
              <dt>{label}</dt>
              <dd className="font-semibold text-ink-secondary">{n}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div
        className={`flex min-h-12 items-center gap-2 border-t px-4 py-2 transition-colors ${
          note ? 'border-warning-dot/40 bg-warning-subtle' : 'border-border'
        }`}
      >
        {note ? (
          <span className="flex min-w-0 flex-1 items-center gap-1.5 text-secondary font-semibold text-warning">
            <TriangleAlert aria-hidden className="size-4 shrink-0" />
            <span className="truncate">{note}</span>
          </span>
        ) : (
          <span className="min-w-0 flex-1 truncate text-caption text-ink-muted tabular-nums">
            {stats.last ? `Last entry ${formatStamp(stats.last)}` : 'No entries yet'}
          </span>
        )}
        {!fromEntryId && (
          <Link
            to={`/registers/${register.id}?new=1`}
            className={NEW_ENTRY}
            aria-label={`New entry in ${register.label}`}
          >
            <Plus aria-hidden className="size-4" />
            New entry
          </Link>
        )}
      </div>
    </li>
  )
}

