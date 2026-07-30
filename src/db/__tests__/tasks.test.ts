import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from './testUtils'
import * as tasks from '../repo/tasks'
import { RuleViolationError } from '../rules'
import { todayISO } from '../../lib/dates'

beforeEach(resetDb)

describe('MIT limit', () => {
  it('allows up to 3 MITs per day and rejects a 4th', async () => {
    const date = todayISO()
    await tasks.create({ title: 'MIT 1', date, isMIT: true })
    await tasks.create({ title: 'MIT 2', date, isMIT: true })
    await tasks.create({ title: 'MIT 3', date, isMIT: true })

    await expect(tasks.create({ title: 'MIT 4', date, isMIT: true })).rejects.toThrow(
      RuleViolationError,
    )

    const mits = await tasks.getMITsForDate(date)
    expect(mits).toHaveLength(3)
  })

  it('does not count non-MIT tasks against the limit', async () => {
    const date = todayISO()
    await tasks.create({ title: 'Regular task', date, isMIT: false })
    await tasks.create({ title: 'MIT 1', date, isMIT: true })

    const all = await tasks.getForDate(date)
    expect(all).toHaveLength(2)
  })
})
