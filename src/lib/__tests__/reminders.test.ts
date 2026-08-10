import { describe, expect, it } from 'vitest'
import { shouldFireReminder } from '../reminders'

describe('shouldFireReminder', () => {
  it('is false before the configured time', () => {
    expect(shouldFireReminder(new Date(2026, 7, 10, 19, 59), '20:00', null)).toBe(false)
  })

  it('is true at the configured time', () => {
    expect(shouldFireReminder(new Date(2026, 7, 10, 20, 0), '20:00', null)).toBe(true)
  })

  it('is true within the window after the configured time', () => {
    expect(shouldFireReminder(new Date(2026, 7, 10, 20, 14), '20:00', null)).toBe(true)
  })

  it('is false once the window has passed', () => {
    expect(shouldFireReminder(new Date(2026, 7, 10, 20, 15), '20:00', null)).toBe(false)
    expect(shouldFireReminder(new Date(2026, 7, 10, 22, 0), '20:00', null)).toBe(false)
  })

  it('is false if it already fired today, even within the window', () => {
    expect(shouldFireReminder(new Date(2026, 7, 10, 20, 5), '20:00', '2026-08-10')).toBe(false)
  })

  it('is true again the next day even if it fired yesterday', () => {
    expect(shouldFireReminder(new Date(2026, 7, 11, 20, 5), '20:00', '2026-08-10')).toBe(true)
  })

  it('handles a non-default configured time', () => {
    expect(shouldFireReminder(new Date(2026, 7, 10, 7, 30), '07:30', null)).toBe(true)
    expect(shouldFireReminder(new Date(2026, 7, 10, 7, 29), '07:30', null)).toBe(false)
  })

  it('is false for a malformed time string', () => {
    expect(shouldFireReminder(new Date(2026, 7, 10, 20, 0), 'not-a-time', null)).toBe(false)
  })
})
