import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from './Button'

interface PaginationProps {
  /** Zero-based. */
  page: number
  pageCount: number
  onChange: (page: number) => void
  /** Show « First and Last » (booklet-style paging). */
  withEnds?: boolean
  className?: string
}

export function Pagination({ page, pageCount, onChange, withEnds = false, className = '' }: PaginationProps) {
  const atStart = page <= 0
  const atEnd = page >= pageCount - 1
  return (
    <nav aria-label="Pagination" className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {withEnds && (
        <Button size="sm" variant="ghost" icon={ChevronsLeft} disabled={atStart} onClick={() => onChange(0)}>
          First
        </Button>
      )}
      <Button size="sm" variant="ghost" icon={ChevronLeft} disabled={atStart} onClick={() => onChange(page - 1)}>
        Prev
      </Button>
      <span className="px-1.5 text-secondary text-ink-secondary tabular-nums" aria-current="page">
        Page {Math.min(page + 1, pageCount)} of {pageCount}
      </span>
      <Button
        size="sm"
        variant="ghost"
        disabled={atEnd}
        onClick={() => onChange(page + 1)}
        className="flex-row-reverse"
      >
        <ChevronRight aria-hidden className="size-4" />
        Next
      </Button>
      {withEnds && (
        <Button
          size="sm"
          variant="ghost"
          disabled={atEnd}
          onClick={() => onChange(pageCount - 1)}
          className="flex-row-reverse"
        >
          <ChevronsRight aria-hidden className="size-4" />
          Last
        </Button>
      )}
    </nav>
  )
}
