import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, Ref } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  ref?: Ref<HTMLButtonElement>
}

const BASE =
  'inline-flex shrink-0 items-center justify-center rounded-md font-medium whitespace-nowrap transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover active:bg-primary-active',
  secondary: 'border border-border bg-surface text-ink shadow-xs hover:bg-subtle active:bg-muted',
  ghost: 'text-ink-secondary hover:bg-subtle hover:text-ink active:bg-muted',
  danger: 'bg-danger-dot text-on-primary hover:bg-danger-dot/90',
}

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 px-3 text-secondary',
  md: 'h-9 gap-2 px-3.5 text-body',
  lg: 'h-11 gap-2 px-4 text-body',
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  type = 'button',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`} {...props}>
      {Icon && <Icon aria-hidden className="size-4 shrink-0" strokeWidth={2} />}
      {children}
    </button>
  )
}
