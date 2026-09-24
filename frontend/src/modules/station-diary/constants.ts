import type { BadgeTone } from '@/components/ui/Badge'
import type { DiaryStatus, ShiftCode, TaskStatus } from './types'

export const FORM_NUMBER = 'CMRL/OPER/SO/F-01'
export const FORM_REVISION = 'Rev: 00'
export const FORM_DATE = 'Date: 2022-09-01'

export const SHIFTS: Record<ShiftCode, { label: string; start: string; end: string }> = {
  A: { label: 'Shift A', start: '06:00', end: '14:00' },
  G: { label: 'Shift G', start: '09:00', end: '17:30' },
  B: { label: 'Shift B', start: '14:00', end: '22:00' },
  C: { label: 'Shift C', start: '22:00', end: '06:00' },
}

export const SHIFT_ORDER: ShiftCode[] = ['A', 'G', 'B', 'C']

export const STATUS_LABELS: Record<DiaryStatus, string> = {
  'in-progress': 'In progress',
  submitted: 'Submitted',
  'no-attendance': 'No attendance',
  upcoming: 'Upcoming',
}

export const STATUS_TONES: Record<DiaryStatus, BadgeTone> = {
  'in-progress': 'warning',
  submitted: 'success',
  'no-attendance': 'danger',
  upcoming: 'neutral',
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'Open',
  acknowledged: 'Acknowledged',
  completed: 'Completed',
}

export const TASK_STATUS_TONES: Record<TaskStatus, BadgeTone> = {
  open: 'warning',
  acknowledged: 'info',
  completed: 'success',
}

export interface HotKey {
  id: string
  label: string

  template: string
}

export const DEFAULT_HOT_KEYS: HotKey[] = [
  {
    id: 'bank',
    label: 'Bank',
    template: 'Bank remittance: ₹__ handed to bank official __ against receipt no. __.',
  },
  {
    id: 'lift',
    label: 'Lift / Escalator',
    template: 'Lift/Escalator __ stopped at __. Maintenance informed at __.',
  },
  {
    id: 'afc',
    label: 'AFC fault',
    template: 'AFC gate __ out of service. Passengers diverted to gate __.',
  },
  { id: 'fire', label: 'Fire alarm', template: 'Fire alarm at __, zone __. Checked on site: __.' },
  { id: 'occ', label: 'OCC instruction', template: 'Instruction received from OCC: __.' },
]

export const HOT_KEY_NAME_MAX = 24
