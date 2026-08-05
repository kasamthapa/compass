import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from './testUtils'
import * as milestones from '../repo/milestones'
import * as goals from '../repo/goals'

beforeEach(resetDb)

describe('milestones.getForMonth', () => {
  it('returns milestones across multiple goals for the same month', async () => {
    const goalA = await goals.create({ title: 'Goal A', why: 'why', year: 2026, order: 0 })
    const goalB = await goals.create({ title: 'Goal B', why: 'why', year: 2026, order: 1 })

    await milestones.create({ goalId: goalA.id, title: 'A milestone', month: '2026-08' })
    await milestones.create({ goalId: goalB.id, title: 'B milestone', month: '2026-08' })
    await milestones.create({ goalId: goalA.id, title: 'Different month', month: '2026-09' })

    const august = await milestones.getForMonth('2026-08')
    expect(august.map((m) => m.title).sort()).toEqual(['A milestone', 'B milestone'])
  })

  it('excludes soft-deleted milestones', async () => {
    const goal = await goals.create({ title: 'Goal', why: 'why', year: 2026, order: 0 })
    const milestone = await milestones.create({ goalId: goal.id, title: 'temp', month: '2026-08' })

    const { db } = await import('../db')
    await db.milestones.update(milestone.id, { deletedAt: new Date().toISOString() })

    expect(await milestones.getForMonth('2026-08')).toHaveLength(0)
  })
})

describe('carrying a milestone to next month', () => {
  it('moves the record to the next month rather than duplicating it', async () => {
    // Mirrors the monthly review's "carry" action (MonthlyReviewDialog.tsx):
    // update the existing record's month in place — same "carry moves,
    // doesn't duplicate" shape as weekly priorities. See DECISIONS.md.
    const goal = await goals.create({ title: 'Goal', why: 'why', year: 2026, order: 0 })
    const milestone = await milestones.create({ goalId: goal.id, title: 'Ship the draft', month: '2026-08' })

    await milestones.update(milestone.id, { month: '2026-09' })

    const thisMonth = await milestones.getForMonth('2026-08')
    const nextMonth = await milestones.getForMonth('2026-09')
    expect(thisMonth).toHaveLength(0)
    expect(nextMonth).toHaveLength(1)
    expect(nextMonth[0].id).toBe(milestone.id)
    expect(nextMonth[0].title).toBe('Ship the draft')
  })

  it('preserves status when carrying, and setStatus still works independently', async () => {
    const goal = await goals.create({ title: 'Goal', why: 'why', year: 2026, order: 0 })
    const milestone = await milestones.create({ goalId: goal.id, title: 'Milestone', month: '2026-08' })
    await milestones.setStatus(milestone.id, 'done')

    await milestones.update(milestone.id, { month: '2026-09' })

    const [carried] = await milestones.getForMonth('2026-09')
    expect(carried.status).toBe('done')

    await milestones.setStatus(carried.id, 'dropped')
    const [afterDrop] = await milestones.getForMonth('2026-09')
    expect(afterDrop.status).toBe('dropped')
  })
})
