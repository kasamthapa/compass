// Pure computation for the Insights page — no Dexie access here (repos own
// that; this module only transforms data already fetched via repo calls).
// Deliberately conservative about what it's willing to assert: both
// functions return null rather than a weak/noisy signal when there isn't
// enough history to say something meaningful. See DECISIONS.md.
//
// Product law: never compute or display a raw streak count anywhere in
// Insights — habit history is always framed as a trend (up/down/steady),
// never a "N days in a row" number. See CLAUDE.md.

export interface WeeklyRate {
  weekOf: string
  /** done/target for that week, in [0, 1]. */
  rate: number
}

export type HabitTrend = 'up' | 'down' | 'steady'

const TREND_WEEKS = 8
const TREND_HALF = TREND_WEEKS / 2
const TREND_THRESHOLD = 0.1

/**
 * Compares the average weekly hit-rate over the most recent 4 weeks against
 * the 4 weeks before that. Requires at least 8 weeks of rate data (with a
 * real target, i.e. the habit existed) — with fewer, there's nothing
 * trustworthy to compare, so this returns null rather than guessing from a
 * couple of data points.
 */
export function habitTrend(weeklyRates: WeeklyRate[]): HabitTrend | null {
  if (weeklyRates.length < TREND_WEEKS) return null
  const lastEight = weeklyRates.slice(-TREND_WEEKS)
  const previous = lastEight.slice(0, TREND_HALF)
  const recent = lastEight.slice(TREND_HALF)
  const average = (weeks: WeeklyRate[]) => weeks.reduce((sum, w) => sum + w.rate, 0) / weeks.length
  const diff = average(recent) - average(previous)
  if (diff > TREND_THRESHOLD) return 'up'
  if (diff < -TREND_THRESHOLD) return 'down'
  return 'steady'
}

/** Plain-language label for a trend — used instead of any numeric streak. */
export function trendLabel(trend: HabitTrend): string {
  if (trend === 'up') return 'picking up'
  if (trend === 'down') return 'quieter lately'
  return 'steady'
}

export interface WeekPoint {
  weekOf: string
  /** The week's rated score, 1-5. */
  score: number
  /** Average habit completion rate across active habits that week, in [0, 1]. */
  completionRate: number
}

export const MIN_PAIRED_WEEKS = 4
const MIN_SCORE_GAP = 0.4

/**
 * Looks for a plain-language pattern between how much of their habits
 * someone kept up with in a week and how they rated that week — a median
 * split, not a real correlation coefficient (this is a calm observation,
 * not a statistics feature). Requires at least 4 weeks that have BOTH a
 * completed weekly review and habit data, and only speaks up if the gap
 * between the two halves is at least 0.4 points on the 1-5 scale — small
 * samples and small gaps are noise, not a pattern worth surfacing. Returns
 * null when there's nothing meaningful to say (either reason).
 */
export function computeObservation(points: WeekPoint[]): string | null {
  if (points.length < MIN_PAIRED_WEEKS) return null

  const sorted = [...points].sort((a, b) => a.completionRate - b.completionRate)
  const half = Math.floor(sorted.length / 2)
  const lowerHalf = sorted.slice(0, half)
  const upperHalf = sorted.slice(sorted.length - half)

  const averageScore = (weeks: WeekPoint[]) => weeks.reduce((sum, w) => sum + w.score, 0) / weeks.length
  const lowerAvg = averageScore(lowerHalf)
  const upperAvg = averageScore(upperHalf)
  const diff = upperAvg - lowerAvg

  if (Math.abs(diff) < MIN_SCORE_GAP) return null

  if (diff > 0) {
    return 'Your week tends to score a bit higher when you keep up with more of your habits — just a pattern, not a rule.'
  }
  return 'Your week tends to score a bit higher when you keep up with fewer of your habits — worth noticing, not worrying about.'
}
