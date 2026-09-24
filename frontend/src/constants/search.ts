export interface SearchScope {
  id: string
  label: string
  description: string
}

export const ALL_SCOPE_ID = 'all'

/** Record types global search will cover once modules are live. */
export const SEARCH_SCOPES: SearchScope[] = [
  { id: ALL_SCOPE_ID, label: 'All', description: 'All operational records' },
  { id: 'station-diary', label: 'Station Diary', description: 'Diary entries' },
  { id: 'registers', label: 'Registers', description: 'Register records' },
  { id: 'incidents', label: 'Incidents', description: 'Incident records' },
  { id: 'ptw', label: 'PTW', description: 'Permits to work' },
  { id: 'wgo', label: 'WGO', description: 'WGO records' },
]
