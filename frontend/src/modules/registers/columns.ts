import { displayValue, findField } from './fields'
import type { RegisterColumn, RegisterDefinition } from './types'

export interface ResolvedColumn extends RegisterColumn {
  /** Long text: wider in exports, clamped in the table. */
  wide: boolean
}

/** The register's list columns, with field keys turned into columns that show the field's value. */
export function resolveColumns(register: RegisterDefinition): ResolvedColumn[] {
  return register.columns.map((c) => {
    if (typeof c !== 'string') return { ...c, wide: false }
    const field = findField(register, c)
    if (!field) throw new Error(`Register ${register.id} has no field ${c}`)
    return {
      id: c,
      label: field.label,
      value: (r) => displayValue(field, r.values),
      wide: field.type === 'textarea' || field.type === 'text',
    }
  })
}
