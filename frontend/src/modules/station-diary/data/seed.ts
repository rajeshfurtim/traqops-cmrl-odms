/*
 * Example diaries for the mock data layer: the last 8 days at the session's station.
 * Times are generated relative to "now" so the current shift always looks live.
 */
import { MOCK_SHIFT, MOCK_STATION, MOCK_USER } from '@/constants/mock'
import { SHIFT_ORDER, SHIFTS } from '../constants'
import type { DiaryEntry, DiaryTask, Person, ShiftCode, ShiftDiary } from '../types'
import { addDays, shiftId, toISODate } from '../utils'

export const CURRENT_USER: Person = { name: MOCK_USER.name, employeeId: MOCK_USER.employeeId }

/** Controllers the current one can hand over to. */
export const STAFF: Person[] = [
  { name: 'R. Arun', employeeId: 'EMP-18820' },
  { name: 'V. Ganesh', employeeId: 'EMP-19954' },
  { name: 'M. Kavitha', employeeId: 'EMP-21133' },
  { name: 'S. Priya', employeeId: 'EMP-20988' },
]

const ROSTER: Record<ShiftCode, Person> = {
  A: STAFF[0],
  G: STAFF[2],
  B: CURRENT_USER,
  C: STAFF[1],
}

const NEXT_SHIFT: Record<ShiftCode, ShiftCode> = { A: 'B', B: 'C', C: 'A', G: 'G' }

const LINES: { text: string; important?: boolean }[] = [
  { text: 'Opening checks completed. All AFC gates and TVMs working.' },
  { text: 'Bank remittance done for the day, receipt no. 55190.', important: true },
  { text: 'Lift L2 abnormal noise reported to maintenance.' },
  { text: 'Instruction received from OCC: headway increased to 7 min due to depot movement.' },
  { text: 'Passenger fell ill at concourse. First aid given; passenger left on their own.' },
  {
    text: 'Unattended bag at platform 2 cleared by security after check. Duration 11 min.',
    important: true,
  },
  { text: 'Escalator E3 handrail speed mismatch. Stopped and reported.', important: true },
  { text: 'Customer care counter audit completed.' },
  { text: 'Lost wallet handed over to owner after ID check.' },
  { text: 'Night patrol completed: no abnormality.' },
  { text: 'Revenue service closed; station secured.' },
]

const at = (date: string, time: string, plusMinutes = 0) => {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm + plusMinutes, (plusMinutes * 7) % 60).toISOString()
}

let seq = 0
const nextId = (prefix: string) => `${prefix}-${++seq}`

function pastEntries(date: string, shift: ShiftCode, person: Person, seed: number): DiaryEntry[] {
  const count = 2 + (seed % 4)
  const span = shift === 'G' ? 480 : 440
  const entries: DiaryEntry[] = [
    {
      id: nextId('e'),
      at: at(date, SHIFTS[shift].start, 3),
      text: `${SHIFTS[shift].label} taken over.`,
      important: false,
      author: person,
      system: true,
    },
  ]
  for (let i = 0; i < count; i++) {
    const line = LINES[(seed * 3 + i * 5) % LINES.length]
    entries.push({
      id: nextId('e'),
      at: at(date, SHIFTS[shift].start, 20 + Math.round(((i + 1) * span) / (count + 1))),
      text: line.text,
      important: Boolean(line.important),
      author: person,
    })
  }
  return entries
}

function circular(status: DiaryTask['status'], dueDate: string): DiaryTask {
  return {
    id: nextId('t'),
    kind: 'circular',
    title: 'Improve CSC to SVP conversion ratio',
    body: 'All stations to strictly follow the issued instructions without deviation and take necessary efforts to improve the CSC to SVP conversion ratio.',
    from: 'Station Operations HQ',
    dueAt: at(dueDate, '12:00'),
    status,
  }
}

function pastDiary(date: string, shift: ShiftCode, seed: number): ShiftDiary {
  const person = ROSTER[shift]
  const { start, end } = SHIFTS[shift]
  const endDate = shift === 'C' ? addDays(date, 1) : date
  // A → B → C → next day's A; the general shift (G) closes its own diary.
  const next = ROSTER[NEXT_SHIFT[shift]]
  return {
    id: shiftId(MOCK_STATION.code, date, shift),
    stationCode: MOCK_STATION.code,
    stationName: MOCK_STATION.name,
    date,
    shift,
    status: 'submitted',
    controller: person,
    signInAt: at(date, start, 1),
    signOutAt: at(endDate, end, 4),
    entries: pastEntries(date, shift, person, seed),
    tasks: seed % 3 === 0 ? [circular('completed', addDays(date, 90))] : [],
    followUps: [],
    handover: {
      handedBy: person,
      handedAt: at(endDate, end, 4),
      takenBy: next,
      takenAt: at(endDate, end, 6),
    },
  }
}

