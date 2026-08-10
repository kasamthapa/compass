import { create } from 'zustand'

// This is a local UI preference (like theme), not user data — it lives in
// localStorage, not Dexie, same reasoning as themeStore.ts.
const STORAGE_KEY = 'compass-evening-reminder'
const DEFAULT_TIME = '20:00'

interface StoredReminder {
  enabled: boolean
  time: string
  /** YYYY-MM-DD of the last day a notification actually fired, so the
   *  foreground checker (see src/components/ReminderScheduler.tsx) never
   *  fires twice in one day. */
  lastFiredDate: string | null
}

function loadStored(): StoredReminder {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { enabled: false, time: DEFAULT_TIME, lastFiredDate: null }
    const parsed = JSON.parse(raw) as Partial<StoredReminder>
    return {
      enabled: parsed.enabled === true,
      time: typeof parsed.time === 'string' ? parsed.time : DEFAULT_TIME,
      lastFiredDate: typeof parsed.lastFiredDate === 'string' ? parsed.lastFiredDate : null,
    }
  } catch {
    return { enabled: false, time: DEFAULT_TIME, lastFiredDate: null }
  }
}

function persist(state: StoredReminder) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

interface ReminderState extends StoredReminder {
  setEnabled: (enabled: boolean) => void
  setTime: (time: string) => void
  markFired: (date: string) => void
}

const initial = loadStored()

export const useReminderStore = create<ReminderState>((set, get) => ({
  ...initial,
  setEnabled: (enabled) => {
    const next = { ...get(), enabled }
    persist(next)
    set({ enabled })
  },
  setTime: (time) => {
    const next = { ...get(), time }
    persist(next)
    set({ time })
  },
  markFired: (date) => {
    const next = { ...get(), lastFiredDate: date }
    persist(next)
    set({ lastFiredDate: date })
  },
}))
