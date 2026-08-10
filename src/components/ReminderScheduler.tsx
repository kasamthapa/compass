import { useEffect } from 'react'
import { useReminderStore } from '../store/reminderStore'
import { shouldFireReminder } from '../lib/reminders'
import { toDateISO } from '../lib/dates'

const CHECK_INTERVAL_MS = 30_000

/**
 * Mounted once in AppShell. Best-effort only, by design — see Settings'
 * Reminders section and DECISIONS.md for the honest scoping: this can only
 * fire while the app is open (or was recently active) in this browser tab,
 * since Compass has no server to deliver a true background push. A closed
 * tab/browser will simply miss it; that's the accepted tradeoff of staying
 * local-first with no server, not a bug.
 */
export function ReminderScheduler() {
  const enabled = useReminderStore((state) => state.enabled)
  const time = useReminderStore((state) => state.time)
  const lastFiredDate = useReminderStore((state) => state.lastFiredDate)
  const markFired = useReminderStore((state) => state.markFired)

  useEffect(() => {
    if (!enabled) return
    if (typeof Notification === 'undefined') return

    function check() {
      if (Notification.permission !== 'granted') return
      const now = new Date()
      if (!shouldFireReminder(now, time, lastFiredDate)) return
      new Notification('Evening review', {
        body: "A quiet moment to close the day, whenever you're ready.",
        icon: '/icon-192.png',
        tag: 'compass-evening-reminder',
      })
      markFired(toDateISO(now))
    }

    check()
    const id = window.setInterval(check, CHECK_INTERVAL_MS)
    return () => window.clearInterval(id)
  }, [enabled, time, lastFiredDate, markFired])

  return null
}
