import { useEffect, useRef, useState } from 'react'
import { useCaptureStore } from '../store/captureStore'

export function CaptureDialog() {
  const isOpen = useCaptureStore((state) => state.isOpen)
  const close = useCaptureStore((state) => state.close)
  const addItem = useCaptureStore((state) => state.addItem)
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setText('')
      const id = requestAnimationFrame(() => inputRef.current?.focus())
      return () => cancelAnimationFrame(id)
    }
  }, [isOpen])

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

  if (!isOpen) return null

  function handleSave() {
    const trimmed = text.trim()
    if (trimmed) {
      addItem(trimmed)
    }
    close()
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-start justify-center bg-bg/70 pt-24 md:pt-32"
      onClick={close}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Capture a thought"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-lg border border-border bg-surface p-4 shadow-xl"
      >
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="What's on your mind?"
          className="w-full rounded-md border border-border bg-bg px-3 py-2 font-body text-text placeholder:text-muted focus:border-accent focus:outline-none"
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="rounded-md px-3 py-1.5 font-body text-sm text-muted hover:text-text"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-accent px-3 py-1.5 font-body text-sm font-medium text-bg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
