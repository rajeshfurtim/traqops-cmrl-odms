import { ChevronRight, FilePlus2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { getDiaryEntry } from '@/modules/station-diary/data/diaryStore'
import { toPlainText } from '@/modules/station-diary/richText'
import { useRecords } from '../data/registerStore'
import { CATEGORIES, CATEGORY_ORDER, REGISTERS } from '../definitions'

export default function RegistersHomePage() {
  const records = useRecords()
  const openCount = (id: string) => records.filter((r) => r.registerId === id && r.status !== 'closed').length

  const [params] = useSearchParams()
  const fromEntryId = params.get('fromEntry')
  const fromEntry = fromEntryId ? getDiaryEntry(fromEntryId) : undefined
  const suffix = fromEntry ? `?fromEntry=${fromEntry.entry.id}` : ''

  return (
    <>
      <PageHeader title="Registers" description="Operational and statutory registers for station operations." />
      {fromEntry && (
        <div className="mb-4 flex gap-3 rounded-xl border border-primary/30 bg-primary-subtle px-4 py-3 text-secondary">
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
      <div className="grid gap-4 md:grid-cols-2">
        {CATEGORY_ORDER.map((category) => {
          const { label, icon: Icon, description } = CATEGORIES[category]
          return (
            <Card key={category} aria-labelledby={`cat-${category}`} className="overflow-hidden">
              <header className="flex items-center gap-3 border-b border-border px-4 py-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                  <Icon aria-hidden className="size-4.5" strokeWidth={1.75} />
                </span>
                <div>
                  <h2 id={`cat-${category}`} className="text-heading text-ink">
                    {label}
                  </h2>
                  <p className="text-caption text-ink-muted">{description}</p>
                </div>
              </header>
              <ul className="divide-y divide-border">
                {REGISTERS.filter((r) => r.category === category).map((r) => {
                  const open = openCount(r.id)
                  return (
                    <li key={r.id}>
                      <Link
                        to={`/registers/${r.id}${suffix}`}
                        className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-subtle focus-visible:outline-offset-[-2px]"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-body font-medium text-ink">{r.label}</span>
                          <span className="block truncate text-secondary text-ink-muted">{r.description}</span>
                        </span>
                        {open > 0 && <Badge tone="warning">{open} open</Badge>}
                        <ChevronRight
                          aria-hidden
                          className="size-4 shrink-0 text-ink-disabled transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </Card>
          )
        })}
      </div>
    </>
  )
}
