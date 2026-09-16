import { useEffect, useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Sheet } from '../Sheet'
import * as sprintsRepo from '../../db/repo/sprints'
import { isAtSprintSoftCap } from '../../db/rules'
import { useFocusAtStart } from '../../lib/focusAtStart'
import { todayISO } from '../../lib/dates'
import type { Sprint } from '../../types/models'

const DAY_PRESETS = [5, 7, 15] as const

interface SprintFormProps {
  isOpen: boolean
  /** null = creating a new sprint. */
  sprint: Sprint | null
  onClose: () => void
}

export function SprintForm({ isOpen, sprint, onClose }: SprintFormProps) {
  const [title, setTitle] = useState('')
  const [why, setWhy] = useState('')
  const [days, setDays] = useState(7)
  const titleRef = useFocusAtStart<HTMLInputElement>(isOpen)

  // Soft cap, same "nudge, never block" pattern as Goals — only surfaced
  // when creating a new sprint, never when editing one that already exists.
  const atSoftCap = useLiveQuery(() => (!sprint ? isAtSprintSoftCap() : Promise.resolve(false)), [sprint]) ?? false

  useEffect(() => {
    if (!isOpen) return
    setTitle(sprint?.title ?? '')
    setWhy(sprint?.why ?? '')
    setDays(sprint?.days ?? 7)
  }, [isOpen, sprint])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    const trimmedWhy = why.trim()
    const safeDays = Math.max(1, Math.round(days) || 1)
    if (sprint) {
      await sprintsRepo.update(sprint.id, { title: trimmedTitle, why: trimmedWhy || undefined, days: safeDays })
    } else {
      await sprintsRepo.create({ title: trimmedTitle, why: trimmedWhy || undefined, startDate: todayISO(), days: safeDays })
    }
    onClose()
  }

  return (
    <Sheet isOpen={isOpen} onClose={onClose} ariaLabel={sprint ? 'Edit sprint' : 'New sprint'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <p className="text-headline text-text">{sprint ? 'Edit sprint' : 'New sprint'}</p>

        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What are you sprinting on?"
          ref={titleRef}
          className="min-h-11 w-full rounded-lg bg-bg px-4 py-3 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
        />

        <div>
          <p className="text-caption font-medium text-text-faint">Why this, why now?</p>
          <textarea
            value={why}
            onChange={(event) => setWhy(event.target.value)}
            rows={2}
            placeholder="Optional"
            className="mt-2 w-full resize-none rounded-lg bg-bg px-4 py-3 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
        </div>

        <div>
          <p className="text-caption font-medium text-text-faint">
            {sprint ? 'Length' : 'How many days?'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {DAY_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDays(preset)}
                aria-pressed={days === preset}
                className={`ios-press min-h-11 rounded-full px-4 text-subhead font-medium transition-colors ${
                  days === preset ? 'bg-accent text-accent-on' : 'bg-bg text-text-muted'
                }`}
              >
                {preset} days
              </button>
            ))}
            <label className="flex items-center gap-2 text-subhead text-text-muted">
              or
              <input
                type="number"
                min={1}
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
                className="h-11 w-20 rounded-lg bg-bg px-2 text-center font-mono text-body text-text focus:outline-none focus:ring-2 focus:ring-accent-ring"
              />
            </label>
          </div>
          {sprint && (
            <p className="mt-2 text-caption text-text-faint">
              Changing this extends or shortens the sprint from its original start date.
            </p>
          )}
        </div>

        {atSoftCap && (
          <p className="text-caption text-text-muted">
            Focus beats breadth — consider finishing or dropping one sprint first.
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
