// Reference lists (masters) the register forms pick from. Values marked "old ODMS" were read from cmrl-odms.com
// (see docs/register-analysis/notes.md); station-specific lists are demo data until the backend serves them.

export const DEPARTMENTS = [
  'AFC',
  'CIVIL',
  'ELECTRICAL & MECHANICAL',
  'IT',
  'LMC',
  'LOST & FOUND OFFICE',
  'OHE',
  'OPERATIONS',
  'PROPERTY DEVELOPMENT',
  'PSD',
  'REVENUE',
  'ROLLING STOCK',
  'SAFETY',
  'SECURITY',
  'SIGNALING',
  'TELECOM',
  'TRACKS',
  'TRAINING',
  'TTM',
  'Others',
]

/** Train incident classes and sub-classes (old ODMS, Incident form). */
export const INCIDENT_CLASSES: Record<string, { title: string; subClasses: string[] }> = {
  A: {
    title: 'Collision',
    subClasses: [
      'A1 – Collision of trains involving a revenue train, resulting in loss of human life and / or grievous hurt',
      'A2 – Collision of trains involving a revenue train not resulting in loss of life / grievous hurt',
      'A3 – Collision involving trains other than revenue train, resulting in loss of human life and / or grievous hurt',
      'A4 – Collision involving trains other than revenue trains, not resulting in loss of human life and / or grievous hurt',
      'A5 – Other collisions, i.e. collision occurring during shunting, in depot yards and sidings etc.',
    ],
  },
  B: {
    title: 'Fire and / or explosion in train / system',
    subClasses: [
      'B1 – Fire and / or explosion in a revenue train, resulting in loss of human life and / or grievous hurt',
      'B2 – Fire and / or explosion in other than a revenue train, resulting in loss of human life and / or grievous hurt',
      'B3 – Fire and / or explosion in a revenue train not resulting in loss of human life and / or grievous hurt',
      'B4 – Fire and / or explosion in other than a revenue train not resulting in loss of human life and / or grievous hurt',
      'B5 – Fire and / or explosion in Metro Railway premises affecting stations, track, OHE, signalling etc.',
      'B6 – Other cases of fire and / or explosion occurring at depots and sidings etc.',
      'B7 – Emission of thick or toxic smoke by the system',
      'B8 – Absence of air renewal of the system',
    ],
  },
  C: {
    title: 'Derailments',
    subClasses: [
      'C1 – Derailment of revenue train, resulting in loss of human life and / or grievous hurt',
      'C2 – Derailment of other than revenue train, resulting in loss of human life and / or grievous hurt',
      'C3 – Derailment of a revenue train, not resulting in loss of human life and / or grievous hurt',
      'C4 – Derailment of other than a revenue train, not resulting in loss of human life and / or grievous hurt',
      'C5 – Other derailments, i.e. derailments occurring during shunting in depot yards, sidings etc.',
    ],
  },
  D: {
    title: 'Other train accidents',
    subClasses: [
      'D1 – A revenue train running into obstruction resulting in loss of human life and / or grievous hurt',
      'D2 – A revenue train running into obstruction not resulting in loss of human life and / or grievous hurt',
      'D3 – Other than revenue train running into obstruction resulting in loss of life and / or grievous hurt',
      'D4 – Other than revenue train running into obstruction not resulting in loss of human life and / or grievous hurt',
    ],
  },
  E: {
    title: 'Security threats',
    subClasses: [
      'E – Security threats, terrorist attacks, sabotage, violence, bomb explosion, fire, release of poisonous, chemical, biological gases and other insurgent activities in Metro trains, stations, right of way and other Metro Railway premises',
    ],
  },
  F: {
    title: 'Indicative accidents',
    subClasses: [
      'F1 – Averted collision between trains, one of which is a revenue train',
      'F2 – Averted collision between non-revenue trains',
      'F3 – A revenue train running solely on the authority of line side signals (in degraded modes) running past a "Stop" signal at "ON" without proper authority',
      'F4 – A non-revenue train running solely on the authority of line side signals (in degraded modes) running past a "Stop" signal at "ON" without proper authority',
    ],
  },
  G: { title: 'Accidents not classified', subClasses: ['G – Any train accident not classified above'] },
  H: {
    title: 'Failure of rolling stock',
    subClasses: [
      'H1 – Failure of propulsion system',
      'H2 – Brake / pneumatic failure',
      'H3 – Physical parting of a train',
      'H4 – Failure of saloon door mechanism',
      'H5 – Failure of vehicle control circuit',
      'H6 – Failure of air conditioning and ventilation',
      'H7 – Failure of bogie including wheels, axles etc.',
      'H8 – Other rolling stock failure such as failure of coupler, partition door, train light etc.',
      'H9 – Failure of cab equipment and TCMS indication',
      'H10 – Uncontrolled run-away train',
      'H11 – Failure of communication between passengers and Train Operator',
    ],
  },
  I: {
    title: 'Failure of track and structures',
    subClasses: [
      'I-1 – Buckling of track',
      'I-2 – Weld failure',
      'I-3 – Rail fracture',
      'I-4 – An unusually slack or rough or heavy lurch reported by Train Operator while passing over any length of permanent way, interrupting through running for 20 minutes or more',
      'I-5 – Failure of railway tunnel, bridge, viaduct, cutting, formation etc.',
      'I-6 – Damage to track rendering it temporarily unsafe for trains, likely to delay traffic for more than 20 minutes',
      'I-7 – Defects in setting of points, creep etc.',
    ],
  },
  J: {
    title: 'Failure of electrical equipment',
    subClasses: [
      'J1 – Snapping or damage to OHE needing switching off of OHE for more than 15 minutes',
      'J2 – No tension in OHE for more than 15 minutes',
      'J3 – Pantograph entanglement',
      'J4 – Total failure of power supply to E&M, ECS & TVS',
      'J5 – Total failure of power supply to Signalling, Telecom and AFC for more than 15 minutes',
      'J6 – Failure of lifts and escalators for more than 2 hours',
      'J7 – Total failure of fire detection and suppression system',
    ],
  },
  K: {
    title: 'Failure of signalling and telecommunication',
    subClasses: [
      'K1 – Failure of signals',
      'K2 – Failure of ATP & ATO system',
      'K3 – Failure of OCC, Station Control Work Station and Depot Work Station',
      'K4 – Failure of OCC control / station / train communication',
      'K5 – Failure of point machine, driving rods, detection rods',
      'K6 – Failure of ATS',
      'K7 – Failure of interlocking',
      'K8 – Failure of track circuit',
      'K9 – Any other failure of signalling system noticed during revenue / non-revenue operation',
      'K10 – Failure of AFC equipment, barriers / gates, ticketing machine etc.',
    ],
  },
  L: {
    title: 'Other incidents',
    subClasses: [
      'L1 – Floods, breaches, landslides, earthquakes etc. interrupting train operation on any Metro Railway line',
      'L2 – Theft and other petty crimes in Metro Railway premises including trains',
      'L3 – Assault on Metro Railway staff on duty',
      'L4 – Murder in running trains and Metro Rail premises, other than Metro Railway quarters',
      'L5 – Person or persons knocked down by train resulting in grievous hurt or loss of life',
      'L6 – Accidental or natural death of any person within Metro Railway premises (excluding staff quarters and administrative buildings)',
      'L7 – Electric shock to passengers, staff and others causing grievous injuries or death',
      'L8 – Suicide or attempted suicide within Metro Railway premises, in or within trains, or the right of way',
      'L9 – Persons trapped between Platform Screen Doors while closing',
      'L10 – Persons trapped between saloon doors while closing',
      'L11 – Persons trapped between PSD and saloon door',
      'L12 – Impossibility to open the track access doors, emergency doors or PSDs during evacuation',
      'L13 – Any other incident not included in the foregoing classifications',
    ],
  },
}

