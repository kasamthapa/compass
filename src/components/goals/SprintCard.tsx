import { useState } from 'react'
import * as sprintsRepo from '../../db/repo/sprints'
import { IconMore } from '../icons'
import { useDropdownPlacement } from '../../lib/useDropdownPlacement'
import { computeSprintProgress } from '../../lib/sprints'
import { todayISO } from '../../lib/dates'
import { SprintForm } from './SprintForm'
import type { Sprint } from '../../types/models'

export function SprintCard({ sprint }: { sprint: Sprint }) {
  const [showMenu, setShowMenu] = useState(false)
  const [editing, setEditing] = useState(false)
  const { triggerRef, openUpward } = useDropdownPlacement(showMenu)

  const progress = computeSprintProgress(sprint.startDate, sprint.days, todayISO())

  async function handleResolve(status: 'completed' | 'dropped') {
    setShowMenu(false)
    await sprintsRepo.setStatus(sprint.id, status)
  }

  return (
    <div className="rounded-lg bg-surface px-5 py-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-headline text-text">{sprint.title}</p>
          {sprint.why && (
            <p className="mt-1.5 max-w-content font-display text-body italic text-text-muted">{sprint.why}</p>
          )}
        </div>
        <div className="relative shrink-0">
          {showMenu && <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />}
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setShowMenu((value) => !value)}
            aria-label="More options"
            className="ios-press relative z-10 flex h-11 w-11 items-center justify-center rounded-full text-text-faint"
          >
            <IconMore className="h-5 w-5" />
          </button>
          {showMenu && (
            <div
              className={`absolute right-0 z-40 w-44 overflow-hidden rounded-lg bg-surface-elevated py-1 shadow-elevated ${
                openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
              }`}
            >
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
                onClick={() => void handleResolve('completed')}
                className="ios-press flex min-h-11 w-full items-center px-4 text-left text-subhead text-text"
              >
                Mark complete
              </button>
              <button
                type="button"
                onClick={() => void handleResolve('dropped')}
                className="ios-press flex min-h-11 w-full items-center px-4 text-left text-subhead text-text-muted"
              >
                Drop
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-caption text-text-muted">
            DAY {progress.currentDay} OF {progress.totalDays}
          </p>
          {progress.isOverdue ? (
            <p className="text-caption text-text-faint">Time's up — resolve when ready</p>
          ) : (
            <p className="font-mono text-caption text-text-faint">{progress.daysRemaining} left</p>
          )}
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-grid-empty">
          <div
            className="h-full rounded-full bg-chart-blue transition-[width] duration-300 ease-ios"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      <SprintForm isOpen={editing} sprint={sprint} onClose={() => setEditing(false)} />
    </div>
  )
}
