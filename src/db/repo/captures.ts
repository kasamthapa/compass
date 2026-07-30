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

// `processed` is a boolean — not indexed (see DECISIONS.md), so this is a
// client-side filter over the whole table. Fine at this table's scale (a
// personal capture inbox).
export async function getUnprocessed(): Promise<CaptureItem[]> {
  return db.captures.filter((item) => !item.processed && !item.deletedAt).toArray()
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

export async function softDelete(id: string): Promise<void> {
  await db.captures.update(id, { deletedAt: nowISO(), updatedAt: nowISO() })
}