export const INCIDENT_CLASS_OPTIONS = Object.entries(INCIDENT_CLASSES).map(([code, c]) => `${code} – ${c.title}`)

/** "K – Failure of …" → its sub-classes. */
export const subClassesOf = (classOption: string) => INCIDENT_CLASSES[classOption.split(' ')[0]]?.subClasses ?? []

/** Weekly essential equipment (old ODMS, Masters › Essential Items). */
export const ESSENTIAL_ITEMS = [
  'Hand flag',
  'Tri colour torch',
  'Megaphone',
  'First aid kit',
  'Stretcher',
  'Wheel chair',
  'Shroud',
  'Safety helmet',
  'High visibility vest',
  'Gum boots',
  'Rubber gloves',
  '33 KV gloves',
  'Crank handle',
  'Point clamp',
  'Pad lock',
  'Queue manager',
  'Hand tally counter',
  'Raincoat',
  'Umbrella',
  'Emergency contact numbers in SWO',
]

/** Mock drill scenarios (old ODMS, Mock Drill Calendar). */
export const MOCK_DRILL_SCENARIOS = [
  'ATS control transfer from OCC to station',
  'Auxiliary power supply failure in station',
  'Back-up OCC',
  'Communication failure',
  'EED & EAD operation',
  'Emergency at platform – ESP operation in mainline',
  'Emergency evacuation (train ramp)',
  'Fire at station – first aid hose reel (FAHR)',
  'Fire at station – reinforced rubber lining hose pipe (RRL)',
  'Flood barrier assembly',
  'Man trapped in lift – passenger rescue',
  'MPO mainline',
  'Passenger run over',
  'PIDS / PAS',
  'PSD override and isolation',
  'Rescue mode driving',
  'Station emergency AFC push button operation',
  'Train door failure, door isolation and inhibit',
  'Train failure / stalled – train coupling',
  'Train stalled and parking brake manual release',
  'TVS IBP panel operation',
]

