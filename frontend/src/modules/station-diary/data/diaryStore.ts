/*
 * Station Diary data layer.
 *
 * In-memory mock with the shape of the future API: components only call the hooks
 * and actions exported here, so swapping this file for HTTP calls leaves the UI untouched.
 * Entries are append-only; every change a controller makes is also written to the diary.
 */
import { useSyncExternalStore } from 'react'
import { DEFAULT_HOT_KEYS, HOT_KEY_NAME_MAX, TASK_STATUS_LABELS, type HotKey } from '../constants'
import type { Attachment, DiaryEntry, Person, ShiftDiary, TaskStatus } from '../types'
import { createSeed } from './seed'

let diaries: ShiftDiary[] = createSeed()
let pnCounter = 118
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const getSnapshot = () => diaries

function update(id: string, change: (diary: ShiftDiary) => ShiftDiary) {
  diaries = diaries.map((d) => (d.id === id ? change(d) : d))
  listeners.forEach((listener) => listener())
}

const newId = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).slice(0, 13)

function entry(author: Person, text: string, extra: Partial<DiaryEntry> = {}): DiaryEntry {
  return { id: newId(), at: new Date().toISOString(), text, important: false, author, ...extra }
}

const appendEntry = (diary: ShiftDiary, e: DiaryEntry): ShiftDiary => ({ ...diary, entries: [...diary.entries, e] })

// ── Queries ────────────────────────────────────────────────────────────────

export function useDiaries(): ShiftDiary[] {
  return useSyncExternalStore(subscribe, getSnapshot)
}

export function useDiary(id: string | undefined): ShiftDiary | undefined {
  const all = useDiaries()
  return id ? all.find((d) => d.id === id) : undefined
}

export function getDiaryEntry(entryId: string): { diary: ShiftDiary; entry: DiaryEntry } | undefined {
  for (const diary of diaries) {
    const found = diary.entries.find((e) => e.id === entryId)
    if (found) return { diary, entry: found }
  }
  return undefined
}

// ── Commands ───────────────────────────────────────────────────────────────

export interface NewEntry {
  text: string
  important: boolean
  attachments?: Attachment[]
}

export function addEntry(diaryId: string, input: NewEntry, author: Person): DiaryEntry {
  const created = entry(author, input.text.trim(), {
    important: input.important,
    attachments: input.attachments?.length ? input.attachments : undefined,
  })
  update(diaryId, (d) => appendEntry(d, created))
  return created
}

export interface EntryChange {
  text: string
  important: boolean
}

/** Edits an entry in place. The previous wording is kept in `revisions`; the logged time never changes. */
export function editEntry(diaryId: string, entryId: string, change: EntryChange, actor: Person) {
  update(diaryId, (d) => ({
    ...d,
    entries: d.entries.map((e) => {
      if (e.id !== entryId) return e
      const text = change.text.trim()
      if (!text || (text === e.text && change.important === e.important)) return e
      const now = new Date().toISOString()
      const revision = { text: e.text, important: e.important, replacedAt: now, replacedBy: actor }
      return { ...e, text, important: change.important, editedAt: now, revisions: [...(e.revisions ?? []), revision] }
    }),
  }))
}

/** Removes an entry from the diary. It moves to `deletedEntries` so the deletion stays auditable. */
export function deleteEntry(diaryId: string, entryId: string, actor: Person) {
  update(diaryId, (d) => {
    const target = d.entries.find((e) => e.id === entryId)
    if (!target) return d
    const deleted = { ...target, deletedAt: new Date().toISOString(), deletedBy: actor }
    return {
      ...d,
      entries: d.entries.filter((e) => e.id !== entryId),
      deletedEntries: [...(d.deletedEntries ?? []), deleted],
      // An open follow-up raised from the entry goes with it.
      followUps: d.followUps.filter((f) => f.entryId !== entryId || f.done),
    }
  })
}

