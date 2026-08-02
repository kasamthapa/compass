import { db } from './db'

// Product-law limits (see CLAUDE.md rule 3) — do not "improve" these.
const MAX_ACTIVE_HABITS = 5
const MAX_MITS_PER_DAY = 3
const MAX_WEEKLY_PRIORITIES = 3

// Goals get a SOFT cap only — a nudge, never a block (see CLAUDE.md Phase 4A
// spec). This is why it's a plain boolean check below rather than a
// RuleViolationError-throwing function like the hard caps above.
const GOAL_SOFT_CAP = 5

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

/** Advisory only — never throws. UI shows a calm nudge, save proceeds either way. */
export async function isAtGoalSoftCap(): Promise<boolean> {
  const count = await db.goals
    .where('status')
    .equals('active')
    .filter((goal) => !goal.deletedAt)
    .count()
  return count >= GOAL_SOFT_CAP
}
