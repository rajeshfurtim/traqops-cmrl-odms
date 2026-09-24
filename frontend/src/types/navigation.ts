import type { LucideIcon } from 'lucide-react'

export type NavItemStatus = 'available' | 'soon'

export interface NavItem {
  id: string
  label: string
  icon: LucideIcon

  to?: string
  status: NavItemStatus

  description?: string

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

export interface RouteHandle {
  crumb?: Crumb | ((params: Record<string, string | undefined>) => Crumb)

  title?: string
}
