import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  formatMonthYear,
  formatWeekRange,
  getMonthGridDays,
  isMonthlyReviewDue,
  isWeeklyReviewDue,
  isYearlyReviewDue,
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

describe('isWeeklyReviewDue', () => {
  it('is false on a Sunday before 4pm', () => {
    // 2026-08-09 is a Sunday
    expect(isWeeklyReviewDue(new Date(2026, 7, 9, 15, 59))).toBe(false)
  })

  it('is true on a Sunday from 4pm onward', () => {
    expect(isWeeklyReviewDue(new Date(2026, 7, 9, 16, 0))).toBe(true)
    expect(isWeeklyReviewDue(new Date(2026, 7, 9, 23, 59))).toBe(true)
  })

  it('is true for all of Monday', () => {
    // 2026-08-10 is a Monday
    expect(isWeeklyReviewDue(new Date(2026, 7, 10, 0, 0))).toBe(true)
    expect(isWeeklyReviewDue(new Date(2026, 7, 10, 23, 59))).toBe(true)
  })

  it('is false on any other day', () => {
    // 2026-08-11 is a Tuesday
    expect(isWeeklyReviewDue(new Date(2026, 7, 11, 12, 0))).toBe(false)
    // 2026-08-8 is a Saturday
    expect(isWeeklyReviewDue(new Date(2026, 7, 8, 23, 0))).toBe(false)
  })
})

describe('isMonthlyReviewDue', () => {
  it('is true for the first 3 days of the month', () => {
    expect(isMonthlyReviewDue(new Date(2026, 8, 1))).toBe(true) // Sep 1
    expect(isMonthlyReviewDue(new Date(2026, 8, 2))).toBe(true)
    expect(isMonthlyReviewDue(new Date(2026, 8, 3))).toBe(true)
    expect(isMonthlyReviewDue(new Date(2026, 8, 4))).toBe(false)
  })

  it('is true for the last 3 days of a 31-day month', () => {
    // August 2026 has 31 days
    expect(isMonthlyReviewDue(new Date(2026, 7, 28))).toBe(false)
    expect(isMonthlyReviewDue(new Date(2026, 7, 29))).toBe(true)
    expect(isMonthlyReviewDue(new Date(2026, 7, 30))).toBe(true)
    expect(isMonthlyReviewDue(new Date(2026, 7, 31))).toBe(true)
  })

  it('is true for the last 3 days of a 30-day month', () => {
    // September 2026 has 30 days
    expect(isMonthlyReviewDue(new Date(2026, 8, 27))).toBe(false)
    expect(isMonthlyReviewDue(new Date(2026, 8, 28))).toBe(true)
    expect(isMonthlyReviewDue(new Date(2026, 8, 29))).toBe(true)
    expect(isMonthlyReviewDue(new Date(2026, 8, 30))).toBe(true)
  })

  it('is true for the last 3 days of February in a non-leap year', () => {
    // February 2026 has 28 days
    expect(isMonthlyReviewDue(new Date(2026, 1, 25))).toBe(false)
    expect(isMonthlyReviewDue(new Date(2026, 1, 26))).toBe(true)
    expect(isMonthlyReviewDue(new Date(2026, 1, 28))).toBe(true)
  })

  it('is false in the middle of the month', () => {
    expect(isMonthlyReviewDue(new Date(2026, 7, 15))).toBe(false)
  })
})

describe('isYearlyReviewDue', () => {
  it('is true from December 20 onward', () => {
    expect(isYearlyReviewDue(new Date(2026, 11, 19))).toBe(false)
    expect(isYearlyReviewDue(new Date(2026, 11, 20))).toBe(true)
    expect(isYearlyReviewDue(new Date(2026, 11, 31))).toBe(true)
  })

  it('is true through January 10', () => {
    expect(isYearlyReviewDue(new Date(2027, 0, 1))).toBe(true)
    expect(isYearlyReviewDue(new Date(2027, 0, 10))).toBe(true)
    expect(isYearlyReviewDue(new Date(2027, 0, 11))).toBe(false)
  })

  it('is false in the middle of the year', () => {
    expect(isYearlyReviewDue(new Date(2026, 6, 15))).toBe(false)
  })
})
