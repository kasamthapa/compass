import { create } from 'zustand'

export type ThemePreference = 'system' | 'light' | 'dark'
type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'compass-theme'
const THEME_COLOR: Record<ResolvedTheme, string> = {
  light: '#f4f4f7',
  dark: '#14171d',
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(preference: ThemePreference): ResolvedTheme {
  return preference === 'system' ? getSystemTheme() : preference
}

function applyTheme(resolved: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', resolved)
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[resolved])
}

function getStoredPreference(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system'
}

interface ThemeState {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (preference: ThemePreference) => void
}

const initialPreference = getStoredPreference()
const initialResolved = resolveTheme(initialPreference)
applyTheme(initialResolved)

export const useThemeStore = create<ThemeState>((set) => ({
  preference: initialPreference,
  resolved: initialResolved,
  setPreference: (preference) => {
    localStorage.setItem(STORAGE_KEY, preference)
    const resolved = resolveTheme(preference)
    applyTheme(resolved)
    set({ preference, resolved })
  },
}))

window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    const { preference } = useThemeStore.getState()
    if (preference !== 'system') return
    const resolved = getSystemTheme()
    applyTheme(resolved)
    useThemeStore.setState({ resolved })
  })
