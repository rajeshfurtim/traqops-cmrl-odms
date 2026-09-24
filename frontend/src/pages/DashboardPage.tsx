import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge, SoonBadge } from '@/components/ui/Badge'
import { NAV_ITEMS } from '@/constants/navigation'
import { useSession } from '@/context/SessionContext'
import { formatShiftRange } from '@/utils/format'

export default function DashboardPage() {
  const { station, shift } = useSession()
  const available = NAV_ITEMS.filter((item) => item.status === 'available' && item.id !== 'home')
  const planned = NAV_ITEMS.filter((item) => item.status === 'soon')

  return (
    <>
      <PageHeader
        title="Home"
        description={`${station.name} · Shift ${formatShiftRange(shift.start, shift.end)}`}
        status={
          <Badge tone="success" dot>
            Shift active
          </Badge>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* ── Active modules ──────────────────────────────────────────── */}
        <section aria-labelledby="modules-heading">
          <h2 id="modules-heading" className="mb-3 text-label font-semibold tracking-wide text-ink-muted uppercase">
            Modules
          </h2>
          <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-card">
            {available.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <Link
                    to={item.to!}
                    className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-subtle focus-visible:outline-offset-[-2px] sm:px-5"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
                      <Icon aria-hidden className="size-5" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body font-semibold text-ink">{item.label}</span>
                      <span className="block text-secondary text-ink-muted">{item.description}</span>
                    </span>
                    <ChevronRight
                      aria-hidden
                      strokeWidth={2}
                      className="size-4 shrink-0 text-ink-disabled transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink-muted"
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>

        {/* ── Planned modules ─────────────────────────────────────────── */}
        <section aria-labelledby="planned-heading">
          <h2 id="planned-heading" className="mb-3 text-label font-semibold tracking-wide text-ink-muted uppercase">
            Planned
          </h2>
          <ul className="divide-y divide-border rounded-xl border border-border bg-surface shadow-card">
            {planned.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id} className="flex h-12 items-center gap-3 px-4 text-body text-ink-secondary">
                  <Icon aria-hidden className="size-4.5 shrink-0 text-ink-muted" strokeWidth={1.75} />
                  <span className="flex-1 truncate">{item.label}</span>
                  <SoonBadge />
                  <span className="sr-only">(coming soon)</span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </>
  )
}
