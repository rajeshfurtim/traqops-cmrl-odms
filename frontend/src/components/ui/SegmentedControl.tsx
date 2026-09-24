import type { LucideIcon } from 'lucide-react'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
}

interface SegmentedControlProps<T extends string> {
  value: T
  options: SegmentOption<T>[]
  onChange: (value: T) => void
  label: string
  className?: string
}

const SEGMENT =
  'inline-flex h-7 items-center gap-1.5 rounded-[0.3125rem] px-2.5 text-secondary font-medium transition-colors duration-150'

/** Small exclusive toggle, e.g. Table / Booklet. */
export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex gap-0.5 rounded-md bg-muted p-0.5 ${className}`}>
      {options.map((option) => {
        const selected = option.value === value
        const Icon = option.icon
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`${SEGMENT} ${selected ? 'bg-surface text-ink shadow-xs' : 'text-ink-secondary hover:text-ink'}`}
          >
            {Icon && <Icon aria-hidden className="size-3.5" strokeWidth={2} />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
