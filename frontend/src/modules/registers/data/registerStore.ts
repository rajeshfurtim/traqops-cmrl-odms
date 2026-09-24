import { useSyncExternalStore } from 'react'
import { MOCK_STATION } from '@/constants/mock'
import { getRegister, STATUS_LABELS } from '../definitions'
import type { RecordStatus, RegisterRecord } from '../types'

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString()
const year = new Date().getFullYear()
const ref = (code: string, n: number) => `${MOCK_STATION.code}/${code}/${year}/${String(n).padStart(4, '0')}`

let records: RegisterRecord[] = [
  {
    id: 'r1',
    registerId: 'equipment-fault',
    ref: ref('EQP', 141),
    values: {
      equipment: 'Lift L2',
      location: 'Entry A · street to concourse',
      fault: 'Stuck at ground floor',
      action: 'Lift isolated, maintenance informed.',
    },
    status: 'in-progress',
    raisedAt: hoursAgo(2.2),
    raisedBy: 'Employee Name',
    diaryLabel: 'Diary, today',
    history: [
      { at: hoursAgo(2.2), by: 'Employee Name', text: 'Raised from the Station Diary.' },
      { at: hoursAgo(1.6), by: 'AFC & Lifts maintenance', text: 'Crew dispatched.' },
    ],
  },
  {
    id: 'r2',
    registerId: 'equipment-fault',
    ref: ref('EQP', 139),
    values: {
      equipment: 'Escalator E3',
      location: 'Platform 2',
      fault: 'Handrail speed mismatch',
      action: 'Escalator stopped and barricaded.',
    },
    status: 'pending-verification',
    raisedAt: hoursAgo(20),
    raisedBy: 'Employee Name',
    history: [
      { at: hoursAgo(20), by: 'Employee Name', text: 'Raised.' },
      { at: hoursAgo(6), by: 'E&M maintenance', text: 'Repaired; awaiting verification by the Station Controller.' },
    ],
  },
  {
    id: 'r3',
    registerId: 'equipment-fault',
    ref: ref('EQP', 137),
    values: { equipment: 'PA system', location: 'Platform 1, zone 3', fault: 'Low volume on speakers' },
    status: 'closed',
    raisedAt: hoursAgo(52),
    raisedBy: 'R. Arun',
    history: [
      { at: hoursAgo(52), by: 'R. Arun', text: 'Raised.' },
      { at: hoursAgo(48), by: 'Telecom maintenance', text: 'Amplifier replaced.' },
      { at: hoursAgo(47), by: 'R. Arun', text: 'Verified and closed.' },
    ],
  },
  {
    id: 'r4',
    registerId: 'occurrence-log',
    ref: ref('OCC', 88),
    values: {
      summary: 'Passenger fell ill at concourse',
      location: 'Concourse, paid side',
      type: 'Passenger',
      details: 'First aid given; passenger left on their own.',
    },
    status: 'closed',
    raisedAt: hoursAgo(1.5),
    raisedBy: 'Employee Name',
    history: [{ at: hoursAgo(1.5), by: 'Employee Name', text: 'Raised and closed.' }],
  },
  {
    id: 'r5',
    registerId: 'safety-inspection',
    ref: ref('SAF', 31),
    values: {
      item: 'Fire extinguishers',
      area: 'Concourse',
      result: 'Needs attention',
      remarks: 'Two units due for refill.',
    },
    status: 'open',
    raisedAt: hoursAgo(30),
    raisedBy: 'M. Kavitha',
    history: [{ at: hoursAgo(30), by: 'M. Kavitha', text: 'Raised.' }],
  },
  {
    id: 'r6',
    registerId: 'complaints',
    ref: ref('CMP', 204),
    values: {
      subject: 'Long queue at ticket counter',
      passenger: '98xxxxxx21',
      details: 'Only one counter open during peak hour.',
    },
    status: 'open',
    raisedAt: hoursAgo(5),
    raisedBy: 'Employee Name',
    history: [{ at: hoursAgo(5), by: 'Employee Name', text: 'Raised.' }],
  },
  {
    id: 'r7',
    registerId: 'lost-found',
    ref: ref('LNF', 412),
    values: { item: 'Black wallet', foundAt: 'Platform 1 bench', description: 'Returned to owner after ID check.' },
    status: 'closed',
    raisedAt: hoursAgo(26),
    raisedBy: 'M. Kavitha',
    history: [
      { at: hoursAgo(26), by: 'M. Kavitha', text: 'Raised.' },
      { at: hoursAgo(24), by: 'M. Kavitha', text: 'Returned to owner; closed.' },
    ],
  },
]

const counters: Record<string, number> = { EQP: 142, OCC: 89, SAF: 32, FDR: 12, KEY: 57, CMP: 205, LNF: 413 }
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function commit(next: RegisterRecord[]) {
  records = next
  listeners.forEach((l) => l())
}

export function useRecords(): RegisterRecord[] {
  return useSyncExternalStore(subscribe, () => records)
}

export interface NewRecord {
  registerId: string
  values: Record<string, string>
  raisedBy: string
  diaryEntryId?: string
  diaryLabel?: string
}

export function createRecord(input: NewRecord): RegisterRecord {
  const def = getRegister(input.registerId)
  if (!def) throw new Error(`Unknown register ${input.registerId}`)
  counters[def.code] = (counters[def.code] ?? 0) + 1
  const now = new Date().toISOString()
  const record: RegisterRecord = {
    id: `${def.code}-${counters[def.code]}`,
    registerId: def.id,
    ref: ref(def.code, counters[def.code]),
    values: input.values,
    status: 'open',
    raisedAt: now,
    raisedBy: input.raisedBy,
    diaryEntryId: input.diaryEntryId,
    diaryLabel: input.diaryLabel,
    history: [{ at: now, by: input.raisedBy, text: input.diaryEntryId ? 'Raised from the Station Diary.' : 'Raised.' }],
  }
  commit([record, ...records])
  return record
}

export function changeStatus(recordId: string, status: RecordStatus, by: string, remark: string) {
  commit(
    records.map((r) =>
      r.id === recordId
        ? {
            ...r,
            status,
            history: [
              ...r.history,
              {
                at: new Date().toISOString(),
                by,
                text: `Status changed to ${STATUS_LABELS[status]}.${remark ? ` ${remark}` : ''}`,
              },
            ],
          }
        : r,
    ),
  )
}

export function addRemark(recordId: string, by: string, text: string) {
  commit(
    records.map((r) =>
      r.id === recordId ? { ...r, history: [...r.history, { at: new Date().toISOString(), by, text }] } : r,
    ),
  )
}
