import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import { motion } from 'framer-motion'
import { Pin, PinOff, Plus, Search, Star, Tag, Trash2, Upload } from 'lucide-react'
import PageHeader from '../components/connectly/PageHeader'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'
import SearchInput from '../components/connectly/SearchInput'
import ActionButton from '../components/connectly/ActionButton'
import SectionHeader from '../components/connectly/SectionHeader'
import EmptyState from '../components/connectly/EmptyState'
import Modal from '../components/ui/Modal'
import { useAppStore } from '../store/useAppStore'
import { useAuth } from '../contexts/useAuth'
import { addRoomPin, fetchRoomPins, removeRoomPin } from '../services/pinService'
import { cn } from '../lib/utils'

const PIN_ROOM_ID = 'room_design'

function noteDeepLink(noteId) {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/app/notes?note=${encodeURIComponent(noteId)}`
}

const STORAGE_V1 = 'connectly-notes-v1'
const STORAGE_V2 = 'connectly-notes-v2'

const PAGE_TOP = 22
const PAGE_BOTTOM = 285
const MARGIN_X = 14
const LINE_HEIGHT = 6
const MAX_WIDTH_MM = 182

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `n_${Date.now()}`
}

function readNotesState() {
  try {
    const raw2 = localStorage.getItem(STORAGE_V2)
    if (raw2) {
      const data = JSON.parse(raw2)
      if (Array.isArray(data.notes)) {
        return {
          notes: data.notes,
          selectedId: data.selectedId || data.notes[0]?.id || null,
        }
      }
    }
    const raw1 = localStorage.getItem(STORAGE_V1)
    if (raw1) {
      const legacy = JSON.parse(raw1)
      const note = {
        id: uid(),
        title: typeof legacy.title === 'string' ? legacy.title : 'Imported note',
        body: typeof legacy.body === 'string' ? legacy.body : '',
        tags: ['imported'],
        starred: true,
        updatedAt: new Date().toISOString(),
      }
      return { notes: [note], selectedId: note.id }
    }
  } catch {
    /* ignore */
  }
  const welcome = {
    id: uid(),
    title: 'Welcome to Connectly notes',
    body: 'Jot meeting takeaways, paste links, and export to PDF when you are ready.\n\nNotes stay in this browser.',
    tags: ['intro'],
    starred: true,
    updatedAt: new Date().toISOString(),
  }
  return { notes: [welcome], selectedId: welcome.id }
}

function normalizeImportedNote(raw, i) {
  return {
    id: raw.id || uid(),
    title: String(raw.title || `Note ${i + 1}`).slice(0, 200),
    body: typeof raw.body === 'string' ? raw.body : '',
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    starred: Boolean(raw.starred),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  }
}

function parseImportedNotes(text, filename) {
  const baseTitle = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'Imported'
  const lower = filename.toLowerCase()
  if (lower.endsWith('.json')) {
    try {
      const data = JSON.parse(text)
      if (data && Array.isArray(data.notes)) {
        return data.notes.map((n, i) => normalizeImportedNote(n, i))
      }
      if (Array.isArray(data)) {
        return data.map((n, i) => normalizeImportedNote(typeof n === 'object' ? n : { body: String(n) }, i))
      }
    } catch {
      /* fall through to plain text */
    }
  }
  return [
    {
      id: uid(),
      title: baseTitle.slice(0, 80),
      body: text,
      tags: ['imported'],
      starred: false,
      updatedAt: new Date().toISOString(),
    },
  ]
}

function exportNotesToPdf({ title, body }) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const safeTitle = title.trim() || 'Connectly notes'
  const safeBody = body.trim() || '(No content)'

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(safeTitle, MARGIN_X, PAGE_TOP)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text(`Exported ${new Date().toLocaleString()}`, MARGIN_X, PAGE_TOP + 8)
  doc.setTextColor(0, 0, 0)

  const paragraphs = safeBody.split(/\n+/)
  let y = PAGE_TOP + 20

  paragraphs.forEach((paragraph) => {
    const lines = doc.splitTextToSize(paragraph, MAX_WIDTH_MM)
    lines.forEach((line) => {
      if (y > PAGE_BOTTOM) {
        doc.addPage()
        y = PAGE_TOP
      }
      doc.text(line, MARGIN_X, y)
      y += LINE_HEIGHT
    })
    y += LINE_HEIGHT * 0.5
  })

  const filename = `${safeTitle.replace(/[^\w\s-]/g, '').slice(0, 40) || 'notes'}.pdf`
  doc.save(filename)
}

function NotesPage() {
  const { user } = useAuth()
  const pushToast = useAppStore((state) => state.pushToast)
  const importRef = useRef(null)
  const [searchParams] = useSearchParams()
  const [{ notes, selectedId }, setState] = useState(readNotesState)
  const [q, setQ] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [roomPins, setRoomPins] = useState([])
  const [pinningId, setPinningId] = useState(null)
  const [unpinningId, setUnpinningId] = useState(null)
  const [deleteTargetId, setDeleteTargetId] = useState(null)

  const selected = useMemo(
    () => notes.find((n) => n.id === selectedId) || notes[0] || null,
    [notes, selectedId],
  )

  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem(STORAGE_V2, JSON.stringify({ notes, selectedId }))
    }, 400)
    return () => clearTimeout(t)
  }, [notes, selectedId])

  async function refreshPins() {
    const pins = await fetchRoomPins(PIN_ROOM_ID)
    setRoomPins(Array.isArray(pins) ? pins : [])
  }

  useEffect(() => {
    let cancelled = false
    fetchRoomPins(PIN_ROOM_ID)
      .then((pins) => {
        if (!cancelled) setRoomPins(Array.isArray(pins) ? pins : [])
      })
      .catch(() => {
        if (!cancelled) setRoomPins([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const id = searchParams.get('note')
    if (!id) return
    setState((s) => {
      if (!s.notes.some((n) => n.id === id)) return s
      if (s.selectedId === id) return s
      return { ...s, selectedId: id }
    })
  }, [searchParams])

  const allTags = useMemo(() => {
    const s = new Set()
    notes.forEach((n) => (n.tags || []).forEach((t) => s.add(t)))
    return [...s].sort()
  }, [notes])

  const list = useMemo(() => {
    let n = [...notes]
    const s = q.trim().toLowerCase()
    if (s) {
      n = n.filter(
        (x) =>
          x.title.toLowerCase().includes(s) ||
          x.body.toLowerCase().includes(s) ||
          (x.tags || []).some((t) => t.toLowerCase().includes(s)),
      )
    }
    if (tagFilter) {
      n = n.filter((x) => (x.tags || []).includes(tagFilter))
    }
    n.sort((a, b) => {
      if (a.starred !== b.starred) return a.starred ? -1 : 1
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
    return n
  }, [notes, q, tagFilter])

  const updateSelected = useCallback((patch) => {
    setState((prev) => {
      const id = prev.selectedId
      const nextNotes = prev.notes.map((n) =>
        n.id === id ? { ...n, ...patch, updatedAt: new Date().toISOString() } : n,
      )
      return { notes: nextNotes, selectedId: id }
    })
  }, [])

  const addNote = useCallback(() => {
    const note = {
      id: uid(),
      title: 'Untitled',
      body: '',
      tags: [],
      starred: false,
      updatedAt: new Date().toISOString(),
    }
    setState((prev) => ({ notes: [note, ...prev.notes], selectedId: note.id }))
  }, [])

  const toggleStar = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      notes: prev.notes.map((n) =>
        n.id === id ? { ...n, starred: !n.starred, updatedAt: new Date().toISOString() } : n,
      ),
    }))
  }, [])

  function findPinForNote(note) {
    const needle = `note=${encodeURIComponent(note.id)}`
    return roomPins.find((p) => p.url && (p.url.includes(needle) || p.url.endsWith(note.id))) || null
  }

  function isNotePinned(note) {
    return Boolean(findPinForNote(note))
  }

  const handlePinNote = useCallback(
    async (note) => {
      if (!user) {
        pushToast({ title: 'Sign in to pin', description: 'Pins appear in #general for your team.' })
        return
      }
      if (isNotePinned(note)) {
        pushToast({ title: 'Already pinned', description: 'This note is already in Pinned.' })
        return
      }
      setPinningId(note.id)
      try {
        await addRoomPin(PIN_ROOM_ID, {
          name: note.title?.trim() || 'Note',
          url: noteDeepLink(note.id),
          messageId: null,
          sender: user.displayName || user.email || 'User',
        })
        await refreshPins()
        pushToast({ title: 'Pinned', description: 'Note link added to #general pinned list.' })
      } catch (err) {
        pushToast({
          title: 'Could not pin',
          description: err?.message || 'Try again.',
        })
      } finally {
        setPinningId(null)
      }
    },
    [user, pushToast, roomPins],
  )

  const handleUnpinNote = useCallback(
    async (note) => {
      const pin = findPinForNote(note)
      if (!user || !pin?.id) {
        pushToast({ title: 'Cannot unpin', description: 'No matching pin found.' })
        return
      }
      setUnpinningId(note.id)
      try {
        await removeRoomPin(PIN_ROOM_ID, pin.id)
        await refreshPins()
        pushToast({ title: 'Unpinned', description: 'Removed from #general pinned list.' })
      } catch (err) {
        pushToast({
          title: 'Could not unpin',
          description: err?.message || 'Try again.',
        })
      } finally {
        setUnpinningId(null)
      }
    },
    [user, pushToast, roomPins],
  )

  const removeNoteFromState = useCallback((id) => {
    setState((prev) => {
      const next = prev.notes.filter((n) => n.id !== id)
      let nextSel = prev.selectedId
      if (nextSel === id) nextSel = next[0]?.id ?? null
      return { notes: next, selectedId: nextSel }
    })
  }, [])

  const confirmDeleteNote = useCallback(async () => {
    if (!deleteTargetId) return
    const id = deleteTargetId
    const note = notes.find((n) => n.id === id)
    setDeleteTargetId(null)
    if (note && user) {
      const needle = `note=${encodeURIComponent(note.id)}`
      const pin = roomPins.find((p) => p.url && (p.url.includes(needle) || p.url.endsWith(note.id)))
      if (pin?.id) {
        try {
          await removeRoomPin(PIN_ROOM_ID, pin.id)
          const pins = await fetchRoomPins(PIN_ROOM_ID)
          setRoomPins(Array.isArray(pins) ? pins : [])
        } catch {
          /* still remove local note */
        }
      }
    }
    removeNoteFromState(id)
    pushToast({ title: 'Note deleted', description: 'The note was removed.' })
  }, [deleteTargetId, notes, user, roomPins, removeNoteFromState, pushToast])

  function handleImportFile(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result || '')
      const imported = parseImportedNotes(text, file.name)
      setState((prev) => ({
        notes: [...imported, ...prev.notes],
        selectedId: imported[0]?.id || prev.selectedId,
      }))
      pushToast({
        title: 'Imported',
        description: `${imported.length} note(s) from ${file.name}`,
      })
    }
    reader.onerror = () => pushToast({ title: 'Import failed', description: 'Could not read the file.' })
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleExportPdf = useCallback(() => {
    if (!selected) return
    try {
      exportNotesToPdf({ title: selected.title, body: selected.body })
      pushToast({ title: 'PDF downloaded', description: 'Your note was exported.' })
    } catch (error) {
      pushToast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Could not create PDF.',
      })
    }
  }, [selected, pushToast])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notes"
        description="Lightweight collaborative scratchpad. Stored locally in your browser."
        action={(
          <div className="flex flex-wrap gap-2">
            <input
              ref={importRef}
              type="file"
              accept=".txt,.md,.markdown,.json,text/plain,text/markdown,application/json"
              className="hidden"
              onChange={handleImportFile}
            />
            <ActionButton variant="secondary" onClick={() => importRef.current?.click()}>
              <Upload className="h-4 w-4" strokeWidth={2} />
              Import from file
            </ActionButton>
            <ActionButton variant="primary" onClick={addNote}>
              <Plus className="h-4 w-4" strokeWidth={2} />
              New note
            </ActionButton>
          </div>
        )}
      />

      <div className="grid min-h-[560px] gap-4 lg:grid-cols-[minmax(240px,300px)_1fr]">
        <ConnectlyPanel className="flex flex-col" noPadding>
          <div className="border-b border-white/[0.06] p-4">
            <SearchInput
              placeholder="Search notes..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full"
            />
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setTagFilter('')}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition',
                  !tagFilter
                    ? 'bg-blue-500/20 text-blue-200'
                    : 'bg-white/[0.05] text-slate-500 hover:text-slate-300',
                )}
              >
                All
              </button>
              {allTags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTagFilter((f) => (f === t ? '' : t))}
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition',
                    tagFilter === t
                      ? 'bg-blue-500/20 text-blue-200'
                      : 'bg-white/[0.05] text-slate-500 hover:text-slate-300',
                  )}
                >
                  <Tag className="h-3 w-3" />
                  {t}
                </button>
              ))}
            </div>
          </div>
          <ul className="connectly-scroll flex-1 space-y-1 overflow-y-auto p-2">
            {list.map((note) => (
              <motion.li key={note.id} layout initial={{ opacity: 0.6 }} animate={{ opacity: 1 }}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setState((s) => ({ ...s, selectedId: note.id }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setState((s) => ({ ...s, selectedId: note.id }))
                    }
                  }}
                  className={cn(
                    'flex w-full flex-col rounded-xl border px-3 py-2.5 text-left transition outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40',
                    note.id === selectedId
                      ? 'border-blue-500/35 bg-blue-500/10 shadow-[0_0_20px_-10px_rgba(59,130,246,0.5)]'
                      : 'cursor-pointer border-transparent bg-white/[0.02] hover:border-white/[0.08] hover:bg-white/[0.05]',
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-white">{note.title}</span>
                    <div className="flex shrink-0 items-center gap-0.5">
                      {user ? (
                        isNotePinned(note) ? (
                          <button
                            type="button"
                            title="Unpin from #general"
                            disabled={unpinningId === note.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleUnpinNote(note)
                            }}
                            className="rounded-lg p-1 text-slate-500 hover:bg-white/[0.08] hover:text-slate-200 disabled:opacity-50"
                          >
                            <PinOff className="h-4 w-4" strokeWidth={2} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            title="Pin to #general"
                            disabled={pinningId === note.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              handlePinNote(note)
                            }}
                            className="rounded-lg p-1 text-slate-500 hover:bg-white/[0.08] hover:text-blue-300 disabled:opacity-50"
                          >
                            <Pin className="h-4 w-4" strokeWidth={2} />
                          </button>
                        )
                      ) : null}
                      <button
                        type="button"
                        title="Delete note"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeleteTargetId(note.id)
                        }}
                        className="rounded-lg p-1 text-slate-500 hover:bg-rose-500/15 hover:text-rose-300"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleStar(note.id)
                        }}
                        className="rounded-lg p-1 text-slate-500 hover:text-amber-300"
                        aria-label="Star"
                      >
                        <Star className={cn('h-4 w-4', note.starred && 'fill-amber-400 text-amber-400')} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{note.body || 'Empty note'}</p>
                  <p className="mt-2 text-[10px] text-slate-600">
                    {new Date(note.updatedAt).toLocaleString()}
                  </p>
                </div>
              </motion.li>
            ))}
          </ul>
        </ConnectlyPanel>

        <ConnectlyPanel className="flex flex-col">
          {selected ? (
            <>
              <SectionHeader
                title="Editor"
                action={(
                  <div className="flex flex-wrap gap-2">
                    {user && selected ? (
                      isNotePinned(selected) ? (
                        <ActionButton
                          variant="secondary"
                          size="sm"
                          disabled={unpinningId === selected.id}
                          onClick={() => handleUnpinNote(selected)}
                        >
                          <PinOff className="h-4 w-4" strokeWidth={2} />
                          {unpinningId === selected.id ? 'Unpinning…' : 'Unpin'}
                        </ActionButton>
                      ) : (
                        <ActionButton
                          variant="secondary"
                          size="sm"
                          disabled={pinningId === selected.id}
                          onClick={() => handlePinNote(selected)}
                        >
                          <Pin className="h-4 w-4" strokeWidth={2} />
                          {pinningId === selected.id ? 'Pinning…' : 'Pin'}
                        </ActionButton>
                      )
                    ) : null}
                    <ActionButton variant="secondary" size="sm" onClick={() => selected && setDeleteTargetId(selected.id)}>
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                      Delete
                    </ActionButton>
                    <ActionButton variant="secondary" size="sm" onClick={handleExportPdf}>
                      Export PDF
                    </ActionButton>
                  </div>
                )}
              />
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Title</span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/[0.1] dark:bg-[#07111f] dark:text-white dark:focus:border-blue-500/40"
                  value={selected.title}
                  onChange={(e) => updateSelected({ title: e.target.value })}
                />
              </label>
              <label className="mt-4 block flex-1">
                <span className="mb-1 block text-xs font-medium text-slate-500">Body</span>
                <textarea
                  className="min-h-[280px] w-full flex-1 resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-900 outline-none focus:border-blue-500 dark:border-white/[0.1] dark:bg-[#07111f] dark:text-slate-100 dark:focus:border-blue-500/40 lg:min-h-[360px]"
                  value={selected.body}
                  onChange={(e) => updateSelected({ body: e.target.value })}
                  placeholder="Write something…"
                />
              </label>
              <label className="mt-4 block">
                <span className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-500">
                  <Tag className="h-3 w-3" />
                  Tags (comma separated)
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-white/[0.1] dark:bg-[#07111f] dark:text-white dark:focus:border-blue-500/40"
                  value={(selected.tags || []).join(', ')}
                  onChange={(e) =>
                    updateSelected({
                      tags: e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </label>
            </>
          ) : (
            <EmptyState
              icon={Search}
              title="Select a note"
              description="Create a new note or pick one from the list."
              className="min-h-[320px] border-white/[0.06]"
            />
          )}
        </ConnectlyPanel>
      </div>

      <Modal open={Boolean(deleteTargetId)} title="Delete this note?" onClose={() => setDeleteTargetId(null)}>
        <p className="text-sm text-slate-300">
          This removes the note from this browser. If it was pinned in #general, the pin is removed too.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <ActionButton variant="ghost" onClick={() => setDeleteTargetId(null)}>
            Cancel
          </ActionButton>
          <ActionButton variant="primary" className="!bg-rose-600 hover:!bg-rose-500" onClick={confirmDeleteNote}>
            Delete
          </ActionButton>
        </div>
      </Modal>
    </div>
  )
}

export default NotesPage
