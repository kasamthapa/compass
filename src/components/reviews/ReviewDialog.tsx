import { useEffect, useState, type ReactNode } from 'react'
import { Sheet } from '../Sheet'
import { IconCheck } from '../icons'

const COMPLETION_DISPLAY_MS = 700

export interface ReviewStep {
  render: () => ReactNode
  /** Whether Next/Finish is enabled for this step. Defaults to true (never blocked) when omitted. */
  canAdvance?: boolean
}

interface ReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  ariaLabel: string
  title: string
  steps: ReviewStep[]
  /** 1-indexed step to resume at — read once, the moment the dialog transitions open. */
  resumeStep: number
  completionMessage: string
  onFinish: () => Promise<void>
}

/**
 * The shared chrome for every step-based review (Sheet, "Step N of M" +
 * title, Back/Next/Finish, the calm amber completion moment). Callers own
 * their own step content, autosave, and resume logic — this component only
 * owns navigation and the finish choreography. Extracted from the Phase 2A
 * daily review so daily and weekly reviews share one implementation instead
 * of two copies of the same dialog shell. See DECISIONS.md.
 */
export function ReviewDialog({
  isOpen,
  onClose,
  ariaLabel,
  title,
  steps,
  resumeStep,
  completionMessage,
  onFinish,
}: ReviewDialogProps) {
  const [step, setStep] = useState(1)
  const [justCompleted, setJustCompleted] = useState(false)

  // Resume at the right step whenever the dialog transitions open — not on
  // every re-render while it's open, or in-progress navigation would get
  // reset by a stale resumeStep value (the same guarantee the daily review
  // already had, generalized here for any caller).
  useEffect(() => {
    if (!isOpen) return
    setStep(resumeStep)
    setJustCompleted(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  async function handleFinish() {
    await onFinish()
    setJustCompleted(true)
    setTimeout(() => {
      onClose()
    }, COMPLETION_DISPLAY_MS)
  }

  const current = steps[step - 1]
  const canAdvance = current?.canAdvance ?? true

  return (
    <Sheet isOpen={isOpen} onClose={onClose} ariaLabel={ariaLabel}>
      {justCompleted ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-on">
            <IconCheck className="h-7 w-7" />
          </div>
          <p className="text-headline text-text">{completionMessage}</p>
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between">
            <p className="font-mono text-caption-2 uppercase tracking-wide text-text-faint">
              Step {step} of {steps.length}
            </p>
            <p className="text-headline text-text">{title}</p>
          </div>

          {current?.render()}

          <div className="mt-6 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="ios-press min-h-11 rounded-md px-4 text-subhead font-medium text-text-muted"
              >
                Back
              </button>
            ) : (
              <span />
            )}
            {step < steps.length ? (
              <button
                type="button"
                disabled={!canAdvance}
                onClick={() => setStep(step + 1)}
                className="ios-press min-h-11 rounded-md bg-accent px-4 text-subhead font-semibold text-accent-on disabled:opacity-40"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleFinish()}
                className="ios-press min-h-11 rounded-md bg-accent px-4 text-subhead font-semibold text-accent-on"
              >
                Finish
              </button>
            )}
          </div>
        </>
      )}
    </Sheet>
  )
}
