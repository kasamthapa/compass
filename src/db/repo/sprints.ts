import { db } from '../db'
import type { Sprint } from '../../types/models'
import { nowISO } from '../../lib/dates'

export interface CreateSprintInput {
  title: string
  why?: string
  startDate: string
  days: number
}

export async function create(input: CreateSprintInput): Promise<Sprint> {
  const timestamp = nowISO()
  const sprint: Sprint = {
    id: crypto.randomUUID(),
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
    ...input,
  }
  await db.sprints.add(sprint)
  return sprint
}

export async function update(
  id: string,
  patch: Partial<Pick<Sprint, 'title' | 'why' | 'startDate' | 'days' | 'status'>>,
): Promise<void> {
  await db.sprints.update(id, { ...patch, updatedAt: nowISO() })
}

export async function setStatus(id: string, status: Sprint['status']): Promise<void> {
  await db.sprints.update(id, { status, updatedAt: nowISO() })
}

export async function getActive(): Promise<Sprint[]> {
  return db.sprints
    .where('status')
    .equals('active')
    .filter((sprint) => !sprint.deletedAt)
    .toArray()
}

export async function getArchived(): Promise<Sprint[]> {
  return db.sprints
    .where('status')
    .anyOf(['completed', 'dropped'])
    .filter((sprint) => !sprint.deletedAt)
    .toArray()
}
