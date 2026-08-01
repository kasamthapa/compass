import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as tasksRepo from '../../db/repo/tasks'
import { pickNextAction } from '../../lib/nextAction'
import { FullScreenOverlay } from '../FullScreenOverlay'
import { FocusTimer } from '../FocusTimer'
import { IconClose, IconCheck } from '../icons'

const COMPLETION_DISPLAY_MS = 700

interface FocusModeProps {
  isOpen: boolean
  onClose: () => void
  today: string
}

export function FocusMode({ isOpen, onClose, today }: FocusModeProps) {
  const tasks = useLiveQuery(() => tasksRepo.getForDate(today), [today]) ?? []
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null)
  const [justDone, setJustDone] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setSelectedId(null)
      setShowPicker(false)
      setTimerMinutes(null)
      setJustDone(false)
    }
  }, [isOpen])

  const autoNext = useMemo(() => pickNextAction(tasks), [tasks])
  const current = selectedId ? (tasks.find((task) => task.id === selectedId) ?? autoNext) : autoNext
  const remaining = tasks.filter(
    (task) => task.status !== 'done' && task.status !== 'dropped' && task.id !== current?.id,
  )

  async function handleDone() {
    if (!current) return
    setJustDone(true)
    await tasksRepo.setStatus(current.id, 'done')
    setSelectedId(null)
    setTimeout(() => setJustDone(false), COMPLETION_DISPLAY_MS)
  }

  return (
    <FullScreenOverlay isOpen={isOpen} onClose={onClose} ariaLabel="Right now">
      <div className="flex items-center justify-between px-5 pt-[calc(1rem_+_env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="ios-press flex h-11 w-11 items-center justify-center rounded-full text-text-muted"
        >
          <IconClose className="h-5 w-5" />
        </button>
        <p className="font-mono text-caption uppercase tracking-wide text-text-faint">Right now</p>
        <div className="h-11 w-11" aria-hidden="true" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-16 text-center">
        {timerMinutes ? (
          <FocusTimer minutes={timerMinutes} onExit={() => setTimerMinutes(null)} />
        ) : justDone ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-on">
              <IconCheck className="h-7 w-7" />
            </div>
            <p className="text-headline text-text">Nice.</p>
          </div>
        ) : !current ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-headline text-text">
              {tasks.length === 0 ? 'Nothing set for today yet.' : "That's the focus for now."}
            </p>
            {tasks.length === 0 && (
              <p className="text-subhead text-text-muted">Add a focus first, then come back here.</p>
            )}
          </div>
        ) : (
          <>
            <div>
              <p className="font-display text-title text-text">{current.title}</p>
              {current.firstMove && (
                <p className="mt-3 text-body text-text-muted">First move: {current.firstMove}</p>
              )}
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                type="button"
                onClick={() => setTimerMinutes(2)}
                className="ios-press min-h-11 w-56 rounded-md bg-accent px-6 text-subhead font-semibold text-accent-on"
              >
                Start 2 min
              </button>
              <button
                type="button"
                onClick={() => setTimerMinutes(25)}
                className="ios-press min-h-11 w-56 rounded-md bg-surface px-6 text-subhead font-semibold text-text"
              >
                Start 25 min
              </button>
              <button
                type="button"
                onClick={() => void handleDone()}
                className="ios-press min-h-11 px-6 text-subhead font-medium text-text-muted"
              >
                Done
              </button>
            </div>

            {remaining.length > 0 &&
              (showPicker ? (
                <div className="flex w-full max-w-xs flex-col gap-1">
                  {remaining.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(task.id)
                        setShowPicker(false)
                      }}
                      className="ios-press min-h-11 rounded-md px-3 py-2 text-subhead text-text-muted"
                    >
                      {task.title}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowPicker(true)}
                  className="ios-press min-h-11 px-3 text-caption text-text-faint"
                >
                  something else
                </button>
              ))}
          </>
        )}
      </div>
    </FullScreenOverlay>
  )
}
