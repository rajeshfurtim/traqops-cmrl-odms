export type RegisterCategory = 'operational' | 'safety' | 'equipment' | 'passenger'

export type RecordStatus = 'open' | 'in-progress' | 'pending-verification' | 'closed'

export interface RegisterField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select'
  options?: string[]
  required?: boolean
  /** Shown as a column in the register table. */
  column?: boolean
}

/**
 * A register is configuration, not a screen: the table, the entry form and the
 * record panel are all generated from its fields.
 */
export interface RegisterDefinition {
  id: string
  label: string
  category: RegisterCategory
  description: string
  /** Middle part of the reference number, e.g. "EQP" in CEN01/EQP/2026/0142. */
  code: string
  retention: string
  statutory: boolean
  fields: RegisterField[]
  /** Field used as the record's title in lists and the detail panel. */
  titleField: string
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
  /** Diary entry this record was raised from. */
  diaryEntryId?: string
  diaryLabel?: string
  history: RecordEvent[]
}
