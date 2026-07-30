// Dev-only demo data. Not imported by any production code path — only the
// hidden /dev route (src/pages/DevPage.tsx) calls this.
import { db } from './db'
import * as habits from './repo/habits'
import * as goals from './repo/goals'
import * as milestones from './repo/milestones'
import * as tasks from './repo/tasks'
import * as journal from './repo/journal'
import { todayISO, addDays, weekOf, monthKey } from '../lib/dates'

/** Idempotent: skips seeding if any habit already exists. */
export async function seedDatabase(): Promise<{ seeded: boolean }> {
  const existingHabits = await db.habits.count()
  if (existingHabits > 0) {
    return { seeded: false }
  }

  const today = todayISO()
  const thisWeekStart = weekOf(today)

  const seededHabits = await Promise.all([
    habits.create({ name: 'Morning walk', cue: 'After waking up', targetPerWeek: 5 }),
    habits.create({ name: 'Read 20 minutes', cue: 'Before bed', targetPerWeek: 4 }),
    habits.create({ name: 'Drink water', cue: 'With every meal', targetPerWeek: 7 }),
  ])

  // 3 weeks of logs, mixing done/skipped/empty so hit-rates vary per habit.
  const statusFor = (habitIndex: number, dayIndex: number): 'done' | 'skipped' | null => {
    const pattern = (habitIndex + dayIndex) % 4
    if (pattern === 3) return null
    return pattern === 2 ? 'skipped' : 'done'
  }

  for (let week = 0; week < 3; week++) {
    const weekStart = addDays(thisWeekStart, -7 * week)
    for (let day = 0; day < 7; day++) {
      const date = addDays(weekStart, day)
      if (date > today) continue
      for (let h = 0; h < seededHabits.length; h++) {
        const status = statusFor(h, day + week)
        if (status) {
          await habits.logHabit(seededHabits[h].id, date, status)
        }
      }
    }
  }

  const year = new Date().getFullYear()
  const goal1 = await goals.create({
    title: 'Run a half marathon',
    why: 'Build lasting endurance and discipline',
    year,
    order: 0,
  })
  const goal2 = await goals.create({
    title: 'Ship a side project',
    why: 'Learn by shipping something real',
    year,
    order: 1,
  })

  await milestones.create({
    goalId: goal1.id,
    title: 'Run 10k without stopping',
    month: monthKey(today),
  })
  await milestones.create({
    goalId: goal1.id,
    title: 'Complete a half-marathon training plan',
    month: monthKey(addDays(today, 60)),
  })
  await milestones.create({
    goalId: goal2.id,
    title: 'Ship an MVP',
    month: monthKey(today),
  })
  await milestones.create({
    goalId: goal2.id,
    title: 'Get 10 real users',
    month: monthKey(addDays(today, 30)),
  })

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(thisWeekStart, i))
  const taskPlan: { title: string; date: string; isMIT: boolean }[] = [
    { title: 'Draft the goal review', date: today, isMIT: true },
    { title: 'Reply to important emails', date: today, isMIT: true },
    { title: 'Plan the week', date: weekDates[0], isMIT: false },
    { title: 'Tidy the workspace', date: weekDates[2], isMIT: false },
    { title: 'Book the dentist', date: weekDates[4], isMIT: false },
  ]
  for (const plan of taskPlan) {
    await tasks.create(plan)
  }

  await journal.upsertForDate(today, {
    text: 'Felt focused today, good momentum.',
    mood: 4,
    energy: 4,
  })
  await journal.upsertForDate(addDays(today, -1), {
    text: 'A slower day, but still showed up.',
    mood: 3,
    energy: 2,
  })
  await journal.upsertForDate(addDays(today, -2), {
    text: 'Great energy after the morning walk.',
    mood: 5,
    energy: 5,
  })
  await journal.upsertForDate(addDays(today, -3), {
    text: 'Bit tired, kept it simple.',
    mood: 3,
    energy: 3,
  })

  return { seeded: true }
}

export async function wipeAllData(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    await Promise.all(db.tables.map((table) => table.clear()))
  })
}
