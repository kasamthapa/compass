import { db } from '../db'
import type { Review } from '../../types/models'
import { nowISO } from '../../lib/dates'

export type ReviewPatch = Partial<Pick<Review, 'answers' | 'score' | 'completedAt'>>

export async function upsert(
  type: Review['type'],
  periodKey: string,
  patch: ReviewPatch,
): Promise<Review> {
  const existing = await getByPeriod(type, periodKey)
  const timestamp = nowISO()

  if (existing) {
    const updated: Review = { ...existing, ...patch, updatedAt: timestamp }
    await db.reviews.update(existing.id, { ...patch, updatedAt: timestamp })
    return updated
  }

  const review: Review = {
    id: crypto.randomUUID(),
    type,
    periodKey,
    answers: patch.answers ?? {},
    score: patch.score,
    completedAt: patch.completedAt,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  await db.reviews.add(review)
  return review
}

export interface DailyReviewSummary {
  periodKey: string
  score?: 1 | 2 | 3 | 4 | 5
}

/** Completed 'daily' reviews (periodKey + score) whose periodKey falls within [startDate, endDate]. */
export async function getCompletedDailyReviews(
  startDate: string,
  endDate: string,
): Promise<DailyReviewSummary[]> {
  const reviews = await db.reviews
    .where('[type+periodKey]')
    .between(['daily', startDate], ['daily', endDate], true, true)
    .filter((review) => !review.deletedAt && Boolean(review.completedAt))
    .toArray()
  return reviews.map((review) => ({ periodKey: review.periodKey, score: review.score }))
}

export async function getByPeriod(
  type: Review['type'],
  periodKey: string,
): Promise<Review | undefined> {
  return db.reviews
    .where('[type+periodKey]')
    .equals([type, periodKey])
    .filter((review) => !review.deletedAt)
    .first()
}
