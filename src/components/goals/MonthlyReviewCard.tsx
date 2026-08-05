import { ReviewEntryCard } from '../reviews/ReviewEntryCard'

interface MonthlyReviewCardProps {
  onOpen: () => void
  isDue: boolean
  isCompleted: boolean
}

export function MonthlyReviewCard(props: MonthlyReviewCardProps) {
  return <ReviewEntryCard title="Monthly review" subtitle="3 MIN" {...props} />
}
