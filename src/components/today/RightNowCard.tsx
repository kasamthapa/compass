import { IconChevronRight } from '../icons'

interface RightNowCardProps {
  onOpen: () => void
}

export function RightNowCard({ onOpen }: RightNowCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="ios-press mt-2 flex w-full items-center justify-between rounded-lg bg-accent-wash px-5 py-4 text-left"
    >
      <div>
        <p className="text-headline text-accent-text">Right now</p>
        <p className="mt-0.5 text-subhead text-text-muted">One thing. Just start.</p>
      </div>
      <IconChevronRight className="h-5 w-5 shrink-0 text-accent-text" />
    </button>
  )
}
