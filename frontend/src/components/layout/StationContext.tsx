import { TrainFront } from 'lucide-react'
import { useSession } from '@/context/SessionContext'

interface StationContextProps {
  /**
   * `full`    — name + code, two lines (wide desktop)
   * `compact` — station code on one line (tablet / small desktop)
   * `minimal` — short name + code inline (mobile context bar)
   */
  variant?: 'full' | 'compact' | 'minimal'
  className?: string
}

export function StationContext({ variant = 'full', className = '' }: StationContextProps) {
  const { station } = useSession()

  if (variant === 'full') {
    return (
      <div className={`flex min-w-0 items-center gap-2.5 ${className}`}>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-primary">
          <TrainFront aria-hidden className="size-4" strokeWidth={2} />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-secondary font-semibold text-ink">{station.name}</p>
          <p className="text-caption text-ink-muted">
            <span className="sr-only">Station code </span>
            <span aria-hidden>Code </span>
            <span className="font-medium tracking-wide text-ink-secondary">{station.code}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex min-w-0 items-center gap-1.5 ${className}`}>
      <TrainFront aria-hidden className="size-3.5 shrink-0 text-primary" strokeWidth={2} />
      <span className="sr-only">
        Station: {station.name}, code {station.code}
      </span>
      <span aria-hidden className="flex min-w-0 items-baseline gap-1.5">
        {variant === 'minimal' ? (
          <>
            <span className="truncate font-semibold text-ink">{station.shortName}</span>
            <span className="shrink-0 font-medium tracking-wide text-ink-muted">{station.code}</span>
          </>
        ) : (
          <span className="font-semibold tracking-wide text-ink">{station.code}</span>
        )}
      </span>
    </div>
  )
}
