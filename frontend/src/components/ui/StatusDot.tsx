export type StatusTone = 'success' | 'warning' | 'danger' | 'info'

const TONES: Record<StatusTone, string> = {
  success: 'bg-success-dot text-success-dot ring-success-dot/20',
  warning: 'bg-warning-dot text-warning-dot ring-warning-dot/20',
  danger: 'bg-danger-dot text-danger-dot ring-danger-dot/20',
  info: 'bg-info-dot text-info-dot ring-info-dot/20',
}

interface StatusDotProps {
  tone: StatusTone

  halo?: boolean

  live?: boolean
  className?: string
}

export function StatusDot({ tone, halo = true, live = false, className = '' }: StatusDotProps) {
  const ring = live ? 'odms-live' : halo ? 'ring-[0.1875rem]' : ''
  return (
    <span aria-hidden className={`inline-block size-2 shrink-0 rounded-full ${TONES[tone]} ${ring} ${className}`} />
  )
}
