import { useEffect, useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { InboxRow } from '../components/inbox/InboxRow'
import { ProcessSheet, type ProcessMode } from '../components/inbox/ProcessSheet'
import * as capturesRepo from '../db/repo/captures'
import { convertCaptureToNote, convertCaptureToSomeday, deleteCapture } from '../lib/inboxActions'
import { useNow } from '../lib/useNow'
import { IconInbox, IconChevronDown } from '../components/icons'
import type { CaptureItem } from '../types/models'

export function InboxPage() {
  const now = useNow()
  const rawItems = useLiveQuery(() => capturesRepo.getUnprocessed(), []) ?? []
  const somedayItems = useLiveQuery(() => capturesRepo.getSomeday(), []) ?? []
  const items = useMemo(
    () => [...rawItems].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [rawItems],
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [openCaptureId, setOpenCaptureId] = useState<string | null>(null)
  const [sheetMode, setSheetMode] = useState<ProcessMode>('choose')
  const [somedayExpanded, setSomedayExpanded] = useState(false)

  useEffect(() => {
    setSelectedIndex((index) => Math.min(index, Math.max(items.length - 1, 0)))
  }, [items.length])

  const selectedItem = items[selectedIndex] ?? null
  const openCapture = items.find((item) => item.id === openCaptureId) ?? null
  const sheetOpen = openCaptureId !== null

  function openSheetWith(item: CaptureItem, mode: ProcessMode) {
    setOpenCaptureId(item.id)
    setSheetMode(mode)
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (sheetOpen) return
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if (isTyping) return

      if (event.key === 'j') {
        event.preventDefault()
        setSelectedIndex((index) => Math.min(index + 1, items.length - 1))
        return
      }
      if (event.key === 'k') {
        event.preventDefault()
        setSelectedIndex((index) => Math.max(index - 1, 0))
        return
      }
      if (!selectedItem) return

      if (event.key === 't') {
        event.preventDefault()
        openSheetWith(selectedItem, 'task')
      } else if (event.key === 'h') {
        event.preventDefault()
        openSheetWith(selectedItem, 'habit')
      } else if (event.key === 'e') {
        event.preventDefault()
        openSheetWith(selectedItem, 'edit')
      } else if (event.key === 'n') {
        event.preventDefault()
        void convertCaptureToNote(selectedItem)
      } else if (event.key === 's') {
        event.preventDefault()
        void convertCaptureToSomeday(selectedItem)
      } else if (event.key === 'Backspace') {
        event.preventDefault()
        void deleteCapture(selectedItem)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [items, selectedItem, sheetOpen])

  const isEmpty = items.length === 0 && somedayItems.length === 0

  return (
    <div>
      <PageHeader title="Inbox" />

      {isEmpty ? (
        <EmptyState icon={IconInbox} title="Inbox zero." message="Nothing to sort." />
      ) : (
        <>
          {items.length === 0 ? (
            <EmptyState icon={IconInbox} title="Inbox zero." message="Nothing to sort." />
          ) : (
            <div className="mt-3 divide-y divide-border-hairline rounded-lg bg-surface px-4 shadow-card">
              {items.map((item, index) => (
                <InboxRow
                  key={item.id}
                  item={item}
                  now={now}
                  isSelected={index === selectedIndex}
                  onSelect={() => setSelectedIndex(index)}
                  onOpen={() => openSheetWith(item, 'choose')}
                />
              ))}
            </div>
          )}

          {somedayItems.length > 0 && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setSomedayExpanded((value) => !value)}
                className="ios-press flex min-h-11 items-center gap-1.5 text-subhead text-text-muted"
              >
                <IconChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ease-ios ${
                    somedayExpanded ? 'rotate-0' : '-rotate-90'
                  }`}
                />
                Someday / maybe ({somedayItems.length})
              </button>
              {somedayExpanded && (
                <div className="mt-1 divide-y divide-border-hairline rounded-lg bg-surface px-4 shadow-card">
                  {somedayItems.map((item) => (
                    <InboxRow
                      key={item.id}
                      item={item}
                      now={now}
                      isSelected={false}
                      onSelect={() => {}}
                      onOpen={() => openSheetWith(item, 'choose')}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="mt-6 hidden flex-wrap items-center justify-center gap-x-4 gap-y-1 text-caption text-text-faint md:flex">
        <span>
          <span className="font-mono">j</span>/<span className="font-mono">k</span> navigate
        </span>
        <span>
          <span className="font-mono">t</span> task
        </span>
        <span>
          <span className="font-mono">h</span> habit
        </span>
        <span>
          <span className="font-mono">n</span> note
        </span>
        <span>
          <span className="font-mono">s</span> someday
        </span>
        <span>
          <span className="font-mono">e</span> edit
        </span>
        <span>
          <span className="font-mono">⌫</span> delete
        </span>
      </div>

      <ProcessSheet capture={openCapture} initialMode={sheetMode} onClose={() => setOpenCaptureId(null)} />
    </div>
  )
}
