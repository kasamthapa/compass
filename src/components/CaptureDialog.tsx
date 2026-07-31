import { useEffect, useRef, useState } from 'react'
import { useCaptureStore } from '../store/captureStore'
import { create as createCapture } from '../db/repo/captures'
import { Sheet } from './Sheet'

export function CaptureDialog() {
  const isOpen = useCaptureStore((state) => state.isOpen)
  const close = useCaptureStore((state) => state.close)
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setText('')
      const raf = requestAnimationFrame(() => inputRef.current?.focus())
      return () => cancelAnimationFrame(raf)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    function handleWindowKeyDown(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        event.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handleWindowKeyDown)
    return () => window.removeEventListener('keydown', handleWindowKeyDown)
  })

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
    <Sheet isOpen={isOpen} onClose={close} ariaLabel="Capture a thought">
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
    </Sheet>
  )
}
