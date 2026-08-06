import { useEffect } from 'react'
import { useCaptureStore } from '../store/captureStore'
import { IconPlus } from './icons'

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
      className="ios-press fixed bottom-[calc(var(--nav-height)_+_env(safe-area-inset-bottom)_+_1rem)] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-on shadow-fab outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-accent-ring focus-visible:ring-offset-2 focus-visible:ring-offset-bg md:bottom-8 md:right-8"
    >
      <IconPlus className="h-6 w-6" />
    </button>
  )
}
