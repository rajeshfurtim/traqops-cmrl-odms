import { useSyncExternalStore } from 'react'
import type { ShiftCode } from '@/types'
import { getRegister, referenceFor, stateOf } from '../definitions'
import { allFields, withComputed } from '../fields'
import type { Person, RegisterRecord, Values } from '../types'
import { SEED_RECORDS } from './seed'

let records: RegisterRecord[] = SEED_RECORDS

/** Next sequence number per register and year, continuing from the seeded records. */
const counters = new Map<string, number>()
for (const r of records) {
  const key = `${r.registerId}/${new Date(r.raisedAt).getFullYear()}`
  counters.set(key, Math.max(counters.get(key) ?? 0, Number(r.ref.match(/(\d+)$/)?.[1] ?? 0)))
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function commit(next: RegisterRecord[]) {
  records = next
  listeners.forEach((l) => l())
}

function update(recordId: string, change: (r: RegisterRecord) => RegisterRecord) {
  commit(records.map((r) => (r.id === recordId ? change(r) : r)))
}

export function useRecords(): RegisterRecord[] {
  return useSyncExternalStore(subscribe, () => records)
}

export const getRecord = (id: string) => records.find((r) => r.id === id)

export interface NewRecord {
  registerId: string
  values: Values
  stationCode: string
  shift: ShiftCode
  raisedBy: Person
  diaryEntryId?: string
  diaryLabel?: string
}

export function createRecord(input: NewRecord): RegisterRecord {
  const def = getRegister(input.registerId)
  if (!def) throw new Error(`Unknown register ${input.registerId}`)
  const now = new Date()
  const key = `${def.id}/${now.getFullYear()}`
  const seq = (counters.get(key) ?? 0) + 1
  counters.set(key, seq)
  const at = now.toISOString()
  const record: RegisterRecord = {
    id: `${def.code}-${now.getFullYear()}-${seq}`,
    registerId: def.id,
    ref: referenceFor(def, input.stationCode, now.getFullYear(), seq),
    values: withComputed(allFields(def), input.values, { stationCode: input.stationCode }),
    state: def.workflow?.initial ?? 'recorded',
    stationCode: input.stationCode,
    shift: input.shift,
    raisedAt: at,
    raisedBy: input.raisedBy,
    revision: 0,
    revisions: [],
    diaryEntryId: input.diaryEntryId,
    diaryLabel: input.diaryLabel,
    history: [
      { at, by: input.raisedBy.name, text: input.diaryEntryId ? 'Recorded from the Station Diary.' : 'Recorded.' },
    ],
  }
  commit([record, ...records])
  return record
}

/** Saves a correction. The earlier values are kept as a revision; the record never loses its history. */
export function reviseRecord(recordId: string, values: Values, by: Person, reason: string) {
  update(recordId, (r) => {
    const def = getRegister(r.registerId)
    const at = new Date().toISOString()
    const revision = r.revision + 1
    return {
      ...r,
      values: def ? withComputed(allFields(def), { ...r.values, ...values }, { stationCode: r.stationCode }) : values,
      revision,
      revisedAt: at,
      revisions: [...r.revisions, { revision: r.revision, at, by, values: r.values }],
      history: [...r.history, { at, by: by.name, text: `Corrected (revision ${revision}). ${reason}` }],
    }
  })
}

/** Moves a record along its register's workflow, storing the step's own fields. */
export function runAction(recordId: string, actionId: string, values: Values, by: Person, remark: string) {
  update(recordId, (r) => {
    const def = getRegister(r.registerId)
    const action = def?.workflow?.actions.find((a) => a.id === actionId)
    if (!def || !action || !action.from.includes(r.state)) return r
    const at = new Date().toISOString()
    const merged = withComputed(allFields(def), { ...r.values, ...values }, { stationCode: r.stationCode })
    return {
      ...r,
      state: action.to,
      values: merged,
      history: [
        ...r.history,
        {
          at,
          by: by.name,
          text: `${action.logText} Status: ${stateOf(def, action.to).label}.${remark ? ` ${remark}` : ''}`,
        },
      ],
    }
  })
}

export function addRemark(recordId: string, by: string, text: string) {
  update(recordId, (r) => ({ ...r, history: [...r.history, { at: new Date().toISOString(), by, text }] }))
}
