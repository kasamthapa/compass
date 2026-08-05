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

/** "YYYY-MM" -> "AUG" — the mono month-group label used on the Goals page. */
export function formatMonthLabel(month: string): string {
  const [, monthStr] = month.split('-')
  return MONTHS_SHORT[Number(monthStr) - 1]
}

/**
 * A pragmatic "week N of the year" count — the number of Mondays from
 * Jan 1 of `weekOf`'s year up to and including `weekOf` itself. This is
 * NOT ISO-8601 week numbering (which has its own year-boundary rules) —
 * it's a simple, locally-consistent counter for the Week view's header,
 * not meant to match any external calendar system. See DECISIONS.md.
 */
export function weekNumber(weekOfDate: string): number {
  const monday = parseDateISO(weekOfDate)
  const jan1 = new Date(monday.getFullYear(), 0, 1)
  const diffDays = Math.round((monday.getTime() - jan1.getTime()) / 86_400_000)
  return Math.floor(diffDays / 7) + 1
}

/** e.g. "AUG 3–9" or "JUL 28–AUG 3" — the mono week-range header format. */
export function formatWeekRange(weekOfDate: string): string {
  const start = parseDateISO(weekOfDate)
  const end = parseDateISO(addDays(weekOfDate, 6))
  const startMonth = MONTHS_SHORT[start.getMonth()]
  const endMonth = MONTHS_SHORT[end.getMonth()]
  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}–${end.getDate()}`
  }
  return `${startMonth} ${start.getDate()}–${endMonth} ${end.getDate()}`
}

/** e.g. "MON 3" — a compact mono day header for the Week grid's columns. */
export function formatDayHeader(date: string): string {
  const d = parseDateISO(date)
  return `${WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()}`
}

/** "YYYY-MM" shifted by `delta` whole months (e.g. addMonths('2026-01', -1) -> '2025-12'). */
export function addMonths(month: string, delta: number): string {
  const [year, monthNum] = month.split('-').map(Number)
  const d = new Date(year, monthNum - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** e.g. "AUG 2026" — the mono month/year label for the Journal calendar header. */
export function formatMonthYear(month: string): string {
  const [year, monthNum] = month.split('-').map(Number)
  return `${MONTHS_SHORT[monthNum - 1]} ${year}`
}

/**
 * Every date in the Monday-first calendar grid that contains `month`
 * (YYYY-MM) — starting on the Monday on/before the 1st and ending on the
 * Sunday on/after the last day, so the grid is always a whole number of
 * complete weeks. Includes leading/trailing days from adjacent months,
 * same as any standard calendar grid.
 */
export function getMonthGridDays(month: string): string[] {
  const [year, monthNum] = month.split('-').map(Number)
  const firstOfMonth = `${month}-01`
  const lastDayNum = new Date(year, monthNum, 0).getDate()
  const lastOfMonth = `${month}-${String(lastDayNum).padStart(2, '0')}`

  const gridStart = weekOf(firstOfMonth)
  const gridEnd = addDays(weekOf(lastOfMonth), 6)

  const days: string[] = []
  let cursor = gridStart
  while (cursor <= gridEnd) {
    days.push(cursor)
    cursor = addDays(cursor, 1)
  }
  return days
}

/**
 * Whether the weekly review is "due" right now: Sunday from 4pm through
 * the end of Monday. A pure time check, deliberately not tied to which
 * week is being viewed — same shape as the daily review's `isEvening`
 * check on Today. See DECISIONS.md.
 */
export function isWeeklyReviewDue(now: Date = new Date()): boolean {
  const day = now.getDay() // 0 = Sunday .. 6 = Saturday
  if (day === 0) return now.getHours() >= 16
  if (day === 1) return true
  return false
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
