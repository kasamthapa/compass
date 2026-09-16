import { describe, expect, it } from 'vitest'
import { computeSprintProgress } from '../sprints'

describe('computeSprintProgress', () => {
  it('is day 1 of N on the start date itself', () => {
    const result = computeSprintProgress('2026-08-01', 7, '2026-08-01')
    expect(result).toEqual({ currentDay: 1, totalDays: 7, daysRemaining: 6, percent: 14, isOverdue: false })
  })

  it('tracks a middle day correctly', () => {
    const result = computeSprintProgress('2026-08-01', 7, '2026-08-04')
    expect(result.currentDay).toBe(4)
    expect(result.daysRemaining).toBe(3)
    expect(result.isOverdue).toBe(false)
  })

  it('is day N of N (100%, 0 remaining) on the last day, not overdue yet', () => {
    const result = computeSprintProgress('2026-08-01', 7, '2026-08-07')
    expect(result.currentDay).toBe(7)
    expect(result.daysRemaining).toBe(0)
    expect(result.percent).toBe(100)
    expect(result.isOverdue).toBe(false)
  })

  it('is overdue the day after the sprint ends, clamped to day N (never N+1)', () => {
    const result = computeSprintProgress('2026-08-01', 7, '2026-08-08')
    expect(result.currentDay).toBe(7)
    expect(result.daysRemaining).toBe(0)
    expect(result.percent).toBe(100)
    expect(result.isOverdue).toBe(true)
  })

  it('stays overdue (not further clamped/broken) many days past the end', () => {
    const result = computeSprintProgress('2026-08-01', 7, '2026-09-01')
    expect(result.currentDay).toBe(7)
    expect(result.isOverdue).toBe(true)
  })

  it('clamps a future-dated start to day 1, not a negative/zero day', () => {
    const result = computeSprintProgress('2026-08-10', 5, '2026-08-01')
    expect(result.currentDay).toBe(1)
    expect(result.daysRemaining).toBe(4)
    expect(result.isOverdue).toBe(false)
  })

  it('handles a 1-day sprint', () => {
    const startDay = computeSprintProgress('2026-08-01', 1, '2026-08-01')
    expect(startDay).toEqual({ currentDay: 1, totalDays: 1, daysRemaining: 0, percent: 100, isOverdue: false })
    const nextDay = computeSprintProgress('2026-08-01', 1, '2026-08-02')
    expect(nextDay.isOverdue).toBe(true)
  })
})
