import { useEffect, useState } from 'react'

/** Live clock, re-rendering every `intervalMs` — used for midnight rollover and the 18:00 evening-review gate. */
export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])

  return now
}
