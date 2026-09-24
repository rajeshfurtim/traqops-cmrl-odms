import { ArrowRight, CornerDownLeft, Search, type LucideIcon } from 'lucide-react'
import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog } from '@/components/ui/Dialog'
import { Kbd } from '@/components/ui/Kbd'
import { NAV_ITEMS } from '@/constants/navigation'
import { ALL_SCOPE_ID, SEARCH_SCOPES, type SearchScope } from '@/constants/search'
import { useShell } from '@/context/ShellContext'

const DIALOG_MOBILE =
  'odms-dialog m-0 h-dvh max-h-none w-screen max-w-none flex-col overflow-hidden bg-surface-raised open:flex'

const DIALOG_DESKTOP =
  'md:mx-auto md:mt-[12vh] md:h-auto md:max-h-[min(37.5rem,76vh)] md:w-[min(40rem,calc(100vw-4rem))] md:rounded-xl md:border md:border-border md:shadow-overlay'

export function GlobalSearch() {
  const { searchOpen, closeSearch } = useShell()
  return (
    <Dialog
      open={searchOpen}
      onClose={closeSearch}
      aria-label="Search ODMS"
      className={`${DIALOG_MOBILE} ${DIALOG_DESKTOP}`}
    >
      {searchOpen && <SearchPanel onClose={closeSearch} />}
    </Dialog>
  )
}

type SearchOption =
  | { kind: 'page'; id: string; label: string; description?: string; icon: LucideIcon; to: string }
  | { kind: 'record'; id: string; scope: SearchScope }

