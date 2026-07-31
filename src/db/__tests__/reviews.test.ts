import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from './testUtils'
import * as reviews from '../repo/reviews'
import { resumeStepFor } from '../../lib/reviewResume'

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
