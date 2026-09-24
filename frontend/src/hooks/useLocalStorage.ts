import { useCallback, useState } from 'react'

/** Persists a small per-device preference. Falls back to memory when storage is unavailable. */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored === null ? initialValue : (JSON.parse(stored) as T)
    } catch {
      return initialValue
    }
  })

  const update = useCallback(
    (next: T) => {
      setValue(next)
      try {
        window.localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // Private mode or blocked storage: keep the in-memory value.
      }
    },
    [key],
  )

  return [value, update] as const
}
