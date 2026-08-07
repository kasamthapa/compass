import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as goalsRepo from '../../db/repo/goals'
import * as reviewsRepo from '../../db/repo/reviews'
import { nowISO } from '../../lib/dates'
import { resumeStepForYearly } from '../../lib/reviewResume'
import { ReviewDialog, type ReviewStep } from '../reviews/ReviewDialog'
import { ScoreStep } from '../reviews/ScoreStep'
import { GoalForm } from './GoalForm'

function ReflectStep({
  biggestWin,
  biggestLesson,
  stopStartContinue,
  onChangeWin,
  onChangeLesson,
  onChangeStopStartContinue,
  onSaveWin,
  onSaveLesson,
  onSaveStopStartContinue,
}: {
  biggestWin: string
  biggestLesson: string
  stopStartContinue: string
  onChangeWin: (value: string) => void
  onChangeLesson: (value: string) => void
  onChangeStopStartContinue: (value: string) => void
  onSaveWin: () => void
  onSaveLesson: () => void
  onSaveStopStartContinue: () => void
}) {
  return (
    <div>
      <p className="text-body text-text">Reflect on the year</p>
      <div className="mt-3 flex flex-col gap-4">
        <div>
          <p className="text-caption font-medium text-text-faint">Biggest win</p>
          <textarea
            value={biggestWin}
            onChange={(event) => onChangeWin(event.target.value)}
            onBlur={onSaveWin}
            rows={2}
            placeholder="What went well this year?"
            className="mt-1.5 w-full resize-none rounded-md bg-bg px-3 py-2 text-subhead text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
        </div>
        <div>
          <p className="text-caption font-medium text-text-faint">Biggest lesson</p>
          <textarea
            value={biggestLesson}
            onChange={(event) => onChangeLesson(event.target.value)}
            onBlur={onSaveLesson}
            rows={2}
            placeholder="What did you learn?"
            className="mt-1.5 w-full resize-none rounded-md bg-bg px-3 py-2 text-subhead text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
        </div>
        <div>
          <p className="text-caption font-medium text-text-faint">Stop / start / continue</p>
          <textarea
            value={stopStartContinue}
            onChange={(event) => onChangeStopStartContinue(event.target.value)}
            onBlur={onSaveStopStartContinue}
            rows={3}
            placeholder="What to leave behind, what to begin, what to keep going"
            className="mt-1.5 w-full resize-none rounded-md bg-bg px-3 py-2 text-subhead text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
        </div>
      </div>
    </div>
  )
}

function NextYearGoalsStep({ nextYear }: { nextYear: number }) {
  const [formOpen, setFormOpen] = useState(false)
  const activeGoals = useLiveQuery(() => goalsRepo.getActive(), []) ?? []
  const nextYearGoals = activeGoals.filter((goal) => goal.year === nextYear)

  return (
    <div>
      <p className="text-body text-text">Set next year's goals</p>
      {nextYearGoals.length > 0 && (
        <div className="mt-3 divide-y divide-border-hairline rounded-md bg-bg px-3">
          {nextYearGoals.map((goal) => (
            <p key={goal.id} className="py-2.5 text-body text-text">
              {goal.title}
            </p>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={() => setFormOpen(true)}
        className="ios-press mt-3 flex min-h-11 items-center text-subhead font-medium text-accent-text"
      >
        + add a goal for {nextYear}
      </button>
      <GoalForm isOpen={formOpen} goal={null} onClose={() => setFormOpen(false)} defaultYear={nextYear} />
    </div>
  )
}

interface YearlyReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  year: string
}

export function YearlyReviewDialog({ isOpen, onClose, year }: YearlyReviewDialogProps) {
  const review = useLiveQuery(() => reviewsRepo.getByPeriod('yearly', year), [year])
  const nextYear = Number(year) + 1

  const [score, setScore] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined)
  const [biggestWin, setBiggestWin] = useState('')
  const [biggestLesson, setBiggestLesson] = useState('')
  const [stopStartContinue, setStopStartContinue] = useState('')

  // Resume: hydrate local state, but only when the dialog transitions
  // open — not on every autosave re-fetch, or in-progress typing would
  // get clobbered by the (stale) saved value. Same guarantee as the
  // daily/weekly/monthly reviews.
  useEffect(() => {
    if (!isOpen) return
    if (review) {
      setScore(review.score)
      setBiggestWin(review.answers.biggestWin ?? '')
      setBiggestLesson(review.answers.biggestLesson ?? '')
      setStopStartContinue(review.answers.stopStartContinue ?? '')
    } else {
      setScore(undefined)
      setBiggestWin('')
      setBiggestLesson('')
      setStopStartContinue('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  async function selectScore(value: 1 | 2 | 3 | 4 | 5) {
    setScore(value)
    await reviewsRepo.upsert('yearly', year, { score: value })
  }

  async function saveReflection(patch: Partial<{ biggestWin: string; biggestLesson: string; stopStartContinue: string }>) {
    await reviewsRepo.upsert('yearly', year, {
      answers: { biggestWin, biggestLesson, stopStartContinue, ...patch },
    })
  }

  const steps: ReviewStep[] = [
    {
      render: () => (
        <ReflectStep
          biggestWin={biggestWin}
          biggestLesson={biggestLesson}
          stopStartContinue={stopStartContinue}
          onChangeWin={setBiggestWin}
          onChangeLesson={setBiggestLesson}
          onChangeStopStartContinue={setStopStartContinue}
          onSaveWin={() => void saveReflection({ biggestWin })}
          onSaveLesson={() => void saveReflection({ biggestLesson })}
          onSaveStopStartContinue={() => void saveReflection({ stopStartContinue })}
        />
      ),
    },
    {
      canAdvance: score !== undefined,
      render: () => <ScoreStep prompt="Rate the year" score={score} onSelect={(value) => void selectScore(value)} />,
    },
    { render: () => <NextYearGoalsStep nextYear={nextYear} /> },
  ]

  return (
    <ReviewDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Yearly review"
      title="Yearly review"
      steps={steps}
      resumeStep={resumeStepForYearly(review)}
      completionMessage="Year reviewed."
      onFinish={async () => {
        await reviewsRepo.upsert('yearly', year, { completedAt: nowISO() })
      }}
    />
  )
}
