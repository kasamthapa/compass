import { useEffect, useState, type ReactNode } from 'react'

const EXIT_DURATION_MS = 220

interface SheetProps {
  isOpen: boolean
  onClose: () => void
  ariaLabel: string
  children: ReactNode
}

/**
 * iOS-style presentation: slides up from the bottom with a grab handle on
 * mobile, fades/scales as a centered modal on desktop. Shared by every
 * dialog in the app so the mount/enter/exit timing stays consistent.
 */
export function Sheet({ isOpen, onClose, ariaLabel, children }: SheetProps) {
  const [mounted, setMounted] = useState(isOpen)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    if (isOpen) setMounted(true)
  }, [isOpen])

  useEffect(() => {
    if (!mounted) return

    if (isOpen) {
      const raf = requestAnimationFrame(() => setEntered(true))
      return () => cancelAnimationFrame(raf)
    }

    setEntered(false)
    const timeout = setTimeout(() => setMounted(false), EXIT_DURATION_MS)
    return () => clearTimeout(timeout)
  }, [isOpen, mounted])

  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!mounted) return null

  return (
    <div
      className={`fixed inset-0 z-40 flex items-end justify-center bg-overlay transition-opacity duration-200 ease-ios md:items-center ${
        entered ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        onClick={(event) => event.stopPropagation()}
        className={`ios-sheet w-full max-w-md rounded-t-xl bg-surface-elevated p-5 pb-[calc(1.5rem_+_env(safe-area-inset-bottom))] shadow-sheet transition-all duration-200 ease-ios md:rounded-xl md:pb-6 md:shadow-card ${
          entered
            ? 'translate-y-0 opacity-100 md:scale-100'
            : 'translate-y-full opacity-0 md:translate-y-0 md:scale-95'
        }`}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 shrink-0 rounded-full bg-border-hairline md:hidden" />
        {children}
      </div>
    </div>
  )
}
