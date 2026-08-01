import { useEffect, useState } from 'react'

interface FocusTimerProps {
  minutes: number
  /** Called when the user is done with this timer session (after time's up, or manually). */
  onExit: () => void
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/**
 * A minimal countdown — a starting aid, not a productivity-tracking tool.
 * Nothing here is persisted or logged as a metric. No sound by default.
 */
export function FocusTimer({ minutes, onExit }: FocusTimerProps) {
  const totalSeconds = minutes * 60
  const [remaining, setRemaining] = useState(totalSeconds)
  const [phase, setPhase] = useState<'running' | 'paused' | 'complete'>('running')

  useEffect(() => {
    if (phase !== 'running') return
    const id = window.setInterval(() => {
      setRemaining((value) => (value <= 1 ? 0 : value - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (remaining === 0 && phase === 'running') {
      setPhase('complete')
    }
  }, [remaining, phase])

  function handleAddFiveMin() {
    setRemaining((value) => value + 300)
    setPhase('running')
  }

  function handleReset() {
    setRemaining(totalSeconds)
    setPhase('paused')
  }

  if (phase === 'complete') {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-headline text-text">Time's up — keep going or take a break?</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAddFiveMin}
            className="ios-press min-h-11 rounded-md bg-surface px-5 text-subhead font-semibold text-text"
          >
            Add 5 min
          </button>
          <button
            type="button"
            onClick={onExit}
            className="ios-press min-h-11 rounded-md bg-accent px-5 text-subhead font-semibold text-accent-on"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  const progress = 1 - remaining / totalSeconds

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <p className="font-mono text-[3.5rem] leading-none text-text">{formatClock(remaining)}</p>
      <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-grid-empty">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPhase(phase === 'running' ? 'paused' : 'running')}
          className="ios-press min-h-11 rounded-md bg-accent px-6 text-subhead font-semibold text-accent-on"
        >
          {phase === 'running' ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="ios-press min-h-11 rounded-md px-5 text-subhead font-medium text-text-muted"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
