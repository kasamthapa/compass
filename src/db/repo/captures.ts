import { db } from '../db'
import type { CaptureItem } from '../../types/models'
import { nowISO } from '../../lib/dates'

export async function create(text: string): Promise<CaptureItem> {
  const timestamp = nowISO()
  const item: CaptureItem = {
    id: crypto.randomUUID(),
    text,
    processed: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  await db.captures.add(item)
  return item
}

function isInMainInbox(item: CaptureItem): boolean {
  return !item.processed && !item.someday && !item.deletedAt
}

// `processed`/`someday` are booleans — not indexed (see DECISIONS.md), so
// these are client-side filters over the whole table. Fine at this table's
// scale (a personal capture inbox).
export async function getUnprocessed(): Promise<CaptureItem[]> {
  return db.captures.filter(isInMainInbox).toArray()
}

export async function getUnprocessedCount(): Promise<number> {
  return db.captures.filter(isInMainInbox).count()
}

/** Items parked in "Someday / maybe" — still unprocessed, just set aside. */
export async function getSomeday(): Promise<CaptureItem[]> {
  return db.captures
    .filter((item) => !item.processed && Boolean(item.someday) && !item.deletedAt)
    .toArray()
}

export async function update(id: string, patch: Partial<Pick<CaptureItem, 'text'>>): Promise<void> {
  await db.captures.update(id, { ...patch, updatedAt: nowISO() })
}

export async function markProcessed(
  id: string,
  convertedTo: CaptureItem['convertedTo'],
): Promise<void> {
  await db.captures.update(id, {
    processed: true,
    convertedTo,
    updatedAt: nowISO(),
  })
}

export async function markSomeday(id: string): Promise<void> {
  await db.captures.update(id, { someday: true, updatedAt: nowISO() })
}

export async function softDelete(id: string): Promise<void> {
  await db.captures.update(id, { deletedAt: nowISO(), updatedAt: nowISO() })
}
