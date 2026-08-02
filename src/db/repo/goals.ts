import { db } from '../db'
import type { Goal } from '../../types/models'
import { nowISO } from '../../lib/dates'

export interface CreateGoalInput {
  title: string
  why: string
  year: number
  order: number
}

export async function create(input: CreateGoalInput): Promise<Goal> {
  const timestamp = nowISO()
  const goal: Goal = {
    id: crypto.randomUUID(),
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  }
  await db.goals.add(goal)
  return goal
}

export async function update(
  id: string,
  patch: Partial<Pick<Goal, 'title' | 'why' | 'year' | 'order' | 'status'>>,
): Promise<void> {
  await db.goals.update(id, { ...patch, updatedAt: nowISO() })
}

export async function getActive(): Promise<Goal[]> {
  return db.goals
    .where('status')
    .equals('active')
    .filter((goal) => !goal.deletedAt)
    .toArray()
}

export async function getArchived(): Promise<Goal[]> {
  return db.goals
    .where('status')
    .anyOf(['achieved', 'dropped'])
    .filter((goal) => !goal.deletedAt)
    .toArray()
}

/** Percentage (0-100) of this goal's milestones that are done. */
export async function progress(goalId: string): Promise<number> {
  const milestones = await db.milestones
    .where('goalId')
    .equals(goalId)
    .filter((milestone) => !milestone.deletedAt)
    .toArray()
  if (milestones.length === 0) return 0
  const done = milestones.filter((milestone) => milestone.status === 'done').length
  return Math.round((done / milestones.length) * 100)
}
