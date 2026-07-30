import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navConfig'

export function LeftRail() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-30 hidden w-rail flex-col gap-1 bg-surface p-4 md:flex"
    >
      <div className="mb-6 px-3 pt-3 font-display text-title text-text">Compass</div>
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `ios-press flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-subhead font-medium transition-colors ${
              isActive
                ? 'bg-accent-wash text-accent'
                : 'text-text-muted hover:bg-bg hover:text-text'
            }`
          }
        >
          <Icon className="h-5 w-5 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
