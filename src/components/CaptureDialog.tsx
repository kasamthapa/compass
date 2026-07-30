import { useEffect, useRef, useState } from 'react'
import { useCaptureStore } from '../store/captureStore'
import { create as createCapture } from '../db/repo/captures'

const EXIT_DURATION_MS = 220

export function CaptureDialog() {
  const isOpen = useCaptureStore((state) => state.isOpen)
  const close = useCaptureStore((state) => state.close)
  const [text, setText] = useState('')
  const [mounted, setMounted] = useState(isOpen)
  const [entered, setEntered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setText('')
      setMounted(true)
    }
  }, [isOpen])

  useEffect(() => {
    if (!mounted) return

    if (isOpen) {
      const raf = requestAnimationFrame(() => {
        setEntered(true)
        requestAnimationFrame(() => inputRef.current?.focus())
      })
      return () => cancelAnimationFrame(raf)
    }

    setEntered(false)
    const timeout = setTimeout(() => setMounted(false), EXIT_DURATION_MS)
    return () => clearTimeout(timeout)
  }, [isOpen, mounted])

  useEffect(() => {
    if (!isOpen) return
    function handleWindowKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      } else if (event.key === 'Enter') {
        event.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleWindowKeyDown)
    return () => window.removeEventListener('keydown', handleWindowKeyDown)
  })

  if (!mounted) return null

  function handleSave() {
    const trimmed = text.trim()
    if (trimmed) {
      createCapture(trimmed).catch((error: unknown) => {
        console.error('Failed to save capture', error)
      })
    }
    close()
  }

  return (
    <div
      className={`fixed inset-0 z-40 flex items-end justify-center bg-overlay transition-opacity duration-200 ease-ios md:items-center ${
        entered ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Capture a thought"
        onClick={(event) => event.stopPropagation()}
        className={`ios-sheet w-full max-w-md rounded-t-xl bg-surface-elevated p-5 pb-[calc(1.5rem_+_env(safe-area-inset-bottom))] shadow-sheet transition-all duration-200 ease-ios md:rounded-xl md:pb-6 md:shadow-card ${
          entered
            ? 'translate-y-0 opacity-100 md:scale-100'
            : 'translate-y-full opacity-0 md:translate-y-0 md:scale-95'
        }`}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 shrink-0 rounded-full bg-border-hairline md:hidden" />
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="What's on your mind?"
          className="w-full rounded-md bg-bg px-4 py-3 text-body text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-accent-ring"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="ios-press min-h-11 rounded-md px-4 py-2 text-subhead font-medium text-text-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="ios-press min-h-11 rounded-md bg-accent px-4 py-2 text-subhead font-semibold text-accent-on"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
