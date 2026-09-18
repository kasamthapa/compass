import { quoteForDate } from '../../lib/quotes'

export function DailyQuote({ today }: { today: string }) {
  const quote = quoteForDate(today)

  return (
    <figure className="mb-4 flex flex-col items-center rounded-lg bg-surface px-5 py-6 text-center shadow-card">
      <span aria-hidden="true" className="h-[2px] w-[24px] rounded-full bg-accent" />
      <blockquote className="mt-4 max-w-content font-display text-headline font-medium italic text-text md:text-title md:font-medium">
        “{quote.text}”
      </blockquote>
      <figcaption className="mt-3 text-caption text-text-faint">
        <span className="font-mono uppercase tracking-wide text-text-muted">{quote.author}</span>
        {quote.source && <span className="ml-1.5">{quote.source}</span>}
      </figcaption>
    </figure>
  )
}
