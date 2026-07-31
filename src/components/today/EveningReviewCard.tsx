import { IconChevronRight } from '../icons'

interface EveningReviewCardProps {
  onOpen: () => void
}

export function EveningReviewCard({ onOpen }: EveningReviewCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="ios-press mt-8 flex w-full items-center justify-between rounded-lg bg-surface px-5 py-4 text-left shadow-card"
    >
      <div>
        <p className="text-headline text-text">Close the day</p>
        <p className="mt-0.5 font-mono text-caption text-text-muted">2 MIN</p>
      </div>
      <IconChevronRight className="h-5 w-5 shrink-0 text-text-faint" />
    </button>
  )
}
