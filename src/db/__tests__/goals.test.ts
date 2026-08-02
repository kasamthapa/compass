import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from './testUtils'
import * as goals from '../repo/goals'
import * as milestones from '../repo/milestones'
import { isAtGoalSoftCap } from '../rules'

beforeEach(resetDb)

describe('goals.progress', () => {
  it('returns 0 for a goal with no milestones', async () => {
    const goal = await goals.create({ title: 'Learn piano', why: 'because music', year: 2026, order: 0 })
    expect(await goals.progress(goal.id)).toBe(0)
  })

  it('reflects the ratio of done to total milestones, rounded', async () => {
    const goal = await goals.create({ title: 'Learn piano', why: 'because music', year: 2026, order: 0 })
    const a = await milestones.create({ goalId: goal.id, title: 'Scales', month: '2026-01' })
    await milestones.create({ goalId: goal.id, title: 'First song', month: '2026-02' })
    await milestones.create({ goalId: goal.id, title: 'Recital', month: '2026-03' })

    expect(await goals.progress(goal.id)).toBe(0)

    await milestones.setStatus(a.id, 'done')
    expect(await goals.progress(goal.id)).toBe(33)
  })

  it('excludes soft-deleted milestones', async () => {
    const goal = await goals.create({ title: 'Learn piano', why: 'because music', year: 2026, order: 0 })
    const a = await milestones.create({ goalId: goal.id, title: 'Scales', month: '2026-01' })
    const b = await milestones.create({ goalId: goal.id, title: 'First song', month: '2026-02' })
    await milestones.setStatus(a.id, 'done')

    const { db } = await import('../db')
    await db.milestones.update(b.id, { deletedAt: new Date().toISOString() })

    expect(await goals.progress(goal.id)).toBe(100)
  })
})

describe('goals.getArchived', () => {
  it('returns only achieved/dropped goals, not active ones', async () => {
    const active = await goals.create({ title: 'Active', why: 'why', year: 2026, order: 0 })
    const achieved = await goals.create({ title: 'Achieved', why: 'why', year: 2026, order: 1 })
    const dropped = await goals.create({ title: 'Dropped', why: 'why', year: 2026, order: 2 })
    await goals.update(achieved.id, { status: 'achieved' })
    await goals.update(dropped.id, { status: 'dropped' })

    const archived = await goals.getArchived()
    expect(archived.map((g) => g.id).sort()).toEqual([achieved.id, dropped.id].sort())

    const activeGoals = await goals.getActive()
    expect(activeGoals.map((g) => g.id)).toEqual([active.id])
  })
})

describe('isAtGoalSoftCap', () => {
  it('is false under 5 active goals and true at 5, but never blocks creation', async () => {
    for (let i = 0; i < 4; i++) {
      await goals.create({ title: `Goal ${i}`, why: 'why', year: 2026, order: i })
    }
    expect(await isAtGoalSoftCap()).toBe(false)

    await goals.create({ title: 'Goal 5', why: 'why', year: 2026, order: 4 })
    expect(await isAtGoalSoftCap()).toBe(true)

    // Still allowed to save a 6th — this is a nudge, not a RuleViolationError.
    const sixth = await goals.create({ title: 'Goal 6', why: 'why', year: 2026, order: 5 })
    expect(sixth.status).toBe('active')
    expect(await goals.getActive()).toHaveLength(6)
  })
})
