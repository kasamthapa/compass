import { useEffect, useRef, useState } from 'react'
import * as journalRepo from '../../db/repo/journal'
import { formatHeaderDate } from '../../lib/dates'
import { IconCheck } from '../icons'

const SAVE_DEBOUNCE_MS = 800
const SAVED_INDICATOR_MS = 1500
const RATING_VALUES = [1, 2, 3, 4, 5] as const
type Rating = (typeof RATING_VALUES)[number]

function RatingDots({
  label,
  value,
  onChange,
}: {
  label: string
  value: Rating | undefined
  onChange: (value: Rating) => void
}) {
  return (
    <div className="flex items-center gap-3">
      <p className="w-14 shrink-0 text-caption font-medium text-text-faint">{label}</p>
      <div className="flex gap-2">
        {RATING_VALUES.map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            aria-label={`${label} ${rating} out of 5`}
            aria-pressed={value === rating}
            className={`ios-press h-6 w-6 rounded-full border transition-colors duration-[250ms] ease-ios ${
              value === rating ? 'border-accent bg-accent' : 'border-border-hairline'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

interface JournalEditorProps {
  date: string
}

export function JournalEditor({ date }: JournalEditorProps) {
  const [text, setText] = useState('')
  const [mood, setMood] = useState<Rating | undefined>(undefined)
  const [energy, setEnergy] = useState<Rating | undefined>(undefined)
  const [showSaved, setShowSaved] = useState(false)

  const dateRef = useRef(date)
  const textRef = useRef('')
  const saveTimerRef = useRef<number>()
  const savedIndicatorTimerRef = useRef<number>()

  function showSavedIndicator() {
    setShowSaved(true)
    if (savedIndicatorTimerRef.current) window.clearTimeout(savedIndicatorTimerRef.current)
    savedIndicatorTimerRef.current = window.setTimeout(() => setShowSaved(false), SAVED_INDICATOR_MS)
  }

  async function flushPendingSave() {
    if (saveTimerRef.current === undefined) return
    window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = undefined
    await journalRepo.upsertForDate(dateRef.current, { text: textRef.current })
    showSavedIndicator()
  }

  // Hydrate from the newly-selected date, and flush any pending debounced
  // save from the PREVIOUS date first (via this effect's cleanup, which
  // React runs before the next date's hydration) — this is what guarantees
  // switching days mid-typing never loses an edit.
  useEffect(() => {
    let cancelled = false
    void (async () => {
      const existing = await journalRepo.getForDate(date)
      if (cancelled) return
      setText(existing?.text ?? '')
      textRef.current = existing?.text ?? ''
      setMood(existing?.mood)
      setEnergy(existing?.energy)
    })()
    dateRef.current = date

    return () => {
      cancelled = true
      void flushPendingSave()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  function handleTextChange(value: string) {
    setText(value)
    textRef.current = value
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = undefined
      void journalRepo.upsertForDate(dateRef.current, { text: value }).then(showSavedIndicator)
    }, SAVE_DEBOUNCE_MS)
  }

  async function handleMood(value: Rating) {
    setMood(value)
    await journalRepo.upsertForDate(date, { mood: value })
  }

  async function handleEnergy(value: Rating) {
    setEnergy(value)
    await journalRepo.upsertForDate(date, { energy: value })
  }

  return (
    <div className="mt-4 max-w-content rounded-lg bg-surface px-4 py-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="font-mono text-caption-2 uppercase tracking-wide text-text-faint">
          {formatHeaderDate(date)}
        </p>
        <span
          className={`flex items-center gap-1 text-caption text-text-faint transition-opacity duration-300 ease-ios ${
            showSaved ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <IconCheck className="h-3 w-3" />
          Saved
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <RatingDots label="Mood" value={mood} onChange={handleMood} />
        <RatingDots label="Energy" value={energy} onChange={handleEnergy} />
      </div>

      <textarea
        value={text}
        onChange={(event) => handleTextChange(event.target.value)}
        placeholder="What happened today?"
        rows={10}
        className="mt-4 w-full resize-none rounded-md bg-bg px-4 py-3 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
      />
    </div>
  )
}
