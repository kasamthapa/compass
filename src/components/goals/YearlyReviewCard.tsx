import { ReviewEntryCard } from '../reviews/ReviewEntryCard'

interface YearlyReviewCardProps {
  onOpen: () => void
  isDue: boolean
  isCompleted: boolean
}

export function YearlyReviewCard(props: YearlyReviewCardProps) {
  return <ReviewEntryCard title="Yearly review" subtitle="5 MIN" {...props} />
}
