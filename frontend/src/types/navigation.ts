import type { LucideIcon } from 'lucide-react'

export type NavItemStatus = 'available' | 'soon'

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  /** Route path. Omitted for modules that are not yet available. */
  to?: string
  status: NavItemStatus
  /** Short explanation used in search results and the home page. */
  description?: string
  /** Extra terms that match this item in global search. */
  keywords?: string[]
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

export interface Crumb {
  label: string
  to?: string
}

/** Metadata attached to routes via `handle`. */
export interface RouteHandle {
  /**
   * Breadcrumb for this route. `to` defaults to the matched pathname.
   * A function receives the route params, e.g. to name a record from its id.
   */
  crumb?: Crumb | ((params: Record<string, string | undefined>) => Crumb)
  /** Document title. Falls back to the last crumb label. */
  title?: string
}
