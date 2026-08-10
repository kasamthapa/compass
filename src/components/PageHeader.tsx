import { NavLink } from 'react-router-dom'
import { IconSettings } from './icons'

interface PageHeaderProps {
  title: string
}

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 pb-2">
      <h1 className="font-display text-large-title text-text">{title}</h1>
      {/* Desktop reaches Settings via the left rail's own entry point below
          the main nav items — this link only needs to exist on mobile,
          where the rail is hidden. See DECISIONS.md (Phase 7C). */}
      <NavLink
        to="/settings"
        aria-label="Settings"
        className={({ isActive }) =>
          `ios-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent-ring md:hidden ${
            isActive ? 'text-accent' : 'text-text-muted'
          }`
        }
      >
        {({ isActive }) => <IconSettings className="h-5 w-5" active={isActive} />}
      </NavLink>
    </header>
  )
}
