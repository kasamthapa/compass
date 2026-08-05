import { useEffect, useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Sheet } from '../Sheet'
import * as goalsRepo from '../../db/repo/goals'
import type { Goal } from '../../types/models'

interface GoalFormProps {
  isOpen: boolean
  /** null = creating a new goal. */
  goal: Goal | null
  onClose: () => void
  /** Prefills the year field for a new goal (e.g. "next year" from the yearly review). Ignored when editing an existing goal, and when omitted defaults to the current year as before. */
  defaultYear?: number
}

export function GoalForm({ isOpen, goal, onClose, defaultYear }: GoalFormProps) {
  const [title, setTitle] = useState('')
  const [why, setWhy] = useState('')
  const [year, setYear] = useState(new Date().getFullYear())

  const activeGoals = useLiveQuery(() => goalsRepo.getActive(), []) ?? []
  // The 5-goal cap is a nudge, not a rule — only surfaced when creating a
  // new goal, never when editing one that already exists.
  const atSoftCap = !goal && activeGoals.length >= 5

  useEffect(() => {
    if (!isOpen) return
    setTitle(goal?.title ?? '')
    setWhy(goal?.why ?? '')
    setYear(goal?.year ?? defaultYear ?? new Date().getFullYear())
  }, [isOpen, goal, defaultYear])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    const trimmedWhy = why.trim()
    if (goal) {
      await goalsRepo.update(goal.id, { title: trimmedTitle, why: trimmedWhy, year })
    } else {
      await goalsRepo.create({ title: trimmedTitle, why: trimmedWhy, year, order: activeGoals.length })
    }
    onClose()
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose} ariaLabel={goal ? 'Edit goal' : 'New goal'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <p className="text-headline text-text">{goal ? 'Edit goal' : 'New goal'}</p>

        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Goal title"
          autoFocus
          className="min-h-11 w-full rounded-lg bg-bg px-4 py-3 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
        />

        <div>
          <p className="text-caption font-medium text-text-faint">Why does this matter to you?</p>
          <textarea
            value={why}
            onChange={(event) => setWhy(event.target.value)}
            rows={3}
            placeholder="Because I'm becoming someone who…"
            className="mt-2 w-full resize-none rounded-lg bg-bg px-4 py-3 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
        </div>

        <label className="flex items-center gap-3 text-subhead text-text-muted">
          Year
          <input
            type="number"
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className="h-9 w-20 rounded-lg bg-bg px-2 text-center font-mono text-body text-text focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
        </label>

        {atSoftCap && (
          <p className="text-caption text-text-muted">
            Focus beats breadth — consider finishing or pausing one first.
          </p>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="ios-press min-h-11 rounded-md px-4 text-subhead font-medium text-text-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ios-press min-h-11 rounded-full bg-accent px-6 text-subhead font-semibold text-accent-on shadow-fab"
          >
            Save
          </button>
        </div>
      </form>
    </Sheet>
  )
}
