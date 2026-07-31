import { useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as tasksRepo from '../../db/repo/tasks'
import { RuleViolationError } from '../../db/rules'
import type { Task } from '../../types/models'
import { IconGoals, IconChevronDown, IconCheck } from '../icons'

interface TaskRowProps {
  task: Task
  onToggle: (task: Task) => void
}

function TaskRow({ task, onToggle }: TaskRowProps) {
  const done = task.status === 'done'
  return (
    <div className="flex min-h-11 items-center gap-3 py-2">
      <button
        type="button"
        onClick={() => onToggle(task)}
        aria-label={done ? `Mark "${task.title}" not done` : `Mark "${task.title}" done`}
        aria-pressed={done}
        className={`ios-press flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-colors duration-[250ms] ease-ios ${
          done ? 'border-accent bg-accent text-accent-on' : 'border-border-hairline bg-transparent'
        }`}
      >
        {done && <IconCheck className="h-4 w-4" />}
      </button>
      <p className={`text-body ${done ? 'text-text-faint line-through' : 'text-text'}`}>
        {task.title}
      </p>
      {task.goalId && <IconGoals className="h-3.5 w-3.5 shrink-0 text-text-faint" />}
    </div>
  )
}

interface TodayFocusProps {
  today: string
}

export function TodayFocus({ today }: TodayFocusProps) {
  const tasksToday = useLiveQuery(() => tasksRepo.getForDate(today), [today]) ?? []
  const mits = tasksToday.filter((task) => task.isMIT)
  const others = tasksToday.filter((task) => !task.isMIT)

  const [showOthers, setShowOthers] = useState(false)
  const [draft, setDraft] = useState('')

  async function handleToggle(task: Task) {
    await tasksRepo.setStatus(task.id, task.status === 'done' ? 'todo' : 'done')
  }

  async function handleAdd(event: FormEvent) {
    event.preventDefault()
    const title = draft.trim()
    if (!title) return
    try {
      await tasksRepo.create({ title, date: today, isMIT: true })
      setDraft('')
    } catch (error) {
      if (!(error instanceof RuleViolationError)) {
        console.error('Failed to add focus task', error)
      }
    }
  }

  return (
    <section className="mt-8">
      <h2 className="font-display text-title text-text">Today's focus</h2>
      <div className="mt-3 rounded-lg bg-surface px-4 shadow-card">
        <div className="divide-y divide-border-hairline">
          {mits.map((task) => (
            <TaskRow key={task.id} task={task} onToggle={handleToggle} />
          ))}
        </div>
        <div className={mits.length > 0 ? 'border-t border-border-hairline py-2' : 'py-2'}>
          {mits.length < 3 ? (
            <form onSubmit={handleAdd}>
              <input
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={mits.length === 0 ? 'What matters most today?' : 'Add another focus'}
                className="min-h-11 w-full bg-transparent text-body text-text placeholder:text-text-faint focus:outline-none"
              />
            </form>
          ) : (
            <p className="min-h-11 py-2.5 text-subhead text-text-muted">Three is enough for today.</p>
          )}
        </div>
      </div>

      {others.length > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowOthers((value) => !value)}
            className="ios-press flex min-h-11 items-center gap-1.5 text-subhead text-text-muted"
          >
            <IconChevronDown
              className={`h-4 w-4 transition-transform duration-200 ease-ios ${
                showOthers ? 'rotate-0' : '-rotate-90'
              }`}
            />
            Other tasks today ({others.length})
          </button>
          {showOthers && (
            <div className="mt-1 divide-y divide-border-hairline rounded-lg bg-surface px-4 shadow-card">
              {others.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={handleToggle} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
