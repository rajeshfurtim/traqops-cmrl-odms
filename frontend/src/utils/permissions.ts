import type { User } from '@/types'

export type Permission =
  /** Create, change or remove this station's report header override. */
  | 'report-header.edit-station'
  /** Change a register's default report header for every station. */
  | 'report-header.edit-register'

// Placeholder until the backend sends permissions with the session; only this map changes then.
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  'Station Controller': ['report-header.edit-station'],
  'Station Supervisor': ['report-header.edit-station', 'report-header.edit-register'],
  Administrator: ['report-header.edit-station', 'report-header.edit-register'],
}

export function can(user: User, permission: Permission): boolean {
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false
}
