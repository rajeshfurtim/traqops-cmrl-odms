import cmrlFullLogo from '@/assets/cmrl-full-logo.png'
import cmrlLogo from '@/assets/cmrl-logo.png'

const REVERSED_IN_DARK = 'dark:brightness-0 dark:invert'

export function BrandMark({ alt = '', className = '' }: { alt?: string; className?: string }) {
  return (
    <img
      src={cmrlLogo}
      alt={alt}
      width={36}
      height={36}
      draggable={false}
      className={`size-9 shrink-0 select-none ${REVERSED_IN_DARK} ${className}`}
    />
  )
}

/** Full "Chennai Metro Rail Limited" lockup (roundel above the organisation name). */
export function BrandLockup({
  alt = 'Chennai Metro Rail Limited',
  className = 'h-13',
}: {
  alt?: string
  className?: string
}) {
  return (
    <img
      src={cmrlFullLogo}
      alt={alt}
      width={330}
      height={96}
      draggable={false}
      className={`w-auto max-w-none shrink-0 select-none ${REVERSED_IN_DARK} ${className}`}
    />
  )
}

export function SidebarBrand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="relative flex h-full min-w-0 flex-1 items-center justify-center overflow-hidden">
      <img
        src={cmrlFullLogo}
        alt="Chennai Metro Rail Limited"
        width={330}
        height={96}
        draggable={false}
        className={`h-12 w-auto max-w-none shrink-0 transition-opacity duration-150 select-none ${REVERSED_IN_DARK} ${collapsed ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      />
      <img
        src={cmrlLogo}
        alt=""
        width={36}
        height={36}
        draggable={false}
        className={`absolute size-8 shrink-0 transition-opacity duration-150 select-none ${REVERSED_IN_DARK} ${collapsed ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
    </div>
  )
}

/** Product name, shown in the topbar on desktop. */
export function ProductName({ className = '' }: { className?: string }) {
  return <span className={`font-display text-heading font-extrabold tracking-tight text-ink ${className}`}>ODMS</span>
}

/** Roundel + product name, for the compact mobile header. */
export function Brand({ className = '' }: { className?: string }) {
  return (
    <span className={`flex min-w-0 items-center gap-2 ${className}`}>
      <BrandMark className="size-8" />
      <ProductName />
    </span>
  )
}
