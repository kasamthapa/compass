// Whole-database transfer: export (backup), import (restore/replace), and
// wipe. The single canonical wipe implementation lives here — both the
// hidden dev route (src/pages/DevPage.tsx) and Settings' "Erase all data"
// call this same function; neither duplicates the logic. See DECISIONS.md.
import { db } from '../db'
import { nowISO } from '../../lib/dates'

const EXPORT_VERSION = 1

export interface ExportedData {
  version: typeof EXPORT_VERSION
  exportedAt: string
  tables: Record<string, unknown[]>
}

/** Every Dexie table, serialized as plain arrays keyed by table name. */
export async function exportAllData(): Promise<ExportedData> {
  const tables: Record<string, unknown[]> = {}
  for (const table of db.tables) {
    tables[table.name] = await table.toArray()
  }
  return { version: EXPORT_VERSION, exportedAt: nowISO(), tables }
}

/**
 * A calm, permissive structural check — not a full schema validator. Rejects
 * anything that obviously isn't a Compass export (wrong shape, foreign
 * table names) without trying to enumerate every possible malformed field,
 * since `importAllData` below only ever touches tables it recognizes.
 */
export function isValidExport(data: unknown): data is ExportedData {
  if (!data || typeof data !== 'object') return false
  const candidate = data as Record<string, unknown>
  if (candidate.version !== EXPORT_VERSION) return false
  if (typeof candidate.exportedAt !== 'string') return false
  if (typeof candidate.tables !== 'object' || candidate.tables === null) return false
  const knownTableNames = new Set(db.tables.map((table) => table.name))
  for (const [tableName, rows] of Object.entries(candidate.tables as Record<string, unknown>)) {
    if (!knownTableNames.has(tableName)) return false
    if (!Array.isArray(rows)) return false
  }
  return true
}

export async function wipeAllData(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()))
  })
}

/** Replaces ALL current data with `data`'s contents. Wipes first — this is destructive and irreversible; callers must confirm with the user before calling. */
export async function importAllData(data: ExportedData): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()))
    for (const table of db.tables) {
      const rows = data.tables[table.name]
      if (Array.isArray(rows) && rows.length > 0) {
        await table.bulkAdd(rows)
      }
    }
  })
}