function SearchPanel({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [scopeId, setScopeId] = useState(ALL_SCOPE_ID)
  const [activeIndex, setActiveIndex] = useState(0)
  const [notice, setNotice] = useState('')
  const listRef = useRef<HTMLDivElement>(null)
  const baseId = useId()

  const trimmed = query.trim()
  const scope = SEARCH_SCOPES.find((s) => s.id === scopeId) ?? SEARCH_SCOPES[0]

  const { pages, records } = useMemo(() => {
    const q = trimmed.toLowerCase()
    const pages: SearchOption[] =
      scopeId === ALL_SCOPE_ID
        ? NAV_ITEMS.filter(
            (item) =>
              item.status === 'available' &&
              item.to &&
              (!q || [item.label, ...(item.keywords ?? [])].some((term) => term.toLowerCase().includes(q))),
          ).map((item) => ({
            kind: 'page',
            id: `page-${item.id}`,
            label: item.label,
            description: item.description,
            icon: item.icon,
            to: item.to!,
          }))
        : []
    const records: SearchOption[] = q
      ? SEARCH_SCOPES.filter((s) => s.id !== ALL_SCOPE_ID && (scopeId === ALL_SCOPE_ID || s.id === scopeId)).map(
          (s) => ({ kind: 'record', id: `record-${s.id}`, scope: s }),
        )
      : []
    return { pages, records }
  }, [trimmed, scopeId])

  const options = [...pages, ...records]
  const active = Math.min(activeIndex, Math.max(options.length - 1, 0))
  const optionId = (option: SearchOption) => `${baseId}-${option.id}`

  const select = (option: SearchOption | undefined) => {
    if (!option) return
    if (option.kind === 'page') {
      onClose()
      navigate(option.to)
    } else {
      setNotice(`Searching ${option.scope.label} will be available once the module is live.`)
    }
  }

  const focusOption = (index: number) => {
    setActiveIndex(index)
    const option = options[index]
    if (option) document.getElementById(optionId(option))?.scrollIntoView({ block: 'nearest' })
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!options.length) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const delta = event.key === 'ArrowDown' ? 1 : -1
      focusOption((active + delta + options.length) % options.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      select(options[active])
    }
  }

  const renderOption = (option: SearchOption, index: number) => {
    const isActive = index === active
    const Icon = option.kind === 'page' ? option.icon : Search
    return (
      <li
        key={option.id}
        id={optionId(option)}
        role="option"
        aria-selected={isActive}
        onMouseMove={() => index !== active && setActiveIndex(index)}
        onClick={() => select(option)}
        className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 ${isActive ? 'bg-subtle' : ''}`}
      >
        <span
          className={`flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface ${isActive ? 'text-primary' : 'text-ink-muted'}`}
        >
          <Icon aria-hidden className="size-4" strokeWidth={1.75} />
        </span>
        <span className="min-w-0 flex-1">
          {option.kind === 'page' ? (
            <>
              <span className="block truncate text-body font-medium text-ink">{option.label}</span>
              {option.description && (
                <span className="block truncate text-secondary text-ink-muted">{option.description}</span>
              )}
            </>
          ) : (
            <>
              <span className="block truncate text-body text-ink">
                <span className="font-semibold">“{trimmed}”</span>
                <span className="text-ink-muted"> in </span>
                <span className="font-medium">{option.scope.label}</span>
              </span>
              <span className="block truncate text-secondary text-ink-muted">
                {option.scope.description} · Coming soon
              </span>
            </>
          )}
        </span>
        {isActive &&
          (option.kind === 'page' ? (
            <ArrowRight aria-hidden className="size-4 shrink-0 text-ink-muted" strokeWidth={2} />
          ) : (
            <CornerDownLeft aria-hidden className="hidden size-4 shrink-0 text-ink-muted md:block" strokeWidth={2} />
          ))}
      </li>
    )
  }

  const listboxId = `${baseId}-listbox`

  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border pr-2 pl-4 md:h-15 md:pr-4">
        <Search aria-hidden className="size-5 shrink-0 text-ink-muted" strokeWidth={2} />
        <input
          data-autofocus
          type="search"
          role="combobox"
          aria-expanded={options.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={options[active] ? optionId(options[active]) : undefined}
          aria-autocomplete="list"
          aria-label="Search ODMS"
          placeholder={scopeId === ALL_SCOPE_ID ? 'Search ODMS…' : `Search ${scope.label}…`}
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActiveIndex(0)
            setNotice('')
          }}
          onKeyDown={onKeyDown}
          className="h-full min-w-0 flex-1 bg-transparent text-body-lg text-ink outline-none placeholder:text-ink-muted [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="button"
          onClick={onClose}
          className="h-11 shrink-0 rounded-md px-3 text-body font-medium text-primary-ink hover:bg-primary-subtle md:hidden"
        >
          Cancel
        </button>
        <button type="button" onClick={onClose} aria-label="Close search" className="hidden rounded md:block">
          <Kbd>Esc</Kbd>
        </button>
      </div>

      <div
        role="radiogroup"
        aria-label="Search in"
        className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border px-4 py-2.5"
      >
        <span aria-hidden className="mr-1 text-caption text-ink-muted">
          Search in
        </span>
        {SEARCH_SCOPES.map((s) => {
          const selected = s.id === scopeId
          return (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => {
                setScopeId(s.id)
                setActiveIndex(0)
                setNotice('')
              }}
              className={`h-8 rounded-md border px-2.5 text-secondary font-medium transition-colors md:h-7 ${selected ? 'border-primary bg-primary-subtle text-primary-ink' : 'border-border text-ink-secondary hover:bg-subtle hover:text-ink'}`}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
        {options.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-body font-medium text-ink">
              {scopeId === ALL_SCOPE_ID ? 'No matching pages' : `Search ${scope.label}`}
            </p>
            <p className="mx-auto mt-1 max-w-xs text-secondary text-ink-muted">
              {scopeId === ALL_SCOPE_ID ? 'Try another term.' : `Type to search ${scope.description.toLowerCase()}.`}
            </p>
          </div>
        ) : (
          <ul id={listboxId} role="listbox" aria-label="Search results" className="flex flex-col">
            {pages.length > 0 && <GroupLabel>{trimmed ? 'Pages' : 'Go to'}</GroupLabel>}
            {pages.map((option, i) => renderOption(option, i))}
            {records.length > 0 && <GroupLabel>Search records</GroupLabel>}
            {records.map((option, i) => renderOption(option, pages.length + i))}
          </ul>
        )}
        {!trimmed && scopeId === ALL_SCOPE_ID && (
          <p className="px-2.5 pt-3 pb-1 text-caption text-ink-muted">
            Record search across Station Diary, Registers, Incidents, PTW and WGO will be available as each module goes
            live.
          </p>
        )}
      </div>

      <div
        role="status"
        aria-live="polite"
        className={`shrink-0 border-t border-border bg-info-subtle px-4 py-2.5 text-secondary text-info ${notice ? '' : 'sr-only'}`}
      >
        {notice}
      </div>

      <div
        aria-hidden
        className="hidden h-10 shrink-0 items-center gap-4 border-t border-border bg-canvas px-4 text-caption text-ink-muted md:flex"
      >
        <span className="flex items-center gap-1.5">
          <Kbd>↑</Kbd>
          <Kbd>↓</Kbd> Navigate
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>↵</Kbd> Open
        </span>
        <span className="flex items-center gap-1.5">
          <Kbd>Esc</Kbd> Close
        </span>
      </div>
    </>
  )
}

function GroupLabel({ children }: { children: string }) {
  return (
    <li role="presentation" className="px-2.5 pt-2 pb-1.5 text-label text-ink-muted uppercase">
      {children}
    </li>
  )
}
