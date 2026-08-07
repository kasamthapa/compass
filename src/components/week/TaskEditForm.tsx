import { useEffect, useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Sheet } from '../Sheet'
import * as tasksRepo from '../../db/repo/tasks'
import * as goalsRepo from '../../db/repo/goals'
import * as weeklyPrioritiesRepo from '../../db/repo/weeklyPriorities'
import { RuleViolationError } from '../../db/rules'
import { addDays, formatDayHeader, todayISO } from '../../lib/dates'
import type { Task } from '../../types/models'

interface TaskEditFormProps {
  isOpen: boolean
  task: Task | null
  /** The Monday of the currently-viewed week — used to build the day-of-week picker. */
  weekOf: string
  onClose: () => void
}

export function TaskEditForm({ isOpen, task, weekOf, onClose }: TaskEditFormProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [isMIT, setIsMIT] = useState(false)
  const [showFirstMove, setShowFirstMove] = useState(false)
  const [firstMove, setFirstMove] = useState('')
  const [goalId, setGoalId] = useState<string | null>(null)
  const [priorityId, setPriorityId] = useState<string | null>(null)

  const goals = useLiveQuery(() => goalsRepo.getActive(), []) ?? []
  const priorities = useLiveQuery(() => weeklyPrioritiesRepo.getForWeek(weekOf), [weekOf]) ?? []
  const activePriorities = priorities.filter((priority) => priority.status !== 'dropped')
  const tasksForDate = useLiveQuery(() => (date ? tasksRepo.getForDate(date) : Promise.resolve([])), [date]) ?? []
  const mitCountForDate = tasksForDate.filter(
    (t) => t.isMIT && t.status !== 'dropped' && t.id !== task?.id,
  ).length
  const mitCapReached = mitCountForDate >= 3

  const today = todayISO()
  const tomorrow = addDays(today, 1)
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekOf, i))

  useEffect(() => {
    if (!isOpen || !task) return
    setTitle(task.title)
    setDate(task.date ?? '')
    setIsMIT(task.isMIT)
    setFirstMove(task.firstMove ?? '')
    setShowFirstMove(Boolean(task.firstMove))
    setGoalId(task.goalId ?? null)
    setPriorityId(task.weeklyPriorityId ?? null)
  }, [isOpen, task])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!task) return
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const wantsMit = isMIT && Boolean(date) && !mitCapReached
    const patch = {
      title: trimmedTitle,
      date: date || undefined,
      firstMove: firstMove.trim() || undefined,
      goalId: goalId ?? undefined,
      weeklyPriorityId: priorityId ?? undefined,
    }

    try {
      await tasksRepo.update(task.id, { ...patch, isMIT: wantsMit })
      onClose()
    } catch (error) {
      if (error instanceof RuleViolationError) {
        await tasksRepo.update(task.id, { ...patch, isMIT: false })
        onClose()
      } else {
        console.error('Failed to update task', error)
      }
    }
  }

  if (!task) return null

  return (
    <Sheet isOpen={isOpen} onClose={onClose} ariaLabel="Edit task">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <p className="text-headline text-text">Edit task</p>

        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          autoFocus
          className="min-h-11 w-full rounded-lg bg-bg px-4 py-3 text-body text-text focus:outline-none focus:ring-2 focus:ring-accent-ring"
        />

        <div>
          <p className="text-caption font-medium text-text-faint">When</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(
              [
                ['today', today, 'Today'],
                ['tomorrow', tomorrow, 'Tomorrow'],
              ] as const
            ).map(([key, value, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setDate((current) => (current === value ? '' : value))}
                className={`ios-press min-h-11 rounded-full px-4 text-subhead font-medium transition-colors ${
                  date === value ? 'bg-accent text-accent-on' : 'bg-bg text-text-muted'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {weekDays.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setDate((current) => (current === day ? '' : day))}
                className={`ios-press min-h-9 rounded-full px-3 font-mono text-caption font-medium transition-colors ${
                  date === day ? 'bg-accent text-accent-on' : 'bg-bg text-text-muted'
                }`}
              >
                {formatDayHeader(day)}
              </button>
            ))}
          </div>
        </div>

        <div>
          {mitCapReached && !task.isMIT ? (
            <p className="text-caption text-text-muted">Three is enough for that day — this'll stay a regular task.</p>
          ) : (
            <button
              type="button"
              onClick={() => setIsMIT((value) => !value)}
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

        {activePriorities.length > 0 && (
          <div>
            <p className="text-caption font-medium text-text-faint">This week's priority</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {activePriorities.map((priority) => (
                <button
                  key={priority.id}
                  type="button"
                  onClick={() => setPriorityId((current) => (current === priority.id ? null : priority.id))}
                  className={`ios-press min-h-9 rounded-full px-3 text-caption font-medium transition-colors ${
                    priorityId === priority.id ? 'bg-accent-wash text-accent-text' : 'bg-bg text-text-muted'
                  }`}
                >
                  {priority.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {showFirstMove ? (
          <input
            type="text"
            value={firstMove}
            onChange={(event) => setFirstMove(event.target.value)}
            placeholder='First move, e.g. "open the doc"'
            className="min-h-9 w-full rounded-lg bg-bg px-3 py-1.5 text-subhead text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowFirstMove(true)}
            className="text-caption font-medium text-text-faint"
          >
            + first move
          </button>
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
