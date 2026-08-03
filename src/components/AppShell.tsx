import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { LeftRail } from './LeftRail'
import { BottomTabBar } from './BottomTabBar'
import { CaptureButton } from './CaptureButton'
import { CaptureDialog } from './CaptureDialog'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation()
  // /week's 7-column grid needs real desktop breathing room the shared
  // prose-width column can't give it — every other route keeps the
  // standard max-w-content untouched. Mobile is unaffected either way
  // since max-width only constrains widths beyond it.
  const maxWidthClass = location.pathname === '/week' ? 'max-w-content-wide' : 'max-w-content'

  return (
    <div className="min-h-screen bg-bg text-text">
      <LeftRail />
      <main
        className={`mx-auto ${maxWidthClass} px-5 pb-[calc(var(--nav-height)_+_env(safe-area-inset-bottom)_+_1.5rem)] pt-8 sm:px-6 md:ml-rail md:px-8 md:pb-12 md:pt-11`}
      >
        {children}
      </main>
      <BottomTabBar />
      <CaptureButton />
      <CaptureDialog />
    </div>
  )
}
