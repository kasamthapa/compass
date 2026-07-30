import { useState } from 'react'
import { seedDatabase, wipeAllData } from '../db/seed'

export function DevPage() {
  const [status, setStatus] = useState<string | null>(null)

  function handleSeed() {
    seedDatabase()
      .then((result) => {
        setStatus(result.seeded ? 'Seeded demo data.' : 'Already has data — seed skipped.')
      })
      .catch((error: unknown) => {
        console.error('Failed to seed database', error)
        setStatus('Seed failed — see console.')
      })
  }

  function handleWipe() {
    if (!window.confirm('This will permanently delete all local data. Continue?')) return
    wipeAllData()
      .then(() => setStatus('Wiped all data.'))
      .catch((error: unknown) => {
        console.error('Failed to wipe database', error)
        setStatus('Wipe failed — see console.')
      })
  }

  return (
    <div className="mx-auto max-w-content px-5 py-8">
      <h1 className="font-display text-title text-text">Dev tools</h1>
      <p className="mt-1 text-subhead text-text-muted">Hidden route — not linked from navigation.</p>
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={handleSeed}
          className="ios-press min-h-11 rounded-md bg-accent px-4 py-2 text-subhead font-semibold text-accent-on"
        >
          Seed
        </button>
        <button
          type="button"
          onClick={handleWipe}
          className="ios-press min-h-11 rounded-md bg-surface px-4 py-2 text-subhead font-semibold text-text"
        >
          Wipe all data
        </button>
      </div>
      {status && <p className="mt-4 text-subhead text-text-muted">{status}</p>}
    </div>
  )
}