/** Organisations whose staff take keys (CMRL + EPIC contractors seen in the old Key Register). */
export const ORGANISATIONS = [
  'CMRL',
  'A1 Global Facility Management',
  'ABS Fujitsu General',
  'ALSTOM',
  'ALSTOM-UDS',
  'Blue Star',
  'BSNL',
  'BVG India',
  'Johnson Lift',
  'KCIC',
  'Other',
]

export const VEHICLE_TYPES = [
  'Two-Wheeler',
  'E-Two-Wheeler',
  'Three-Wheeler',
  'Four-Wheeler',
  'E-Four-Wheeler',
  'Six-Wheeler',
]

// ——— Station masters (demo data for the signed-in station) ———

export interface PointNumber {
  point: string
  chk: string
}

export const POINT_NUMBERS: PointNumber[] = [
  { point: 'P101N', chk: 'CHK101N' },
  { point: 'P102R', chk: 'CHK102R' },
  { point: 'P103N', chk: 'CHK103N' },
  { point: 'P104R', chk: 'CHK104R' },
]

export interface StationRoom {
  room: string
  keyHive: string
  keyNo: string
  location: string
}

export const ROOMS: StationRoom[] = [
  { room: 'Signalling equipment room', keyHive: 'Hive 1', keyNo: 'K-101', location: 'Concourse, LHS' },
  { room: 'Telecom equipment room', keyHive: 'Hive 1', keyNo: 'K-102', location: 'Concourse, LHS' },
  { room: 'AFC room', keyHive: 'Hive 1', keyNo: 'K-110', location: 'Concourse, paid side' },
  { room: 'UPS room', keyHive: 'Hive 2', keyNo: 'K-205', location: 'Concourse, RHS' },
  { room: 'Pump room', keyHive: 'Hive 2', keyNo: 'K-214', location: 'Undercroft' },
  { room: 'Track access gate, UP', keyHive: 'Hive 3', keyNo: 'K-301', location: 'Platform 1 end' },
  { room: 'Track access gate, DN', keyHive: 'Hive 3', keyNo: 'K-302', location: 'Platform 2 end' },
]

export const roomLabel = (r: StationRoom) => `${r.room} · ${r.keyNo}`
export const findRoom = (label: string) => ROOMS.find((r) => roomLabel(r) === label)

export interface PdShop {
  shop: string
  pdCode: string
  licensee: string
  loaRef: string
  location: string
  area: number
  tenureFrom: string
  tenureTo: string
}

export const SHOPS: PdShop[] = [
  {
    shop: 'Madras Coffee House',
    pdCode: 'PD-CEN-01',
    licensee: 'MCH Foods Pvt Ltd',
    loaRef: 'CMRL/PD/LOA/2024/118',
    location: 'Concourse',
    area: 320,
    tenureFrom: '2024-04-01',
    tenureTo: '2027-03-31',
  },
  {
    shop: 'Metro Books & Gifts',
    pdCode: 'PD-CEN-02',
    licensee: 'S. Ramesh',
    loaRef: 'CMRL/PD/LOA/2023/064',
    location: 'Concourse',
    area: 180,
    tenureFrom: '2023-07-01',
    tenureTo: '2026-06-30',
  },
  {
    shop: 'Quick Mart ATM kiosk',
    pdCode: 'PD-CEN-03',
    licensee: 'Quick Mart Retail LLP',
    loaRef: 'CMRL/PD/LOA/2025/021',
    location: 'Street',
    area: 60,
    tenureFrom: '2025-01-01',
    tenureTo: '2028-12-31',
  },
]

export const findShop = (name: string) => SHOPS.find((s) => s.shop === name)
