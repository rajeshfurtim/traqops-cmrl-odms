import { useEffect, type ReactNode } from 'react'
import cmrlFullLogo from '@/assets/cmrl-full-logo.png'
import { BrandLockup } from './Brand'

const FEATURES = ['Station Diary and shift handover', 'Statutory registers', 'Reports with the official CMRL header']

/** A metro line with stations, like the wayfinding strip above platform doors. */
function RouteStrip({ className = '' }: { className?: string }) {
  const stops = [24, 104, 184, 264, 344]
  return (
    <svg viewBox="0 0 368 48" aria-hidden className={className}>
      <rect x="12" y="20" width="344" height="8" rx="4" className="fill-accent" />
      {stops.map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy="24"
          r={i === 2 ? 11 : 8}
          className={i === 2 ? 'fill-accent stroke-nav' : 'fill-nav stroke-ink'}
          strokeWidth={i === 2 ? 5 : 3.5}
        />
      ))}
    </svg>
  )
}

interface AuthLayoutProps {
  /** Browser tab title, e.g. "Sign in". */
  title: string
  children: ReactNode
}

/** Frame for sign-in pages: navy brand panel (large screens) and the form. Not inside the app shell. */
export function AuthLayout({ title, children }: AuthLayoutProps) {
  useEffect(() => {
    document.title = `${title} · ODMS`
  }, [title])

  return (
    <div className="grid min-h-dvh bg-canvas lg:grid-cols-[minmax(0,1fr)_minmax(30rem,36rem)]">
      <aside className="on-dark relative hidden flex-col justify-between overflow-hidden border-l-[0.5rem] border-accent bg-nav px-12 py-10 text-ink lg:flex">
        <img
          src={cmrlFullLogo}
          alt="Chennai Metro Rail Limited"
          width={330}
          height={96}
          draggable={false}
          className="h-14 w-auto self-start brightness-0 invert select-none"
        />

        <div className="flex max-w-[30rem] flex-col gap-6">
          <RouteStrip className="w-72" />
          <div>
            <p className="font-display text-[2.75rem] leading-none font-extrabold tracking-tight text-ink">ODMS</p>
            <p className="mt-3 text-title font-semibold text-ink-secondary">
              Station operations for Chennai Metro Rail
            </p>
          </div>
          <ul className="flex flex-col gap-2.5">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-3 text-body text-ink-secondary">
                <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-accent" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="max-w-[30rem] text-caption text-ink-muted">
          For authorised CMRL staff only. Sign-ins and actions are recorded.
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center px-4 py-8 sm:px-8">
        <div className="flex w-full max-w-[26rem] flex-col gap-6">
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <BrandLockup className="h-12" />
            <span aria-hidden className="h-1 w-16 rounded-full bg-accent" />
          </div>
          {children}
          <p className="text-center text-caption text-ink-muted lg:hidden">
            For authorised CMRL staff only. Sign-ins and actions are recorded.
          </p>
        </div>
      </main>
    </div>
  )
}
