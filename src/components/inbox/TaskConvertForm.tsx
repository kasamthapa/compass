import { useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as tasksRepo from '../../db/repo/tasks'
import * as capturesRepo from '../../db/repo/captures'
import * as goalsRepo from '../../db/repo/goals'
import { RuleViolationError } from '../../db/rules'
import { todayISO, addDays, weekOf } from '../../lib/dates'
import type { CaptureItem } from '../../types/models'

interface TaskConvertFormProps {
  capture: CaptureItem
  onDone: () => void
  onCancel: () => void
}

type DateChip = 'today' | 'tomorrow' | 'week' | null

export function TaskConvertForm({ capture, onDone, onCancel }: TaskConvertFormProps) {
  const today = todayISO()
  const tomorrow = addDays(today, 1)
  const weekEnd = addDays(weekOf(today), 6)

  const [title, setTitle] = useState(capture.text)
  const [dateChip, setDateChip] = useState<DateChip>(null)
  const [isMIT, setIsMIT] = useState(false)
  const [showFirstMove, setShowFirstMove] = useState(false)
  const [firstMove, setFirstMove] = useState('')
  const [showEstimate, setShowEstimate] = useState(false)
  const [estimate, setEstimate] = useState('')
  const [goalId, setGoalId] = useState<string | null>(null)

  const date = dateChip === 'today' ? today : dateChip === 'tomorrow' ? tomorrow : dateChip === 'week' ? weekEnd : ''

  const goals = useLiveQuery(() => goalsRepo.getActive(), []) ?? []
  const tasksForDate = useLiveQuery(() => (date ? tasksRepo.getForDate(date) : Promise.resolve([])), [date]) ?? []
  const mitCountForDate = tasksForDate.filter((task) => task.isMIT && task.status !== 'dropped').length
  const mitCapReached = mitCountForDate >= 3

  function selectChip(chip: DateChip) {
    setDateChip((current) => (current === chip ? null : chip))
  }

  function handleMitToggle() {
    if (!isMIT && !date) {
      setDateChip('today')
    }
    setIsMIT((value) => !value)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return

    const wantsMit = isMIT && Boolean(date) && !mitCapReached

    try {
      const task = await tasksRepo.create({
        title: trimmed,
        date: date || undefined,
        isMIT: wantsMit,
        firstMove: firstMove.trim() || undefined,
        estimateMin: estimate ? Number(estimate) : undefined,
        goalId: goalId ?? undefined,
      })
      await capturesRepo.markProcessed(capture.id, { type: 'task', id: task.id })
      onDone()
    } catch (error) {
      if (error instanceof RuleViolationError) {
        const task = await tasksRepo.create({
          title: trimmed,
          date: date || undefined,
          isMIT: false,
          firstMove: firstMove.trim() || undefined,
          estimateMin: estimate ? Number(estimate) : undefined,
          goalId: goalId ?? undefined,
        })
        await capturesRepo.markProcessed(capture.id, { type: 'task', id: task.id })
        onDone()
      } else {
        console.error('Failed to convert capture to task', error)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <p className="text-headline text-text">Turn into a task</p>

      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        autoFocus
        className="min-h-11 w-full rounded-lg bg-bg px-4 py-3 text-body text-text focus:outline-none focus:ring-2 focus:ring-accent-ring"
      />

      <div>
        <p className="text-caption font-medium text-text-faint">When</p>
        <div className="mt-2 flex gap-2">
          {(
            [
              ['today', 'Today'],
              ['tomorrow', 'Tomorrow'],
              ['week', 'This week'],
            ] as const
          ).map(([chip, label]) => (
            <button
              key={chip}
              type="button"
              onClick={() => selectChip(chip)}
              className={`ios-press min-h-11 rounded-full px-4 text-subhead font-medium transition-colors ${
                dateChip === chip ? 'bg-accent text-accent-on' : 'bg-bg text-text-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {mitCapReached ? (
          <p className="text-caption text-text-muted">Three is enough for that day — this'll be a regular task.</p>
        ) : (
          <button
            type="button"
            onClick={handleMitToggle}
            aria-pressed={isMIT}
            className="ios-press flex min-h-11 items-center gap-2.5"
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
                isMIT ? 'border-accent bg-accent' : 'border-border-hairline'
              }`}
            />
            <span className="text-subhead text-text">Make this a top focus (MIT)</span>
          </button>
        )}
      </div>

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
                  goalId === goal.id ? 'bg-accent-wash text-accent-text' : 'bg-bg text-text-muted'
                }`}
              >
                {goal.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {showFirstMove && (
        <input
          type="text"
          value={firstMove}
          onChange={(event) => setFirstMove(event.target.value)}
          placeholder='First move, e.g. "open the doc"'
          className="min-h-9 w-full rounded-lg bg-bg px-3 py-1.5 text-subhead text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
        />
      )}

      {showEstimate && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={240}
            value={estimate}
            onChange={(event) => setEstimate(event.target.value)}
            placeholder="15"
            className="h-9 w-16 rounded-lg bg-bg px-2 text-center font-mono text-subhead text-text focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
          <span className="text-caption text-text-faint">minutes, roughly</span>
        </div>
      )}

      <div className="flex gap-4">
        {!showFirstMove && (
          <button
            type="button"
            onClick={() => setShowFirstMove(true)}
            className="text-caption font-medium text-text-faint"
          >
            + first move
          </button>
        )}
        {!showEstimate && (
          <button
            type="button"
            onClick={() => setShowEstimate(true)}
            className="text-caption font-medium text-text-faint"
          >
            + ~min
          </button>
        )}
      </div>

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
          Save
        </button>
      </div>
    </form>
  )
}
