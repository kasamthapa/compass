import { useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as weeklyPrioritiesRepo from '../../db/repo/weeklyPriorities'
import * as goalsRepo from '../../db/repo/goals'
import { canAddWeeklyPriority, RuleViolationError } from '../../db/rules'
import { addDays } from '../../lib/dates'
import { IconCheck, IconMore } from '../icons'
import type { WeeklyPriority } from '../../types/models'

interface PriorityRowProps {
  priority: WeeklyPriority
  goalTitle?: string
  onToggleDone: () => void
  onCarry: () => void
  onDrop: () => void
}

function PriorityRow({ priority, goalTitle, onToggleDone, onCarry, onDrop }: PriorityRowProps) {
  const [showMenu, setShowMenu] = useState(false)
  const done = priority.status === 'done'

  return (
    <div className="flex items-start gap-3 py-3">
      <button
        type="button"
        onClick={onToggleDone}
        aria-pressed={done}
        aria-label={done ? `Mark "${priority.title}" not done` : `Mark "${priority.title}" done`}
        className={`ios-press flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-[250ms] ease-ios ${
          done ? 'border-accent bg-accent text-accent-on' : 'border-border-hairline'
        }`}
      >
        {done && <IconCheck className="h-3.5 w-3.5" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-body ${done ? 'text-text-faint line-through' : 'text-text'}`}>{priority.title}</p>
        {goalTitle && (
          <p className="mt-0.5 font-mono text-caption text-text-faint">{'→'} {goalTitle}</p>
        )}
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
          <div className="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-lg bg-surface-elevated py-1 shadow-elevated">
            <button
              type="button"
              onClick={() => {
                setShowMenu(false)
                onCarry()
              }}
              className="ios-press flex min-h-11 w-full items-center px-4 text-left text-subhead text-text"
            >
              Carry to next week
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

function AddPriorityInline({
  weekOf,
  order,
  onDone,
}: {
  weekOf: string
  order: number
  onDone: () => void
}) {
  const [title, setTitle] = useState('')
  const [goalId, setGoalId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const goals = useLiveQuery(() => goalsRepo.getActive(), []) ?? []

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    try {
      await weeklyPrioritiesRepo.create({ title: trimmed, weekOf, goalId: goalId ?? undefined, order })
      onDone()
    } catch (submitError) {
      if (submitError instanceof RuleViolationError) {
        setError(submitError.message)
      } else {
        console.error('Failed to add weekly priority', submitError)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 py-3">
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="What matters most this week?"
        autoFocus
        className="min-h-11 w-full rounded-md bg-bg px-3 py-2 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
      />
      {goals.length > 0 && (
        <div className="flex flex-wrap gap-2">
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
      )}
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onDone}
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
      {error && <p className="text-subhead text-text-muted">{error}</p>}
    </form>
  )
}

interface WeekPrioritiesProps {
  weekOf: string
  /** Defaults to "This week's priorities" — overridden when this component is reused inside the weekly review's "next week" step. */
  heading?: string
  /** Defaults to "What matters most this week?" — overridden alongside `heading` for the same reason. */
  emptyPrompt?: string
}

export function WeekPriorities({
  weekOf,
  heading = "This week's priorities",
  emptyPrompt = 'What matters most this week?',
}: WeekPrioritiesProps) {
  const allPriorities = useLiveQuery(() => weeklyPrioritiesRepo.getForWeek(weekOf), [weekOf]) ?? []
  const priorities = allPriorities.filter((priority) => priority.status !== 'dropped')
  const goals = useLiveQuery(() => goalsRepo.getActive(), []) ?? []
  const [showAddForm, setShowAddForm] = useState(false)
  const [carryNotice, setCarryNotice] = useState<string | null>(null)

  const atCap = priorities.length >= 3

  function goalTitleFor(goalId?: string): string | undefined {
    if (!goalId) return undefined
    return goals.find((goal) => goal.id === goalId)?.title
  }

  async function handleToggleDone(priority: WeeklyPriority) {
    await weeklyPrioritiesRepo.setStatus(priority.id, priority.status === 'done' ? 'active' : 'done')
  }

  async function handleDrop(priority: WeeklyPriority) {
    await weeklyPrioritiesRepo.setStatus(priority.id, 'dropped')
  }

  async function handleCarry(priority: WeeklyPriority) {
    const nextWeek = addDays(priority.weekOf, 7)
    const allowed = await canAddWeeklyPriority(nextWeek)
    if (!allowed) {
      setCarryNotice('Next week already has three — finish or drop one there first.')
      return
    }
    setCarryNotice(null)
    await weeklyPrioritiesRepo.update(priority.id, { weekOf: nextWeek })
  }

  return (
    <section className="mt-4">
      <h2 className="font-display text-title text-text">{heading}</h2>
      <div className="mt-4 rounded-lg bg-surface px-4 shadow-card">
        {priorities.length === 0 && !showAddForm && (
          <p className="py-4 text-subhead text-text-muted">{emptyPrompt}</p>
        )}
        <div className="divide-y divide-border-hairline">
          {priorities.map((priority) => (
            <PriorityRow
              key={priority.id}
              priority={priority}
              goalTitle={goalTitleFor(priority.goalId)}
              onToggleDone={() => void handleToggleDone(priority)}
              onCarry={() => void handleCarry(priority)}
              onDrop={() => void handleDrop(priority)}
            />
          ))}
        </div>
        <div className={priorities.length > 0 ? 'border-t border-border-hairline' : ''}>
          {showAddForm ? (
            <AddPriorityInline weekOf={weekOf} order={priorities.length} onDone={() => setShowAddForm(false)} />
          ) : atCap ? (
            <p className="py-2.5 text-subhead text-text-muted">Three is enough for one week.</p>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="ios-press flex min-h-11 w-full items-center py-2.5 text-left text-subhead font-medium text-accent-text"
            >
              + add priority
            </button>
          )}
        </div>
        {carryNotice && <p className="pb-2.5 text-caption text-text-muted">{carryNotice}</p>}
      </div>
    </section>
  )
}
