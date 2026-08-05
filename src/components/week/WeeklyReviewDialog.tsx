import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as reviewsRepo from '../../db/repo/reviews'
import * as capturesRepo from '../../db/repo/captures'
import * as goalsRepo from '../../db/repo/goals'
import { addDays, nowISO } from '../../lib/dates'
import { GOAL_NOTE_ANSWER_PREFIX, resumeStepForWeekly } from '../../lib/reviewResume'
import { ProcessSheet, type ProcessMode } from '../inbox/ProcessSheet'
import { ReviewDialog, type ReviewStep } from '../reviews/ReviewDialog'
import { ScoreStep } from '../reviews/ScoreStep'
import { WeekPriorities } from './WeekPriorities'

function InboxStep() {
  const items = useLiveQuery(() => capturesRepo.getUnprocessed(), []) ?? []
  const [openCaptureId, setOpenCaptureId] = useState<string | null>(null)
  const openCapture = items.find((item) => item.id === openCaptureId) ?? null

  return (
    <div>
      <p className="text-body text-text">Clear your inbox</p>
      {items.length === 0 ? (
        <p className="mt-3 text-subhead text-text-muted">Already clear. Nice.</p>
      ) : (
        <div className="mt-3 divide-y divide-border-hairline rounded-md bg-bg px-3">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenCaptureId(item.id)}
              className="ios-press flex min-h-11 w-full items-center py-2.5 text-left"
            >
              <p className="line-clamp-2 text-body text-text">{item.text}</p>
            </button>
          ))}
        </div>
      )}
      <ProcessSheet
        capture={openCapture}
        initialMode={'choose' as ProcessMode}
        onClose={() => setOpenCaptureId(null)}
      />
    </div>
  )
}

function GoalsCheckinStep({
  notes,
  onChange,
  onSave,
}: {
  notes: Record<string, string>
  onChange: (goalId: string, value: string) => void
  onSave: () => void
}) {
  const goals = useLiveQuery(() => goalsRepo.getActive(), []) ?? []

  return (
    <div>
      <p className="text-body text-text">Check your goals</p>
      {goals.length === 0 ? (
        <p className="mt-3 text-subhead text-text-muted">No active goals yet — nothing to check in on.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          {goals.map((goal) => (
            <div key={goal.id}>
              <p className="text-subhead font-medium text-text">{goal.title}</p>
              <textarea
                value={notes[goal.id] ?? ''}
                onChange={(event) => onChange(goal.id, event.target.value)}
                onBlur={onSave}
                placeholder="Still on track? Any next action?"
                rows={2}
                className="mt-1.5 w-full resize-none rounded-md bg-bg px-3 py-2 text-subhead text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface WeeklyReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  weekOf: string
}

export function WeeklyReviewDialog({ isOpen, onClose, weekOf }: WeeklyReviewDialogProps) {
  const review = useLiveQuery(() => reviewsRepo.getByPeriod('weekly', weekOf), [weekOf])
  const nextWeek = addDays(weekOf, 7)

  const [score, setScore] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined)
  const [goalNotes, setGoalNotes] = useState<Record<string, string>>({})

  // Resume: hydrate local state, but only when the dialog transitions
  // open — not on every autosave re-fetch, or in-progress typing would get
  // clobbered by the (stale) saved value. Same guarantee as the daily
  // review, generalized through the shared engine.
  useEffect(() => {
    if (!isOpen) return
    if (review) {
      setScore(review.score)
      const notes: Record<string, string> = {}
      for (const [key, value] of Object.entries(review.answers)) {
        if (key.startsWith(GOAL_NOTE_ANSWER_PREFIX)) {
          notes[key.slice(GOAL_NOTE_ANSWER_PREFIX.length)] = value
        }
      }
      setGoalNotes(notes)
    } else {
      setScore(undefined)
      setGoalNotes({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  async function selectScore(value: 1 | 2 | 3 | 4 | 5) {
    setScore(value)
    await reviewsRepo.upsert('weekly', weekOf, { score: value })
  }

  function handleGoalNoteChange(goalId: string, value: string) {
    setGoalNotes((current) => ({ ...current, [goalId]: value }))
  }

  async function saveGoalNotes() {
    const answers = Object.fromEntries(
      Object.entries(goalNotes).map(([goalId, text]) => [`${GOAL_NOTE_ANSWER_PREFIX}${goalId}`, text]),
    )
    await reviewsRepo.upsert('weekly', weekOf, { answers })
  }

  const steps: ReviewStep[] = [
    { render: () => <InboxStep /> },
    { render: () => <WeekPriorities weekOf={weekOf} /> },
    {
      render: () => <GoalsCheckinStep notes={goalNotes} onChange={handleGoalNoteChange} onSave={() => void saveGoalNotes()} />,
    },
    {
      canAdvance: score !== undefined,
      render: () => <ScoreStep prompt="Rate your week" score={score} onSelect={(value) => void selectScore(value)} />,
    },
    {
      render: () => (
        <WeekPriorities
          weekOf={nextWeek}
          heading="Next week's priorities"
          emptyPrompt="What matters most next week?"
        />
      ),
    },
  ]

  return (
    <ReviewDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Weekly review"
      title="Weekly review"
      steps={steps}
      resumeStep={resumeStepForWeekly(review)}
      completionMessage="Week reviewed."
      onFinish={async () => {
        await reviewsRepo.upsert('weekly', weekOf, { completedAt: nowISO() })
      }}
    />
  )
}
