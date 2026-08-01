import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as tasksRepo from '../../db/repo/tasks'
import { pickNextAction } from '../../lib/nextAction'
import { Sheet } from '../Sheet'
import { FocusTimer } from '../FocusTimer'
import { IconLifebuoy } from '../icons'

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
    <div className="flex flex-col items-center gap-7 py-8 text-center">
      <div
        className="breathe-pulse h-32 w-32 rounded-full"
        style={{ background: 'var(--breathe-glow)' }}
        aria-hidden="true"
      />
      <div>
        <p className="text-body text-text-muted">Just breathe.</p>
        <p className="mt-2 font-mono text-title text-text">{remaining}</p>
      </div>
      <button
        type="button"
        onClick={onDone}
        className="ios-press min-h-11 rounded-full px-6 text-subhead font-medium text-text-muted"
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
        <div className="py-6">
          <FocusTimer minutes={2} onExit={onClose} />
        </div>
      ) : mode === 'breathe' ? (
        <BreathingMoment onDone={() => setMode('prompt')} />
      ) : (
        <div className="flex flex-col items-center gap-6 py-3 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-wash text-accent">
            <IconLifebuoy className="h-5 w-5" />
          </div>

          <div>
            <p className="font-display text-title text-text">You don't have to do it all.</p>
            <p className="mt-2 text-subhead text-text-muted">
              Just the next tiny thing. Two minutes. That's all.
            </p>
          </div>

          {oneThing ? (
            <p className="w-full rounded-lg bg-bg px-4 py-3.5 text-body text-text">{oneThing}</p>
          ) : (
            <input
              type="text"
              value={manualThing}
              onChange={(event) => setManualThing(event.target.value)}
              placeholder="One small thing"
              className="w-full rounded-lg bg-bg px-4 py-3.5 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
            />
          )}

          <button
            type="button"
            disabled={!oneThing && !manualThing.trim()}
            onClick={() => setMode('timer')}
            className="ios-press min-h-11 w-full rounded-full bg-accent px-6 text-subhead font-semibold text-accent-on shadow-fab disabled:opacity-40 disabled:shadow-none"
          >
            Start 2 min
          </button>
          <button
            type="button"
            onClick={() => setMode('breathe')}
            className="ios-press mt-1 min-h-11 text-subhead text-text-muted"
          >
            Still stuck — just breathe
          </button>
        </div>
      )}
    </Sheet>
  )
}
