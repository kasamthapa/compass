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
