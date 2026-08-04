import type { ReactNode } from 'react'
import { LeftRail } from './LeftRail'
import { BottomTabBar } from './BottomTabBar'
import { CaptureButton } from './CaptureButton'
import { CaptureDialog } from './CaptureDialog'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <LeftRail />
      {/* Wide is the shared default for every route (structural cards/rows/
          header get the full column) — routes with freeform prose text
          cap just that text at max-w-content (720px) locally, they don't
          narrow the whole page. See DECISIONS.md. */}
      <main className="mx-auto max-w-content-wide px-5 pb-[calc(var(--nav-height)_+_env(safe-area-inset-bottom)_+_1.5rem)] pt-8 sm:px-6 md:ml-rail md:px-8 md:pb-12 md:pt-11">
        {children}
      </main>
      <BottomTabBar />
      <CaptureButton />
      <CaptureDialog />
    </div>
  )
}
