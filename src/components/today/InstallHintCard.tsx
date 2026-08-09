import { useEffect, useState } from 'react'
import { IconClose, IconShare } from '../icons'

const DISMISS_KEY = 'compass-install-hint-dismissed'

/** The subset of the (non-standard, Chromium-only) BeforeInstallPromptEvent this component needs. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
}

function isStandalone(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  // iOS Safari's legacy, non-standard flag — still the only signal it exposes.
  return Boolean((window.navigator as { standalone?: boolean }).standalone)
}

function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !('MSStream' in window)
}

/**
 * A calm, dismissible-forever nudge toward installing the app — never a
 * generic "Install our app!" banner. Two platform paths: Android/desktop
 * Chromium can install directly via the native `beforeinstallprompt` flow;
 * iOS Safari has no such API, so it gets a one-line pointer to the real
 * Share icon. Shown nowhere once already installed, or once dismissed —
 * dismissal is UI state (not user data), so it lives in localStorage, not
 * Dexie. See DECISIONS.md.
 *
 * Sizing note: this component deliberately avoids Tailwind's `h-8`/`h-9`/
 * `w-8`/`w-9`/`min-h-8`/`min-h-9` utilities. tailwind.config.js overrides
 * spacing keys 1-9 to the app's 8pt rhythm tokens (`--space-8` = 4rem/64px,
 * `--space-9` = 5rem/80px) for margin/gap/padding use — but Tailwind derives
 * its default `height`/`minHeight` scales from the same `spacing` scale, so
 * those same keys silently produce 64-80px boxes instead of the ~32-36px a
 * reader would expect. Confirmed via computed-style in-browser while
 * building this component (see DECISIONS.md) — the identical `min-h-9` chip
 * pattern already exists elsewhere in the app (goal/priority chips), so this
 * is pre-existing, wider debt, not something introduced here.
 */
export function InstallHintCard() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === 'true')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone)
  const ios = isIOS()

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }
    function handleAppInstalled() {
      setInstalled(true)
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, 'true')
    setDismissed(true)
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    setDeferredPrompt(null)
  }

  if (dismissed || installed) return null
  // Nothing actionable to offer yet: not iOS (which always has the Share
  // sheet available) and the browser hasn't fired an install prompt (either
  // it never will — desktop Safari, Firefox — or it just hasn't yet).
  if (!ios && !deferredPrompt) return null

  return (
    <div className="mt-4 flex items-start gap-3 rounded-lg bg-surface px-5 py-4 shadow-card">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-wash text-accent">
        <IconShare className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-subhead font-medium text-text">Keep Compass a tap away</p>
        {ios ? (
          <p className="mt-0.5 text-caption text-text-muted">
            Tap the Share icon in Safari's toolbar, then "Add to Home Screen."
          </p>
        ) : (
          <>
            <p className="mt-0.5 text-caption text-text-muted">
              Add it to your home screen or dock for quick, full-screen access.
            </p>
            <button
              type="button"
              onClick={() => void handleInstall()}
              className="ios-press mt-2 flex min-h-10 items-center rounded-full bg-accent px-4 text-caption font-semibold text-accent-on"
            >
              Install
            </button>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="ios-press flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-faint"
      >
        <IconClose className="h-4 w-4" />
      </button>
    </div>
  )
}
