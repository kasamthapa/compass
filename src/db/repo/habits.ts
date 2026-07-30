import { db } from '../db'
import type { Habit, HabitLog } from '../../types/models'
import { nowISO, addDays } from '../../lib/dates'
import { canActivateHabit, RuleViolationError } from '../rules'

export interface CreateHabitInput {
  name: string
  cue: string
  targetPerWeek: number
  goalId?: string
  color?: string
}

export async function create(input: CreateHabitInput): Promise<Habit> {
  const allowed = await canActivateHabit()
  if (!allowed) {
    throw new RuleViolationError('MAX_ACTIVE_HABITS', 'You can have at most 5 active habits.')
  }
  const timestamp = nowISO()
  const habit: Habit = {
    id: crypto.randomUUID(),
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  }
  await db.habits.add(habit)
  return habit
}

export async function update(
  id: string,
  patch: Partial<Pick<Habit, 'name' | 'cue' | 'targetPerWeek' | 'goalId' | 'color'>>,
): Promise<void> {
  await db.habits.update(id, { ...patch, updatedAt: nowISO() })
}

export async function setStatus(id: string, status: Habit['status']): Promise<void> {
  if (status === 'active') {
    const allowed = await canActivateHabit()
    if (!allowed) {
      throw new RuleViolationError('MAX_ACTIVE_HABITS', 'You can have at most 5 active habits.')
    }
  }
  await db.habits.update(id, { status, updatedAt: nowISO() })
}

export async function getActive(): Promise<Habit[]> {
  return db.habits
    .where('status')
    .equals('active')
    .filter((habit) => !habit.deletedAt)
    .toArray()
}

export interface HabitWithTodayLog extends Habit {
  todayStatus: HabitLog['status'] | null
}

export async function getActiveWithTodayLog(date: string): Promise<HabitWithTodayLog[]> {
  const [habits, logs] = await Promise.all([
    getActive(),
    db.habitLogs
      .where('date')
      .equals(date)
      .filter((log) => !log.deletedAt)
      .toArray(),
  ])
  const statusByHabit = new Map(logs.map((log) => [log.habitId, log.status]))
  return habits.map((habit) => ({
    ...habit,
    todayStatus: statusByHabit.get(habit.id) ?? null,
  }))
}

/**
 * Toggle behavior: calling with the same status the log already has removes
 * it (back to empty). Calling with a different status switches it. Calling
 * on an empty day creates the log. Returns the resulting log, or null if the
 * log was removed.
 */
export async function logHabit(
  habitId: string,
  date: string,
  status: HabitLog['status'],
): Promise<HabitLog | null> {
  const existing = await db.habitLogs
    .where('[habitId+date]')
    .equals([habitId, date])
    .filter((log) => !log.deletedAt)
    .first()

  const timestamp = nowISO()

  if (existing) {
    if (existing.status === status) {
      await db.habitLogs.update(existing.id, { deletedAt: timestamp, updatedAt: timestamp })
      return null
    }
    await db.habitLogs.update(existing.id, { status, updatedAt: timestamp })
    return { ...existing, status, updatedAt: timestamp }
  }

  const log: HabitLog = {
    id: crypto.randomUUID(),
    habitId,
    date,
    status,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  await db.habitLogs.add(log)
  return log
}

export async function weeklyHitRate(
  habitId: string,
  weekOf: string,
): Promise<{ done: number; target: number }> {
  const habit = await db.habits.get(habitId)
  const target = habit?.targetPerWeek ?? 0
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekOf, i))
  const logs = await db.habitLogs
    .where('[habitId+date]')
    .anyOf(days.map((date) => [habitId, date]))
    .filter((log) => log.status === 'done' && !log.deletedAt)
    .toArray()
  return { done: logs.length, target }
}
