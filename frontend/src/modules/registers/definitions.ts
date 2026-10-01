import {
  Accessibility,
  ArrowLeftRight,
  Car,
  ClipboardList,
  KeyRound,
  ListChecks,
  ShieldAlert,
  Siren,
  Store,
  TriangleAlert,
  Waypoints,
  type LucideIcon,
} from 'lucide-react'
import { SHIFT_ORDER } from '@/modules/station-diary/constants'
import {
  DEPARTMENTS,
  ESSENTIAL_ITEMS,
  findRoom,
  findShop,
  INCIDENT_CLASS_OPTIONS,
  MOCK_DRILL_SCENARIOS,
  ORGANISATIONS,
  POINT_NUMBERS,
  ROOMS,
  roomLabel,
  SHOPS,
  subClassesOf,
  VEHICLE_TYPES,
} from './data/masters'
import { checklistOf, countTotal, formatMinutes, formatWhen, minutesBetween, str, toLocalDateTime } from './fields'
import type {
  RegisterCategory,
  RegisterColumn,
  RegisterDefinition,
  RegisterField,
  RegisterRecord,
  Values,
  Workflow,
  WorkflowState,
} from './types'

export const CATEGORIES: Record<RegisterCategory, { label: string; icon: LucideIcon; description: string }> = {
  operations: {
    label: 'Train operations & safety',
    icon: ShieldAlert,
    description: 'Incidents, point operations, control handover and drills',
  },
  services: {
    label: 'Station services',
    icon: ClipboardList,
    description: 'Passengers, equipment, keys, parking and shops',
  },
}

export const CATEGORY_ORDER: RegisterCategory[] = ['operations', 'services']

/** Registers without a workflow are logs: a record is complete once it is saved. */
const RECORDED: WorkflowState = { label: 'Recorded', tone: 'neutral', done: true }

export function stateOf(register: RegisterDefinition, state: string): WorkflowState {
  return register.workflow?.states[state] ?? RECORDED
}

export const isOpen = (register: RegisterDefinition, record: RegisterRecord) => !stateOf(register, record.state).done

// ——— Field helpers ———

const now = ({ now }: { now: Date }) => toLocalDateTime(now)

const when = (key: string, label: string, required = true): RegisterField => ({
  key,
  label,
  type: 'datetime',
  required,
  initial: now,
})

const shift: RegisterField = {
  key: 'shift',
  label: 'Shift',
  type: 'choice',
  options: SHIFT_ORDER,
  required: true,
  initial: ({ shift }) => shift,
}

const remarks: RegisterField = { key: 'remarks', label: 'Remarks', type: 'textarea' }
const photos: RegisterField = { key: 'photos', label: 'Photos', type: 'photos' }

const duration = (key: string, start: string, end: string): RegisterField => ({
  key,
  label: 'Time taken',
  type: 'computed',
  compute: (v) => {
    const m = minutesBetween(str(v, start), str(v, end))
    return m === undefined ? '' : formatMinutes(m)
  },
})

const endAfterStart =
  (start: string, end: string, message: string) =>
  (v: Values): { field: string; message: string } | undefined =>
    str(v, start) && str(v, end) && minutesBetween(str(v, start), str(v, end)) === undefined
      ? { field: end, message }
      : undefined

const col = (
  id: string,
  label: string,
  value: RegisterColumn['value'],
  sub?: RegisterColumn['sub'],
): RegisterColumn => ({ id, label, value, sub })

const v = (r: RegisterRecord, key: string) => str(r.values, key)

// ——— Workflows ———

const KEY_WORKFLOW: Workflow = {
  initial: 'issued',
  states: {
    issued: { label: 'Issued', tone: 'warning' },
    returned: { label: 'Returned', tone: 'success', done: true },
  },
  actions: [
    {
      id: 'return',
      label: 'Record key return',
      from: ['issued'],
      to: 'returned',
      logText: 'Key returned.',
      prefill: (v) => ({ returnedBy: str(v, 'issuedTo'), returnedByEmpNo: str(v, 'issuedToEmpNo') }),
      fields: [
        when('returnedAt', 'Returned at'),
        { key: 'returnedBy', label: 'Returned by', type: 'text', required: true },
        { key: 'returnedByEmpNo', label: 'Employee / EPIC no.', type: 'text', required: true },
      ],
    },
  ],
}

