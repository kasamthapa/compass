import type { ReactNode } from 'react'
import { LeftRail } from './LeftRail'
import { BottomTabBar } from './BottomTabBar'
import { CaptureButton } from './CaptureButton'
import { CaptureDialog } from './CaptureDialog'
import { UpdateToast } from './UpdateToast'
import { ReminderScheduler } from './ReminderScheduler'

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
          narrow the whole page. See DECISIONS.md.

          Bottom padding must clear the CaptureButton FAB's full footprint,
          not just the tab bar. The FAB sits `nav-height + 1rem` (mobile) /
          `2rem` (desktop) above the viewport bottom and is itself `3.5rem`
          (h-14) tall — the old `+1.5rem` breathing room only accounted for
          the tab bar and left the FAB overlapping the last card on any
          page short enough to end near the bottom (e.g. Today's evening
          review card).

          On desktop the FAB's own `bottom-8`/`right-8` are ALSO hit by
          tailwind.config.js's spacing-key-1-9 remap (space-8 = 4rem/64px,
          not the standard 2rem/32px `bottom-8` implies elsewhere) — so the
          FAB's real top edge sits 64px + 56px (h-14) = 120px above the
          viewport bottom on desktop, not the ~88px a quick read of the
          className suggests. +6rem mobile / 9rem desktop clears each
          platform's FAB position with a comfortable gap above it —
          verified via getBoundingClientRect, not assumed from the
          classNames. See DECISIONS.md. */}
      <main className="mx-auto max-w-content-wide px-5 pb-[calc(var(--nav-height)_+_env(safe-area-inset-bottom)_+_6rem)] pt-8 sm:px-6 md:ml-rail md:px-8 md:pb-36 md:pt-11">
        {children}
      </main>
      <BottomTabBar />
      <CaptureButton />
      <CaptureDialog />
      <UpdateToast />
      <ReminderScheduler />
    </div>
  )
}
