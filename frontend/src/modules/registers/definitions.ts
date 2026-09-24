import { ClipboardList, PackageSearch, ShieldCheck, Wrench, type LucideIcon } from 'lucide-react'
import type { BadgeTone } from '@/components/ui/Badge'
import type { RecordStatus, RegisterCategory, RegisterDefinition } from './types'

export const CATEGORIES: Record<RegisterCategory, { label: string; icon: LucideIcon; description: string }> = {
  operational: { label: 'Operational', icon: ClipboardList, description: 'Occurrences and daily returns' },
  safety: { label: 'Safety & Compliance', icon: ShieldCheck, description: 'Inspections and fire drills' },
  equipment: { label: 'Equipment & Assets', icon: Wrench, description: 'Faults and key control' },
  passenger: { label: 'Passenger', icon: PackageSearch, description: 'Complaints and lost property' },
}

export const CATEGORY_ORDER: RegisterCategory[] = ['operational', 'safety', 'equipment', 'passenger']

export const STATUS_LABELS: Record<RecordStatus, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  'pending-verification': 'Pending verification',
  closed: 'Closed',
}

export const STATUS_TONES: Record<RecordStatus, BadgeTone> = {
  open: 'warning',
  'in-progress': 'info',
  'pending-verification': 'neutral',
  closed: 'success',
}

export const NEXT_STATUSES: Record<RecordStatus, RecordStatus[]> = {
  open: ['in-progress', 'pending-verification', 'closed'],
  'in-progress': ['pending-verification', 'closed'],
  'pending-verification': ['in-progress', 'closed'],
  closed: [],
}

export const REGISTERS: RegisterDefinition[] = [
  {
    id: 'occurrence-log',
    label: 'Occurrence Log',
    category: 'operational',
    description: 'Unusual events at the station that need a formal record.',
    code: 'OCC',
    retention: 'Retained 5 years',
    statutory: true,
    titleField: 'summary',
    fields: [
      { key: 'summary', label: 'Occurrence', type: 'text', required: true, column: true },
      { key: 'location', label: 'Location', type: 'text', required: true, column: true },
      {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: ['Passenger', 'Security', 'Operations', 'Other'],
        required: true,
        column: true,
      },
      { key: 'details', label: 'Details & action taken', type: 'textarea', required: true },
    ],
  },
  {
    id: 'safety-inspection',
    label: 'Safety Inspection',
    category: 'safety',
    description: 'Routine safety checks and their findings.',
    code: 'SAF',
    retention: 'Retained 7 years',
    statutory: true,
    titleField: 'item',
    fields: [
      { key: 'item', label: 'Item inspected', type: 'text', required: true, column: true },
      { key: 'area', label: 'Area', type: 'text', required: true, column: true },
      {
        key: 'result',
        label: 'Result',
        type: 'select',
        options: ['Satisfactory', 'Needs attention', 'Unsafe'],
        required: true,
        column: true,
      },
      { key: 'remarks', label: 'Remarks', type: 'textarea' },
    ],
  },
  {
    id: 'fire-drill',
    label: 'Fire Drill Register',
    category: 'safety',
    description: 'Fire and evacuation drills conducted at the station.',
    code: 'FDR',
    retention: 'Retained 7 years',
    statutory: true,
    titleField: 'scenario',
    fields: [
      { key: 'scenario', label: 'Scenario', type: 'text', required: true, column: true },
      { key: 'duration', label: 'Evacuation time', type: 'text', required: true, column: true },
      { key: 'observations', label: 'Observations', type: 'textarea' },
    ],
  },
  {
    id: 'equipment-fault',
    label: 'Equipment Fault',
    category: 'equipment',
    description: 'Faults on station equipment, from report to verified repair.',
    code: 'EQP',
    retention: 'Retained 7 years',
    statutory: true,
    titleField: 'fault',
    fields: [
      { key: 'equipment', label: 'Equipment', type: 'text', required: true, column: true },
      { key: 'location', label: 'Location', type: 'text', required: true, column: true },
      { key: 'fault', label: 'Fault', type: 'text', required: true, column: true },
      { key: 'action', label: 'Immediate action', type: 'textarea' },
    ],
  },
  {
    id: 'keys',
    label: 'Keys Register',
    category: 'equipment',
    description: 'Issue and return of station keys.',
    code: 'KEY',
    retention: 'Retained 3 years',
    statutory: false,
    titleField: 'key',
    fields: [
      { key: 'key', label: 'Key', type: 'text', required: true, column: true },
      { key: 'issuedTo', label: 'Issued to', type: 'text', required: true, column: true },
      { key: 'purpose', label: 'Purpose', type: 'text', column: true },
    ],
  },
  {
    id: 'complaints',
    label: 'Complaints',
    category: 'passenger',
    description: 'Passenger complaints received at the station.',
    code: 'CMP',
    retention: 'Retained 3 years',
    statutory: false,
    titleField: 'subject',
    fields: [
      { key: 'subject', label: 'Subject', type: 'text', required: true, column: true },
      { key: 'passenger', label: 'Passenger contact', type: 'text', column: true },
      { key: 'details', label: 'Details', type: 'textarea', required: true },
    ],
  },
  {
    id: 'lost-found',
    label: 'Lost & Found',
    category: 'passenger',
    description: 'Property found at the station and its return.',
    code: 'LNF',
    retention: 'Retained 1 year',
    statutory: false,
    titleField: 'item',
    fields: [
      { key: 'item', label: 'Item', type: 'text', required: true, column: true },
      { key: 'foundAt', label: 'Found at', type: 'text', required: true, column: true },
      { key: 'description', label: 'Description', type: 'textarea' },
    ],
  },
]

export const getRegister = (id: string | undefined) => REGISTERS.find((r) => r.id === id)
