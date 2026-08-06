import { useThemeStore, type ThemePreference } from '../store/themeStore'
import { IconSystem, IconSun, IconMoon } from './icons'

const OPTIONS: { value: ThemePreference; icon: typeof IconSystem; label: string }[] = [
  { value: 'system', icon: IconSystem, label: 'System' },
  { value: 'light', icon: IconSun, label: 'Light' },
  { value: 'dark', icon: IconMoon, label: 'Dark' },
]

export function ThemeToggle() {
  const preference = useThemeStore((state) => state.preference)
  const setPreference = useThemeStore((state) => state.setPreference)

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex shrink-0 items-center gap-0.5 rounded-full bg-surface p-0.5"
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const active = preference === value
        return (
          <button
            key={value}
            type="button"
            onClick={() => setPreference(value)}
            aria-label={label}
            aria-pressed={active}
            className={`ios-press flex h-8 w-8 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-ring ${
              active ? 'bg-bg text-text-muted' : 'text-text-faint'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        )
      })}
    </div>
  )
}
