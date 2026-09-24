import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { MEDIA } from '@/constants/breakpoints'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { isEditableTarget } from '@/utils/dom'

export type ShellLayout = 'mobile' | 'tablet' | 'desktop'

interface ShellContextValue {
  layout: ShellLayout
  /** Effective sidebar state. Always collapsed (rail) on tablet. */
  sidebarCollapsed: boolean
  /** Whether the user can toggle the sidebar at the current size. */
  sidebarCollapsible: boolean
  toggleSidebar: () => void
  drawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  searchOpen: boolean
  openSearch: () => void
  closeSearch: () => void
}

const ShellContext = createContext<ShellContextValue | null>(null)

export function ShellProvider({ children }: { children: ReactNode }) {
  const isMd = useMediaQuery(MEDIA.md)
  const isLg = useMediaQuery(MEDIA.lg)
  const isXl = useMediaQuery(MEDIA.xl)
  const layout: ShellLayout = !isMd ? 'mobile' : !isLg ? 'tablet' : 'desktop'

  // null = no explicit choice yet: expanded on wide screens, rail below 1280px.
  const [collapsedPref, setCollapsedPref] = useLocalStorage<boolean | null>('odms.sidebar.collapsed', null)
  const sidebarCollapsible = layout === 'desktop'
  const sidebarCollapsed = layout === 'tablet' ? true : (collapsedPref ?? !isXl)

  const toggleSidebar = useCallback(() => {
    if (sidebarCollapsible) setCollapsedPref(!sidebarCollapsed)
  }, [sidebarCollapsible, sidebarCollapsed, setCollapsedPref])

  const [drawerRequested, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  // The drawer only exists below desktop; it closes itself if the viewport grows.
  const drawerOpen = drawerRequested && layout !== 'desktop'

  // Global shortcuts: ⌘K / Ctrl+K or "/" for search, "[" to toggle the sidebar.
  const toggleRef = useRef(toggleSidebar)
  useEffect(() => {
    toggleRef.current = toggleSidebar
  })
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
        return
      }
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
      if (isEditableTarget(event.target) || document.querySelector('dialog[open]')) return
      if (event.key === '/') {
        event.preventDefault()
        setSearchOpen(true)
      } else if (event.key === '[') {
        toggleRef.current()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const value = useMemo<ShellContextValue>(
    () => ({
      layout,
      sidebarCollapsed,
      sidebarCollapsible,
      toggleSidebar,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      searchOpen,
      openSearch: () => setSearchOpen(true),
      closeSearch: () => setSearchOpen(false),
    }),
    [layout, sidebarCollapsed, sidebarCollapsible, toggleSidebar, drawerOpen, searchOpen],
  )

  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
}

export function useShell(): ShellContextValue {
  const shell = useContext(ShellContext)
  if (!shell) throw new Error('useShell must be used within <ShellProvider>')
  return shell
}