/** Whole days a vehicle has been parked, counting a part day as a day. */
function daysParked(entry: string, exit: string): number | undefined {
  const m = minutesBetween(entry, exit)
  return m === undefined ? undefined : Math.max(1, Math.ceil(m / 1440))
}

const PARKING_WORKFLOW: Workflow = {
  initial: 'parked',
  states: {
    parked: { label: 'Parked', tone: 'warning' },
    exited: { label: 'Exited', tone: 'success', done: true },
  },
  actions: [
    {
      id: 'exit',
      label: 'Record exit',
      from: ['parked'],
      to: 'exited',
      logText: 'Vehicle exited and charges settled.',
      fields: [
        when('exitAt', 'Exit at'),
        {
          key: 'daysParked',
          label: 'Days parked',
          type: 'computed',
          compute: (v) => String(daysParked(str(v, 'entryAt'), str(v, 'exitAt')) ?? ''),
        },
        { key: 'amountCollected', label: 'Amount collected', type: 'number', unit: '₹', min: 0, required: true },
        { key: 'receiptNo', label: 'Receipt no.', type: 'text', inferred: true },
      ],
    },
  ],
}

// ——— Registers ———

const defaultRef = ({ stationCode, year, seq }: { stationCode: string; year: number; seq: number }, code: string) =>
  `${stationCode}/${code}/${year}/${String(seq).padStart(4, '0')}`

