import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from './testUtils'
import * as reviews from '../repo/reviews'
import {
  resumeStepFor,
  resumeStepForMonthly,
  resumeStepForWeekly,
  resumeStepForYearly,
} from '../../lib/reviewResume'

beforeEach(resetDb)

describe('daily review upsert', () => {
  it('creates then updates in place, merging fields across calls', async () => {
    const created = await reviews.upsert('daily', '2026-07-31', { score: 4 })
    expect(created.score).toBe(4)
    expect(created.answers).toEqual({})

    await reviews.upsert('daily', '2026-07-31', { answers: { win: 'Shipped the feature' } })
    const afterWin = await reviews.getByPeriod('daily', '2026-07-31')
    expect(afterWin?.score).toBe(4)
    expect(afterWin?.answers).toEqual({ win: 'Shipped the feature' })

    await reviews.upsert('daily', '2026-07-31', {
      answers: { win: 'Shipped the feature', lesson: 'Started too late' },
    })
    const afterLesson = await reviews.getByPeriod('daily', '2026-07-31')
    expect(afterLesson?.answers).toEqual({
      win: 'Shipped the feature',
      lesson: 'Started too late',
    })

    await reviews.upsert('daily', '2026-07-31', { completedAt: '2026-07-31T19:00:00.000Z' })
    const completed = await reviews.getByPeriod('daily', '2026-07-31')
    expect(completed?.completedAt).toBe('2026-07-31T19:00:00.000Z')
    // still holds everything from earlier steps
    expect(completed?.score).toBe(4)
    expect(completed?.answers.lesson).toBe('Started too late')
  })

  it('does not create a second row for the same period', async () => {
    await reviews.upsert('daily', '2026-07-31', { score: 3 })
    await reviews.upsert('daily', '2026-07-31', { score: 5 })
    const review = await reviews.getByPeriod('daily', '2026-07-31')
    expect(review?.score).toBe(5)
  })
})

describe('resumeStepFor', () => {
  it('resumes at step 1 when there is no review yet', () => {
    expect(resumeStepFor(undefined)).toBe(1)
  })

  it('resumes at step 1 when no score has been set', () => {
    expect(resumeStepFor({ score: undefined, answers: {} })).toBe(1)
  })

  it('resumes at step 2 when score is set but no win', () => {
    expect(resumeStepFor({ score: 4, answers: {} })).toBe(2)
  })

  it('resumes at step 3 when score and win are set but no lesson', () => {
    expect(resumeStepFor({ score: 4, answers: { win: 'Good focus' } })).toBe(3)
  })

  it('resumes at step 4 once score, win, and lesson are all set', () => {
    expect(
      resumeStepFor({ score: 4, answers: { win: 'Good focus', lesson: 'Slept late' } }),
    ).toBe(4)
  })
})

describe('weekly review upsert', () => {
  it('creates then updates in place, merging fields across calls, independently of a daily review for the same periodKey', async () => {
    // 'daily' and 'weekly' share the [type+periodKey] index shape but are
    // different types — a weekly review keyed on a Monday must never be
    // confused with a daily review that happens to use the same date string.
    await reviews.upsert('daily', '2026-08-03', { score: 2 })
    await reviews.upsert('weekly', '2026-08-03', { score: 5 })

    const daily = await reviews.getByPeriod('daily', '2026-08-03')
    const weekly = await reviews.getByPeriod('weekly', '2026-08-03')
    expect(daily?.score).toBe(2)
    expect(weekly?.score).toBe(5)

    await reviews.upsert('weekly', '2026-08-03', {
      answers: { 'goal:abc': 'Still on track' },
    })
    const updated = await reviews.getByPeriod('weekly', '2026-08-03')
    expect(updated?.score).toBe(5)
    expect(updated?.answers).toEqual({ 'goal:abc': 'Still on track' })
  })
})

