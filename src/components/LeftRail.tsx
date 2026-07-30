import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navConfig'

export function LeftRail() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-30 hidden w-rail flex-col gap-1 border-r border-border bg-surface p-4 md:flex"
    >
      <div className="mb-6 px-3 pt-2 font-display text-lg font-semibold text-text">
        Compass
      </div>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `rounded-md px-3 py-2 font-body text-sm transition-colors ${
              isActive
                ? 'bg-bg text-accent'
                : 'text-muted hover:bg-bg hover:text-text'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
