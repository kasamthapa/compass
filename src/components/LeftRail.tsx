import { NavLink } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { NAV_ITEMS } from './navConfig'
import * as capturesRepo from '../db/repo/captures'

/**
 * The app's one-time signature mark: a thin ink-soft compass rose with a
 * single brass-filled kite at north. Appears exactly once, here in the
 * rail's wordmark — never repeated elsewhere as decoration. See
 * DECISIONS.md.
 */
function CompassRoseMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-text-faint" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path
        d="M12 4.2v3M12 16.8v3M4.2 12h3M16.8 12h3"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <path d="M12 4.2l1.7 4.3-1.7 1.4-1.7-1.4Z" fill="var(--brass)" stroke="none" />
    </svg>
  )
}

export function LeftRail() {
  const unprocessedCount = useLiveQuery(() => capturesRepo.getUnprocessedCount(), []) ?? 0

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-y-0 left-0 z-30 hidden w-rail flex-col gap-1 bg-surface p-4 md:flex"
    >
      <div className="mb-6 flex items-center gap-2 px-3 pt-3 font-display text-title text-text">
        <CompassRoseMark />
        Compass
      </div>
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
          {({ isActive }) => (
            <>
              <Icon className="h-5 w-5 shrink-0" active={isActive} />
              {label}
              {to === '/inbox' && unprocessedCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 font-mono text-[10px] font-semibold leading-none text-accent-on">
                  {unprocessedCount > 9 ? '9+' : unprocessedCount}
                </span>
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