describe('resumeStepForWeekly', () => {
  it('resumes at step 1 when there is no review yet', () => {
    expect(resumeStepForWeekly(undefined)).toBe(1)
  })

  it('resumes at step 1 when nothing has been recorded', () => {
    expect(resumeStepForWeekly({ score: undefined, answers: {} })).toBe(1)
  })

  it('resumes at step 4 once a goal check-in note exists but no score yet', () => {
    expect(
      resumeStepForWeekly({ score: undefined, answers: { 'goal:abc': 'On track' } }),
    ).toBe(4)
  })

  it('resumes at step 5 once a score has been set', () => {
    expect(resumeStepForWeekly({ score: 3, answers: {} })).toBe(5)
    expect(
      resumeStepForWeekly({ score: 3, answers: { 'goal:abc': 'On track' } }),
    ).toBe(5)
  })
})

describe('monthly and yearly reviews do not collide with each other or with weekly/daily', () => {
  it('keeps all four review types independent for the same periodKey string', async () => {
    await reviews.upsert('daily', '2026-08', { score: 1 })
    await reviews.upsert('weekly', '2026-08', { score: 2 })
    await reviews.upsert('monthly', '2026-08', { score: 3 })
    await reviews.upsert('yearly', '2026-08', { score: 4 })

    expect((await reviews.getByPeriod('daily', '2026-08'))?.score).toBe(1)
    expect((await reviews.getByPeriod('weekly', '2026-08'))?.score).toBe(2)
    expect((await reviews.getByPeriod('monthly', '2026-08'))?.score).toBe(3)
    expect((await reviews.getByPeriod('yearly', '2026-08'))?.score).toBe(4)
  })
})

describe('resumeStepForMonthly', () => {
  it('resumes at step 1 when there is no review yet', () => {
    expect(resumeStepForMonthly(undefined)).toBe(1)
  })

  it('resumes at step 1 when no score has been set', () => {
    expect(resumeStepForMonthly({ score: undefined, answers: {} })).toBe(1)
  })

  it('resumes at step 3 once a score has been set', () => {
    expect(resumeStepForMonthly({ score: 4, answers: {} })).toBe(3)
  })
})

describe('resumeStepForYearly', () => {
  it('resumes at step 1 when there is no review yet', () => {
    expect(resumeStepForYearly(undefined)).toBe(1)
  })

  it('resumes at step 1 when nothing has been recorded', () => {
    expect(resumeStepForYearly({ score: undefined, answers: {} })).toBe(1)
  })

  it('resumes at step 2 once a reflection answer exists but no score yet', () => {
    expect(
      resumeStepForYearly({ score: undefined, answers: { biggestWin: 'Shipped it' } }),
    ).toBe(2)
    expect(
      resumeStepForYearly({ score: undefined, answers: { stopStartContinue: 'Start earlier' } }),
    ).toBe(2)
  })

  it('resumes at step 3 once a score has been set', () => {
    expect(resumeStepForYearly({ score: 5, answers: {} })).toBe(3)
    expect(
      resumeStepForYearly({ score: 5, answers: { biggestLesson: 'Slow down' } }),
    ).toBe(3)
  })
})

describe('reviews.getCompletedWeeklyReviews', () => {
  it('returns only completed weekly reviews within range, sorted oldest-first', async () => {
    await reviews.upsert('weekly', '2026-08-03', { score: 4, completedAt: '2026-08-04T00:00:00.000Z' })
    await reviews.upsert('weekly', '2026-07-27', { score: 3, completedAt: '2026-07-28T00:00:00.000Z' })
    // Not completed yet — should be excluded.
    await reviews.upsert('weekly', '2026-08-10', { score: 5 })
    // A different type sharing a periodKey — should never leak in.
    await reviews.upsert('daily', '2026-08-03', { score: 1, completedAt: '2026-08-03T12:00:00.000Z' })

    const result = await reviews.getCompletedWeeklyReviews('2026-07-01', '2026-08-31')
    expect(result.map((r) => r.periodKey)).toEqual(['2026-07-27', '2026-08-03'])
    expect(result[0].score).toBe(3)
    expect(result[1].score).toBe(4)
  })

  it('excludes reviews outside the requested range', async () => {
    await reviews.upsert('weekly', '2026-01-05', { score: 4, completedAt: '2026-01-06T00:00:00.000Z' })
    const result = await reviews.getCompletedWeeklyReviews('2026-07-01', '2026-08-31')
    expect(result).toHaveLength(0)
  })
})
