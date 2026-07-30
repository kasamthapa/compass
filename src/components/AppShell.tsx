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
      <main className="mx-auto max-w-content px-4 pb-24 pt-6 md:ml-rail md:pb-6">
        {children}
      </main>
      <BottomTabBar />
      <CaptureButton />
      <CaptureDialog />
    </div>
  )
}
