import type { Task } from '../types/models'

/**
 * The single next action to focus on: the first incomplete MIT (by creation
 * order), falling back to the first incomplete non-MIT task. Returns null if
 * everything for the day is done/dropped, or there are no tasks at all —
 * both cases are "nothing to pick," just for different reasons.
 */
export function pickNextAction(tasks: Task[]): Task | null {
  function firstIncomplete(list: Task[]): Task | null {
    const incomplete = list
      .filter((task) => task.status !== 'done' && task.status !== 'dropped')
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    return incomplete[0] ?? null
  }

  const mit = firstIncomplete(tasks.filter((task) => task.isMIT))
  if (mit) return mit

  return firstIncomplete(tasks.filter((task) => !task.isMIT))
}
