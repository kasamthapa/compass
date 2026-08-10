import { toDateISO } from './dates'

/**
 * Whether the evening-review reminder should fire right now: enabled,
 * hasn't already fired today, and the current local time is at/past the
 * configured time (but we only check within a short window after it —
 * see `WINDOW_MINUTES` — so re-opening the app hours later on a day it
 * was already missed doesn't fire a stale notification).
 *
 * This is a pure time check, same shape as the review due-window helpers
 * in dates.ts — no side effects, no Notification API calls. The caller
 * (src/components/ReminderScheduler.tsx) is responsible for actually
 * firing the notification and recording today's date via
 * reminderStore's markFired.
 */
const WINDOW_MINUTES = 15

export function shouldFireReminder(
  now: Date,
  time: string,
  lastFiredDate: string | null,
): boolean {
  const today = toDateISO(now)
  if (lastFiredDate === today) return false

  const [hourStr, minuteStr] = time.split(':')
  const targetHour = Number(hourStr)
  const targetMinute = Number(minuteStr)
  if (Number.isNaN(targetHour) || Number.isNaN(targetMinute)) return false

  const targetMinutesOfDay = targetHour * 60 + targetMinute
  const nowMinutesOfDay = now.getHours() * 60 + now.getMinutes()
  const minutesPast = nowMinutesOfDay - targetMinutesOfDay

  return minutesPast >= 0 && minutesPast < WINDOW_MINUTES
}
