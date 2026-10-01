// Demo records for each register, dated relative to now so lists, KPIs and "needs attention" look live.
import { MOCK_STATION, MOCK_USER } from '@/constants/mock'
import type { ShiftCode } from '@/types'
import { getRegister, referenceFor } from '../definitions'
import { allFields, toLocalDateTime, withComputed } from '../fields'
import type { CheckItem, Person, RecordEvent, RegisterRecord, Values } from '../types'
import { ESSENTIAL_ITEMS } from './masters'

const ARUN: Person = { name: 'R. Arun', employeeId: 'EMP-10032' }
const KAVITHA: Person = { name: 'M. Kavitha', employeeId: 'EMP-10118' }
const ME: Person = { name: MOCK_USER.name, employeeId: MOCK_USER.employeeId }

const at = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3_600_000)
const local = (hoursAgo: number) => toLocalDateTime(at(hoursAgo))

function shiftAt(date: Date): ShiftCode {
  const h = date.getHours()
  return h >= 22 || h < 6 ? 'C' : h < 14 ? 'A' : 'B'
}

const seqs = new Map<string, number>()

function make(
  registerId: string,
  hoursAgo: number,
  by: Person,
  values: Values,
  extra: { state?: string; history?: RecordEvent[] } = {},
): RegisterRecord {
  const def = getRegister(registerId)
  if (!def) throw new Error(`Unknown register ${registerId}`)
  const raised = at(hoursAgo)
  const seq = (seqs.get(registerId) ?? 0) + 1
  seqs.set(registerId, seq)
  const raisedAt = raised.toISOString()
  return {
    id: `seed-${registerId}-${seq}`,
    registerId,
    ref: referenceFor(def, MOCK_STATION.code, raised.getFullYear(), seq),
    values: withComputed(allFields(def), values, { stationCode: MOCK_STATION.code }),
    state: extra.state ?? def.workflow?.initial ?? 'recorded',
    stationCode: MOCK_STATION.code,
    shift: shiftAt(raised),
    raisedAt,
    raisedBy: by,
    revision: 0,
    revisions: [],
    history: [{ at: raisedAt, by: by.name, text: 'Recorded.' }, ...(extra.history ?? [])],
  }
}

const row = (hoursAgo: number, text: string) => ({ id: `t${hoursAgo}-${text.length}`, at: local(hoursAgo), text })

function checks(bad: Record<string, string> = {}): Record<string, CheckItem> {
  return Object.fromEntries(
    ESSENTIAL_ITEMS.map((item) => [
      item,
      bad[item] ? { status: 'Not working', remarks: bad[item] } : { status: 'Working' },
    ]),
  )
}

const counts = (entries: Record<string, number>) => entries

