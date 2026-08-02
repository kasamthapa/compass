import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from './testUtils'
import { db } from '../db'
import * as captures from '../repo/captures'
import * as tasks from '../repo/tasks'
import * as habits from '../repo/habits'
import { RuleViolationError } from '../rules'
import { todayISO } from '../../lib/dates'

beforeEach(resetDb)

describe('capture -> task conversion', () => {
  it('creates the task and marks the capture processed with the right convertedTo', async () => {
    const capture = await captures.create('Email the landlord')
    const task = await tasks.create({ title: capture.text, date: todayISO(), isMIT: true })
    await captures.markProcessed(capture.id, { type: 'task', id: task.id })

    const unprocessed = await captures.getUnprocessed()
    expect(unprocessed.map((item) => item.id)).not.toContain(capture.id)

    const stored = await db.captures.get(capture.id)
    expect(stored?.processed).toBe(true)
    expect(stored?.convertedTo).toEqual({ type: 'task', id: task.id })

    const todayTasks = await tasks.getForDate(todayISO())
    expect(todayTasks.map((t) => t.id)).toContain(task.id)
  })
})

describe('someday', () => {
  it('moves an item out of the main inbox and into getSomeday, without marking it processed', async () => {
    const capture = await captures.create('Learn to sail')
    await captures.markSomeday(capture.id)

    const unprocessed = await captures.getUnprocessed()
    expect(unprocessed.map((item) => item.id)).not.toContain(capture.id)

    const someday = await captures.getSomeday()
    expect(someday.map((item) => item.id)).toContain(capture.id)

    const stored = await db.captures.get(capture.id)
    expect(stored?.processed).toBe(false)
  })
})

describe('caps enforced on conversion paths', () => {
  it('rejects a 6th active habit but allows saving as paused instead', async () => {
    for (let i = 0; i < 5; i++) {
      await habits.create({ name: `Habit ${i}`, cue: 'cue', targetPerWeek: 3 })
    }

    await expect(
      habits.create({ name: 'Sixth', cue: 'cue', targetPerWeek: 3 }),
    ).rejects.toThrow(RuleViolationError)

    const paused = await habits.create({
      name: 'Sixth, paused',
      cue: 'cue',
      targetPerWeek: 3,
      status: 'paused',
    })
    expect(paused.status).toBe('paused')

    const active = await habits.getActive()
    expect(active).toHaveLength(5)
  })

  it('rejects a 4th MIT for the same day', async () => {
    const date = todayISO()
    await tasks.create({ title: 'MIT 1', date, isMIT: true })
    await tasks.create({ title: 'MIT 2', date, isMIT: true })
    await tasks.create({ title: 'MIT 3', date, isMIT: true })

    await expect(
      tasks.create({ title: 'MIT 4', date, isMIT: true }),
    ).rejects.toThrow(RuleViolationError)
  })
})
