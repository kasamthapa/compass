import { beforeEach, describe, expect, it } from 'vitest'
import { resetDb } from './testUtils'
import * as journal from '../repo/journal'

beforeEach(resetDb)

describe('journal.upsertForDate', () => {
  it('creates then updates in place, merging fields across calls', async () => {
    await journal.upsertForDate('2026-08-05', { text: 'First draft' })
    await journal.upsertForDate('2026-08-05', { mood: 4 })

    const entry = await journal.getForDate('2026-08-05')
    expect(entry?.text).toBe('First draft')
    expect(entry?.mood).toBe(4)

    const all = await journal.getForMonth('2026-08')
    expect(all).toHaveLength(1)
  })

  it('never crosses data between two different dates saved in sequence', async () => {
    // Mirrors the editor's flush-then-hydrate sequence when switching days
    // mid-typing: the previous date's pending save must land on its own
    // date, and the newly-selected date must start clean, not inherit it.
    await journal.upsertForDate('2026-08-05', { text: 'Draft for the 5th' })
    await journal.upsertForDate('2026-08-06', { text: 'Draft for the 6th' })

    const fifth = await journal.getForDate('2026-08-05')
    const sixth = await journal.getForDate('2026-08-06')
    expect(fifth?.text).toBe('Draft for the 5th')
    expect(sixth?.text).toBe('Draft for the 6th')
  })
})

describe('journal.getForMonth', () => {
  it('returns only entries within the given month, excluding adjacent months', async () => {
    await journal.upsertForDate('2026-07-31', { text: 'end of July' })
    await journal.upsertForDate('2026-08-01', { text: 'start of August' })
    await journal.upsertForDate('2026-08-31', { text: 'end of August' })
    await journal.upsertForDate('2026-09-01', { text: 'start of September' })

    const august = await journal.getForMonth('2026-08')
    expect(august.map((entry) => entry.date).sort()).toEqual(['2026-08-01', '2026-08-31'])
  })

  it('excludes soft-deleted entries', async () => {
    const { db } = await import('../db')
    const entry = await journal.upsertForDate('2026-08-10', { text: 'temp' })
    await db.journalEntries.update(entry.id, { deletedAt: new Date().toISOString() })

    const august = await journal.getForMonth('2026-08')
    expect(august).toHaveLength(0)
  })
})
