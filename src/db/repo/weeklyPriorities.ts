import { db } from '../db'
import type { WeeklyPriority } from '../../types/models'
import { nowISO } from '../../lib/dates'
import { canAddWeeklyPriority, RuleViolationError } from '../rules'

export interface CreateWeeklyPriorityInput {
  title: string
  weekOf: string
  milestoneId?: string
  goalId?: string
  order: number
}

export async function create(input: CreateWeeklyPriorityInput): Promise<WeeklyPriority> {
  const allowed = await canAddWeeklyPriority(input.weekOf)
  if (!allowed) {
    throw new RuleViolationError(
      'MAX_WEEKLY_PRIORITIES',
      'You can have at most 3 weekly priorities.',
    )
  }
  const timestamp = nowISO()
  const priority: WeeklyPriority = {
    id: crypto.randomUUID(),
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  }
  await db.weeklyPriorities.add(priority)
  return priority
}

export async function update(
  id: string,
  patch: Partial<Pick<WeeklyPriority, 'title' | 'weekOf' | 'milestoneId' | 'goalId' | 'order'>>,
): Promise<void> {
  await db.weeklyPriorities.update(id, { ...patch, updatedAt: nowISO() })
}

export async function setStatus(id: string, status: WeeklyPriority['status']): Promise<void> {
  await db.weeklyPriorities.update(id, { status, updatedAt: nowISO() })
}

export async function getForWeek(weekOf: string): Promise<WeeklyPriority[]> {
  return db.weeklyPriorities
    .where('weekOf')
    .equals(weekOf)
    .filter((priority) => !priority.deletedAt)
    .toArray()
}
