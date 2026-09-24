import type { ShiftCode } from '@/types'

export type { ShiftCode }

/** in-progress: shift open for entries · submitted: handed over and locked. */
export type DiaryStatus = 'in-progress' | 'submitted' | 'no-attendance' | 'upcoming'

export interface Person {
  name: string
  employeeId: string
}

export interface Attachment {
  id: string
  name: string
  /** Object URL in the mock; a signed file URL once the backend exists. */
  url: string
}

export interface DiaryEntry {
  id: string
  /** ISO timestamp, stamped when the entry is logged. It never changes, even when the text is edited. */
  at: string
  /** Light markup: **bold**, _italic_, "- " bullets, "1. " numbered lines. */
  text: string
  important: boolean
  author: Person
  /** Logged by ODMS itself (task updates, handover), not typed by a controller. */
  system?: boolean
  attachments?: Attachment[]
  /** Register record raised from this entry. */
  registerRecord?: { registerId: string; ref: string }
  /** Last edit. Earlier wording is kept in `revisions`, oldest first. */
  editedAt?: string
  revisions?: EntryRevision[]
  /** Follow-up raised from this entry. */
  followUpId?: string
}

/** An earlier version of an edited entry, kept for audit. */
export interface EntryRevision {
  text: string
  important: boolean
  /** When this version was replaced, and by whom. */
  replacedAt: string
  replacedBy: Person
}

/** A deleted entry. Hidden from the diary, booklet and PDF but kept for audit. */
export interface DeletedEntry extends DiaryEntry {
  deletedAt: string
  deletedBy: Person
}

export type TaskStatus = 'open' | 'acknowledged' | 'completed'

export interface DiaryTask {
  id: string
  kind: 'circular' | 'task'
  title: string
  body: string
  from: string
  dueAt: string
  status: TaskStatus
}

export interface FollowUp {
  id: string
  text: string
  done: boolean
  /** Diary entry it was raised from, if any. */
  entryId?: string
}

export interface Handover {
  handedBy?: Person
  handedAt?: string
  takenBy?: Person
  /** Set when the incoming controller acknowledges. */
  takenAt?: string
}

export interface ShiftDiary {
  /** "CEN01-2026-09-24-B" */
  id: string
  stationCode: string
  stationName: string
  /** "YYYY-MM-DD" (the date the shift starts) */
  date: string
  shift: ShiftCode
  status: DiaryStatus
  controller?: Person
  signInAt?: string
  signOutAt?: string
  entries: DiaryEntry[]
  /** Audit trail of deleted entries; never shown in the diary or on the form. */
  deletedEntries?: DeletedEntry[]
  tasks: DiaryTask[]
  followUps: FollowUp[]
  handover: Handover
}
