import { useEffect, useState, type ReactNode } from 'react'

const EXIT_DURATION_MS = 200

interface FullScreenOverlayProps {
  isOpen: boolean
  onClose: () => void
  ariaLabel: string
  children: ReactNode
}

/**
 * A calm full-bleed takeover (fade only, no slide) — distinct from `Sheet`,
 * which stays a bounded dialog. Used by Focus Mode, where the whole point is
 * to blot out everything else on the page, not float above it.
 */
export function FullScreenOverlay({ isOpen, onClose, ariaLabel, children }: FullScreenOverlayProps) {
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
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      className={`fixed inset-0 z-50 flex flex-col bg-bg transition-opacity duration-200 ease-ios ${
        entered ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  )
}
