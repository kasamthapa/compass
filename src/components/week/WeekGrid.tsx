import { useMemo, useState, type DragEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import * as tasksRepo from '../../db/repo/tasks'
import { addDays, formatDayHeader } from '../../lib/dates'
import { IconGoals } from '../icons'
import type { Task } from '../../types/models'

function WeekTaskRow({ task, onOpen }: { task: Task; onOpen: () => void }) {
  const done = task.status === 'done'

  return (
    <button
      type="button"
      draggable
      onDragStart={(event: DragEvent<HTMLButtonElement>) => {
        event.dataTransfer.setData('text/plain', task.id)
        event.dataTransfer.effectAllowed = 'move'
      }}
      onClick={onOpen}
      className="ios-press flex min-h-11 w-full items-center gap-2 py-2 text-left md:items-start md:py-2.5"
    >
      {task.isMIT && (
        <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent md:mt-1.5" />
      )}
      <p
        className={`min-w-0 flex-1 truncate text-subhead md:line-clamp-2 md:whitespace-normal ${done ? 'text-text-faint line-through' : 'text-text'}`}
      >
        {task.title}
      </p>
      {(task.goalId || task.weeklyPriorityId) && (
        <IconGoals className="h-3.5 w-3.5 shrink-0 text-text-faint md:mt-1" />
      )}
    </button>
  )
}

interface WeekGridProps {
  weekOf: string
  onEditTask: (task: Task) => void
}

export function WeekGrid({ weekOf, onEditTask }: WeekGridProps) {
  const tasks = useLiveQuery(() => tasksRepo.getForWeek(weekOf), [weekOf]) ?? []
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekOf, i)), [weekOf])
  const [dragOverDate, setDragOverDate] = useState<string | null>(null)

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const day of days) map.set(day, [])
    for (const task of tasks) {
      if (task.date && map.has(task.date)) map.get(task.date)!.push(task)
    }
    return map
  }, [tasks, days])

  async function handleDrop(event: DragEvent<HTMLDivElement>, date: string) {
    event.preventDefault()
    setDragOverDate(null)
    const taskId = event.dataTransfer.getData('text/plain')
    if (!taskId) return
    await tasksRepo.update(taskId, { date })
  }

  return (
    <section className="mt-6">
      <h2 className="font-display text-title text-text">This week's tasks</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-7 md:gap-3">
        {days.map((day) => (
          <div
            key={day}
            onDragOver={(event) => {
              event.preventDefault()
              setDragOverDate(day)
            }}
            onDragLeave={() => setDragOverDate((current) => (current === day ? null : current))}
            onDrop={(event) => void handleDrop(event, day)}
            className={`rounded-lg bg-surface px-3 py-3 shadow-card transition-colors duration-150 ease-ios md:px-4 md:py-4 ${
              dragOverDate === day ? 'ring-2 ring-accent-ring' : ''
            }`}
          >
            <p className="font-mono text-caption-2 uppercase tracking-wide text-text-faint">
              {formatDayHeader(day)}
            </p>
            <div className="mt-1 divide-y divide-border-hairline md:mt-3">
              {(tasksByDate.get(day) ?? []).map((task) => (
                <WeekTaskRow key={task.id} task={task} onOpen={() => onEditTask(task)} />
              ))}
            </div>
            {(tasksByDate.get(day) ?? []).length === 0 && (
              <p className="py-3 text-caption text-text-faint">Nothing here.</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
