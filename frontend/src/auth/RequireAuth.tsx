import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './authStore'

/** Sends signed-out users to the sign-in page and brings them back to where they were going. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const session = useAuth()
  const location = useLocation()
  if (!session) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  return children
}

/** Sign-in pages: a signed-in user goes straight to Home. */
export function GuestOnly({ children }: { children: ReactNode }) {
  return useAuth() ? <Navigate to="/dashboard" replace /> : children
}
