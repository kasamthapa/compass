import { useEffect, useState } from 'react'

interface FocusTimerProps {
  minutes: number
  /** Called when the user is done with this timer session (after time's up, or manually). */
  onExit: () => void
}

const RING_RADIUS = 90
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

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
      <div className="flex flex-col items-center gap-7 text-center">
        <p className="font-display text-title text-text">
          Time's up — keep going or take a break?
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddFiveMin}
            className="ios-press min-h-11 rounded-full bg-surface px-6 text-subhead font-semibold text-text"
          >
            Add 5 min
          </button>
          <button
            type="button"
            onClick={onExit}
            className="ios-press min-h-11 rounded-full bg-accent px-6 text-subhead font-semibold text-accent-on shadow-fab"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  const progress = 1 - remaining / totalSeconds
  const dashoffset = RING_CIRCUMFERENCE * (1 - progress)

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div className="relative flex h-52 w-52 items-center justify-center">
        <svg viewBox="0 0 200 200" className="absolute inset-0 -rotate-90">
          <circle
            cx="100"
            cy="100"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--grid-empty)"
            strokeWidth="8"
          />
          <circle
            cx="100"
            cy="100"
            r={RING_RADIUS}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashoffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <p className="font-mono text-[2.75rem] leading-none text-text">{formatClock(remaining)}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPhase(phase === 'running' ? 'paused' : 'running')}
          className="ios-press min-h-11 rounded-full bg-accent px-8 text-subhead font-semibold text-accent-on shadow-fab"
        >
          {phase === 'running' ? 'Pause' : 'Start'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="ios-press min-h-11 rounded-full bg-surface px-6 text-subhead font-medium text-text-muted"
        >
          Reset
        </button>
      </div>
    </div>
  )
}
