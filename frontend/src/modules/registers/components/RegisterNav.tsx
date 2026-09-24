import { NavLink } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { CATEGORIES, CATEGORY_ORDER, REGISTERS } from '../definitions'
import type { RegisterRecord } from '../types'

const ITEM = 'flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-secondary transition-colors'

/** Register list grouped by category, with open-record counts. */
export function RegisterNav({ records }: { records: RegisterRecord[] }) {
  const openCount = (id: string) => records.filter((r) => r.registerId === id && r.status !== 'closed').length
  return (
    <Card as="nav" aria-label="Registers" className="p-2">
      {CATEGORY_ORDER.map((category) => (
        <div key={category} className="mb-1 last:mb-0">
          <p className="px-2.5 pt-2.5 pb-1 text-label text-ink-muted uppercase">{CATEGORIES[category].label}</p>
          <ul>
            {REGISTERS.filter((r) => r.category === category).map((r) => {
              const open = openCount(r.id)
              return (
                <li key={r.id}>
                  <NavLink
                    to={`/registers/${r.id}`}
                    className={({ isActive }) =>
                      `${ITEM} ${isActive ? 'bg-primary-subtle font-medium text-primary-ink' : 'text-ink-secondary hover:bg-subtle hover:text-ink'}`
                    }
                  >
                    {r.label}
                    {open > 0 && (
                      <span className="text-caption text-ink-muted tabular-nums">
                        {open}
                        <span className="sr-only"> open</span>
                      </span>
                    )}
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </Card>
  )
}
