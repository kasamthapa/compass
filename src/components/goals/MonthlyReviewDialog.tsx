import { useEffect, useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as goalsRepo from '../../db/repo/goals'
import * as milestonesRepo from '../../db/repo/milestones'
import * as reviewsRepo from '../../db/repo/reviews'
import { addMonths, nowISO } from '../../lib/dates'
import { resumeStepForMonthly } from '../../lib/reviewResume'
import { IconCheck, IconMore } from '../icons'
import { ReviewDialog, type ReviewStep } from '../reviews/ReviewDialog'
import { ScoreStep } from '../reviews/ScoreStep'
import type { Milestone } from '../../types/models'

function MilestoneAuditRow({
  milestone,
  goalTitle,
  onToggleDone,
  onCarry,
  onDrop,
}: {
  milestone: Milestone
  goalTitle: string
  onToggleDone: () => void
  onCarry: () => void
  onDrop: () => void
}) {
  const [showMenu, setShowMenu] = useState(false)
  const done = milestone.status === 'done'

  return (
    <div className="flex items-start gap-3 py-3">
      <button
        type="button"
        onClick={onToggleDone}
        aria-pressed={done}
        aria-label={done ? `Mark "${milestone.title}" not done` : `Mark "${milestone.title}" done`}
        className={`ios-press flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-[250ms] ease-ios ${
          done ? 'border-accent bg-accent text-accent-on' : 'border-border-hairline'
        }`}
      >
        {done && <IconCheck className="h-3.5 w-3.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-body ${done ? 'text-text-faint line-through' : 'text-text'}`}>{milestone.title}</p>
        {goalTitle && <p className="mt-0.5 font-mono text-caption text-text-faint">{goalTitle}</p>}
      </div>
      <div className="relative shrink-0">
        {showMenu && <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />}
        <button
          type="button"
          onClick={() => setShowMenu((value) => !value)}
          aria-label="More options"
          className="ios-press relative z-10 flex h-11 w-11 items-center justify-center rounded-full text-text-faint"
        >
          <IconMore className="h-5 w-5" />
        </button>
        {showMenu && (
          <div className="absolute right-0 top-full z-10 mt-1 w-48 overflow-hidden rounded-lg bg-surface-elevated py-1 shadow-elevated">
            <button
              type="button"
              onClick={() => {
                setShowMenu(false)
                onCarry()
              }}
              className="ios-press flex min-h-11 w-full items-center px-4 text-left text-subhead text-text"
            >
              Carry to next month
            </button>
            <button
              type="button"
              onClick={() => {
                setShowMenu(false)
                onDrop()
              }}
              className="ios-press flex min-h-11 w-full items-center px-4 text-left text-subhead text-text-muted"
            >
              Drop
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function MilestoneAuditStep({ month }: { month: string }) {
  const allMilestones = useLiveQuery(() => milestonesRepo.getForMonth(month), [month]) ?? []
  const goals = useLiveQuery(() => goalsRepo.getActive(), []) ?? []
  const activeGoalIds = new Set(goals.map((goal) => goal.id))
  const milestones = allMilestones.filter(
    (milestone) => milestone.status !== 'dropped' && activeGoalIds.has(milestone.goalId),
  )
  const nextMonth = addMonths(month, 1)

  function goalTitleFor(goalId: string): string {
    return goals.find((goal) => goal.id === goalId)?.title ?? ''
  }

  async function handleToggleDone(milestone: Milestone) {
    await milestonesRepo.setStatus(milestone.id, milestone.status === 'done' ? 'active' : 'done')
  }

  async function handleDrop(milestone: Milestone) {
    await milestonesRepo.setStatus(milestone.id, 'dropped')
  }

  async function handleCarry(milestone: Milestone) {
    await milestonesRepo.update(milestone.id, { month: nextMonth })
  }

  return (
    <div>
      <p className="text-body text-text">Audit this month's milestones</p>
      {milestones.length === 0 ? (
        <p className="mt-3 text-subhead text-text-muted">No milestones set for this month.</p>
      ) : (
        <div className="mt-3 divide-y divide-border-hairline rounded-md bg-bg px-3">
          {milestones.map((milestone) => (
            <MilestoneAuditRow
              key={milestone.id}
              milestone={milestone}
              goalTitle={goalTitleFor(milestone.goalId)}
              onToggleDone={() => void handleToggleDone(milestone)}
              onCarry={() => void handleCarry(milestone)}
              onDrop={() => void handleDrop(milestone)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function GoalMilestoneAdder({ goalId, goalTitle, month }: { goalId: string; goalTitle: string; month: string }) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const milestones = useLiveQuery(() => milestonesRepo.getForGoal(goalId), [goalId]) ?? []
  const existingForMonth = milestones.filter((milestone) => milestone.month === month && milestone.status !== 'dropped')

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    await milestonesRepo.create({ goalId, title: trimmed, month })
    setTitle('')
    setShowForm(false)
  }

  return (
    <div>
      <p className="text-subhead font-medium text-text">{goalTitle}</p>
      {existingForMonth.length > 0 && (
        <div className="mt-1.5 flex flex-col gap-1">
          {existingForMonth.map((milestone) => (
            <p key={milestone.id} className="text-caption text-text-muted">
              {milestone.title}
            </p>
          ))}
        </div>
      )}
      {showForm ? (
        <form onSubmit={handleAdd} className="mt-1.5 flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Milestone"
            autoFocus
            className="min-h-9 w-full rounded-md bg-bg px-3 py-1.5 text-subhead text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
          <button
            type="submit"
            className="ios-press min-h-9 shrink-0 rounded-md bg-accent px-3 text-caption font-semibold text-accent-on"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="ios-press min-h-9 shrink-0 px-2 text-caption font-medium text-text-muted"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="ios-press mt-1.5 flex min-h-9 items-center text-caption font-medium text-accent"
        >
          + add milestone
        </button>
      )}
    </div>
  )
}

function NextMonthMilestonesStep({ nextMonth }: { nextMonth: string }) {
  const goals = useLiveQuery(() => goalsRepo.getActive(), []) ?? []

  return (
    <div>
      <p className="text-body text-text">Next month's milestones</p>
      {goals.length === 0 ? (
        <p className="mt-3 text-subhead text-text-muted">No active goals yet.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          {goals.map((goal) => (
            <GoalMilestoneAdder key={goal.id} goalId={goal.id} goalTitle={goal.title} month={nextMonth} />
          ))}
        </div>
      )}
    </div>
  )
}

interface MonthlyReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  month: string
}

export function MonthlyReviewDialog({ isOpen, onClose, month }: MonthlyReviewDialogProps) {
  const review = useLiveQuery(() => reviewsRepo.getByPeriod('monthly', month), [month])
  const nextMonth = addMonths(month, 1)

  const [score, setScore] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined)

  // Resume: hydrate local state, but only when the dialog transitions
  // open — not on every autosave re-fetch, or in-progress navigation
  // would get clobbered by the (stale) saved value. Same guarantee as
  // the daily/weekly reviews.
  useEffect(() => {
    if (!isOpen) return
    setScore(review?.score)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  async function selectScore(value: 1 | 2 | 3 | 4 | 5) {
    setScore(value)
    await reviewsRepo.upsert('monthly', month, { score: value })
  }

  const steps: ReviewStep[] = [
    { render: () => <MilestoneAuditStep month={month} /> },
    {
      canAdvance: score !== undefined,
      render: () => <ScoreStep prompt="Rate the month" score={score} onSelect={(value) => void selectScore(value)} />,
    },
    { render: () => <NextMonthMilestonesStep nextMonth={nextMonth} /> },
  ]

  return (
    <ReviewDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Monthly review"
      title="Monthly review"
      steps={steps}
      resumeStep={resumeStepForMonthly(review)}
      completionMessage="Month reviewed."
      onFinish={async () => {
        await reviewsRepo.upsert('monthly', month, { completedAt: nowISO() })
      }}
    />
  )
}
