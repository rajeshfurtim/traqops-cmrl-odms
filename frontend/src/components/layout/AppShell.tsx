import { useEffect, useRef } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { GlobalSearch } from '@/components/search/GlobalSearch'
import { SessionProvider } from '@/context/SessionContext'
import { ShellProvider } from '@/context/ShellContext'
import { useRouteTitle } from '@/hooks/useBreadcrumbs'
import { MobileDrawer } from './MobileDrawer'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  return (
    <SessionProvider>
      <ShellProvider>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <div className="flex min-h-dvh">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <MainContent />
          </div>
        </div>
        <MobileDrawer />
        <GlobalSearch />
        <ScrollRestoration />
      </ShellProvider>
    </SessionProvider>
  )
}

function MainContent() {
  const mainRef = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const title = useRouteTitle()
  const isFirstRender = useRef(true)

  useEffect(() => {
    document.title = title ? `${title} · ODMS` : 'ODMS · Chennai Metro Rail'
  }, [title])

  // Move focus to the new page so screen-reader and keyboard users land on its content.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <main ref={mainRef} id="main-content" tabIndex={-1} className="flex-1 outline-none">
      <div className="mx-auto w-full max-w-content px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <Outlet />
      </div>
    </main>
  )
}
