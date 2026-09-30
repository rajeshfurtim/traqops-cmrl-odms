import { useMemo } from 'react'
import { useSession } from '@/context/SessionContext'
import type { Person } from './types'
import { shiftId, toISODate } from './utils'

export function useCurrentDiaryId(): string {
  const { station, shift } = useSession()
  return shiftId(station.code, toISODate(new Date()), shift.code)
}

export function useActor(): Person {
  const { user } = useSession()
  return useMemo(() => ({ name: user.name, employeeId: user.employeeId }), [user.name, user.employeeId])
}
