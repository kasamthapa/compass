import { useState, type FormEvent } from 'react'

export interface AddTaskInlineValue {
  title: string
  firstMove?: string
  estimateMin?: number
}

interface AddTaskInlineProps {
  placeholder: string
  onAdd: (value: AddTaskInlineValue) => void | Promise<void>
}

/**
 * Title input plus two optional, low-friction reveal-on-tap fields: a tiny
 * "first move" and a rough time estimate. Both are off by default — the
 * calm default is a single quiet input, per CLAUDE.md's no-clutter rule.
 */
export function AddTaskInline({ placeholder, onAdd }: AddTaskInlineProps) {
  const [title, setTitle] = useState('')
  const [showFirstMove, setShowFirstMove] = useState(false)
  const [firstMove, setFirstMove] = useState('')
  const [showEstimate, setShowEstimate] = useState(false)
  const [estimate, setEstimate] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    await onAdd({
      title: trimmedTitle,
      firstMove: firstMove.trim() || undefined,
      estimateMin: estimate ? Number(estimate) : undefined,
    })
    setTitle('')
    setFirstMove('')
    setEstimate('')
    setShowFirstMove(false)
    setShowEstimate(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full bg-transparent text-body text-text placeholder:text-text-faint focus:outline-none"
      />

      {showFirstMove && (
        <input
          type="text"
          value={firstMove}
          onChange={(event) => setFirstMove(event.target.value)}
          placeholder='e.g. "open the doc"'
          className="mt-1.5 min-h-9 w-full rounded-md bg-bg px-3 py-1.5 text-subhead text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
        />
      )}

      {showEstimate && (
        <div className="mt-1.5 flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={240}
            value={estimate}
            onChange={(event) => setEstimate(event.target.value)}
            placeholder="15"
            className="h-9 w-16 rounded-md bg-bg px-2 text-center font-mono text-subhead text-text focus:outline-none focus:ring-2 focus:ring-accent-ring"
          />
          <span className="text-caption text-text-faint">minutes, roughly</span>
        </div>
      )}

      <div className="mt-1.5 flex gap-4">
        {!showFirstMove && (
          <button
            type="button"
            onClick={() => setShowFirstMove(true)}
            className="text-caption font-medium text-text-faint"
          >
            + first move
          </button>
        )}
        {!showEstimate && (
          <button
            type="button"
            onClick={() => setShowEstimate(true)}
            className="text-caption font-medium text-text-faint"
          >
            + ~min
          </button>
        )}
      </div>
    </form>
  )
}
