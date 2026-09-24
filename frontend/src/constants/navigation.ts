import {
  BookOpenText,
  ClipboardList,
  Database,
  HardHat,
  House,
  NotebookPen,
  PackageSearch,
  UsersRound,
  Wrench,
} from 'lucide-react'
import type { NavGroup, NavItem } from '@/types'

export const NAVIGATION: NavGroup[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      {
        id: 'home',
        label: 'Home',
        icon: House,
        to: '/dashboard',
        status: 'available',
        description: 'Station overview for the current shift',
        keywords: ['dashboard', 'overview'],
      },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      {
        id: 'station-diary',
        label: 'Station Diary',
        icon: NotebookPen,
        to: '/station-diary',
        status: 'available',
        description: 'Shift-wise record of station operations',
        keywords: ['diary', 'log', 'shift', 'shift summary', 'booklet', 'handover', 'pdf'],
      },
      {
        id: 'registers',
        label: 'Registers',
        icon: ClipboardList,
        to: '/registers',
        status: 'available',
        description: 'Operational and statutory registers',
        keywords: ['register', 'incident', 'equipment fault', 'occurrence', 'complaint'],
      },
    ],
  },
  {
    id: 'work',
    label: 'Work Management',
    items: [
      { id: 'ptw', label: 'PTW', icon: HardHat, status: 'soon' },
      { id: 'wgo', label: 'WGO', icon: Wrench, status: 'soon' },
    ],
  },
  {
    id: 'information',
    label: 'Information',
    items: [{ id: 'manuals', label: 'Manuals & Acts', icon: BookOpenText, status: 'soon' }],
  },
  {
    id: 'other',
    label: 'Other',
    items: [{ id: 'lost-found', label: 'Lost & Found', icon: PackageSearch, status: 'soon' }],
  },
  {
    id: 'admin',
    label: 'Administration',
    items: [
      { id: 'masters', label: 'Masters', icon: Database, status: 'soon' },
      { id: 'users-roles', label: 'Users & Roles', icon: UsersRound, status: 'soon' },
    ],
  },
]

export const NAV_ITEMS: NavItem[] = NAVIGATION.flatMap((group) => group.items)
