import { useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as habitsRepo from '../../db/repo/habits'
import * as capturesRepo from '../../db/repo/captures'
import * as goalsRepo from '../../db/repo/goals'
import type { CaptureItem } from '../../types/models'

interface HabitConvertFormProps {
  capture: CaptureItem
  onDone: () => void
  onCancel: () => void
}

export function HabitConvertForm({ capture, onDone, onCancel }: HabitConvertFormProps) {
  const [name, setName] = useState(capture.text)
  const [cue, setCue] = useState('')
  const [target, setTarget] = useState(5)
  const [goalId, setGoalId] = useState<string | null>(null)

  const activeHabits = useLiveQuery(() => habitsRepo.getActive(), []) ?? []
  const goals = useLiveQuery(() => goalsRepo.getActive(), []) ?? []
  const atCap = activeHabits.length >= 5

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    try {
      const habit = await habitsRepo.create({
        name: trimmedName,
        cue: cue.trim(),
        targetPerWeek: target,
        goalId: goalId ?? undefined,
        status: atCap ? 'paused' : 'active',
      })
      await capturesRepo.markProcessed(capture.id, { type: 'habit', id: habit.id })
      onDone()
    } catch (error) {
      console.error('Failed to convert capture to habit', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <p className="text-headline text-text">Turn into a habit</p>

      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
        className="min-h-11 w-full rounded-lg bg-bg px-4 py-3 text-body text-text focus:outline-none focus:ring-2 focus:ring-accent-ring"
      />
      <input
        type="text"
        value={cue}
        onChange={(event) => setCue(event.target.value)}
        placeholder="Cue (e.g. After waking up)"
        className="min-h-11 w-full rounded-lg bg-bg px-4 py-3 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
      />

      <label className="flex items-center gap-3 text-subhead text-text-muted">
        Target per week
        <input
          type="number"
          min={1}
          max={7}
          value={target}
          onChange={(event) => setTarget(Number(event.target.value))}
          className="h-9 w-14 rounded-lg bg-bg px-2 text-center font-mono text-body text-text focus:outline-none focus:ring-2 focus:ring-accent-ring"
        />
      </label>

      {goals.length > 0 && (
        <div>
          <p className="text-caption font-medium text-text-faint">Goal</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {goals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => setGoalId((current) => (current === goal.id ? null : goal.id))}
                className={`ios-press min-h-9 rounded-full px-3 text-caption font-medium transition-colors ${
                  goalId === goal.id ? 'bg-accent-wash text-accent' : 'bg-bg text-text-muted'
                }`}
              >
                {goal.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {atCap && (
        <p className="text-caption text-text-muted">
          Five is plenty for now — this'll be saved as paused, ready to activate later.
        </p>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="ios-press min-h-11 rounded-md px-4 text-subhead font-medium text-text-muted"
        >
          Back
        </button>
        <button
          type="submit"
          className="ios-press min-h-11 rounded-full bg-accent px-6 text-subhead font-semibold text-accent-on shadow-fab"
        >
          {atCap ? 'Save as paused' : 'Save'}
        </button>
      </div>
    </form>
  )
}
