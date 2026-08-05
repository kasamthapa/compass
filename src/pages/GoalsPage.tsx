import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { GoalCard } from '../components/goals/GoalCard'
import { GoalForm } from '../components/goals/GoalForm'
import { MonthlyReviewCard } from '../components/goals/MonthlyReviewCard'
import { MonthlyReviewDialog } from '../components/goals/MonthlyReviewDialog'
import { YearlyReviewCard } from '../components/goals/YearlyReviewCard'
import { YearlyReviewDialog } from '../components/goals/YearlyReviewDialog'
import { IconGoals, IconChevronDown } from '../components/icons'
import * as goalsRepo from '../db/repo/goals'
import * as reviewsRepo from '../db/repo/reviews'
import { isMonthlyReviewDue, isYearlyReviewDue, monthKey, todayISO } from '../lib/dates'

export function GoalsPage() {
  const activeGoals = useLiveQuery(() => goalsRepo.getActive(), []) ?? []
  const archivedGoals = useLiveQuery(() => goalsRepo.getArchived(), []) ?? []
  const [formOpen, setFormOpen] = useState(false)
  const [archivedExpanded, setArchivedExpanded] = useState(false)
  const [monthlyReviewOpen, setMonthlyReviewOpen] = useState(false)
  const [yearlyReviewOpen, setYearlyReviewOpen] = useState(false)

  const currentMonth = monthKey(todayISO())
  const currentYear = String(new Date().getFullYear())
  const monthlyReview = useLiveQuery(() => reviewsRepo.getByPeriod('monthly', currentMonth), [currentMonth])
  const yearlyReview = useLiveQuery(() => reviewsRepo.getByPeriod('yearly', currentYear), [currentYear])

  return (
    <div>
      <PageHeader title="Goals" />

      <MonthlyReviewCard
        onOpen={() => setMonthlyReviewOpen(true)}
        isDue={isMonthlyReviewDue()}
        isCompleted={Boolean(monthlyReview?.completedAt)}
      />
      <YearlyReviewCard
        onOpen={() => setYearlyReviewOpen(true)}
        isDue={isYearlyReviewDue()}
        isCompleted={Boolean(yearlyReview?.completedAt)}
      />

      {activeGoals.length === 0 ? (
        <EmptyState
          icon={IconGoals}
          title="What's the shape of this year?"
          message="Add a goal when you're ready."
        />
      ) : (
        <div className="mt-3 flex flex-col gap-3">
          {activeGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setFormOpen(true)}
        className="ios-press mt-3 flex min-h-11 w-full items-center justify-center rounded-lg bg-surface px-4 text-subhead font-medium text-accent shadow-card"
      >
        + New goal
      </button>

      {archivedGoals.length > 0 && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setArchivedExpanded((value) => !value)}
            aria-expanded={archivedExpanded}
            className="ios-press flex min-h-11 items-center gap-1.5 text-subhead font-medium text-text-muted"
          >
            <IconChevronDown
              className={`h-4 w-4 transition-transform duration-200 ease-ios ${
                archivedExpanded ? '' : '-rotate-90'
              }`}
            />
            Archived ({archivedGoals.length})
          </button>
          {archivedExpanded && (
            <div className="mt-1 divide-y divide-border-hairline rounded-lg bg-surface px-4 shadow-card">
              {archivedGoals.map((goal) => (
                <div key={goal.id} className="flex items-center justify-between gap-3 py-3">
                  <p className="min-w-0 truncate text-body text-text-muted">{goal.title}</p>
                  <span className="shrink-0 text-caption text-text-faint">
                    {goal.status === 'achieved' ? 'Achieved' : 'Dropped'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <GoalForm isOpen={formOpen} goal={null} onClose={() => setFormOpen(false)} />
      <MonthlyReviewDialog
        isOpen={monthlyReviewOpen}
        onClose={() => setMonthlyReviewOpen(false)}
        month={currentMonth}
      />
      <YearlyReviewDialog
        isOpen={yearlyReviewOpen}
        onClose={() => setYearlyReviewOpen(false)}
        year={currentYear}
      />
    </div>
  )
}
