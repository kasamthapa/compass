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
 *
 * Sizing note: uses `h-11`/`h-10`/`min-h-10`, not `h-8`/`h-9`/`min-h-9` —
 * tailwind.config.js remaps spacing keys 1-9 for the app's 8pt rhythm,
 * which also silently reshapes those height utilities (h-9 renders at
 * 80px, not ~36px). The dismiss button in particular had no background
 * fill, so its real 80x80px tap zone was invisible and could overlap the
 * icon badge beside it. Same fix already applied in InstallHintCard.tsx —
 * see DECISIONS.md.
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
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-wash text-accent">
          <IconCheck className="h-4 w-4" />
        </div>
        <p className="min-w-0 flex-1 pt-1 text-subhead text-text">A newer version is ready.</p>
        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          aria-label="Dismiss"
          className="ios-press -mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-faint"
        >
          <IconClose className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => void updateServiceWorker(true)}
        className="ios-press mt-3 flex min-h-10 w-full items-center justify-center rounded-full bg-accent px-4 text-caption font-semibold text-accent-on"
      >
        Refresh
      </button>
    </div>
  )
}
