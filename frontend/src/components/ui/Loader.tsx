import cmrlLogo from '@/assets/cmrl-logo.png'

export type LoaderSize = 'sm' | 'md' | 'lg' | 'xl'

export interface LoaderProps {
  size?: LoaderSize
  label?: string
  showLogo?: boolean
  fullscreen?: boolean
  className?: string
}

const SIZES: Record<
  LoaderSize,
  {
    container: string
    ring: string
    borderWidth: string
    logo: string
  }
> = {
  sm: {
    container: 'size-9',
    ring: 'size-9',
    borderWidth: 'border-2',
    logo: 'size-5',
  },
  md: {
    container: 'size-13',
    ring: 'size-13',
    borderWidth: 'border-2',
    logo: 'size-8',
  },
  lg: {
    container: 'size-20',
    ring: 'size-20',
    borderWidth: 'border-3',
    logo: 'size-12',
  },
  xl: {
    container: 'size-28',
    ring: 'size-28',
    borderWidth: 'border-4',
    logo: 'size-16',
  },
}

export function Loader({ size = 'md', label, showLogo = true, fullscreen = false, className = '' }: LoaderProps) {
  const { container, ring, borderWidth, logo } = SIZES[size]

  const spinner = (
    <div className={`relative flex items-center justify-center ${container}`}>
      <div
        className={`absolute inset-0 rounded-full ${ring} ${borderWidth} border-border/80 dark:border-white/10`}
        aria-hidden
      />
      <div
        className={`absolute inset-0 animate-spin rounded-full ${ring} ${borderWidth} border-transparent border-t-accent border-r-primary dark:border-r-accent/60`}
        aria-hidden
      />
      {showLogo && (
        <img
          src={cmrlLogo}
          alt=""
          aria-hidden
          draggable={false}
          className={`${logo} shrink-0 transition-transform duration-300 select-none dark:brightness-0 dark:invert`}
        />
      )}
    </div>
  )

  if (fullscreen) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-surface/90 p-4 backdrop-blur-sm ${className}`}
      >
        {spinner}
        {label && <p className="text-caption font-semibold tracking-wider text-ink-muted uppercase">{label}</p>}
        <span className="sr-only">{label || 'Loading…'}</span>
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-2.5 p-4 ${className}`}
    >
      {spinner}
      {label && <p className="text-caption font-medium tracking-wide text-ink-muted">{label}</p>}
      <span className="sr-only">{label || 'Loading…'}</span>
    </div>
  )
}
