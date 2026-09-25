import type { LucideIcon } from 'lucide-react'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  icon?: LucideIcon
}

export type SegmentedControlVariant = 'default' | 'header'
export type SegmentedControlSize = 'sm' | 'md'

interface SegmentedControlProps<T extends string> {
  value: T
  options: SegmentOption<T>[]
  onChange: (value: T) => void
  label: string
  variant?: SegmentedControlVariant
  size?: SegmentedControlSize
  className?: string
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
  variant = 'default',
  size = 'md',
  className = '',
}: SegmentedControlProps<T>) {
  const isHeader = variant === 'header'

  const containerClasses = isHeader
    ? 'inline-flex items-center gap-1 rounded-lg bg-black/40 border border-white/25 p-1 shadow-inner backdrop-blur-md'
    : 'inline-flex items-center gap-1 rounded-lg bg-muted border border-border/60 p-1'

  const sizeClasses = size === 'sm' ? 'h-7 px-2.5 text-secondary gap-1.5' : 'h-8 px-3.5 text-body gap-2'

  return (
    <div role="radiogroup" aria-label={label} className={`${containerClasses} ${className}`}>
      {options.map((option) => {
        const selected = option.value === value
        const Icon = option.icon

        let itemStyle = ''
        if (isHeader) {
          itemStyle = selected
            ? 'bg-accent text-on-accent font-bold shadow-md shadow-accent/25'
            : 'text-white/80 hover:text-white hover:bg-white/10 font-medium'
        } else {
          itemStyle = selected
            ? 'bg-surface text-ink font-semibold shadow-xs'
            : 'text-ink-secondary hover:text-ink font-medium'
        }

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={`inline-flex cursor-pointer items-center justify-center rounded-md transition-all duration-150 select-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none active:scale-[0.98] ${sizeClasses} ${itemStyle}`}
          >
            {Icon && (
              <Icon
                aria-hidden
                className={size === 'sm' ? 'size-3.5 shrink-0' : 'size-4 shrink-0'}
                strokeWidth={selected ? 2.2 : 1.8}
              />
            )}
            <span>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
