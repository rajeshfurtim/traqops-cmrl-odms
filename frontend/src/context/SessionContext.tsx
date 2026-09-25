import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { MOCK_SHIFT, MOCK_STATION, MOCK_USER } from '@/constants/mock'
import type { Shift, Station, User } from '@/types'

export interface Session {
  user: User
  station: Station
  shift: Shift
  /** Demo only: switch the mock user's role to try permission-controlled features. */
  setDemoRole: (role: string) => void
}

const SessionContext = createContext<Session | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setDemoRole] = useState(MOCK_USER.role)
  const value = useMemo(
    () => ({ user: { ...MOCK_USER, role }, station: MOCK_STATION, shift: MOCK_SHIFT, setDemoRole }),
    [role],
  )
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): Session {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession must be used within <SessionProvider>')
  return session
}
