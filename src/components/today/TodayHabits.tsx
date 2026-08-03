import { useRef, useState, type FormEvent, type MouseEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as habitsRepo from '../../db/repo/habits'
import type { HabitWithTodayLog } from '../../db/repo/habits'
import * as goalsRepo from '../../db/repo/goals'
import { RuleViolationError } from '../../db/rules'

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const LONG_PRESS_MS = 500

interface HabitRowProps {
  habit: HabitWithTodayLog
  today: string
  weekStart: string
}

function HabitRow({ habit, today, weekStart }: HabitRowProps) {
  const weekLogs = useLiveQuery(
    () => habitsRepo.getWeekLogs(habit.id, weekStart),
    [habit.id, weekStart],
  )
  const hitRate = useLiveQuery(
    () => habitsRepo.weeklyHitRate(habit.id, weekStart),
    [habit.id, weekStart],
  ) ?? { done: 0, target: habit.targetPerWeek }

  const longPressTimer = useRef<number>()
  const longPressTriggered = useRef(false)

  function clearLongPressTimer() {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = undefined
    }
  }

  function handlePointerDown() {
    longPressTriggered.current = false
    clearLongPressTimer()
    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true
      void habitsRepo.logHabit(habit.id, today, 'skipped')
    }, LONG_PRESS_MS)
  }

  function handlePointerUp() {
    clearLongPressTimer()
    if (!longPressTriggered.current) {
      void habitsRepo.logHabit(habit.id, today, 'done')
    }
  }

  function handleContextMenu(event: MouseEvent) {
    event.preventDefault()
    clearLongPressTimer()
    void habitsRepo.logHabit(habit.id, today, 'skipped')
  }

  const metTarget = hitRate.done >= hitRate.target && hitRate.target > 0

  return (
    <div className="py-3">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 line-clamp-2 text-body text-text">{habit.name}</p>
        <div className="flex shrink-0 items-center gap-1 font-mono text-caption text-text-muted">
          <span>
            {hitRate.done} of {hitRate.target}
          </span>
          {metTarget && <span className="text-good">✓</span>}
        </div>
      </div>
      <p className="mt-1 truncate text-caption text-text-muted">{habit.cue}</p>

      <div className="mt-3 grid grid-cols-7">
        {(weekLogs ?? []).map((entry, index) => {
          const isToday = entry.date === today
          const fillClass =
            entry.status === 'done'
              ? 'bg-accent'
              : entry.status === 'skipped'
                ? 'bg-skip'
                : 'border border-border-hairline bg-grid-empty'
          const dayLetter = DAY_LETTERS[index]

          const square = (
            <span
              aria-hidden="true"
              className={`block h-[22px] w-[22px] rounded-[6px] transition-colors duration-[250ms] ease-ios ${fillClass} ${
                isToday && !entry.status ? 'outline outline-1 outline-accent-ring outline-offset-[1px]' : ''
              }`}
            />
          )

          if (isToday) {
            return (
              <button
                key={entry.date}
                type="button"
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                onPointerLeave={clearLongPressTimer}
                onContextMenu={handleContextMenu}
                aria-label={
                  entry.status === 'done'
                    ? 'Today: done. Tap to clear.'
                    : entry.status === 'skipped'
                      ? 'Today: skipped. Tap to clear.'
                      : 'Mark today done. Long-press or right-click to skip.'
                }
                className="ios-press flex min-h-11 flex-col items-center justify-center gap-1"
              >
                {square}
                <span className="font-mono text-caption-2 text-text-faint">{dayLetter}</span>
              </button>
            )
          }

          return (
            <div key={entry.date} className="flex flex-col items-center justify-center gap-1 py-1">
              {square}
              <span className="font-mono text-caption-2 text-text-faint">{dayLetter}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AddHabitForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [cue, setCue] = useState('')
  const [target, setTarget] = useState(5)
  const [goalId, setGoalId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const goals = useLiveQuery(() => goalsRepo.getActive(), []) ?? []

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    try {
      await habitsRepo.create({
        name: trimmedName,
        cue: cue.trim(),
        targetPerWeek: target,
        goalId: goalId ?? undefined,
      })
      onDone()
    } catch (submitError) {
      if (submitError instanceof RuleViolationError) {
        setError(submitError.message)
      } else {
        console.error('Failed to add habit', submitError)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 py-3">
      <input
        type="text"
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Habit name"
        autoFocus
        className="min-h-11 w-full rounded-md bg-bg px-3 py-2 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
      />
      <input
        type="text"
        value={cue}
        onChange={(event) => setCue(event.target.value)}
        placeholder="Cue (e.g. After waking up)"
        className="min-h-11 w-full rounded-md bg-bg px-3 py-2 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
      />
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-subhead text-text-muted">
          Target per week
          <input
            type="number"
            min={1}
            max={7}
            value={target}
            onChange={(event) => setTarget(Number(event.target.value))}
            className="h-9 w-14 rounded-md bg-bg px-2 text-center font-mono text-body text-text focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="ios-press min-h-11 rounded-md px-3 text-subhead font-medium text-text-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ios-press min-h-11 rounded-md bg-accent px-3 text-subhead font-semibold text-accent-on"
          >
            Add
          </button>
        </div>
      </div>
      {goals.length > 0 && (
        <div className="flex flex-wrap gap-2">
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
      )}
      {error && <p className="text-subhead text-text-muted">{error}</p>}
    </form>
  )
}

interface TodayHabitsProps {
  today: string
  weekStart: string
}

export function TodayHabits({ today, weekStart }: TodayHabitsProps) {
  const habits = useLiveQuery(() => habitsRepo.getActiveWithTodayLog(today), [today]) ?? []
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <section className="mt-8">
      <h2 className="font-display text-title text-text">Today's habits</h2>
      <div className="mt-3 rounded-lg bg-surface px-4 shadow-card">
        {habits.length === 0 && !showAddForm && (
          <p className="py-4 text-subhead text-text-muted">
            No habits yet — add one when you're ready.
          </p>
        )}
        <div className="divide-y divide-border-hairline">
          {habits.map((habit) => (
            <HabitRow key={habit.id} habit={habit} today={today} weekStart={weekStart} />
          ))}
        </div>
        <div className={habits.length > 0 ? 'border-t border-border-hairline' : ''}>
          {showAddForm ? (
            <AddHabitForm onDone={() => setShowAddForm(false)} onCancel={() => setShowAddForm(false)} />
          ) : habits.length < 5 ? (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="ios-press flex min-h-11 w-full items-center py-2.5 text-left text-subhead font-medium text-accent"
            >
              + Add habit
            </button>
          ) : (
            <p className="py-2.5 text-subhead text-text-muted">Five is plenty for now.</p>
          )}
        </div>
      </div>
    </section>
  )
}
