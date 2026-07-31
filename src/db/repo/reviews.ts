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

/** periodKeys of completed 'daily' reviews whose periodKey falls within [startDate, endDate]. */
export async function getCompletedDailyPeriodKeys(
  startDate: string,
  endDate: string,
): Promise<string[]> {
  const reviews = await db.reviews
    .where('[type+periodKey]')
    .between(['daily', startDate], ['daily', endDate], true, true)
    .filter((review) => !review.deletedAt && Boolean(review.completedAt))
    .toArray()
  return reviews.map((review) => review.periodKey)
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
