import { IconCheck, IconChevronRight } from '../icons'

interface ReviewEntryCardProps {
  title: string
  subtitle: string
  onOpen: () => void
  isDue: boolean
  isCompleted: boolean
}

/**
 * Shared entry-point card for every periodic review (weekly, monthly,
 * yearly) — always reachable, never hides itself before/after its due
 * window or once completed; only its visual weight changes (a ring +
 * wash when due, a quiet checkmark once completed). See DECISIONS.md
 * ("the weekly review card is always visible").
 */
export function ReviewEntryCard({ title, subtitle, onOpen, isDue, isCompleted }: ReviewEntryCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`ios-press mt-3 flex w-full items-center justify-between rounded-lg px-5 py-4 text-left shadow-card transition-colors duration-150 ease-ios ${
        isDue ? 'bg-accent-wash ring-1 ring-accent-ring' : 'bg-surface'
      }`}
    >
      <div className="flex items-center gap-2">
        <div>
          <p className="text-headline text-text">{title}</p>
          <p className="mt-0.5 font-mono text-caption text-text-muted">{subtitle}</p>
        </div>
        {isCompleted && <IconCheck className="h-4 w-4 shrink-0 text-accent" />}
      </div>
      <IconChevronRight className="h-5 w-5 shrink-0 text-text-faint" />
    </button>
  )
}
