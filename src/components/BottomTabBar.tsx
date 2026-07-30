import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navConfig'

export function BottomTabBar() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex h-nav border-t border-border bg-surface md:hidden"
    >
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center justify-center gap-1 text-xs font-body transition-colors ${
              isActive ? 'text-accent' : 'text-muted'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