/** Raises a follow-up from an entry. Open follow-ups are carried to the next shift at handover. */
export function addFollowUp(diaryId: string, entryId: string, text: string) {
  update(diaryId, (d) => {
    const target = d.entries.find((e) => e.id === entryId)
    if (!target || target.followUpId || !text.trim()) return d
    const followUp = { id: newId(), text: text.trim(), done: false, entryId }
    return {
      ...d,
      followUps: [...d.followUps, followUp],
      entries: d.entries.map((e) => (e.id === entryId ? { ...e, followUpId: followUp.id } : e)),
    }
  })
}

export function setTaskStatus(diaryId: string, taskId: string, status: TaskStatus, actor: Person) {
  update(diaryId, (d) => {
    const task = d.tasks.find((t) => t.id === taskId)
    if (!task || task.status === status) return d
    const note = entry(
      actor,
      `Task "${task.title}" marked **${TASK_STATUS_LABELS[status].toLowerCase()}** by ${actor.name}.`,
      { system: true },
    )
    return appendEntry({ ...d, tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)) }, note)
  })
}

export function closeFollowUp(diaryId: string, followUpId: string, actor: Person) {
  update(diaryId, (d) => {
    const item = d.followUps.find((f) => f.id === followUpId)
    if (!item || item.done) return d
    const note = entry(actor, `Follow-up closed: ${item.text}.`, { system: true })
    return appendEntry(
      { ...d, followUps: d.followUps.map((f) => (f.id === followUpId ? { ...f, done: true } : f)) },
      note,
    )
  })
}

export function linkRegisterRecord(entryId: string, registerId: string, ref: string) {
  const found = getDiaryEntry(entryId)
  if (!found) return
  update(found.diary.id, (d) => ({
    ...d,
    entries: d.entries.map((e) => (e.id === entryId ? { ...e, registerRecord: { registerId, ref } } : e)),
  }))
}

/** Outgoing controller signs off: the shift locks and waits for the incoming controller. */
export function submitHandover(diaryId: string, incoming: Person, actor: Person) {
  update(diaryId, (d) => {
    const now = new Date().toISOString()
    const openFollowUps = d.followUps.filter((f) => !f.done).length
    const note = entry(
      actor,
      `Shift handed over to ${incoming.name} (${incoming.employeeId}).` +
        (openFollowUps ? ` ${openFollowUps} follow-up${openFollowUps > 1 ? 's' : ''} carried forward.` : ''),
      { system: true },
    )
    return {
      ...appendEntry(d, note),
      status: 'submitted',
      signOutAt: now,
      handover: { handedBy: actor, handedAt: now, takenBy: incoming },
    }
  })
}

/** Private Number from the station's PN book. */
export function generatePnNumber(stationCode: string): string {
  pnCounter += 1
  return `PN/${stationCode}/${new Date().getFullYear()}/${String(pnCounter).padStart(6, '0')}`
}

// ── Hot keys (per station) ─────────────────────────────────────────────────

let hotKeys: Record<string, HotKey[]> = {}
const hotKeyListeners = new Set<() => void>()

function subscribeHotKeys(listener: () => void) {
  hotKeyListeners.add(listener)
  return () => hotKeyListeners.delete(listener)
}

export function useHotKeys(stationCode: string): HotKey[] {
  return useSyncExternalStore(subscribeHotKeys, () => hotKeys[stationCode] ?? DEFAULT_HOT_KEYS)
}

export interface NewHotKey {
  label: string
  /** Message inserted into the editor; "__" marks blanks to fill. */
  template: string
}

/** Saves a hot key for the station. Returns an error message, or undefined when saved. */
export function addHotKey(stationCode: string, input: NewHotKey): string | undefined {
  const label = input.label.trim().replace(/\s+/g, ' ')
  const template = input.template.trim()
  if (!label) return 'Enter a name for the hot key.'
  if (label.length > HOT_KEY_NAME_MAX) return `Keep the name to ${HOT_KEY_NAME_MAX} characters or fewer.`
  if (!template) return 'Enter the message this hot key adds.'
  const current = hotKeys[stationCode] ?? DEFAULT_HOT_KEYS
  if (current.some((k) => k.label.toLowerCase() === label.toLowerCase()))
    return `A hot key named "${label}" already exists.`
  hotKeys = { ...hotKeys, [stationCode]: [...current, { id: newId(), label, template }] }
  hotKeyListeners.forEach((listener) => listener())
  return undefined
}
