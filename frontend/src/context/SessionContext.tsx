import { createContext, useContext, type ReactNode } from 'react'
import { MOCK_SHIFT, MOCK_STATION, MOCK_USER } from '@/constants/mock'
import type { Shift, Station, User } from '@/types'

export interface Session {
  user: User
  station: Station
  shift: Shift
}

const SessionContext = createContext<Session | null>(null)

/**
 * Who is operating, from which station, on which shift.
 * Currently mock data; the provider is the single seam for real authentication later.
 */
export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionContext.Provider value={{ user: MOCK_USER, station: MOCK_STATION, shift: MOCK_SHIFT }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession(): Session {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession must be used within <SessionProvider>')
  return session
}
