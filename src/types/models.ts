export interface Base {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface CaptureItem extends Base {
  text: string
  processed: boolean
  /** Deferred to the "Someday / maybe" section — still unprocessed, just parked. */
  someday?: boolean
  convertedTo?: { type: 'task' | 'habit' | 'note' | 'someday'; id: string }
}

export interface Habit extends Base {
  name: string
  cue: string
  status: 'active' | 'paused' | 'archived'
  targetPerWeek: number
  goalId?: string
  color?: string
}

export interface HabitLog extends Base {
  habitId: string
  date: string
  status: 'done' | 'skipped'
}

export interface Task extends Base {
  title: string
  notes?: string
  status: 'todo' | 'doing' | 'done' | 'dropped'
  date?: string
  isMIT: boolean
  weeklyPriorityId?: string
  goalId?: string
  /** The tiny first physical action to start this task — added Phase 2A, UI lands in 2B. */
  firstMove?: string
  /** Rough estimate in minutes — added Phase 2A, UI lands in 2B. */
  estimateMin?: number
}

export interface Goal extends Base {
  title: string
  why: string
  year: number
  status: 'active' | 'achieved' | 'dropped'
  order: number
}

export interface Milestone extends Base {
  goalId: string
  title: string
  month: string
  status: 'active' | 'done' | 'dropped'
}

export interface WeeklyPriority extends Base {
  title: string
  weekOf: string
  milestoneId?: string
  goalId?: string
  status: 'active' | 'done' | 'dropped'
  order: number
}

export interface JournalEntry extends Base {
  date: string
  text: string
  mood?: 1 | 2 | 3 | 4 | 5
  energy?: 1 | 2 | 3 | 4 | 5
}

export interface Review extends Base {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly'
  periodKey: string
  answers: Record<string, string>
  score?: 1 | 2 | 3 | 4 | 5
  completedAt?: string
}

export interface SyncQueueItem extends Base {
  table: string
  recordId: string
  op: 'put' | 'delete'
  payload: unknown
  synced: boolean
}
