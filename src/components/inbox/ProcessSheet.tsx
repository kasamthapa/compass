import { useEffect, useState, type ComponentType, type FormEvent } from 'react'
import * as capturesRepo from '../../db/repo/captures'
import { convertCaptureToNote, convertCaptureToSomeday, deleteCapture } from '../../lib/inboxActions'
import type { CaptureItem } from '../../types/models'
import { Sheet } from '../Sheet'
import { IconCheck, IconChecklist, IconRepeat, IconJournal, IconBookmark, IconEdit, IconTrash } from '../icons'
import { TaskConvertForm } from './TaskConvertForm'
import { HabitConvertForm } from './HabitConvertForm'

export type ProcessMode = 'choose' | 'task' | 'habit' | 'edit'

interface ProcessSheetProps {
  capture: CaptureItem | null
  initialMode: ProcessMode
  onClose: () => void
}

const COMPLETION_DISPLAY_MS = 700

function ActionTile({
  icon: Icon,
  label,
  onClick,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ios-press flex min-h-11 flex-col items-center justify-center gap-2 rounded-lg bg-bg px-4 py-5 text-subhead font-semibold text-text"
    >
      <Icon className="h-6 w-6 text-accent" />
      {label}
    </button>
  )
}

function EditCaptureForm({
  capture,
  onDone,
  onCancel,
}: {
  capture: CaptureItem
  onDone: () => void
  onCancel: () => void
}) {
  const [text, setText] = useState(capture.text)

  async function handleSave(event: FormEvent) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    await capturesRepo.update(capture.id, { text: trimmed })
    onDone()
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-5">
      <p className="text-headline text-text">Edit</p>
      <input
        type="text"
        value={text}
        onChange={(event) => setText(event.target.value)}
        autoFocus
        className="min-h-11 w-full rounded-lg bg-bg px-4 py-3 text-body text-text focus:outline-none focus:ring-2 focus:ring-accent-ring"
      />
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onCancel}
          className="ios-press min-h-11 rounded-md px-4 text-subhead font-medium text-text-muted"
        >
          Back
        </button>
        <button
          type="submit"
          className="ios-press min-h-11 rounded-full bg-accent px-6 text-subhead font-semibold text-accent-on shadow-fab"
        >
          Save
        </button>
      </div>
    </form>
  )
}

export function ProcessSheet({ capture, initialMode, onClose }: ProcessSheetProps) {
  const [mode, setMode] = useState<ProcessMode>(initialMode)
  const [justDone, setJustDone] = useState<string | null>(null)

  useEffect(() => {
    if (capture) setMode(initialMode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capture?.id, initialMode])

  function flashAndClose(message: string) {
    setJustDone(message)
    setTimeout(() => {
      setJustDone(null)
      onClose()
    }, COMPLETION_DISPLAY_MS)
  }

  async function handleNote() {
    if (!capture) return
    await convertCaptureToNote(capture)
    flashAndClose("Added to today's journal.")
  }

  async function handleSomeday() {
    if (!capture) return
    await convertCaptureToSomeday(capture)
    flashAndClose('Saved for someday.')
  }

  async function handleDelete() {
    if (!capture) return
    await deleteCapture(capture)
    onClose()
  }

  return (
    <Sheet isOpen={capture !== null} onClose={onClose} ariaLabel="Process this thought">
      {!capture ? null : justDone ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-on">
            <IconCheck className="h-7 w-7" />
          </div>
          <p className="text-headline text-text">{justDone}</p>
        </div>
      ) : mode === 'edit' ? (
        <EditCaptureForm capture={capture} onDone={() => setMode('choose')} onCancel={() => setMode('choose')} />
      ) : mode === 'task' ? (
        <TaskConvertForm
          capture={capture}
          onDone={() => flashAndClose("Added to today's focus.")}
          onCancel={() => setMode('choose')}
        />
      ) : mode === 'habit' ? (
        <HabitConvertForm
          capture={capture}
          onDone={() => flashAndClose('Added to your habits.')}
          onCancel={() => setMode('choose')}
        />
      ) : (
        <div className="flex flex-col gap-5">
          <p className="text-body text-text">{capture.text}</p>
          <div className="grid grid-cols-2 gap-3">
            <ActionTile icon={IconChecklist} label="Task" onClick={() => setMode('task')} />
            <ActionTile icon={IconRepeat} label="Habit" onClick={() => setMode('habit')} />
            <ActionTile icon={IconJournal} label="Note" onClick={() => void handleNote()} />
            <ActionTile icon={IconBookmark} label="Someday" onClick={() => void handleSomeday()} />
          </div>
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => setMode('edit')}
              className="ios-press flex min-h-11 items-center gap-1.5 px-3 text-subhead text-text-muted"
            >
              <IconEdit className="h-4 w-4" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="ios-press flex min-h-11 items-center gap-1.5 px-3 text-subhead text-text-muted"
            >
              <IconTrash className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
