import type { AppNotification, Shift, Station, User } from '@/types'

export const MOCK_STATION: Station = {
  name: 'Central Square Station',
  shortName: 'Central Square',
  code: 'CEN01',
}

export const MOCK_SHIFT: Shift = {
  code: 'B',
  start: '14:00',
  end: '22:00',
  status: 'active',
}

export const MOCK_USER: User = {
  name: 'Employee Name',
  employeeId: 'EMP-20417',
  role: 'Station Controller',
}

/** Roles the demo session can switch between (user menu), to try permission-controlled features. */
export const DEMO_ROLES = ['Station Controller', 'Station Supervisor'] as const

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000)

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    kind: 'attention',
    title: 'Equipment issue requires attention',
    body: 'A reported equipment fault is awaiting acknowledgement.',
    createdAt: minutesAgo(10),
    read: false,
  },
  {
    id: 'n2',
    kind: 'handover',
    title: 'New shift handover available',
    body: 'Handover from the previous shift is ready for review.',
    createdAt: minutesAgo(25),
    read: false,
  },
  {
    id: 'n3',
    kind: 'update',
    title: 'Incident record updated',
    body: 'An incident record linked to this station was updated.',
    createdAt: minutesAgo(60),
    read: false,
  },
  {
    id: 'n4',
    kind: 'system',
    title: 'Scheduled system maintenance',
    body: 'ODMS will be briefly unavailable tonight at 02:00.',
    createdAt: minutesAgo(180),
    read: true,
  },
]
