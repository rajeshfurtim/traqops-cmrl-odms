import type { ShiftCode } from '@/types'

export type { ShiftCode }

export type DiaryStatus = 'in-progress' | 'submitted' | 'no-attendance' | 'upcoming'

export interface Person {
  name: string
  employeeId: string
}

export interface Attachment {
  id: string
  name: string

  url: string
}

export interface DiaryEntry {
  id: string

  at: string

  text: string
  important: boolean
  author: Person

  system?: boolean
  attachments?: Attachment[]

  registerRecord?: { registerId: string; ref: string }

  editedAt?: string
  revisions?: EntryRevision[]

  followUpId?: string
}

export interface EntryRevision {
  text: string
  important: boolean

  replacedAt: string
  replacedBy: Person
}

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

  entryId?: string
}

export interface Handover {
  handedBy?: Person
  handedAt?: string
  takenBy?: Person

  takenAt?: string
}

export interface ShiftDiary {
  id: string
  stationCode: string
  stationName: string

  date: string
  shift: ShiftCode
  status: DiaryStatus
  controller?: Person
  signInAt?: string
  signOutAt?: string
  entries: DiaryEntry[]

  deletedEntries?: DeletedEntry[]
  tasks: DiaryTask[]
  followUps: FollowUp[]
  handover: Handover
}
