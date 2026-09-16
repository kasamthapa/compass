import { daysBetween } from './dates'

export interface SprintProgress {
  /** 1-indexed, clamped to [1, totalDays] — for "Day X of N" display. */
  currentDay: number
  totalDays: number
  /** 0 once the sprint has run its full length (or is overdue). */
  daysRemaining: number
  /** 0-100, clamped — for a progress bar. */
  percent: number
  /** The day count has elapsed but the sprint hasn't been marked complete or dropped yet. Not a failure state — just something to resolve, same spirit as a habit's "skipped" being neutral. */
  isOverdue: boolean
}

/**
 * Pure day-count math for a Sprint, given today's date. A sprint's first
 * day (`startDate` itself) is day 1, not day 0 — someone starting a
 * 7-day sprint today should see "Day 1 of 7", not "Day 0 of 7". A
 * future-dated `startDate` (sprint hasn't started yet) clamps to day 1 /
 * 0% rather than going negative.
 */
export function computeSprintProgress(startDate: string, totalDays: number, today: string): SprintProgress {
  const elapsedDays = daysBetween(startDate, today)
  const dayNumber = elapsedDays + 1
  const currentDay = Math.min(Math.max(dayNumber, 1), totalDays)
  const isOverdue = dayNumber > totalDays
  const daysRemaining = Math.max(totalDays - Math.max(dayNumber, 1), 0)
  const percent = Math.min(Math.max(Math.round((Math.max(dayNumber, 1) / totalDays) * 100), 0), 100)
  return { currentDay, totalDays, daysRemaining, percent, isOverdue }
}
