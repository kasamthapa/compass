import { describe, expect, it } from 'vitest'
import { pickNextAction } from '../nextAction'
import type { Task } from '../../types/models'

let counter = 0
function makeTask(overrides: Partial<Task> = {}): Task {
  counter += 1
  return {
    id: `task-${counter}`,
    title: `Task ${counter}`,
    status: 'todo',
    isMIT: false,
    createdAt: '2026-07-31T00:00:00.000Z',
    updatedAt: '2026-07-31T00:00:00.000Z',
    ...overrides,
  }
}

describe('pickNextAction', () => {
  it('returns null when there are no tasks', () => {
    expect(pickNextAction([])).toBeNull()
  })

  it('picks the first incomplete MIT over non-MIT tasks', () => {
    const other = makeTask({ title: 'Other', isMIT: false })
    const mit = makeTask({ title: 'MIT', isMIT: true })
    expect(pickNextAction([other, mit])?.title).toBe('MIT')
  })

  it('picks MITs in creation order, not array order', () => {
    const first = makeTask({ title: 'First', isMIT: true, createdAt: '2026-07-31T08:00:00.000Z' })
    const second = makeTask({ title: 'Second', isMIT: true, createdAt: '2026-07-31T09:00:00.000Z' })
    expect(pickNextAction([second, first])?.title).toBe('First')
  })

  it('skips done and dropped MITs', () => {
    const done = makeTask({ title: 'Done MIT', isMIT: true, status: 'done', createdAt: '2026-07-31T08:00:00.000Z' })
    const dropped = makeTask({
      title: 'Dropped MIT',
      isMIT: true,
      status: 'dropped',
      createdAt: '2026-07-31T08:30:00.000Z',
    })
    const todo = makeTask({ title: 'Todo MIT', isMIT: true, createdAt: '2026-07-31T09:00:00.000Z' })
    expect(pickNextAction([done, dropped, todo])?.title).toBe('Todo MIT')
  })

  it('falls back to a non-MIT task when no MITs are incomplete', () => {
    const doneMit = makeTask({ title: 'Done MIT', isMIT: true, status: 'done' })
    const other = makeTask({ title: 'Other task', isMIT: false })
    expect(pickNextAction([doneMit, other])?.title).toBe('Other task')
  })

  it('returns null when everything is done or dropped', () => {
    const doneMit = makeTask({ isMIT: true, status: 'done' })
    const droppedOther = makeTask({ isMIT: false, status: 'dropped' })
    expect(pickNextAction([doneMit, droppedOther])).toBeNull()
  })
})
