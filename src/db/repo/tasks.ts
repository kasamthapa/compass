import { db } from '../db'
import type { Task } from '../../types/models'
import { nowISO, addDays } from '../../lib/dates'
import { canAddMIT, RuleViolationError } from '../rules'

export interface CreateTaskInput {
  title: string
  notes?: string
  date?: string
  isMIT?: boolean
  weeklyPriorityId?: string
  goalId?: string
}

export async function create(input: CreateTaskInput): Promise<Task> {
  if (input.isMIT && input.date) {
    const allowed = await canAddMIT(input.date)
    if (!allowed) {
      throw new RuleViolationError('MAX_MITS', 'You can have at most 3 MITs per day.')
    }
  }
  const timestamp = nowISO()
  const task: Task = {
    id: crypto.randomUUID(),
    title: input.title,
    notes: input.notes,
    status: 'todo',
    date: input.date,
    isMIT: input.isMIT ?? false,
    weeklyPriorityId: input.weeklyPriorityId,
    goalId: input.goalId,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  await db.tasks.add(task)
  return task
}

export async function update(
  id: string,
  patch: Partial<Pick<Task, 'title' | 'notes' | 'date' | 'isMIT' | 'weeklyPriorityId' | 'goalId'>>,
): Promise<void> {
  const existing = await db.tasks.get(id)
  if (!existing) return

  const next = { ...existing, ...patch }
  const wasMitOnSameDate = existing.isMIT && existing.date === next.date
  const becomingMit = Boolean(next.isMIT && next.date) && !wasMitOnSameDate

  if (becomingMit && next.date) {
    const allowed = await canAddMIT(next.date)
    if (!allowed) {
      throw new RuleViolationError('MAX_MITS', 'You can have at most 3 MITs per day.')
    }
  }

  await db.tasks.update(id, { ...patch, updatedAt: nowISO() })
}

export async function setStatus(id: string, status: Task['status']): Promise<void> {
  await db.tasks.update(id, { status, updatedAt: nowISO() })
}

export async function getForDate(date: string): Promise<Task[]> {
  return db.tasks
    .where('date')
    .equals(date)
    .filter((task) => !task.deletedAt)
    .toArray()
}

// `isMIT` is a boolean — not indexed (see DECISIONS.md), so this filters
// client-side after the indexed `date` lookup narrows it to one day's tasks.
export async function getMITsForDate(date: string): Promise<Task[]> {
  return db.tasks
    .where('date')
    .equals(date)
    .filter((task) => task.isMIT && !task.deletedAt)
    .toArray()
}

export async function getForWeek(weekOf: string): Promise<Task[]> {
  const end = addDays(weekOf, 6)
  return db.tasks
    .where('date')
    .between(weekOf, end, true, true)
    .filter((task) => !task.deletedAt)
    .toArray()
}
