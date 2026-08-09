import { useRegisterSW } from 'virtual:pwa-register/react'
import { IconCheck, IconClose } from './icons'

/**
 * A calm, non-blocking notice that a new version of the app has finished
 * downloading and is waiting to take over. Never reloads automatically —
 * `registerType: 'prompt'` (see vite.config.ts) means the new service
 * worker sits idle until this toast's "Refresh" is tapped, so an in-progress
 * action (e.g. mid-typing in the Journal composer before the debounced save
 * fires) is never interrupted out from under the user. Dismissing just
 * hides it for this pending update — it won't nag again until a genuinely
 * newer version shows up, which is what re-flips `needRefresh` to true.
 * See DECISIONS.md.
 */
export function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('Service worker registration failed', error)
    },
  })

  if (!needRefresh) return null

  return (
    <div
      role="status"
      className="fixed inset-x-5 bottom-[calc(var(--nav-height)_+_env(safe-area-inset-bottom)_+_1rem)] z-40 mx-auto max-w-xs rounded-lg bg-surface-elevated p-4 shadow-elevated md:inset-x-auto md:bottom-8 md:left-[calc(var(--rail-width)_+_2rem)]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-wash text-accent">
          <IconCheck className="h-4 w-4" />
        </div>
        <p className="min-w-0 flex-1 pt-1 text-subhead text-text">A newer version is ready.</p>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          aria-label="Dismiss"
          className="ios-press -mr-1.5 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-faint"
        >
          <IconClose className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => void updateServiceWorker(true)}
        className="ios-press mt-3 flex min-h-9 w-full items-center justify-center rounded-full bg-accent px-4 text-caption font-semibold text-accent-on"
      >
        Refresh
      </button>
    </div>
  )
}
