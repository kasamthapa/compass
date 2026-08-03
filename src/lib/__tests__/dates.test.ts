import { describe, expect, it } from 'vitest'
import { addDays, formatWeekRange, weekNumber, weekOf } from '../dates'

describe('weekOf', () => {
  it('returns the same Monday regardless of which day of that week is passed', () => {
    expect(weekOf('2026-08-03')).toBe('2026-08-03') // Monday itself
    expect(weekOf('2026-08-05')).toBe('2026-08-03') // Wednesday
    expect(weekOf('2026-08-09')).toBe('2026-08-03') // Sunday
  })

  it('moving forward and back by 7 days returns to the same week', () => {
    const start = weekOf('2026-08-05')
    const nextWeek = addDays(start, 7)
    const backAgain = addDays(nextWeek, -7)
    expect(backAgain).toBe(start)
  })
})

describe('weekNumber', () => {
  it('increases by exactly 1 when navigating to the next week', () => {
    const week1 = weekOf('2026-08-05')
    const week2 = addDays(week1, 7)
    expect(weekNumber(week2)).toBe(weekNumber(week1) + 1)
  })

  it('decreases by exactly 1 when navigating to the previous week', () => {
    const week1 = weekOf('2026-08-05')
    const prevWeek = addDays(week1, -7)
    expect(weekNumber(prevWeek)).toBe(weekNumber(week1) - 1)
  })
})

describe('formatWeekRange', () => {
  it('formats a week within a single month as "MON d–d"', () => {
    expect(formatWeekRange('2026-08-03')).toBe('AUG 3–9')
  })

  it('formats a week spanning two months as "MON d–MON d"', () => {
    expect(formatWeekRange('2026-07-27')).toBe('JUL 27–AUG 2')
  })
})
