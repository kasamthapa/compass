import { describe, expect, it } from 'vitest'
import { computeObservation, habitTrend, trendLabel, type WeekPoint, type WeeklyRate } from '../insights'

function week(i: number, rate: number): WeeklyRate {
  return { weekOf: `2026-W${String(i).padStart(2, '0')}`, rate }
}

describe('habitTrend', () => {
  it('returns null with fewer than 8 weeks of data', () => {
    const rates = Array.from({ length: 7 }, (_, i) => week(i, 0.5))
    expect(habitTrend(rates)).toBeNull()
  })

  it('detects an upward trend when the recent 4 weeks beat the previous 4', () => {
    const rates = [
      week(1, 0.2),
      week(2, 0.2),
      week(3, 0.3),
      week(4, 0.3),
      week(5, 0.8),
      week(6, 0.9),
      week(7, 0.9),
      week(8, 1.0),
    ]
    expect(habitTrend(rates)).toBe('up')
  })

  it('detects a downward trend when the recent 4 weeks are worse than the previous 4', () => {
    const rates = [
      week(1, 1.0),
      week(2, 0.9),
      week(3, 0.9),
      week(4, 0.8),
      week(5, 0.3),
      week(6, 0.3),
      week(7, 0.2),
      week(8, 0.2),
    ]
    expect(habitTrend(rates)).toBe('down')
  })

  it('reports steady when the two halves are close', () => {
    const rates = Array.from({ length: 8 }, (_, i) => week(i, 0.6))
    expect(habitTrend(rates)).toBe('steady')
  })

  it('only looks at the most recent 8 weeks when given more', () => {
    // 4 very old, low-rate weeks the trend should ignore, then a clean
    // "steady" 8-week window at the end.
    const oldLowWeeks = Array.from({ length: 4 }, (_, i) => week(i, 0.0))
    const steadyWeeks = Array.from({ length: 8 }, (_, i) => week(i + 4, 0.6))
    expect(habitTrend([...oldLowWeeks, ...steadyWeeks])).toBe('steady')
  })
})

describe('trendLabel', () => {
  it('maps each trend to plain language, never a number', () => {
    expect(trendLabel('up')).toBe('picking up')
    expect(trendLabel('down')).toBe('quieter lately')
    expect(trendLabel('steady')).toBe('steady')
  })
})

function point(weekOf: string, score: number, completionRate: number): WeekPoint {
  return { weekOf, score, completionRate }
}

describe('computeObservation', () => {
  it('returns null with fewer than 4 paired weeks', () => {
    const points = [point('2026-08-03', 4, 0.9), point('2026-08-10', 2, 0.2)]
    expect(computeObservation(points)).toBeNull()
  })

  it('returns null when the score gap between halves is small', () => {
    const points = [
      point('2026-08-03', 3, 0.9),
      point('2026-08-10', 3, 0.8),
      point('2026-08-17', 3, 0.2),
      point('2026-08-24', 3, 0.1),
    ]
    expect(computeObservation(points)).toBeNull()
  })

  it('surfaces a positive observation when higher completion pairs with higher scores', () => {
    const points = [
      point('2026-08-03', 5, 1.0),
      point('2026-08-10', 5, 0.9),
      point('2026-08-17', 2, 0.1),
      point('2026-08-24', 2, 0.0),
    ]
    const result = computeObservation(points)
    expect(result).not.toBeNull()
    expect(result).toContain('higher')
    expect(result).toContain('more of your habits')
  })

  it('surfaces the honest inverse observation when the data actually runs that way', () => {
    const points = [
      point('2026-08-03', 2, 1.0),
      point('2026-08-10', 2, 0.9),
      point('2026-08-17', 5, 0.1),
      point('2026-08-24', 5, 0.0),
    ]
    const result = computeObservation(points)
    expect(result).not.toBeNull()
    expect(result).toContain('fewer of your habits')
  })

  it('excludes the middle week from the comparison for an odd number of points', () => {
    // 5 weeks: middle one (index 2 after sort) should not count toward
    // either half.
    const points = [
      point('2026-08-03', 5, 1.0),
      point('2026-08-10', 5, 0.9),
      point('2026-08-17', 3, 0.5), // middle by completionRate — excluded
      point('2026-08-24', 2, 0.1),
      point('2026-08-31', 2, 0.0),
    ]
    const result = computeObservation(points)
    expect(result).not.toBeNull()
    expect(result).toContain('higher')
  })
})
