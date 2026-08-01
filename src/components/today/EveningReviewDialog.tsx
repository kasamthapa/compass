import { useEffect, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as reviewsRepo from '../../db/repo/reviews'
import * as tasksRepo from '../../db/repo/tasks'
import { RuleViolationError } from '../../db/rules'
import { nowISO } from '../../lib/dates'
import { resumeStepFor } from '../../lib/reviewResume'
import { Sheet } from '../Sheet'
import { IconCheck } from '../icons'
import { AddTaskInline, type AddTaskInlineValue } from './AddTaskInline'

const SCORES = [1, 2, 3, 4, 5] as const
const COMPLETION_DISPLAY_MS = 700

interface EveningReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  today: string
  tomorrow: string
}

export function EveningReviewDialog({ isOpen, onClose, today, tomorrow }: EveningReviewDialogProps) {
  const review = useLiveQuery(() => reviewsRepo.getByPeriod('daily', today), [today])

  const [step, setStep] = useState(1)
  const [score, setScore] = useState<1 | 2 | 3 | 4 | 5 | undefined>(undefined)
  const [win, setWin] = useState('')
  const [lesson, setLesson] = useState('')
  const [justCompleted, setJustCompleted] = useState(false)

  // Resume: hydrate local state and jump to the first unanswered step, but
  // only when the dialog transitions open — not on every autosave re-fetch,
  // or in-progress typing would get clobbered by the (stale) saved value.
  useEffect(() => {
    if (!isOpen) return
    if (review) {
      setScore(review.score)
      setWin(review.answers.win ?? '')
      setLesson(review.answers.lesson ?? '')
      setStep(resumeStepFor(review))
    } else {
      setScore(undefined)
      setWin('')
      setLesson('')
      setStep(1)
    }
    setJustCompleted(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const tomorrowTasks = useLiveQuery(() => tasksRepo.getForDate(tomorrow), [tomorrow]) ?? []
  const tomorrowMits = tomorrowTasks.filter((task) => task.isMIT)
  const tomorrowOthers = tomorrowTasks.filter((task) => !task.isMIT)

  async function selectScore(value: 1 | 2 | 3 | 4 | 5) {
    setScore(value)
    await reviewsRepo.upsert('daily', today, { score: value })
  }

  async function saveWin() {
    await reviewsRepo.upsert('daily', today, { answers: { win: win.trim(), lesson } })
  }

  async function saveLesson() {
    await reviewsRepo.upsert('daily', today, { answers: { win, lesson: lesson.trim() } })
  }

  async function handlePickTomorrow(taskId: string) {
    try {
      await tasksRepo.update(taskId, { isMIT: true })
    } catch (error) {
      if (!(error instanceof RuleViolationError)) {
        console.error('Failed to set tomorrow focus', error)
      }
    }
  }

  async function handleAddTomorrow(value: AddTaskInlineValue) {
    try {
      await tasksRepo.create({
        title: value.title,
        date: tomorrow,
        isMIT: true,
        firstMove: value.firstMove,
        estimateMin: value.estimateMin,
      })
    } catch (error) {
      if (!(error instanceof RuleViolationError)) {
        console.error('Failed to add tomorrow focus', error)
      }
    }
  }

  async function handleFinish() {
    await reviewsRepo.upsert('daily', today, { completedAt: nowISO() })
    setJustCompleted(true)
    setTimeout(() => {
      onClose()
    }, COMPLETION_DISPLAY_MS)
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose} ariaLabel="Close the day">
      {justCompleted ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-on">
            <IconCheck className="h-7 w-7" />
          </div>
          <p className="text-headline text-text">Day closed.</p>
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-text-faint">
              Step {step} of 4
            </p>
            <p className="text-headline text-text">Close the day</p>
          </div>

          {step === 1 && (
            <div>
              <p className="text-body text-text">How was today?</p>
              <div className="mt-4 flex justify-between gap-2">
                {SCORES.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => void selectScore(value)}
                    aria-label={`${value} out of 5`}
                    aria-pressed={score === value}
                    className={`ios-press flex h-11 w-11 items-center justify-center rounded-full border font-mono text-body transition-colors duration-[250ms] ease-ios ${
                      score === value
                        ? 'border-accent bg-accent text-accent-on'
                        : 'border-border-hairline text-text-muted'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <p className="text-body text-text">One win</p>
              <input
                type="text"
                value={win}
                onChange={(event) => setWin(event.target.value)}
                onBlur={() => void saveWin()}
                placeholder="Something that went well"
                autoFocus
                className="mt-3 min-h-11 w-full rounded-md bg-bg px-4 py-3 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
              />
            </div>
          )}

          {step === 3 && (
            <div>
              <p className="text-body text-text">One lesson or snag</p>
              <input
                type="text"
                value={lesson}
                onChange={(event) => setLesson(event.target.value)}
                onBlur={() => void saveLesson()}
                placeholder="Something worth remembering"
                autoFocus
                className="mt-3 min-h-11 w-full rounded-md bg-bg px-4 py-3 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
              />
            </div>
          )}

          {step === 4 && (
            <div>
              <p className="text-body text-text">Tomorrow's focus</p>
              <div className="mt-3 divide-y divide-border-hairline rounded-md bg-bg px-3">
                {tomorrowMits.map((task) => (
                  <div key={task.id} className="flex min-h-11 items-center gap-2 py-2 text-body text-text">
                    <IconCheck className="h-4 w-4 shrink-0 text-accent" />
                    {task.title}
                  </div>
                ))}
                {tomorrowOthers.length > 0 &&
                  tomorrowMits.length < 3 &&
                  tomorrowOthers.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => void handlePickTomorrow(task.id)}
                      className="ios-press flex min-h-11 w-full items-center gap-2 py-2 text-left text-body text-text-muted"
                    >
                      <span className="h-4 w-4 shrink-0 rounded-full border border-border-hairline" />
                      {task.title}
                    </button>
                  ))}
              </div>
              {tomorrowMits.length < 3 ? (
                <div className="mt-2">
                  <AddTaskInline placeholder="Add a focus for tomorrow" onAdd={handleAddTomorrow} />
                </div>
              ) : (
                <p className="mt-2 min-h-11 py-2.5 text-subhead text-text-muted">
                  Three is enough for tomorrow.
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="ios-press min-h-11 rounded-md px-4 text-subhead font-medium text-text-muted"
              >
                Back
              </button>
            ) : (
              <span />
            )}
            {step < 4 ? (
              <button
                type="button"
                disabled={step === 1 && score === undefined}
                onClick={() => setStep(step + 1)}
                className="ios-press min-h-11 rounded-md bg-accent px-4 text-subhead font-semibold text-accent-on disabled:opacity-40"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleFinish()}
                className="ios-press min-h-11 rounded-md bg-accent px-4 text-subhead font-semibold text-accent-on"
              >
                Finish
              </button>
            )}
          </div>
        </>
      )}
    </Sheet>
  )
}
