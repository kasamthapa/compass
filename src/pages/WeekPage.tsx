import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '../components/PageHeader'
import { WeekPriorities } from '../components/week/WeekPriorities'
import { WeekGrid } from '../components/week/WeekGrid'
import { TaskEditForm } from '../components/week/TaskEditForm'
import { WeeklyReviewCard } from '../components/week/WeeklyReviewCard'
import { WeeklyReviewDialog } from '../components/week/WeeklyReviewDialog'
import { IconChevronRight } from '../components/icons'
import * as reviewsRepo from '../db/repo/reviews'
import {
  addDays,
  formatWeekRange,
  isWeeklyReviewDue,
  todayISO,
  weekNumber,
  weekOf as weekOfMonday,
} from '../lib/dates'
import type { Task } from '../types/models'

export function WeekPage() {
  const [weekOf, setWeekOf] = useState(() => weekOfMonday(todayISO()))
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)

  const weeklyReview = useLiveQuery(() => reviewsRepo.getByPeriod('weekly', weekOf), [weekOf])
  const isCurrentWeek = weekOf === weekOfMonday(todayISO())
  const isDue = isCurrentWeek && isWeeklyReviewDue()

  return (
    <div className="pb-16 md:pb-0">
      <PageHeader title="Week" />

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setWeekOf((current) => addDays(current, -7))}
          aria-label="Previous week"
          className="ios-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-faint"
        >
          <IconChevronRight className="h-4 w-4 rotate-180" />
        </button>
        <p className="font-mono text-subhead text-text-muted">
          {formatWeekRange(weekOf)} · WEEK {weekNumber(weekOf)}
        </p>
        <button
          type="button"
          onClick={() => setWeekOf((current) => addDays(current, 7))}
          aria-label="Next week"
          className="ios-press flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-text-faint"
        >
          <IconChevronRight className="h-4 w-4" />
        </button>
      </div>

      <WeeklyReviewCard
        onOpen={() => setReviewOpen(true)}
        isDue={isDue}
        isCompleted={Boolean(weeklyReview?.completedAt)}
      />

      <WeekPriorities weekOf={weekOf} />
      <WeekGrid weekOf={weekOf} onEditTask={setEditingTask} />

      <TaskEditForm
        isOpen={editingTask !== null}
        task={editingTask}
        weekOf={weekOf}
        onClose={() => setEditingTask(null)}
      />

      <WeeklyReviewDialog isOpen={reviewOpen} onClose={() => setReviewOpen(false)} weekOf={weekOf} />
    </div>
  )
}
