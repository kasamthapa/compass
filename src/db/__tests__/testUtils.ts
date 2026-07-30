import { db } from '../db'

export async function resetDb(): Promise<void> {
  await Promise.all(db.tables.map((table) => table.clear()))
}
