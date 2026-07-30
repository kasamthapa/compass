import { db } from '../db'
import type { Milestone } from '../../types/models'
import { nowISO } from '../../lib/dates'

export interface CreateMilestoneInput {
  goalId: string
  title: string
  month: string
}

export async function create(input: CreateMilestoneInput): Promise<Milestone> {
  const timestamp = nowISO()
  const milestone: Milestone = {
    id: crypto.randomUUID(),
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  }
  await db.milestones.add(milestone)
  return milestone
}

export async function update(
  id: string,
  patch: Partial<Pick<Milestone, 'title' | 'month' | 'goalId'>>,
): Promise<void> {
  await db.milestones.update(id, { ...patch, updatedAt: nowISO() })
}

export async function setStatus(id: string, status: Milestone['status']): Promise<void> {
  await db.milestones.update(id, { status, updatedAt: nowISO() })
}

export async function getForGoal(goalId: string): Promise<Milestone[]> {
  return db.milestones
    .where('goalId')
    .equals(goalId)
    .filter((milestone) => !milestone.deletedAt)
    .toArray()
}
