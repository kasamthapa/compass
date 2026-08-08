import { useLiveQuery } from 'dexie-react-hooks'
import * as journalRepo from '../../db/repo/journal'
import { addDays, parseDateISO, todayISO } from '../../lib/dates'
import { EmptyState } from '../EmptyState'
import { IconJournal } from '../icons'

const DAYS_SHOWN = 60
const CHART_HEIGHT = 40
const CHART_WIDTH = 320

interface Sparkline {
  label: string
  color: string
  points: { x: number; y: number }[]
}

function Sparkline({ label, color, points }: Sparkline) {
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  return (
    <div>
      <p className="font-mono text-caption-2 uppercase tracking-wide text-text-faint">{label}</p>
      <svg
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        className="mt-1 h-10 w-full overflow-visible"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {points.length > 1 && <path d={path} fill="none" stroke={color} strokeWidth="1.5" />}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.75" fill={color} />
        ))}
      </svg>
    </div>
  )
}

/** Two small sparklines — mood and energy — over the last ~60 days of
 * journal entries. Only days with an actual rating are plotted; x position
 * reflects real elapsed time (a week without entries leaves a visible gap,
 * not a false flat line). */
export function MoodEnergyTrend() {
  const today = todayISO()
  const startDate = addDays(today, -(DAYS_SHOWN - 1))
  const entries = useLiveQuery(() => journalRepo.getForRange(startDate, today), [startDate, today])

  const startMs = parseDateISO(startDate).getTime()
  const endMs = parseDateISO(today).getTime()
  const span = Math.max(endMs - startMs, 1)

  function toPoints(field: 'mood' | 'energy') {
    return (entries ?? [])
      .filter((entry) => entry[field] !== undefined)
      .map((entry) => {
        const x = ((parseDateISO(entry.date).getTime() - startMs) / span) * CHART_WIDTH
        const value = entry[field]!
        const y = CHART_HEIGHT - ((value - 1) / 4) * CHART_HEIGHT
        return { x, y }
      })
  }

  const moodPoints = toPoints('mood')
  const energyPoints = toPoints('energy')
  const hasAny = moodPoints.length > 0 || energyPoints.length > 0

  return (
    <section className="mt-8">
      <h2 className="font-display text-title text-text">Mood &amp; energy</h2>
      <div className="mt-4 rounded-lg bg-surface px-5 py-5 shadow-card">
        {!hasAny ? (
          <EmptyState
            icon={IconJournal}
            title="Nothing to show yet"
            message="Rate your mood and energy in the Journal and they'll trend here."
          />
        ) : (
          <div className="flex flex-col gap-4">
            <Sparkline label="Mood" color="var(--chart-blue)" points={moodPoints} />
            <Sparkline label="Energy" color="var(--ink-soft)" points={energyPoints} />
          </div>
        )}
      </div>
    </section>
  )
}
