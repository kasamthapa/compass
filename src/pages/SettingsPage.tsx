import { useRef, useState } from 'react'
import { PageHeader } from '../components/PageHeader'
import { ThemeToggle } from '../components/ThemeToggle'
import { IconShare, IconImport, IconTrash } from '../components/icons'
import * as dataRepo from '../db/repo/data'
import { useReminderStore } from '../store/reminderStore'
import { todayISO } from '../lib/dates'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-title text-text">{title}</h2>
      <div className="mt-4 rounded-lg bg-surface px-4 py-4 shadow-card">{children}</div>
    </section>
  )
}

function DataSection() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingImport, setPendingImport] = useState<dataRepo.ExportedData | null>(null)
  const [wipeConfirming, setWipeConfirming] = useState(false)

  async function handleExport() {
    const data = await dataRepo.exportAllData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `compass-export-${todayISO()}.json`
    link.click()
    URL.revokeObjectURL(url)
    setStatus('Exported.')
    setError(null)
  }

  function handleFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setStatus(null)
    setError(null)
    file
      .text()
      .then((text) => {
        let parsed: unknown
        try {
          parsed = JSON.parse(text)
        } catch {
          setError("That file isn't valid JSON — nothing was changed.")
          return
        }
        if (!dataRepo.isValidExport(parsed)) {
          setError("That doesn't look like a Compass export — nothing was changed.")
          return
        }
        setPendingImport(parsed)
      })
      .catch(() => setError('Could not read that file — nothing was changed.'))
  }

  async function confirmImport() {
    if (!pendingImport) return
    if (!window.confirm('Last check: this replaces everything currently in Compass. Continue?')) return
    await dataRepo.importAllData(pendingImport)
    setPendingImport(null)
    setStatus('Imported. Your data has been replaced.')
  }

  async function confirmWipe() {
    if (!window.confirm('This permanently deletes everything. There is no undo. Continue?')) return
    await dataRepo.wipeAllData()
    setWipeConfirming(false)
    setStatus('Erased. Compass is now empty.')
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-subhead font-medium text-text">Export</p>
        <p className="mt-0.5 text-caption text-text-muted">
          Download everything — habits, tasks, goals, journal entries, reviews — as one JSON file.
        </p>
        <button
          type="button"
          onClick={() => void handleExport()}
          className="ios-press mt-2 flex min-h-11 items-center gap-1.5 rounded-full bg-bg px-4 text-subhead font-medium text-text"
        >
          <IconShare className="h-4 w-4" />
          Export data
        </button>
      </div>

      <div className="border-t border-border-hairline pt-5">
        <p className="text-subhead font-medium text-text">Import</p>
        <p className="mt-0.5 text-caption text-text-muted">
          Restore from a Compass export. This replaces everything currently here — exporting first
          is a good safety net.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          onChange={handleFileChosen}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="ios-press mt-2 flex min-h-11 items-center gap-1.5 rounded-full bg-bg px-4 text-subhead font-medium text-text"
        >
          <IconImport className="h-4 w-4" />
          Choose file to import
        </button>

        {pendingImport && (
          <div className="mt-3 rounded-md bg-accent-wash px-4 py-3">
            <p className="text-subhead text-text">
              This file has {Object.values(pendingImport.tables).reduce((n, rows) => n + rows.length, 0)}{' '}
              records, exported {pendingImport.exportedAt.slice(0, 10)}. Importing it{' '}
              <strong>replaces everything</strong> currently in Compass — there's no undo once you
              confirm.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPendingImport(null)}
                className="ios-press min-h-9 rounded-full px-3 text-caption font-medium text-text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmImport()}
                className="ios-press min-h-9 rounded-full bg-seal px-4 text-caption font-semibold text-seal-on"
              >
                Replace my data
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border-hairline pt-5">
        <p className="text-subhead font-medium text-text">Erase everything</p>
        <p className="mt-0.5 text-caption text-text-muted">
          Permanently deletes all local data. There's no undo — export first if you want a copy.
        </p>
        {wipeConfirming ? (
          <div className="mt-3 rounded-md bg-accent-wash px-4 py-3">
            <p className="text-subhead text-text">
              Everything — every habit, task, goal, journal entry, and review — will be gone for good.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setWipeConfirming(false)}
                className="ios-press min-h-9 rounded-full px-3 text-caption font-medium text-text-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmWipe()}
                className="ios-press min-h-9 rounded-full bg-seal px-4 text-caption font-semibold text-seal-on"
              >
                Yes, erase everything
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setWipeConfirming(true)}
            className="ios-press mt-2 flex min-h-11 items-center gap-1.5 rounded-full bg-bg px-4 text-subhead font-medium text-text-muted"
          >
            <IconTrash className="h-4 w-4" />
            Erase all data
          </button>
        )}
      </div>

      {status && <p className="text-caption text-text-muted">{status}</p>}
      {error && <p className="text-caption text-text-muted">{error}</p>}
    </div>
  )
}