function currentDiary(date: string, shift: ShiftCode): ShiftDiary {
  const now = Date.now()
  // Spread the example entries between sign-in and now (falls back to the last 3 hours before the shift starts).
  const shiftStart = new Date(at(date, SHIFTS[shift].start, 2)).getTime()
  const start = shiftStart < now - 30 * 60_000 ? shiftStart : now - 178 * 60_000
  const ago = (minutes: number) => new Date(start + (1 - minutes / 178) * (now - start)).toISOString()
  const person = CURRENT_USER
  const entry = (minutes: number, text: string, important = false, system = false) => ({
    id: nextId('e'),
    at: ago(minutes),
    text,
    important,
    author: person,
    system,
  })
  return {
    id: shiftId(MOCK_STATION.code, date, shift),
    stationCode: MOCK_STATION.code,
    stationName: MOCK_STATION.name,
    date,
    shift,
    status: 'in-progress',
    controller: person,
    signInAt: ago(178),
    entries: [
      entry(176, `${SHIFTS[shift].label} taken over from R. Arun (EMP-18820). 1 follow-up carried.`, false, true),
      entry(160, 'Instruction received from OCC: headway increased to 7 min due to depot movement.'),
      entry(128, 'Lift L2 stopped at ground floor. Maintenance informed; no one trapped.'),
      entry(
        112,
        'Task "Improve CSC to SVP conversion ratio" marked **completed**. Acknowledged and completed by ' +
          `${person.name}.`,
        false,
        true,
      ),
      entry(95, 'Passenger fell ill at concourse. First aid given; passenger left on their own.'),
      entry(61, 'AFC gate G4 out of service. Passengers diverted to:\n- Gate G3\n- Gate G5', true),
      entry(38, 'Bank remittance: **₹8,000** handed to bank official against receipt no. 55231.', true),
    ],
    tasks: [
      circular('completed', addDays(date, 90)),
      {
        id: nextId('t'),
        kind: 'task',
        title: 'Monthly fire extinguisher check',
        body: 'Carry out the monthly visual check of fire extinguishers on the concourse and record it in the Safety Inspection register.',
        from: 'Station Manager',
        dueAt: at(date, '18:00'),
        status: 'open',
      },
    ],
    followUps: [
      { id: nextId('f'), text: 'Lift L2 awaiting maintenance crew', done: false },
      { id: nextId('f'), text: 'Collect duplicate key from SCR cabinet', done: false },
    ],
    handover: { handedBy: person },
  }
}

function emptyDiary(date: string, shift: ShiftCode, status: 'upcoming' | 'no-attendance'): ShiftDiary {
  return {
    id: shiftId(MOCK_STATION.code, date, shift),
    stationCode: MOCK_STATION.code,
    stationName: MOCK_STATION.name,
    date,
    shift,
    status,
    entries: [],
    tasks: [],
    followUps: [],
    handover: {},
  }
}

/** A shift from earlier today that overlaps the current one (e.g. G) stays open until its end time. */
function stillRunning(diary: ShiftDiary): ShiftDiary {
  const now = new Date().toISOString()
  if (!diary.signOutAt || diary.signOutAt <= now) return diary
  return {
    ...diary,
    status: 'in-progress',
    signOutAt: undefined,
    entries: diary.entries.filter((e) => e.at <= now),
    handover: { handedBy: diary.controller },
  }
}

export function createSeed(): ShiftDiary[] {
  const today = toISODate(new Date())
  const current = MOCK_SHIFT.code
  const diaries: ShiftDiary[] = []
  for (let back = 7; back >= 0; back--) {
    const date = addDays(today, -back)
    SHIFT_ORDER.forEach((shift, i) => {
      const seed = back * 4 + i
      if (back === 0 && shift === current) diaries.push(currentDiary(date, shift))
      else if (back === 0 && SHIFT_ORDER.indexOf(shift) > SHIFT_ORDER.indexOf(current))
        diaries.push(emptyDiary(date, shift, 'upcoming'))
      else if (back === 1 && shift === 'C') diaries.push(emptyDiary(date, shift, 'no-attendance'))
      else if (back === 0) diaries.push(stillRunning(pastDiary(date, shift, seed)))
      else diaries.push(pastDiary(date, shift, seed))
    })
  }
  return diaries
}
