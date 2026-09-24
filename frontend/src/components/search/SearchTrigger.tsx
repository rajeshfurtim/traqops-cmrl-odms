import { Search } from 'lucide-react'
import { Kbd } from '@/components/ui/Kbd'
import { useShell } from '@/context/ShellContext'
import { MOD_KEY } from '@/utils/dom'

interface SearchTriggerProps {
  className?: string
}

/** Header search field. Opens the global search dialog. */
export function SearchTrigger({ className = '' }: SearchTriggerProps) {
  const { openSearch, searchOpen } = useShell()

  return (
    <button
      type="button"
      onClick={openSearch}
      aria-haspopup="dialog"
      aria-expanded={searchOpen}
      aria-keyshortcuts="Meta+K Control+K /"
      className={`group @container h-9 items-center gap-2.5 rounded-lg border border-border bg-surface px-3 text-left text-body text-ink-muted shadow-card transition-colors duration-150 hover:border-border-strong hover:text-ink-secondary ${className}`}
    >
      <Search aria-hidden className="size-4 shrink-0" strokeWidth={2} />
      <span className="flex-1 truncate">
        Search<span className="hidden @[10rem]:inline"> ODMS</span>…
      </span>
      {/* Shortcut hint only when the field has room for it */}
      <span aria-hidden className="hidden shrink-0 gap-1 @[14rem]:flex">
        <Kbd>{MOD_KEY}</Kbd>
        <Kbd>K</Kbd>
      </span>
    </button>
  )
}
