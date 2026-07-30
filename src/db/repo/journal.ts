import { db } from '../db'
import type { JournalEntry } from '../../types/models'
import { nowISO } from '../../lib/dates'

export type JournalPatch = Partial<Pick<JournalEntry, 'text' | 'mood' | 'energy'>>

export async function upsertForDate(date: string, patch: JournalPatch): Promise<JournalEntry> {
  const existing = await getForDate(date)
  const timestamp = nowISO()

  if (existing) {
    const updated: JournalEntry = { ...existing, ...patch, updatedAt: timestamp }
    await db.journalEntries.update(existing.id, { ...patch, updatedAt: timestamp })
    return updated
  }

  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    date,
    text: patch.text ?? '',
    mood: patch.mood,
    energy: patch.energy,
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  await db.journalEntries.add(entry)
  return entry
}

export async function getForDate(date: string): Promise<JournalEntry | undefined> {
  return db.journalEntries
    .where('date')
    .equals(date)
    .filter((entry) => !entry.deletedAt)
    .first()
}

export async function getForMonth(yyyymm: string): Promise<JournalEntry[]> {
  const start = `${yyyymm}-01`
  const end = `${yyyymm}-31`
  return db.journalEntries
    .where('date')
    .between(start, end, true, true)
    .filter((entry) => !entry.deletedAt)
    .toArray()
}
