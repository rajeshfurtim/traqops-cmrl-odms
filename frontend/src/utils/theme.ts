export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

/** Keep in sync with the inline script in index.html. */
export const THEME_STORAGE_KEY = 'odms.theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

export function readThemePreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {
    // Storage unavailable: fall through to the default.
  }
  return 'light'
}

export function writeThemePreference(preference: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    // Keep the in-memory choice only.
  }
}

export function systemPrefersDark(): boolean {
  return window.matchMedia(DARK_QUERY).matches
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return preference
}

export function subscribeToSystemTheme(onChange: () => void): () => void {
  const media = window.matchMedia(DARK_QUERY)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

/** Applies the theme to <html> without animating every color change. */
export function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement
  if (root.dataset.theme === theme) return
  root.setAttribute('data-theme-switching', '')
  root.dataset.theme = theme
  const surface = getComputedStyle(root).getPropertyValue('--color-surface').trim()
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', surface || '#ffffff')
  requestAnimationFrame(() => requestAnimationFrame(() => root.removeAttribute('data-theme-switching')))
}
