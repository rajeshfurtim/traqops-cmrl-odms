import type { FixedHeader, HeaderContent } from '@/export'

export type RegisterCategory = 'operational' | 'safety' | 'equipment' | 'passenger'

export type RecordStatus = 'open' | 'in-progress' | 'pending-verification' | 'closed'

export interface RegisterField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select'
  options?: string[]
  required?: boolean

  column?: boolean
}

export interface RegisterDefinition {
  id: string
  label: string
  category: RegisterCategory
  description: string

  code: string
  retention: string
  statutory: boolean
  fields: RegisterField[]

  titleField: string

  /**
   * Opts the register into the shared export (Copy · CSV · Excel · PDF · Print). `header` is fixed in code;
   * users can only change the subtitle and department, starting from `defaultHeader`.
   */
  report?: { header?: FixedHeader; defaultHeader?: Partial<HeaderContent> }
}

export interface RecordEvent {
  at: string
  by: string
  text: string
}

export interface RegisterRecord {
  id: string
  registerId: string
  ref: string
  values: Record<string, string>
  status: RecordStatus
  raisedAt: string
  raisedBy: string

  diaryEntryId?: string
  diaryLabel?: string
  history: RecordEvent[]
}
