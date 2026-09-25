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

// A fuller Occurrence Log, so exports show paging and period filters on realistic data.
const OCCURRENCES: [hours: number, summary: string, location: string, type: string, details: string, by: string][] = [
  [
    9,
    'Unattended bag on platform',
    'Platform 2, zone 4',
    'Security',
    'Area cordoned; owner traced by CCTV and bag returned after check.',
    'R. Arun',
  ],
  [
    22,
    'Train held 4 min for door fault',
    'Platform 1',
    'Operations',
    'OCC informed; door isolated and train cleared.',
    'Employee Name',
  ],
  [
    31,
    'Child separated from parent',
    'Concourse, unpaid side',
    'Passenger',
    'Announcement made; reunited within 10 minutes.',
    'M. Kavitha',
  ],
  [
    47,
    'Passenger slipped on wet floor',
    'Entry B stairs',
    'Passenger',
    'First aid given; housekeeping called and caution board placed.',
    'R. Arun',
  ],
  [
    58,
    'Crowd build-up after event',
    'Entry A',
    'Operations',
    'Extra AFC gate opened; queue controlled by security staff.',
    'Employee Name',
  ],
  [
    70,
    'Argument at ticket counter',
    'Ticket counter 2',
    'Security',
    'Security intervened; passenger issued a ticket and left.',
    'M. Kavitha',
  ],
  [
    95,
    'Stray dog inside paid area',
    'Concourse, paid side',
    'Other',
    'Guided out through Entry C by housekeeping.',
    'R. Arun',
  ],
  [
    118,
    'Passenger trapped in lift L1',
    'Entry A lift',
    'Passenger',
    'Released in 6 minutes by lift technician; no injury.',
    'Employee Name',
  ],
  [
    140,
    'Fire alarm, false trigger',
    'Staff room',
    'Operations',
    'Checked by SC and fire team; detector reset.',
    'M. Kavitha',
  ],
  [
    165,
    'Suspicious person reported',
    'Parking',
    'Security',
    'Checked by security; nothing found. Police informed as a precaution.',
    'R. Arun',
  ],
  [
    190,
    'Power dip, lights flickered',
    'Station-wide',
    'Operations',
    'Normal in 2 minutes; E&M informed.',
    'Employee Name',
  ],
  [
    214,
    'Lost senior citizen assisted',
    'Entry C',
    'Passenger',
    'Contacted family; waited in SC room until pickup.',
    'M. Kavitha',
  ],
]

records = [
  ...records,
  ...OCCURRENCES.map(([h, summary, location, type, details, by], i): RegisterRecord => {
    const n = 87 - i
    const closed = h > 30
    return {
      id: `occ-${n}`,
      registerId: 'occurrence-log',
      ref: ref('OCC', n),
      values: { summary, location, type, details },
      status: closed ? 'closed' : 'open',
      raisedAt: hoursAgo(h),
      raisedBy: by,
      history: [
        { at: hoursAgo(h), by, text: 'Raised.' },
        ...(closed ? [{ at: hoursAgo(h - 1), by, text: 'Status changed to Closed. Action complete.' }] : []),
      ],
    }
  }),
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
