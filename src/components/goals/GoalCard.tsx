import { useMemo, useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as goalsRepo from '../../db/repo/goals'
import * as milestonesRepo from '../../db/repo/milestones'
import { GoalForm } from './GoalForm'
import { IconCheck, IconChevronDown, IconMore } from '../icons'
import { formatMonthLabel, monthKey, todayISO } from '../../lib/dates'
import type { Goal, Milestone } from '../../types/models'

function MilestoneRow({ milestone }: { milestone: Milestone }) {
  const done = milestone.status === 'done'

  async function toggle() {
    await milestonesRepo.setStatus(milestone.id, done ? 'active' : 'done')
  }

  return (
    <div className="flex min-h-11 items-center gap-3 py-2">
      <button
        type="button"
        onClick={() => void toggle()}
        aria-pressed={done}
        aria-label={done ? `Mark "${milestone.title}" not done` : `Mark "${milestone.title}" done`}
        className={`ios-press flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-[250ms] ease-ios ${
          done ? 'border-accent bg-accent text-accent-on' : 'border-border-hairline'
        }`}
      >
        {done && <IconCheck className="h-3.5 w-3.5" />}
      </button>
      <p className={`text-subhead ${done ? 'text-text-faint line-through' : 'text-text'}`}>{milestone.title}</p>
    </div>
  )
}

function AddMilestoneInline({ goalId, onDone }: { goalId: string; onDone: () => void }) {
  const [title, setTitle] = useState('')
  const [month, setMonth] = useState(monthKey(todayISO()))

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    await milestonesRepo.create({ goalId, title: trimmed, month })
    onDone()
  }

  return (
    <form onSubmit={handleSubmit} className="mt-1 flex flex-col gap-2 py-2">
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Milestone"
        autoFocus
        className="min-h-11 w-full rounded-md bg-bg px-3 py-2 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
      />
      <div className="flex items-center gap-2">
        <input
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="h-11 rounded-md bg-bg px-3 font-mono text-body text-text focus:outline-none focus:ring-2 focus:ring-accent-ring"
        />
        <button
          type="submit"
          className="ios-press min-h-11 rounded-md bg-accent px-4 text-subhead font-semibold text-accent-on"
        >
          Add
        </button>
        <button
          type="button"
          onClick={onDone}
          className="ios-press min-h-11 px-2 text-subhead font-medium text-text-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export function GoalCard({ goal }: { goal: Goal }) {
  const [expanded, setExpanded] = useState(false)
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [editing, setEditing] = useState(false)

  const progress = useLiveQuery(() => goalsRepo.progress(goal.id), [goal.id]) ?? 0
  const milestones = useLiveQuery(() => milestonesRepo.getForGoal(goal.id), [goal.id]) ?? []

  const groupedByMonth = useMemo(() => {
    const sorted = [...milestones].sort((a, b) => a.month.localeCompare(b.month))
    const map = new Map<string, Milestone[]>()
    for (const milestone of sorted) {
      const list = map.get(milestone.month) ?? []
      list.push(milestone)
      map.set(milestone.month, list)
    }
    return map
  }, [milestones])

  async function handleArchive(status: 'achieved' | 'dropped') {
    setShowMenu(false)
    await goalsRepo.update(goal.id, { status })
  }

  return (
    <div className="rounded-lg bg-surface shadow-card">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="ios-press flex w-full items-start justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="min-w-0">
          <p className="font-display text-headline text-text">{goal.title}</p>
          {goal.why && (
            <p className="mt-1 max-w-content text-subhead italic text-text-muted">{goal.why}</p>
          )}
        </div>
        <div className="mt-0.5 flex shrink-0 items-center gap-2">
          <span className="font-mono text-body text-text-muted">{progress}%</span>
          <IconChevronDown
            className={`h-4 w-4 text-text-faint transition-transform duration-200 ease-ios ${
              expanded ? '' : '-rotate-90'
            }`}
          />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border-hairline px-5 py-4">
          {[...groupedByMonth.entries()].map(([month, items]) => (
            <div key={month} className="mb-4 last:mb-0">
              <p className="font-mono text-caption-2 uppercase tracking-wide text-text-faint">
                {formatMonthLabel(month)}
              </p>
              <div className="mt-1 divide-y divide-border-hairline">
                {items.map((milestone) => (
                  <MilestoneRow key={milestone.id} milestone={milestone} />
                ))}
              </div>
            </div>
          ))}

          {showAddMilestone ? (
            <AddMilestoneInline goalId={goal.id} onDone={() => setShowAddMilestone(false)} />
          ) : (
            <button
              type="button"
              onClick={() => setShowAddMilestone(true)}
              className="ios-press flex min-h-11 items-center text-subhead font-medium text-accent"
            >
              + add milestone
            </button>
          )}

          <div className="relative mt-2 flex justify-end">
            {showMenu && (
              <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />
            )}
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
                    setEditing(true)
                  }}
                  className="ios-press flex min-h-11 w-full items-center px-4 text-left text-subhead text-text"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleArchive('achieved')}
                  className="ios-press flex min-h-11 w-full items-center px-4 text-left text-subhead text-text"
                >
                  Mark achieved
                </button>
                <button
                  type="button"
                  onClick={() => void handleArchive('dropped')}
                  className="ios-press flex min-h-11 w-full items-center px-4 text-left text-subhead text-text-muted"
                >
                  Mark dropped
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <GoalForm isOpen={editing} goal={goal} onClose={() => setEditing(false)} />
    </div>
  )
}
