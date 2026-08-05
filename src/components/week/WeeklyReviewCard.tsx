import { ReviewEntryCard } from '../reviews/ReviewEntryCard'

interface WeeklyReviewCardProps {
  onOpen: () => void
  isDue: boolean
  isCompleted: boolean
}

export function WeeklyReviewCard(props: WeeklyReviewCardProps) {
  return <ReviewEntryCard title="Weekly review" subtitle="5 MIN" {...props} />
}
