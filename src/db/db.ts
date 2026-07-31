import Dexie, { type Table } from 'dexie'
import type {
  CaptureItem,
  Habit,
  HabitLog,
  Task,
  Goal,
  Milestone,
  WeeklyPriority,
  JournalEntry,
  Review,
  SyncQueueItem,
} from '../types/models'

// The only place that touches Dexie directly should be this file and the
// modules under src/db/repo/*.ts (see CLAUDE.md rule 7).
//
// Note on boolean fields (`captures.processed`, `tasks.isMIT`): IndexedDB has
// no valid boolean key type, so a Dexie index on a boolean field silently
// never matches (the record is just omitted from that index). Those two
// fields are intentionally NOT included in the schema strings below — the
// repos filter them client-side after an indexed lookup on a sibling field
// instead. See DECISIONS.md.
export class CompassDB extends Dexie {
  captures!: Table<CaptureItem, string>
  habits!: Table<Habit, string>
  habitLogs!: Table<HabitLog, string>
  tasks!: Table<Task, string>
  goals!: Table<Goal, string>
  milestones!: Table<Milestone, string>
  weeklyPriorities!: Table<WeeklyPriority, string>
  journalEntries!: Table<JournalEntry, string>
  reviews!: Table<Review, string>
  syncQueue!: Table<SyncQueueItem, string>

  constructor() {
    super('compass')
    this.version(1).stores({
      captures: 'id',
      habits: 'id, status',
      habitLogs: 'id, [habitId+date], date',
      tasks: 'id, date, weeklyPriorityId, goalId, status',
      goals: 'id, status',
      milestones: 'id, goalId, month',
      weeklyPriorities: 'id, weekOf',
      journalEntries: 'id, date',
      reviews: 'id, [type+periodKey]',
      syncQueue: 'id, synced',
    })

    // v2 (Phase 2A): Task gained `firstMove?: string` and `estimateMin?:
    // number`. Neither is indexed, so no store's index string changes —
    // this bump exists to formally version the schema and demonstrate the
    // migration path; Dexie carries all existing data forward untouched
    // since no store is redeclared here.
    this.version(2).stores({})
  }
}

export const db = new CompassDB()