function RemindersSection() {
  const enabled = useReminderStore((state) => state.enabled)
  const time = useReminderStore((state) => state.time)
  const setEnabled = useReminderStore((state) => state.setEnabled)
  const setTime = useReminderStore((state) => state.setTime)

  const supported = typeof Notification !== 'undefined'
  const [permission, setPermission] = useState<NotificationPermission | null>(
    supported ? Notification.permission : null,
  )

  async function handleEnableNotifications() {
    const result = await Notification.requestPermission()
    setPermission(result)
    if (result === 'granted') setEnabled(true)
  }

  if (!supported) {
    return <p className="text-subhead text-text-muted">Notifications aren't available in this browser.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-caption text-text-muted">
        A quiet nudge toward the evening review — nothing more. This works best while Compass is
        open or was recently active; it can't reliably reach you in the background, since Compass
        intentionally has no server to deliver a true push notification. Fully closing the app or
        browser means it may not fire.
      </p>

      {permission === 'denied' ? (
        <p className="text-subhead text-text-muted">
          Notifications are turned off for Compass in your browser. You can turn them back on from
          your browser or device's site settings.
        </p>
      ) : permission !== 'granted' ? (
        <button
          type="button"
          onClick={() => void handleEnableNotifications()}
          className="ios-press flex min-h-11 items-center rounded-full bg-accent px-4 text-subhead font-semibold text-accent-on self-start"
        >
          Enable notifications
        </button>
      ) : (
        <>
          <label className="flex items-center justify-between gap-3">
            <span>
              <span className="block text-subhead font-medium text-text">Evening review reminder</span>
              <span className="block text-caption text-text-muted">
                Best-effort — fires while the app is open or recently active.
              </span>
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled(!enabled)}
              className={`ios-press relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                enabled ? 'bg-accent' : 'bg-bg'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-surface-elevated shadow-card transition-transform ${
                  enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </label>

          {enabled && (
            <label className="flex items-center gap-3 text-subhead text-text-muted">
              Remind me at
              <input
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="h-9 rounded-md bg-bg px-2 font-mono text-body text-text focus:outline-none focus:ring-2 focus:ring-accent-ring"
              />
            </label>
          )}
        </>
      )}

      <p className="text-caption text-text-faint">
        Want a nudge for a specific habit instead? Each habit's cue (set when you create it) is the
        honest way to remember it — Compass doesn't schedule per-habit notifications, for the same
        background-delivery reason as above.
      </p>
    </div>
  )
}

export function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" />

      <Section title="Appearance">
        <ThemeToggle />
      </Section>

      <Section title="Data">
        <DataSection />
      </Section>

      <Section title="Reminders">
        <RemindersSection />
      </Section>

      <section className="mt-8">
        <p className="text-caption text-text-faint">Compass · Built {__BUILD_DATE__}</p>
      </section>
    </div>
  )
}
