import { NotebookPen, Rows3 } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const TAB =
  'inline-flex h-10 items-center gap-2 border-b-2 px-1 text-body font-medium transition-colors duration-150 focus-visible:outline-offset-[-2px]'

const TABS = [
  { to: '/station-diary', label: 'Today', icon: NotebookPen, end: true },
  { to: '/station-diary/summary', label: 'Shift Summary', icon: Rows3, end: false },
]

/** Sub-navigation shared by the Station Diary pages. */
export function DiaryTabs() {
  return (
    <nav aria-label="Station Diary" className="mb-5 flex gap-6 border-b border-border">
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `${TAB} ${isActive ? 'border-accent text-ink' : 'border-transparent text-ink-muted hover:text-ink'}`
          }
        >
          <Icon aria-hidden className="size-4" strokeWidth={1.75} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
