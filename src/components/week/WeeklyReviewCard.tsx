import { IconCheck, IconChevronRight } from '../icons'

interface WeeklyReviewCardProps {
  onOpen: () => void
  isDue: boolean
  isCompleted: boolean
}

/**
 * Always reachable — unlike the daily review's card, this never hides
 * itself (before, during, or after the due window, and whether or not
 * it's been completed). "Due" only changes how loud it looks; skipping it
 * is never scolded. See CLAUDE.md's no-guilt-language rule.
 */
export function WeeklyReviewCard({ onOpen, isDue, isCompleted }: WeeklyReviewCardProps) {
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
          <p className="text-headline text-text">Weekly review</p>
          <p className="mt-0.5 font-mono text-caption text-text-muted">5 MIN</p>
        </div>
        {isCompleted && <IconCheck className="h-4 w-4 shrink-0 text-accent" />}
      </div>
      <IconChevronRight className="h-5 w-5 shrink-0 text-text-faint" />
    </button>
  )
}
