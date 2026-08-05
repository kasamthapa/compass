const SCORES = [1, 2, 3, 4, 5] as const
type Score = (typeof SCORES)[number]

interface ScoreStepProps {
  prompt: string
  score: Score | undefined
  onSelect: (value: Score) => void
}

/** The 1–5 tap-to-rate row, shared between the daily and weekly reviews. */
export function ScoreStep({ prompt, score, onSelect }: ScoreStepProps) {
  return (
    <div>
      <p className="text-body text-text">{prompt}</p>
      <div className="mt-4 flex justify-between gap-2">
        {SCORES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            aria-label={`${value} out of 5`}
            aria-pressed={score === value}
            className={`ios-press flex h-11 w-11 items-center justify-center rounded-full border font-mono text-body transition-colors duration-[250ms] ease-ios ${
              score === value
                ? 'border-accent bg-accent text-accent-on'
                : 'border-border-hairline text-text-muted'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}
