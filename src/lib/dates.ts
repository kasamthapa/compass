// Local-date helpers. All "date" strings in this app are YYYY-MM-DD in the
// user's local timezone — never parsed via `new Date(isoString)` (which
// treats bare date strings as UTC midnight and can shift a day in negative
// UTC offsets). Weeks start on Monday — see DECISIONS.md.

export function nowISO(): string {
  return new Date().toISOString()
}

export function todayISO(): string {
  return toDateISO(new Date())
}

export function toDateISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function parseDateISO(date: string): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDays(date: string, days: number): string {
  const d = parseDateISO(date)
  d.setDate(d.getDate() + days)
  return toDateISO(d)
}

/** Monday of the week containing `date` (see DECISIONS.md: Monday is the week start). */
export function weekOf(date: string): string {
  const d = parseDateISO(date)
  const day = d.getDay() // 0 = Sunday .. 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day
  return addDays(date, diffToMonday)
}

export function monthKey(date: string): string {
  return date.slice(0, 7) // YYYY-MM
}

export function formatDay(date: string): string {
  return parseDateISO(date).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
