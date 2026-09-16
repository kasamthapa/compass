import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from './testUtils'
import * as sprints from '../repo/sprints'
import { isAtSprintSoftCap } from '../rules'

beforeEach(resetDb)

describe('sprints.create', () => {
  it('defaults to active status', async () => {
    const sprint = await sprints.create({ title: 'Ship the landing page', startDate: '2026-08-01', days: 7 })
    expect(sprint.status).toBe('active')
    expect(sprint.days).toBe(7)
  })

  it('accepts an optional why', async () => {
    const sprint = await sprints.create({
      title: 'Ship the landing page',
      why: 'Momentum before the launch',
      startDate: '2026-08-01',
      days: 5,
    })
    expect(sprint.why).toBe('Momentum before the launch')
  })
})

describe('sprints.getActive / getArchived', () => {
  it('splits sprints by status, excluding soft-deleted ones', async () => {
    const active = await sprints.create({ title: 'Active one', startDate: '2026-08-01', days: 7 })
    const completed = await sprints.create({ title: 'Done one', startDate: '2026-07-01', days: 7 })
    const dropped = await sprints.create({ title: 'Dropped one', startDate: '2026-07-01', days: 7 })
    const deleted = await sprints.create({ title: 'Deleted one', startDate: '2026-07-01', days: 7 })

    await sprints.setStatus(completed.id, 'completed')
    await sprints.setStatus(dropped.id, 'dropped')

    const { db } = await import('../db')
    await db.sprints.update(deleted.id, { deletedAt: new Date().toISOString() })

    const activeList = await sprints.getActive()
    const archivedList = await sprints.getArchived()

    expect(activeList.map((s) => s.id)).toEqual([active.id])
    expect(archivedList.map((s) => s.id).sort()).toEqual([completed.id, dropped.id].sort())
  })
})

describe('sprints.update', () => {
  it('can extend a sprint by changing its day count', async () => {
    const sprint = await sprints.create({ title: 'Ship it', startDate: '2026-08-01', days: 7 })
    await sprints.update(sprint.id, { days: 14 })
    const [updated] = await sprints.getActive()
    expect(updated.days).toBe(14)
  })
})

describe('isAtSprintSoftCap', () => {
  it('is false below the cap and true at 3 active sprints', async () => {
    expect(await isAtSprintSoftCap()).toBe(false)
    await sprints.create({ title: 'One', startDate: '2026-08-01', days: 7 })
    await sprints.create({ title: 'Two', startDate: '2026-08-01', days: 7 })
    expect(await isAtSprintSoftCap()).toBe(false)
    await sprints.create({ title: 'Three', startDate: '2026-08-01', days: 7 })
    expect(await isAtSprintSoftCap()).toBe(true)
  })

  it('never blocks — create still succeeds past the cap', async () => {
    for (let i = 0; i < 5; i++) {
      await sprints.create({ title: `Sprint ${i}`, startDate: '2026-08-01', days: 7 })
    }
    expect(await isAtSprintSoftCap()).toBe(true)
    expect((await sprints.getActive()).length).toBe(5)
  })
})
