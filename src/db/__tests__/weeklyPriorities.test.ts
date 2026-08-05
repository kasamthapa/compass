import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from './testUtils'
import * as weeklyPriorities from '../repo/weeklyPriorities'
import { RuleViolationError } from '../rules'
import { weekOf } from '../../lib/dates'

beforeEach(resetDb)

describe('weekly priority hard cap', () => {
  it('allows up to 3 priorities for a week and rejects a 4th', async () => {
    const week = weekOf('2026-08-05')
    await weeklyPriorities.create({ title: 'Priority 1', weekOf: week, order: 0 })
    await weeklyPriorities.create({ title: 'Priority 2', weekOf: week, order: 1 })
    await weeklyPriorities.create({ title: 'Priority 3', weekOf: week, order: 2 })

    await expect(
      weeklyPriorities.create({ title: 'Priority 4', weekOf: week, order: 3 }),
    ).rejects.toThrow(RuleViolationError)

    const forWeek = await weeklyPriorities.getForWeek(week)
    expect(forWeek).toHaveLength(3)
  })

  it('does not count a dropped priority against the cap', async () => {
    const week = weekOf('2026-08-05')
    const first = await weeklyPriorities.create({ title: 'Priority 1', weekOf: week, order: 0 })
    await weeklyPriorities.create({ title: 'Priority 2', weekOf: week, order: 1 })
    await weeklyPriorities.create({ title: 'Priority 3', weekOf: week, order: 2 })
    await weeklyPriorities.setStatus(first.id, 'dropped')

    const fourth = await weeklyPriorities.create({ title: 'Priority 4', weekOf: week, order: 3 })
    expect(fourth.status).toBe('active')
  })

  it('does not let a different week be affected by another week being at cap', async () => {
    const week = weekOf('2026-08-05')
    const nextWeek = weekOf('2026-08-12')
    await weeklyPriorities.create({ title: 'Priority 1', weekOf: week, order: 0 })
    await weeklyPriorities.create({ title: 'Priority 2', weekOf: week, order: 1 })
    await weeklyPriorities.create({ title: 'Priority 3', weekOf: week, order: 2 })

    const nextWeekPriority = await weeklyPriorities.create({
      title: 'Priority in next week',
      weekOf: nextWeek,
      order: 0,
    })
    expect(nextWeekPriority.status).toBe('active')
  })
})

describe('carrying a priority to next week', () => {
  it('moves the record to the next week rather than duplicating it', async () => {
    // Mirrors the weekly review's "carry" action (WeekPriorities.tsx /
    // WeeklyReviewDialog.tsx): update the existing record's weekOf in
    // place — see DECISIONS.md's "carry moves, doesn't duplicate" entry.
    const week = weekOf('2026-08-05')
    const nextWeek = weekOf('2026-08-12')
    const priority = await weeklyPriorities.create({ title: 'Ship the draft', weekOf: week, order: 0 })

    await weeklyPriorities.update(priority.id, { weekOf: nextWeek })

    const thisWeek = await weeklyPriorities.getForWeek(week)
    const following = await weeklyPriorities.getForWeek(nextWeek)
    expect(thisWeek).toHaveLength(0)
    expect(following).toHaveLength(1)
    expect(following[0].id).toBe(priority.id)
    expect(following[0].title).toBe('Ship the draft')
  })

  it('frees up a slot in the original week for a new priority', async () => {
    const week = weekOf('2026-08-05')
    const nextWeek = weekOf('2026-08-12')
    await weeklyPriorities.create({ title: 'Priority 1', weekOf: week, order: 0 })
    await weeklyPriorities.create({ title: 'Priority 2', weekOf: week, order: 1 })
    const third = await weeklyPriorities.create({ title: 'Priority 3', weekOf: week, order: 2 })

    await weeklyPriorities.update(third.id, { weekOf: nextWeek })

    // The week that just lost a priority to a carry should accept a new one.
    const replacement = await weeklyPriorities.create({ title: 'New priority', weekOf: week, order: 2 })
    expect(replacement.status).toBe('active')
    expect(await weeklyPriorities.getForWeek(week)).toHaveLength(3)
  })
})
