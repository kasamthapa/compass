import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from './testUtils'
import * as data from '../repo/data'
import * as habits from '../repo/habits'
import * as goals from '../repo/goals'
import * as journal from '../repo/journal'

beforeEach(resetDb)

describe('exportAllData / importAllData round trip', () => {
  it('restores every table exactly after wipe + import', async () => {
    const habit = await habits.create({ name: 'Stretch', cue: 'After coffee', targetPerWeek: 5 })
    await habits.logHabit(habit.id, '2026-08-10', 'done')
    const goal = await goals.create({ title: 'Learn piano', why: 'because music', year: 2026, order: 0 })
    await journal.upsertForDate('2026-08-10', { text: 'Good day', mood: 4, energy: 3 })

    const exported = await data.exportAllData()

    await data.wipeAllData()
    expect(await habits.getActive()).toHaveLength(0)

    await data.importAllData(exported)

    const restoredHabits = await habits.getActive()
    expect(restoredHabits).toHaveLength(1)
    expect(restoredHabits[0].name).toBe('Stretch')

    const restoredGoals = await goals.getActive()
    expect(restoredGoals).toHaveLength(1)
    expect(restoredGoals[0].title).toBe('Learn piano')
    expect(restoredGoals[0].id).toBe(goal.id)

    const restoredEntry = await journal.getForDate('2026-08-10')
    expect(restoredEntry?.text).toBe('Good day')
    expect(restoredEntry?.mood).toBe(4)
  })

  it('replaces rather than merges — data not in the import disappears', async () => {
    await habits.create({ name: 'Old habit', cue: '', targetPerWeek: 3 })
    const exported = await data.exportAllData() // empty-of-goals export

    await habits.create({ name: 'Should be gone after import', cue: '', targetPerWeek: 3 })
    await data.importAllData(exported)

    const restored = await habits.getActive()
    expect(restored.map((h) => h.name)).toEqual(['Old habit'])
  })
})

describe('isValidExport', () => {
  it('accepts a real export', async () => {
    const exported = await data.exportAllData()
    expect(data.isValidExport(exported)).toBe(true)
  })

  it('rejects non-object input', () => {
    expect(data.isValidExport(null)).toBe(false)
    expect(data.isValidExport('a string')).toBe(false)
    expect(data.isValidExport(42)).toBe(false)
  })

  it('rejects the wrong version', () => {
    expect(data.isValidExport({ version: 2, exportedAt: '2026-01-01', tables: {} })).toBe(false)
  })

  it('rejects an unknown table name', () => {
    expect(
      data.isValidExport({
        version: 1,
        exportedAt: '2026-01-01',
        tables: { notARealTable: [] },
      }),
    ).toBe(false)
  })

  it('rejects a table value that is not an array', () => {
    expect(
      data.isValidExport({
        version: 1,
        exportedAt: '2026-01-01',
        tables: { habits: { not: 'an array' } },
      }),
    ).toBe(false)
  })

  it('rejects a foreign JSON file', () => {
    expect(data.isValidExport({ hello: 'world' })).toBe(false)
  })
})

describe('wipeAllData', () => {
  it('clears every table', async () => {
    await habits.create({ name: 'Stretch', cue: '', targetPerWeek: 5 })
    await goals.create({ title: 'Learn piano', why: 'because music', year: 2026, order: 0 })

    await data.wipeAllData()

    expect(await habits.getActive()).toHaveLength(0)
    expect(await goals.getActive()).toHaveLength(0)
  })
})
