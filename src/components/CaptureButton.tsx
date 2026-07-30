import { useEffect } from 'react'
import { useCaptureStore } from '../store/captureStore'

export function CaptureButton() {
  const open = useCaptureStore((state) => state.open)
  const isOpen = useCaptureStore((state) => state.isOpen)

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (isOpen) return
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      if (isTyping) return
      if (event.key === 'c' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault()
        open()
      }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [isOpen, open])

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Capture a thought"
      className="fixed bottom-20 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-2xl font-display text-bg shadow-lg transition-transform hover:scale-105 active:scale-95 md:bottom-6 md:right-6"
    >
      +
    </button>
  )
}
