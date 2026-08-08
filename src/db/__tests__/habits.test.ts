import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from './testUtils'
import * as habits from '../repo/habits'
import { RuleViolationError } from '../rules'
import { todayISO, weekOf, addDays } from '../../lib/dates'

beforeEach(resetDb)

describe('habit logging toggle', () => {
  it('goes empty -> done -> removed on repeated taps', async () => {
    const habit = await habits.create({ name: 'Test habit', cue: 'cue', targetPerWeek: 5 })
    const date = todayISO()

    const first = await habits.logHabit(habit.id, date, 'done')
    expect(first?.status).toBe('done')

    const withLog = await habits.getActiveWithTodayLog(date)
    expect(withLog.find((h) => h.id === habit.id)?.todayStatus).toBe('done')

    const second = await habits.logHabit(habit.id, date, 'done')
    expect(second).toBeNull()

    const afterRemoval = await habits.getActiveWithTodayLog(date)
    expect(afterRemoval.find((h) => h.id === habit.id)?.todayStatus).toBeNull()
  })

  it('supports a separate skip path that switches an existing done log', async () => {
    const habit = await habits.create({ name: 'Test habit', cue: 'cue', targetPerWeek: 5 })
    const date = todayISO()

    await habits.logHabit(habit.id, date, 'done')
    const skipped = await habits.logHabit(habit.id, date, 'skipped')
    expect(skipped?.status).toBe('skipped')

    const removed = await habits.logHabit(habit.id, date, 'skipped')
    expect(removed).toBeNull()
  })
})

describe('max active habits', () => {
  it('rejects a 6th active habit', async () => {
    for (let i = 0; i < 5; i++) {
      await habits.create({ name: `Habit ${i}`, cue: 'cue', targetPerWeek: 3 })
    }

    await expect(
      habits.create({ name: 'One too many', cue: 'cue', targetPerWeek: 3 }),
    ).rejects.toThrow(RuleViolationError)

    const active = await habits.getActive()
    expect(active).toHaveLength(5)
  })
})

describe('weeklyHitRate', () => {
  it('counts only done logs within the week against the target', async () => {
    const habit = await habits.create({ name: 'Test habit', cue: 'cue', targetPerWeek: 4 })
    const monday = weekOf(todayISO())
    const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

    await habits.logHabit(habit.id, days[0], 'done')
    await habits.logHabit(habit.id, days[1], 'done')
    await habits.logHabit(habit.id, days[2], 'skipped')
    // days[3..6] left empty

    const rate = await habits.weeklyHitRate(habit.id, monday)
    expect(rate).toEqual({ done: 2, target: 4 })
  })
})

describe('habits.getActiveAndPaused', () => {
  it('includes both active and paused habits but excludes archived', async () => {
    const active = await habits.create({ name: 'Active', cue: '', targetPerWeek: 3 })
    const paused = await habits.create({ name: 'Paused', cue: '', targetPerWeek: 3, status: 'paused' })
    const archived = await habits.create({ name: 'Archived', cue: '', targetPerWeek: 3 })
    await habits.setStatus(archived.id, 'archived')

    const result = await habits.getActiveAndPaused()
    const ids = result.map((h) => h.id).sort()
    expect(ids).toEqual([active.id, paused.id].sort())
  })
})
