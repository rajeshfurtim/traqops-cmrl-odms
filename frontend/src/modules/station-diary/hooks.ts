import { useSession } from '@/context/SessionContext'
import { CURRENT_USER } from './data/seed'
import type { Person } from './types'
import { shiftId, toISODate } from './utils'

/** Diary id of the shift the signed-in controller is working now. */
export function useCurrentDiaryId(): string {
  const { station, shift } = useSession()
  return shiftId(station.code, toISODate(new Date()), shift.code)
}

/** The signed-in controller, as recorded on diary entries. */
export function useActor(): Person {
  const { user } = useSession()
  return user.employeeId === CURRENT_USER.employeeId ? CURRENT_USER : { name: user.name, employeeId: user.employeeId }
}