// Oldest first; the store keeps newest first.
const seeded: RegisterRecord[] = [
  // ——— Incident ———
  make('incident', 122, KAVITHA, {
    occurredAt: local(122.5),
    level: 'Level 2',
    incidentClass: 'H – Failure of rolling stock',
    subClass: 'H4 – Failure of saloon door mechanism',
    subject: 'Train 118 saloon door failed to close at platform 1',
    timeline: [
      row(122.5, 'Door 3, car 2 of train 118 did not close. Train held at platform 1.'),
      row(122.45, 'TO isolated the door as instructed by OCC; staff posted at the door.'),
      row(122.4, 'Train cleared the platform. Passengers of car 2 moved to other cars at the next station.'),
    ],
    communicatedAt: local(122.48),
    communicatedTo: 'Station Manager, Line 1',
    escalated: 'Yes',
    escalatedAt: local(122.46),
    escalatedTo: 'Rolling Stock duty engineer',
    cause: 'Door obstruction sensor fault (to be confirmed by Rolling Stock).',
    actionInitiated: 'Door isolated; train withdrawn to depot after the trip for inspection.',
    propertyLoss: 'No',
    serviceDelay: 'Yes',
    minorDelay: '4 min, platform 1 UP',
    tripsCancelled: '0',
    passengers: 'About 40 passengers in car 2 asked to move to other cars. No complaints.',
    injuries: 'No',
    police: 'No',
  }),
  make('incident', 50, ARUN, {
    occurredAt: local(50.2),
    level: 'Level 1',
    incidentClass: 'L – Other incidents',
    subClass: 'L2 – Theft and other petty crimes in Metro Railway premises including trains',
    subject: 'Mobile phone theft reported on platform 2',
    timeline: [
      row(50.2, 'Passenger reported phone stolen while boarding at platform 2.'),
      row(50.1, 'CCTV footage checked with security; suspect seen leaving via Entry B.'),
      row(49.8, 'Passenger taken to the police station with a security escort to file a complaint.'),
    ],
    communicatedAt: local(50.15),
    communicatedTo: 'Station Manager, Line 1',
    escalated: 'Yes',
    escalatedAt: local(50.1),
    escalatedTo: 'Security Inspector',
    cause: 'Crowding during peak boarding.',
    actionInitiated: 'Extra security staff posted on platform 2 during evening peak.',
    propertyLoss: 'No',
    serviceDelay: 'No',
    passengers: 'Complainant: adult male passenger (details with the police).',
    injuries: 'No',
    police: 'Yes',
    policeDetails: 'Complaint registered at the local police station; FIR copy awaited.',
  }),
  make('incident', 5, ME, {
    occurredAt: local(7.5),
    level: 'Level 1',
    incidentClass: 'J – Failure of electrical equipment',
    subClass: 'J6 – Failure of lifts and escalators for more than 2 hours',
    subject: 'Lift L2 (Entry A) out of service for more than 2 hours',
    timeline: [
      row(7.5, 'Lift L2 stopped at street level. No one inside.'),
      row(7.4, 'Lift isolated and barricaded; E&M lift technician called.'),
      row(5.2, 'Technician reports controller board fault; spare awaited.'),
    ],
    communicatedAt: local(7.45),
    communicatedTo: 'Station Manager, Line 1',
    escalated: 'Yes',
    escalatedAt: local(5.3),
    escalatedTo: 'E&M duty engineer',
    cause: 'Lift controller board fault.',
    actionInitiated: 'Wheelchair users guided to lift L1 at Entry C with staff assistance.',
    propertyLoss: 'No',
    serviceDelay: 'No',
    passengers: 'None affected. Two wheelchair users helped via Entry C.',
    injuries: 'No',
    police: 'No',
  }),

  // ——— Manual point operation ———
  make('manual-point-operation', 76, ARUN, {
    point: 'P102R',
    startAt: local(77),
    endAt: local(76.4),
    releaseStationPn: 'PN/CEN01/2026/000311',
    releaseOccPn: 'OCC-8841',
    normaliseStationPn: 'PN/CEN01/2026/000312',
    normaliseOccPn: 'OCC-8856',
    observations: [
      row(77, 'OCC asked for manual operation of P102R after point failure indication.'),
      row(76.8, 'Point clamped and padlocked in reverse; confirmed to OCC.'),
      row(76.4, 'Point machine restored by Signalling; clamp removed and point normalised.'),
    ],
    remarks: 'Crank handle and clamp returned to the SCR.',
  }),
  make('manual-point-operation', 20, KAVITHA, {
    point: 'P101N',
    startAt: local(20.6),
    endAt: local(20.1),
    releaseStationPn: 'PN/CEN01/2026/000402',
    releaseOccPn: 'OCC-9012',
    normaliseStationPn: 'PN/CEN01/2026/000405',
    normaliseOccPn: 'OCC-9020',
    observations: [row(20.6, 'Night maintenance: point operated for track inspection vehicle movement.')],
  }),

  // ——— Local traffic regulation ———
  make('local-traffic-regulation', 98, ARUN, {
    at: local(98),
    operatingSystem: 'OC-500',
    controlStatus: 'OC – Offer Control',
    stationPn: 'PN/CEN01/2026/000288',
    exchangePn: 'OCC-8710',
    remarks: 'Offered control to OCC after local route setting for depot movement.',
  }),
  make('local-traffic-regulation', 99, ARUN, {
    at: local(99),
    operatingSystem: 'OC-500',
    controlStatus: 'TC – Take Control',
    stationPn: 'PN/CEN01/2026/000287',
    exchangePn: 'OCC-8706',
    remarks: 'Took control for depot movement as requested by OCC.',
  }),
  make('local-traffic-regulation', 30, KAVITHA, {
    at: local(30),
    operatingSystem: 'Both',
    controlStatus: 'Enforce Take Control',
    stationPn: 'PN/CEN01/2026/000377',
    exchangePn: 'OCC-8990',
    remarks: 'ATS link lost at OCC; control enforced at station until restored.',
  }),

  // ——— Mock drill / events ———
  make('mock-drill', 190, KAVITHA, {
    type: 'Mock Drill',
    department: 'OPERATIONS',
    scenario: 'Man trapped in lift – passenger rescue',
    location: 'Lift L1, Entry C',
    participants: '8',
    startAt: local(190.5),
    endAt: local(190.2),
    description: 'Rescue of a person trapped in lift L1 using the manual rescue procedure.',
    actions: [
      row(190.5, 'Alarm received from lift L1; SC announced drill start.'),
      row(190.4, 'Lift isolated at the controller; manual rescue started by the technician.'),
      row(190.2, 'Person rescued at concourse level. Drill closed.'),
    ],
  }),
  make('mock-drill', 70, ME, {
    type: 'Pep Talk',
    department: 'SAFETY',
    topic: 'Monsoon preparedness: flood barriers and slippery floors',
    location: 'SCR',
    participants: '12',
    startAt: local(70.5),
    endAt: local(70.2),
    description: 'Briefed station staff on flood barrier assembly and caution boards at entries.',
  }),
  make('mock-drill', 26, ARUN, {
    type: 'Mock Drill',
    department: 'OPERATIONS',
    scenario: 'Fire at station – first aid hose reel (FAHR)',
    location: 'Concourse, unpaid side',
    participants: '14',
    startAt: local(26.6),
    endAt: local(26.1),
    description: 'Fire at the ticket counter area; FAHR used, passengers evacuated through Entry A.',
  }),

  // ——— Passenger assistance ———
  make('passenger-assistance', 60, KAVITHA, {
    assistedAt: local(60),
    shift: 'A',
    type: 'Wheelchair person',
    movement: counts({ 'Male|Entry': 2, 'Female|Exit': 1 }),
  }),
  make('passenger-assistance', 44, ARUN, {
    assistedAt: local(44),
    shift: 'B',
    type: 'First aid provided',
    people: counts({ 'Female|People': 1 }),
    remarks: 'Passenger felt dizzy at the concourse; given water and rest. Left on her own.',
  }),
  make('passenger-assistance', 26, ME, {
    assistedAt: local(26),
    shift: 'B',
    type: 'Visually impaired',
    movement: counts({ 'Male|Entry': 1, 'Male|Interchange': 1 }),
    remarks: 'Escorted to platform 2 and handed over to the TO.',
  }),
  make('passenger-assistance', 20, ARUN, {
    assistedAt: local(20),
    shift: 'B',
    type: 'Separated person',
    people: counts({ 'Male|People': 1 }),
    remarks: 'Child separated from parent at Entry B; reunited within 10 minutes.',
  }),
  make('passenger-assistance', 3, ME, {
    assistedAt: local(3),
    shift: 'A',
    type: 'Wheelchair person',
    movement: counts({ 'Female|Entry': 1, 'Male|Exit': 2 }),
  }),

  // ——— Essential equipment ———
  make('essential-equipment', 16 * 24, KAVITHA, { checkedAt: local(16 * 24), items: checks() }),
  make('essential-equipment', 9 * 24, ARUN, {
    checkedAt: local(9 * 24),
    items: checks({ Megaphone: 'Battery weak; replaced from store.' }),
  }),
  make('essential-equipment', 2 * 24, ME, {
    checkedAt: local(2 * 24),
    items: checks({ 'Tri colour torch': 'Green lens cracked. Replacement requested.' }),
    remarks: 'Other items checked and in place.',
  }),

  // ——— Key register ———
  make(
    'key-register',
    52,
    ARUN,
    {
      room: 'Signalling equipment room · K-101',
      issuedAt: local(52),
      issuedTo: 'S. Prakash',
      issuedToEmpNo: 'EPIC-44120',
      phone: '98400 12345',
      organisation: 'ALSTOM',
      department: 'SIGNALING',
      reason: 'Point machine inspection (PTW CEN01-L-00041).',
      returnedAt: local(49.5),
      returnedBy: 'S. Prakash',
      returnedByEmpNo: 'EPIC-44120',
    },
    {
      state: 'returned',
      history: [{ at: at(49.5).toISOString(), by: ARUN.name, text: 'Key returned. Status: Returned.' }],
    },
  ),
  make(
    'key-register',
    28,
    KAVITHA,
    {
      room: 'AFC room · K-110',
      issuedAt: local(28),
      issuedTo: 'V. Deepa',
      issuedToEmpNo: 'EMP-30871',
      phone: '94440 67890',
      organisation: 'CMRL',
      department: 'AFC',
      reason: 'Gate 4 card reader replacement.',
      returnedAt: local(26),
      returnedBy: 'V. Deepa',
      returnedByEmpNo: 'EMP-30871',
    },
    {
      state: 'returned',
      history: [{ at: at(26).toISOString(), by: KAVITHA.name, text: 'Key returned. Status: Returned.' }],
    },
  ),
  make('key-register', 6, ME, {
    room: 'UPS room · K-205',
    issuedAt: local(6),
    issuedTo: 'K. Senthil',
    issuedToEmpNo: 'EPIC-51002',
    phone: '90030 44556',
    organisation: 'Blue Star',
    department: 'ELECTRICAL & MECHANICAL',
    reason: 'Quarterly UPS battery maintenance.',
  }),
  make('key-register', 1.5, ME, {
    room: 'Pump room · K-214',
    issuedAt: local(1.5),
    issuedTo: 'A. Ravi',
    issuedToEmpNo: 'EMP-31540',
    phone: '98765 11223',
    organisation: 'CMRL',
    department: 'CIVIL',
    reason: 'Sump pump check before rain.',
  }),

  // ——— Parking ———
  make(
    'parking',
    9 * 24,
    ARUN,
    {
      vehicleNo: 'TN 07 CK 4410',
      vehicleType: 'Four-Wheeler',
      entryAt: local(9 * 24),
      location: 'Bay 3, Entry B',
      exitAt: local(6 * 24),
      amountCollected: '450',
      receiptNo: 'PRK-2026-0192',
    },
    {
      state: 'exited',
      history: [
        { at: at(6 * 24).toISOString(), by: KAVITHA.name, text: 'Vehicle exited and charges settled. Status: Exited.' },
      ],
    },
  ),
  make('parking', 4 * 24, KAVITHA, {
    vehicleNo: 'TN 09 BX 2231',
    vehicleType: 'Two-Wheeler',
    entryAt: local(4 * 24),
    location: 'Two-wheeler bay, Entry A',
    remarks: 'Owner travelling out of town; informed at entry.',
  }),
  make('parking', 30, ME, {
    vehicleNo: 'TN 22 DA 7788',
    vehicleType: 'E-Four-Wheeler',
    entryAt: local(30),
    location: 'Bay 1, Entry B',
  }),

  // ——— PD management ———
  make('pd-inspection', 150, KAVITHA, {
    shop: 'Madras Coffee House',
    inspectedAt: local(150),
    inspectionPoints: 'Hygiene, fire extinguisher validity, display of licence, area within the allotted boundary.',
    penalty: 'No',
  }),
  make('pd-inspection', 72, ARUN, {
    shop: 'Metro Books & Gifts',
    inspectedAt: local(72),
    inspectionPoints: 'Display stand extends into the passenger walkway by about 1 m.',
    penalty: 'Yes',
    penaltyAmount: '2000',
    penaltyRemarks: 'Encroachment beyond the allotted area (second notice).',
    remarks: 'Licence expired on 30/06/2026; informed PD department.',
  }),
  make('pd-inspection', 10, ME, {
    shop: 'Quick Mart ATM kiosk',
    inspectedAt: local(10),
    inspectionPoints: 'Kiosk clean, signage fine, no encroachment.',
    penalty: 'No',
  }),
]

export const SEED_RECORDS: RegisterRecord[] = seeded.sort((a, b) => b.raisedAt.localeCompare(a.raisedAt))
