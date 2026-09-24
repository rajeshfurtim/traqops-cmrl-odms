import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  applyTheme,
  readThemePreference,
  resolveTheme,
  subscribeToSystemTheme,
  writeThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from '@/utils/theme'

interface ThemeContextValue {
  preference: ThemePreference

  theme: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readThemePreference)
  const [theme, setTheme] = useState<ResolvedTheme>(() => resolveTheme(preference))

  const setPreference = useCallback((next: ThemePreference) => {
    writeThemePreference(next)
    setPreferenceState(next)
    setTheme(resolveTheme(next))
  }, [])

  useEffect(() => {
    if (preference !== 'system') return
    return subscribeToSystemTheme(() => setTheme(resolveTheme('system')))
  }, [preference])

  useEffect(() => applyTheme(theme), [theme])

  const value = useMemo(() => ({ preference, theme, setPreference }), [preference, theme, setPreference])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>')
  return ctx
}
