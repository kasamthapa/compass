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

const WEEKDAYS_SHORT = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const MONTHS_SHORT = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
]

/** e.g. "THU · 31 JUL" — the mono header date format. */
export function formatHeaderDate(date: string): string {
  const d = parseDateISO(date)
  return `${WEEKDAYS_SHORT[d.getDay()]} · ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`
}

/** e.g. "2h ago" — a quiet relative timestamp for capture rows. */
export function formatRelativeTime(isoTimestamp: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(isoTimestamp).getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return `${diffDay}d ago`
  const diffWeek = Math.floor(diffDay / 7)
  return `${diffWeek}w ago`
}