export const REGISTERS: RegisterDefinition[] = [
  {
    id: 'incident',
    label: 'Incident Register',
    icon: TriangleAlert,
    category: 'operations',
    description: 'Incidents by national class and sub-class, with timeline, escalation and impact.',
    code: 'INC',
    retention: 'Retained 10 years',
    statutory: true,
    form: { title: 'Incident Report', number: 'CMRL/OPER/SO/R4', revision: 'Rev 00', date: '' },
    reference: ({ stationCode, seq }) => `CMRL/OPER/SO/IN/${stationCode}/${String(seq).padStart(4, '0')}`,
    titleField: 'subject',
    dateField: 'occurredAt',
    notesField: 'timeline',
    sections: [
      {
        title: 'Incident details',
        fields: [
          when('occurredAt', 'Date & time of incident'),
          { key: 'level', label: 'Level of incident', type: 'choice', options: ['Level 1', 'Level 2'], required: true },
          { key: 'incidentClass', label: 'Class', type: 'select', options: INCIDENT_CLASS_OPTIONS, required: true },
          {
            key: 'subClass',
            label: 'Sub-class',
            type: 'select',
            required: true,
            options: (v) => subClassesOf(str(v, 'incidentClass')),
            hint: 'Choose the class first.',
          },
          { key: 'subject', label: 'Subject', type: 'text', required: true, wide: true },
        ],
      },
      {
        title: 'Incident timeline',
        fields: [
          {
            key: 'timeline',
            label: 'What happened and the action taken',
            type: 'timeline',
            required: true,
            hint: 'One row per step, in order.',
          },
        ],
      },
      {
        title: 'Communication & escalation',
        fields: [
          when('communicatedAt', 'Communicated to reporting officer at'),
          { key: 'communicatedTo', label: 'Reporting officer', type: 'text', required: true },
          {
            key: 'escalated',
            label: 'Escalated to the concerned department?',
            type: 'yesno',
            required: true,
            wide: true,
          },
          { ...when('escalatedAt', 'Escalated at'), when: { field: 'escalated', is: 'Yes' } },
          {
            key: 'escalatedTo',
            label: 'Escalated to (officer)',
            type: 'text',
            required: true,
            when: { field: 'escalated', is: 'Yes' },
          },
        ],
      },
      {
        title: 'Cause & action',
        fields: [
          { key: 'cause', label: 'Prima facie cause', type: 'textarea', required: true },
          { key: 'actionInitiated', label: 'Action initiated', type: 'textarea', required: true },
        ],
      },
      {
        title: 'Impact',
        fields: [
          { key: 'propertyLoss', label: 'Loss of Metro Railway property?', type: 'yesno', required: true },
          { key: 'serviceDelay', label: 'Delay in Metro services?', type: 'yesno', required: true },
          {
            key: 'damages',
            label: 'Details of damages',
            type: 'textarea',
            required: true,
            when: { field: 'propertyLoss', is: 'Yes' },
          },
          {
            key: 'minorDelay',
            label: 'Minor delay',
            type: 'text',
            placeholder: 'e.g. 4 min, 14:05–14:09, SAP–SME',
            hint: 'Minutes, from–to and section.',
            when: { field: 'serviceDelay', is: 'Yes' },
          },
          {
            key: 'majorDelay',
            label: 'Major delay',
            type: 'text',
            placeholder: 'e.g. 22 min, 14:05–14:27, SAP–SME',
            hint: 'Minutes, from–to and section.',
            when: { field: 'serviceDelay', is: 'Yes' },
          },
          {
            key: 'tripsCancelled',
            label: 'Trips cancelled / suspended',
            type: 'number',
            min: 0,
            required: true,
            when: { field: 'serviceDelay', is: 'Yes' },
          },
        ],
      },
      {
        title: 'People & response',
        fields: [
          {
            key: 'passengers',
            label: 'Passenger details',
            type: 'textarea',
            required: true,
            placeholder: 'None, or who was affected and how',
          },
          { key: 'injuries', label: 'Any injuries?', type: 'yesno', required: true, initial: () => 'No' },
          { key: 'police', label: 'Police / ambulance involved?', type: 'yesno', required: true, initial: () => 'No' },
          {
            key: 'injuryDetails',
            label: 'Injury details',
            type: 'textarea',
            required: true,
            when: { field: 'injuries', is: 'Yes' },
          },
          {
            key: 'policeDetails',
            label: 'Police / ambulance details',
            type: 'textarea',
            required: true,
            when: { field: 'police', is: 'Yes' },
          },
          photos,
        ],
      },
    ],
    columns: [
      col(
        'class',
        'Class',
        (r) => v(r, 'subClass').split(' ')[0] || v(r, 'incidentClass').split(' ')[0],
        (r) => v(r, 'level'),
      ),
      'subject',
      col('impact', 'Impact', (r) =>
        [
          v(r, 'injuries') === 'Yes' && 'Injuries',
          v(r, 'police') === 'Yes' && 'Police / ambulance',
          v(r, 'serviceDelay') === 'Yes' && 'Service delay',
          v(r, 'propertyLoss') === 'Yes' && 'Property loss',
        ]
          .filter(Boolean)
          .join(', '),
      ),
    ],
    filters: ['incidentClass', 'level'],
    kpis: [
      { id: 'all', label: 'Total incidents' },
      { id: 'l1', label: 'Level 1', match: (r) => v(r, 'level') === 'Level 1' },
      { id: 'l2', label: 'Level 2', match: (r) => v(r, 'level') === 'Level 2', tone: 'warning' },
      { id: 'inj', label: 'Injuries', match: (r) => v(r, 'injuries') === 'Yes', tone: 'danger' },
      { id: 'pol', label: 'Police / ambulance', match: (r) => v(r, 'police') === 'Yes' },
    ],
    report: {
      header: { formRef: 'CMRL/OPER/SO/R4', revision: 'Rev 00', orientation: 'landscape' },
      defaultHeader: { subtitle: 'Incident Register', department: 'Operations & Maintenance' },
    },
  },

  {
    id: 'manual-point-operation',
    label: 'Manual Point Operation',
    icon: Waypoints,
    category: 'operations',
    description: 'Points operated by hand, with the private numbers exchanged with OCC.',
    code: 'MPO',
    retention: 'Retained 5 years',
    statutory: true,
    form: {
      title: 'Manual Point Operation Report',
      number: 'CMRL/OPER/SO/F-32',
      revision: 'Rev 02',
      date: '01/04/2026',
    },
    titleField: 'point',
    dateField: 'startAt',
    notesField: 'observations',
    sections: [
      {
        title: 'Point',
        fields: [
          {
            key: 'point',
            label: 'Point no.',
            type: 'select',
            options: POINT_NUMBERS.map((p) => p.point),
            required: true,
          },
          {
            key: 'chk',
            label: 'CHK',
            type: 'computed',
            compute: (v) => POINT_NUMBERS.find((p) => p.point === str(v, 'point'))?.chk ?? '',
          },
        ],
      },
      {
        title: 'Release and normalisation',
        fields: [
          when('startAt', 'Released at'),
          { ...when('endAt', 'Normalised at'), initial: undefined },
          { key: 'releaseStationPn', label: 'Release · station PN', type: 'pn', required: true },
          { key: 'releaseOccPn', label: 'Release · OCC PN', type: 'text', required: true },
          { key: 'normaliseStationPn', label: 'Normalise · station PN', type: 'pn', required: true },
          { key: 'normaliseOccPn', label: 'Normalise · OCC PN', type: 'text', required: true },
          duration('timeTaken', 'startAt', 'endAt'),
        ],
      },
      {
        title: 'Observations',
        fields: [{ key: 'observations', label: 'Observation timeline', type: 'timeline' }, photos, remarks],
      },
    ],
    validate: endAfterStart('startAt', 'endAt', 'Normalised at must be after Released at.'),
    columns: [
      col(
        'point',
        'Point · CHK',
        (r) => v(r, 'point'),
        (r) => v(r, 'chk'),
      ),
      col('release', 'Release PN (stn / OCC)', (r) => `${v(r, 'releaseStationPn')} / ${v(r, 'releaseOccPn')}`),
      col('normalise', 'Normalise PN (stn / OCC)', (r) => `${v(r, 'normaliseStationPn')} / ${v(r, 'normaliseOccPn')}`),
      col(
        'taken',
        'Time taken',
        (r) => v(r, 'timeTaken'),
        (r) => `to ${formatWhen(v(r, 'endAt'))}`,
      ),
    ],
    filters: ['point'],
    report: {
      header: { orientation: 'landscape' },
      defaultHeader: { subtitle: 'Manual Point Operation Register', department: 'Operations & Maintenance' },
    },
  },

  {
    id: 'local-traffic-regulation',
    label: 'Local Traffic Regulation',
    icon: ArrowLeftRight,
    category: 'operations',
    description: 'Control of the station signalling passing between OCC and the station.',
    code: 'LTR',
    retention: 'Retained 5 years',
    statutory: true,
    titleField: 'controlStatus',
    dateField: 'at',
    notesField: 'remarks',
    sections: [
      {
        title: 'Control handover',
        fields: [
          when('at', 'Date & time'),
          {
            key: 'operatingSystem',
            label: 'Operating system',
            type: 'choice',
            options: ['OC-500', 'OC-111', 'Both'],
            required: true,
          },
          {
            key: 'controlStatus',
            label: 'Control status',
            type: 'choice',
            options: ['OC – Offer Control', 'TC – Take Control', 'Enforce Take Control'],
            required: true,
            wide: true,
          },
          { key: 'stationPn', label: 'Station PN', type: 'pn', required: true },
          { key: 'exchangePn', label: 'Exchanged PN (OCC)', type: 'text', required: true },
          remarks,
        ],
      },
    ],
    columns: [
      'controlStatus',
      'operatingSystem',
      col('pn', 'PN (stn / OCC)', (r) => `${v(r, 'stationPn')} / ${v(r, 'exchangePn')}`),
      'remarks',
    ],
    filters: ['controlStatus', 'operatingSystem'],
    kpis: [
      { id: 'all', label: 'Total operations' },
      { id: 'oc', label: 'Offer Control', match: (r) => v(r, 'controlStatus').startsWith('OC') },
      { id: 'tc', label: 'Take Control', match: (r) => v(r, 'controlStatus').startsWith('TC') },
      {
        id: 'etc',
        label: 'Enforce Take Control',
        match: (r) => v(r, 'controlStatus').startsWith('Enforce'),
        tone: 'warning',
      },
    ],
    report: {
      defaultHeader: { subtitle: 'Local Traffic Regulation Register', department: 'Operations & Maintenance' },
    },
  },

  {
    id: 'mock-drill',
    label: 'Mock Drill / Events',
    icon: Siren,
    category: 'operations',
    description: 'Mock drills, events and pep talks held at the station.',
    code: 'MDR',
    retention: 'Retained 5 years',
    statutory: true,
    form: { title: 'Mock Drill Report', number: 'CMRL/OPER/SO/F-28', revision: 'Rev 00', date: '01/09/2022' },
    titleField: 'title',
    dateField: 'startAt',
    notesField: 'description',
    sections: [
      {
        title: 'Basic information',
        fields: [
          {
            key: 'type',
            label: 'Type',
            type: 'choice',
            options: ['Mock Drill', 'Event', 'Pep Talk'],
            required: true,
            initial: () => 'Mock Drill',
          },
          {
            key: 'department',
            label: 'Department',
            type: 'select',
            options: DEPARTMENTS,
            required: true,
            initial: () => 'OPERATIONS',
          },
          {
            key: 'scenario',
            label: 'Scenario',
            type: 'select',
            options: MOCK_DRILL_SCENARIOS,
            required: true,
            wide: true,
            when: { field: 'type', is: 'Mock Drill' },
          },
          {
            key: 'topic',
            label: 'Title',
            type: 'text',
            required: true,
            wide: true,
            when: { field: 'type', is: ['Event', 'Pep Talk'] },
          },
          {
            key: 'title',
            label: 'Title',
            type: 'computed',
            hidden: true,
            compute: (v) => (str(v, 'type') === 'Mock Drill' ? str(v, 'scenario') : str(v, 'topic')),
          },
        ],
      },
      {
        title: 'Details',
        fields: [
          { key: 'location', label: 'Location', type: 'text', required: true },
          { key: 'participants', label: 'Participants', type: 'number', min: 1, required: true },
          when('startAt', 'Started at'),
          { ...when('endAt', 'Ended at'), initial: undefined },
          duration('timeTaken', 'startAt', 'endAt'),
          { key: 'description', label: 'Brief description', type: 'textarea', required: true },
          { key: 'actions', label: 'Action timeline', type: 'timeline' },
          photos,
        ],
      },
    ],
    validate: endAfterStart('startAt', 'endAt', 'Ended at must be after Started at.'),
    columns: [
      'type',
      'title',
      col(
        'where',
        'Location',
        (r) => v(r, 'location'),
        (r) => `${v(r, 'participants')} participants`,
      ),
      'timeTaken',
    ],
    filters: ['type', 'department'],
    kpis: [
      { id: 'all', label: 'Total' },
      { id: 'md', label: 'Mock drills', match: (r) => v(r, 'type') === 'Mock Drill' },
      { id: 'ev', label: 'Events', match: (r) => v(r, 'type') === 'Event' },
      { id: 'pt', label: 'Pep talks', match: (r) => v(r, 'type') === 'Pep Talk' },
    ],
    report: {
      defaultHeader: { subtitle: 'Mock Drill / Event / Pep Talk Register', department: 'Operations & Maintenance' },
    },
  },

  {
    id: 'passenger-assistance',
    label: 'Passenger Assistance',
    icon: Accessibility,
    category: 'services',
    description: 'Wheelchair users, visually impaired passengers, first aid and separated persons helped.',
    code: 'PAS',
    retention: 'Retained 3 years',
    statutory: true,
    form: {
      title: 'Passenger Assistance Report',
      number: 'CMRL/OPER/SO/F-33',
      revision: 'Rev 02',
      date: '01/04/2026',
    },
    titleField: 'type',
    dateField: 'assistedAt',
    notesField: 'remarks',
    sections: [
      {
        title: 'Basic information',
        fields: [
          when('assistedAt', 'Date & time'),
          shift,
          {
            key: 'type',
            label: 'Type of assistance',
            type: 'choice',
            options: ['Wheelchair person', 'Visually impaired', 'First aid provided', 'Separated person'],
            required: true,
            wide: true,
          },
        ],
      },
      {
        title: 'People assisted',
        fields: [
          {
            key: 'movement',
            label: 'Number of people',
            type: 'counts',
            rows: ['Male', 'Female', 'Transgender'],
            cols: ['Entry', 'Exit', 'Interchange'],
            required: true,
            when: { field: 'type', is: ['Wheelchair person', 'Visually impaired'] },
          },
          {
            key: 'people',
            label: 'Number of people',
            type: 'counts',
            rows: ['Male', 'Female', 'Transgender'],
            cols: ['People'],
            required: true,
            when: { field: 'type', is: ['First aid provided', 'Separated person'] },
          },
          remarks,
        ],
      },
    ],
    columns: ['shift', 'type', col('total', 'People', (r) => String(assisted(r))), 'remarks'],
    filters: ['type', 'shift'],
    kpis: [
      { id: 'all', label: 'Total assisted', count: (r) => assisted(r) },
      { id: 'wc', label: 'Wheelchair', match: (r) => v(r, 'type') === 'Wheelchair person', count: (r) => assisted(r) },
      {
        id: 'vi',
        label: 'Visually impaired',
        match: (r) => v(r, 'type') === 'Visually impaired',
        count: (r) => assisted(r),
      },
      { id: 'fa', label: 'First aid', match: (r) => v(r, 'type') === 'First aid provided', count: (r) => assisted(r) },
      { id: 'sp', label: 'Separated', match: (r) => v(r, 'type') === 'Separated person', count: (r) => assisted(r) },
    ],
    report: {
      header: { formRef: 'CMRL/OPER/SO/F-33', revision: 'Rev 02', issueDate: '2026-04-01' },
      defaultHeader: {
        subtitle: 'Differently Abled & Medical Assistance Register',
        department: 'Operations & Maintenance',
      },
    },
  },

  {
    id: 'essential-equipment',
    label: 'Essential Equipment',
    icon: ListChecks,
    category: 'services',
    description: 'Weekly check that emergency and safety equipment is present and working.',
    code: 'EEQ',
    retention: 'Retained 3 years',
    statutory: true,
    titleField: 'week',
    dateField: 'checkedAt',
    notesField: 'remarks',
    sections: [
      {
        title: 'Weekly check',
        fields: [
          when('checkedAt', 'Checked on'),
          {
            key: 'week',
            label: 'Week',
            type: 'computed',
            compute: (v) => weekLabel(str(v, 'checkedAt')),
          },
          {
            key: 'items',
            label: 'Equipment',
            type: 'checklist',
            items: () => ESSENTIAL_ITEMS,
            hint: 'A photo is needed for each item that is not working.',
          },
          remarks,
        ],
      },
    ],
    columns: [
      'week',
      col(
        'result',
        'Result',
        (r) => {
          const bad = notWorking(r)
          return bad.length ? `${bad.length} not working` : 'All working'
        },
        (r) => notWorking(r).join(', ') || undefined,
      ),
      'remarks',
    ],
    kpis: [
      { id: 'all', label: 'Weekly checks' },
      { id: 'bad', label: 'Checks with faults', match: (r) => notWorking(r).length > 0, tone: 'danger' },
    ],
    attention: (records, today) => {
      const latest = records[0]
      if (!latest || today.getTime() - new Date(str(latest.values, 'checkedAt')).getTime() > 7 * 86_400_000)
        return 'Weekly check due'
      const bad = notWorking(latest).length
      return bad ? `${bad} item${bad === 1 ? '' : 's'} not working` : undefined
    },
    report: { defaultHeader: { subtitle: 'Essential Equipment Register', department: 'Operations & Maintenance' } },
  },

  {
    id: 'key-register',
    label: 'Key Register',
    icon: KeyRound,
    category: 'services',
    description: 'Issue and return of station room keys.',
    code: 'KEY',
    retention: 'Retained 3 years',
    statutory: false,
    titleField: 'room',
    dateField: 'issuedAt',
    notesField: 'reason',
    workflow: KEY_WORKFLOW,
    sections: [
      {
        title: 'Key',
        fields: [
          {
            key: 'room',
            label: 'Room · key no.',
            type: 'select',
            options: ROOMS.map(roomLabel),
            required: true,
            wide: true,
          },
          {
            key: 'keyHive',
            label: 'Key hive',
            type: 'computed',
            compute: (v) => findRoom(str(v, 'room'))?.keyHive ?? '',
          },
          {
            key: 'location',
            label: 'Location',
            type: 'computed',
            compute: (v) => findRoom(str(v, 'room'))?.location ?? '',
          },
        ],
      },
      {
        title: 'Issued to',
        fields: [
          when('issuedAt', 'Issued at'),
          { key: 'issuedTo', label: 'Name', type: 'text', required: true },
          { key: 'issuedToEmpNo', label: 'Employee / EPIC no.', type: 'text', required: true },
          { key: 'phone', label: 'Mobile', type: 'text', required: true },
          { key: 'organisation', label: 'Organisation', type: 'select', options: ORGANISATIONS, required: true },
          {
            key: 'otherOrganisation',
            label: 'Organisation name',
            type: 'text',
            required: true,
            when: { field: 'organisation', is: 'Other' },
          },
          { key: 'department', label: 'Department', type: 'select', options: DEPARTMENTS, required: true },
          { key: 'reason', label: 'Reason / work', type: 'textarea', required: true },
        ],
      },
    ],
    columns: [
      col(
        'key',
        'Room · key',
        (r) => v(r, 'room'),
        (r) => v(r, 'keyHive'),
      ),
      col(
        'to',
        'Issued to',
        (r) => v(r, 'issuedTo'),
        (r) => `${v(r, 'issuedToEmpNo')} · ${v(r, 'otherOrganisation') || v(r, 'organisation')}`,
      ),
      'reason',
      col(
        'returned',
        'Returned',
        (r) => formatWhen(v(r, 'returnedAt')),
        (r) => v(r, 'returnedBy') || undefined,
      ),
    ],
    filters: ['organisation'],
    kpis: [
      { id: 'all', label: 'Total entries' },
      { id: 'out', label: 'Not returned', match: (r) => r.state === 'issued', tone: 'warning' },
      { id: 'back', label: 'Returned', match: (r) => r.state === 'returned', tone: 'success' },
    ],
    attention: (records) => {
      const out = records.filter((r) => r.state === 'issued').length
      return out ? `${out} key${out === 1 ? '' : 's'} not returned` : undefined
    },
    report: {
      header: { orientation: 'landscape' },
      defaultHeader: { subtitle: 'Key Register', department: 'Operations & Maintenance' },
    },
  },

  {
    id: 'parking',
    label: 'Parking (Long Halt)',
    icon: Car,
    category: 'services',
    description: 'Vehicles left in station parking for long periods, from entry to exit and settlement.',
    code: 'PRK',
    retention: 'Retained 3 years',
    statutory: false,
    titleField: 'vehicleNo',
    dateField: 'entryAt',
    notesField: 'remarks',
    workflow: PARKING_WORKFLOW,
    sections: [
      {
        title: 'Vehicle entry',
        fields: [
          { key: 'vehicleNo', label: 'Vehicle no.', type: 'text', required: true, placeholder: 'TN 09 AB 1234' },
          { key: 'vehicleType', label: 'Vehicle type', type: 'select', options: VEHICLE_TYPES, required: true },
          when('entryAt', 'Entry at'),
          {
            key: 'location',
            label: 'Parking location',
            type: 'text',
            required: true,
            placeholder: 'e.g. Bay 2, Entry B',
          },
          remarks,
        ],
      },
    ],
    columns: [
      col(
        'vehicle',
        'Vehicle',
        (r) => v(r, 'vehicleNo'),
        (r) => v(r, 'vehicleType'),
      ),
      'location',
      col('days', 'Days parked', (r) =>
        String(v(r, 'daysParked') || (daysParked(v(r, 'entryAt'), toLocalDateTime(new Date())) ?? '')),
      ),
      col(
        'exit',
        'Exit',
        (r) => formatWhen(v(r, 'exitAt')),
        (r) => (v(r, 'amountCollected') ? `₹${v(r, 'amountCollected')}` : undefined),
      ),
    ],
    filters: ['vehicleType'],
    kpis: [
      { id: 'all', label: 'Total entries' },
      { id: 'in', label: 'Still parked', match: (r) => r.state === 'parked', tone: 'warning' },
      { id: 'out', label: 'Exited', match: (r) => r.state === 'exited', tone: 'success' },
    ],
    attention: (records) => {
      const n = records.filter((r) => r.state === 'parked').length
      return n ? `${n} vehicle${n === 1 ? '' : 's'} still parked` : undefined
    },
    report: { defaultHeader: { subtitle: 'Long Halt Vehicle Register', department: 'Operations & Maintenance' } },
  },

  {
    id: 'pd-inspection',
    label: 'Station PD Management',
    icon: Store,
    category: 'services',
    description: 'Inspections of Property Development shops and licensees, with penalties.',
    code: 'PDM',
    retention: 'Retained 5 years',
    statutory: false,
    titleField: 'shop',
    dateField: 'inspectedAt',
    notesField: 'inspectionPoints',
    sections: [
      {
        title: 'Shop',
        fields: [
          { key: 'shop', label: 'Shop', type: 'select', options: SHOPS.map((s) => s.shop), required: true },
          { key: 'pdCode', label: 'PD code', type: 'computed', compute: (v) => findShop(str(v, 'shop'))?.pdCode ?? '' },
          {
            key: 'licensee',
            label: 'Licensee',
            type: 'computed',
            compute: (v) => findShop(str(v, 'shop'))?.licensee ?? '',
          },
          {
            key: 'loaRef',
            label: 'LOA ref.',
            type: 'computed',
            compute: (v) => findShop(str(v, 'shop'))?.loaRef ?? '',
          },
          {
            key: 'shopLocation',
            label: 'Location · area',
            type: 'computed',
            compute: (v) => {
              const s = findShop(str(v, 'shop'))
              return s ? `${s.location} · ${s.area} sq ft` : ''
            },
          },
          {
            key: 'tenure',
            label: 'Licence tenure',
            type: 'computed',
            compute: (v) => {
              const s = findShop(str(v, 'shop'))
              if (!s) return ''
              const on = str(v, 'inspectedAt').slice(0, 10)
              const status = on && on > s.tenureTo ? 'Expired' : 'Active'
              return `${formatWhen(s.tenureFrom)} – ${formatWhen(s.tenureTo)} (${status})`
            },
          },
        ],
      },
      {
        title: 'Inspection',
        fields: [
          when('inspectedAt', 'Inspected at'),
          { key: 'inspectionPoints', label: 'Inspection points', type: 'textarea', required: true },
          { key: 'penalty', label: 'Penalty imposed?', type: 'yesno', required: true, initial: () => 'No' },
          {
            key: 'penaltyAmount',
            label: 'Penalty amount',
            type: 'number',
            unit: '₹',
            min: 1,
            required: true,
            when: { field: 'penalty', is: 'Yes' },
          },
          {
            key: 'penaltyRemarks',
            label: 'Reason for penalty',
            type: 'textarea',
            required: true,
            when: { field: 'penalty', is: 'Yes' },
          },
          remarks,
          photos,
        ],
      },
    ],
    columns: [
      col(
        'shop',
        'Shop',
        (r) => v(r, 'shop'),
        (r) => `${v(r, 'pdCode')} · ${v(r, 'licensee')}`,
      ),
      'inspectionPoints',
      col('penalty', 'Penalty', (r) => (v(r, 'penalty') === 'Yes' ? `₹${v(r, 'penaltyAmount')}` : 'No')),
      col('licence', 'Licence', (r) => (v(r, 'tenure').includes('Expired') ? 'Expired' : 'Active')),
    ],
    filters: ['shop', 'penalty'],
    kpis: [
      { id: 'all', label: 'Inspections' },
      { id: 'pen', label: 'With penalties', match: (r) => v(r, 'penalty') === 'Yes', tone: 'warning' },
      { id: 'exp', label: 'Expired licences', match: (r) => v(r, 'tenure').includes('Expired'), tone: 'danger' },
    ],
    report: {
      header: { orientation: 'landscape' },
      defaultHeader: { subtitle: 'Station PD Management Register', department: 'Property Development' },
    },
  },
]

function assisted(r: RegisterRecord): number {
  return countTotal(r.values, 'movement') + countTotal(r.values, 'people')
}

function notWorking(r: RegisterRecord): string[] {
  return Object.entries(checklistOf(r.values, 'items'))
    .filter(([, c]) => c.status === 'Not working')
    .map(([item]) => item)
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-09-24T08:10" → "Week 4 · Sep 2026" (weeks start on the 1st, 8th, 15th, 22nd and 29th). */
function weekLabel(value: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const month = MONTHS[date.getMonth()]
  return `Week ${Math.ceil(date.getDate() / 7)} · ${month} ${date.getFullYear()}`
}

export function referenceFor(register: RegisterDefinition, stationCode: string, year: number, seq: number): string {
  return register.reference?.({ stationCode, year, seq }) ?? defaultRef({ stationCode, year, seq }, register.code)
}

export const getRegister = (id: string | undefined) => REGISTERS.find((r) => r.id === id)
