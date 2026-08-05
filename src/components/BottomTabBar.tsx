import { NavLink } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { NAV_ITEMS } from './navConfig'
import * as capturesRepo from '../db/repo/captures'

export function BottomTabBar() {
  const unprocessedCount = useLiveQuery(() => capturesRepo.getUnprocessedCount(), []) ?? 0

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
          {({ isActive }) => (
            <>
              <span className="relative">
                <Icon className="h-6 w-6" active={isActive} />
                {to === '/inbox' && unprocessedCount > 0 && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-mono text-[9px] font-semibold leading-none text-accent-on">
                    {unprocessedCount > 9 ? '9+' : unprocessedCount}
                  </span>
                )}
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
