import { formatRelativeTime } from '../../lib/dates'
import type { CaptureItem } from '../../types/models'

interface InboxRowProps {
  item: CaptureItem
  now: Date
  isSelected: boolean
  onSelect: () => void
  onOpen: () => void
}

export function InboxRow({ item, now, isSelected, onSelect, onOpen }: InboxRowProps) {
  return (
    <button
      type="button"
      onClick={() => {
        onSelect()
        onOpen()
      }}
      className={`ios-press flex min-h-11 w-full items-start gap-3 -mx-4 px-4 py-3 text-left transition-colors ${
        isSelected ? 'bg-accent-wash' : ''
      }`}
    >
      <p className="min-w-0 flex-1 line-clamp-2 text-body text-text">{item.text}</p>
      <span className="mt-0.5 shrink-0 font-mono text-caption-2 text-text-faint">
        {formatRelativeTime(item.createdAt, now)}
      </span>
    </button>
  )
}
