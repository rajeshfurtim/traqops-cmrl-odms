import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '@/auth/authStore'
import type { Shift, ShiftCode, Station, User } from '@/types'
import { SHIFTS } from '@/modules/station-diary/constants'

export interface Session {
  user: User
  station: Station
  shift: Shift
  /** Demo only: switch the mock user's role to try permission-controlled features. */
  setDemoRole: (role: string) => void
}

const SessionContext = createContext<Session | null>(null)

/** The signed-in user's session. Rendered only inside `RequireAuth`. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()
  if (!auth) throw new Error('SessionProvider needs a signed-in user (wrap it in <RequireAuth>)')
  const shift = buildShift(auth.shiftCode)
  // Keyed by user + shift so the demo role resets when someone else signs in or shift changes.
  return (
    <SignedInSession key={`${auth.user.employeeId}-${auth.shiftCode}`} user={auth.user} station={auth.station} shift={shift}>
      {children}
    </SignedInSession>
  )
}

function buildShift(code: ShiftCode): Shift {
  const s = SHIFTS[code]
  return { code, start: s.start, end: s.end, status: 'active' }
}

function SignedInSession({
  user,
  station,
  shift,
  children,
}: {
  user: User
  station: Station
  shift: Shift
  children: ReactNode
}) {
  const [role, setDemoRole] = useState(user.role)
  const value = useMemo(
    () => ({ user: { ...user, role }, station, shift, setDemoRole }),
    [user, station, shift, role],
  )
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): Session {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession must be used within <SessionProvider>')
  return session
}
