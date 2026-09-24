export interface Station {
  name: string
  shortName: string
  code: string
}

export type ShiftStatus = 'active' | 'upcoming' | 'closed'

export type ShiftCode = 'A' | 'B' | 'C' | 'G'

export interface Shift {
  code: ShiftCode
  /** 24-hour "HH:mm" */
  start: string
  end: string
  status: ShiftStatus
}

export interface User {
  name: string
  employeeId: string
  role: string
}
