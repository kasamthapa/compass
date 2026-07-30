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
      <main className="mx-auto max-w-content px-5 pb-[calc(var(--nav-height)_+_env(safe-area-inset-bottom)_+_1.5rem)] pt-8 sm:px-6 md:ml-rail md:px-8 md:pb-12 md:pt-11">
        {children}
      </main>
      <BottomTabBar />
      <CaptureButton />
      <CaptureDialog />
    </div>
  )
}
