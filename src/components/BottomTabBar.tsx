import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navConfig'

export function BottomTabBar() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border-hairline bg-tabbar pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      style={{ minHeight: 'var(--nav-height)' }}
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `ios-press flex min-h-11 flex-1 flex-col items-center justify-center gap-1 pt-2 text-caption-2 font-medium transition-colors ${
              isActive ? 'text-accent' : 'text-text-muted'
            }`
          }
        >
          <Icon className="h-6 w-6" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
