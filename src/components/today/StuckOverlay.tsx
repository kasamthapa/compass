import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as tasksRepo from '../../db/repo/tasks'
import { pickNextAction } from '../../lib/nextAction'
import { Sheet } from '../Sheet'
import { FocusTimer } from '../FocusTimer'

const BREATHE_SECONDS = 60

function BreathingMoment({ onDone }: { onDone: () => void }) {
  const [remaining, setRemaining] = useState(BREATHE_SECONDS)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => {
      setRemaining((value) => (value <= 1 ? 0 : value - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [running])

  useEffect(() => {
    if (remaining === 0 && running) setRunning(false)
  }, [remaining, running])

  return (
    <div className="flex flex-col items-center gap-6 py-6 text-center">
      <div className="h-24 w-24 animate-pulse rounded-full bg-accent-wash" aria-hidden="true" />
      <p className="text-body text-text-muted">Just breathe.</p>
      <p className="font-mono text-title text-text">{remaining}</p>
      <button
        type="button"
        onClick={onDone}
        className="ios-press min-h-11 rounded-md px-6 text-subhead font-medium text-text-muted"
      >
        Close
      </button>
    </div>
  )
}

interface StuckOverlayProps {
  isOpen: boolean
  onClose: () => void
  today: string
}

/** A kind friend, not a task manager — never shows the whole list, no stats, no pressure. */
export function StuckOverlay({ isOpen, onClose, today }: StuckOverlayProps) {
  const tasks = useLiveQuery(() => tasksRepo.getForDate(today), [today]) ?? []
  const next = useMemo(() => pickNextAction(tasks), [tasks])
  const [mode, setMode] = useState<'prompt' | 'timer' | 'breathe'>('prompt')
  const [manualThing, setManualThing] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setMode('prompt')
      setManualThing('')
    }
  }, [isOpen])

  const oneThing = next?.firstMove || next?.title || null

  return (
    <Sheet isOpen={isOpen} onClose={onClose} ariaLabel="Just one small thing">
      {mode === 'timer' ? (
        <div className="py-4">
          <FocusTimer minutes={2} onExit={onClose} />
        </div>
      ) : mode === 'breathe' ? (
        <BreathingMoment onDone={() => setMode('prompt')} />
      ) : (
        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <div>
            <p className="text-headline text-text">You don't have to do it all.</p>
            <p className="mt-1 text-subhead text-text-muted">
              Just the next tiny thing. Two minutes. That's all.
            </p>
          </div>

          {oneThing ? (
            <p className="w-full rounded-md bg-bg px-4 py-3 text-body text-text">{oneThing}</p>
          ) : (
            <input
              type="text"
              value={manualThing}
              onChange={(event) => setManualThing(event.target.value)}
              placeholder="One small thing"
              className="w-full rounded-md bg-bg px-4 py-3 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
            />
          )}

          <button
            type="button"
            disabled={!oneThing && !manualThing.trim()}
            onClick={() => setMode('timer')}
            className="ios-press min-h-11 w-full rounded-md bg-accent px-6 text-subhead font-semibold text-accent-on disabled:opacity-40"
          >
            Start 2 min
          </button>
          <button
            type="button"
            onClick={() => setMode('breathe')}
            className="ios-press min-h-11 text-subhead text-text-muted"
          >
            Still stuck — just breathe
          </button>
        </div>
      )}
    </Sheet>
  )
}
