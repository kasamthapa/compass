import { NavLink } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { NAV_ITEMS } from './navConfig'
import * as capturesRepo from '../db/repo/captures'

export function LeftRail() {
  const unprocessedCount = useLiveQuery(() => capturesRepo.getUnprocessedCount(), []) ?? 0

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
          {to === '/inbox' && unprocessedCount > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-mono text-[10px] font-semibold leading-none text-accent-on">
              {unprocessedCount > 9 ? '9+' : unprocessedCount}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
