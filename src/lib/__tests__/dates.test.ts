import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  formatMonthYear,
  formatWeekRange,
  getMonthGridDays,
  monthKey,
  parseDateISO,
  weekNumber,
  weekOf,
} from '../dates'

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

describe('addMonths', () => {
  it('steps forward and backward across a year boundary', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
  })

  it('returns the same month for delta 0', () => {
    expect(addMonths('2026-08', 0)).toBe('2026-08')
  })
})

describe('formatMonthYear', () => {
  it('formats as "MON YYYY"', () => {
    expect(formatMonthYear('2026-08')).toBe('AUG 2026')
  })
})

describe('getMonthGridDays', () => {
  it('starts on a Monday and ends on a Sunday, in whole weeks', () => {
    const days = getMonthGridDays('2026-08')
    expect(days.length % 7).toBe(0)
    expect(parseDateISO(days[0]).getDay()).toBe(1) // Monday
    expect(parseDateISO(days[days.length - 1]).getDay()).toBe(0) // Sunday
  })

  it('includes every day of the month', () => {
    const days = new Set(getMonthGridDays('2026-08'))
    for (let day = 1; day <= 31; day++) {
      expect(days.has(`2026-08-${String(day).padStart(2, '0')}`)).toBe(true)
    }
  })

  it('may include leading/trailing days from adjacent months to fill the grid', () => {
    const days = getMonthGridDays('2026-08')
    const outsideMonth = days.filter((day) => monthKey(day) !== '2026-08')
    // Whether there are any depends on which weekday the 1st/last fall on —
    // just confirm the grid only ever bleeds into the immediately adjacent
    // months, never anything further away.
    for (const day of outsideMonth) {
      expect(['2026-07', '2026-09']).toContain(monthKey(day))
    }
  })
})
