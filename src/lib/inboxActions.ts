import * as capturesRepo from '../db/repo/captures'
import * as journalRepo from '../db/repo/journal'
import type { CaptureItem } from '../types/models'
import { todayISO } from './dates'

// Shared between the tap-driven ProcessSheet and the keyboard-driven Inbox
// list so the two flows can never disagree about what these actions do.

export async function convertCaptureToNote(capture: CaptureItem): Promise<void> {
  const today = todayISO()
  const existing = await journalRepo.getForDate(today)
  const appended = `${capture.text} — from inbox`
  const nextText = existing?.text ? `${existing.text}\n\n${appended}` : appended
  const entry = await journalRepo.upsertForDate(today, { text: nextText })
  await capturesRepo.markProcessed(capture.id, { type: 'note', id: entry.id })
}

export async function convertCaptureToSomeday(capture: CaptureItem): Promise<void> {
  await capturesRepo.markSomeday(capture.id)
}

export async function deleteCapture(capture: CaptureItem): Promise<void> {
  await capturesRepo.softDelete(capture.id)
}
