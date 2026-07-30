import { db } from './db'

// Product-law limits (see CLAUDE.md rule 3) — do not "improve" these.
const MAX_ACTIVE_HABITS = 5
const MAX_MITS_PER_DAY = 3
const MAX_WEEKLY_PRIORITIES = 3

export type RuleViolationCode = 'MAX_ACTIVE_HABITS' | 'MAX_MITS' | 'MAX_WEEKLY_PRIORITIES'

export class RuleViolationError extends Error {
  code: RuleViolationCode

  constructor(code: RuleViolationCode, message: string) {
    super(message)
    this.name = 'RuleViolationError'
    this.code = code
  }
}

export async function canActivateHabit(): Promise<boolean> {
  const count = await db.habits
    .where('status')
    .equals('active')
    .filter((habit) => !habit.deletedAt)
    .count()
  return count < MAX_ACTIVE_HABITS
}

export async function canAddMIT(date: string): Promise<boolean> {
  const count = await db.tasks
    .where('date')
    .equals(date)
    .filter((task) => task.isMIT && task.status !== 'dropped' && !task.deletedAt)
    .count()
  return count < MAX_MITS_PER_DAY
}

export async function canAddWeeklyPriority(weekOf: string): Promise<boolean> {
  const count = await db.weeklyPriorities
    .where('weekOf')
    .equals(weekOf)
    .filter((priority) => priority.status !== 'dropped' && !priority.deletedAt)
    .count()
  return count < MAX_WEEKLY_PRIORITIES
}
