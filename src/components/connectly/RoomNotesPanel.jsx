import { useCallback, useEffect, useRef, useState } from 'react'
import { Link2, Plus, Trash2, ExternalLink } from 'lucide-react'
import ActionButton from './ActionButton'

const STORAGE_PREFIX = 'connectly_room_notes_v1:'

function storageKey(roomId) {
  return `${STORAGE_PREFIX}${encodeURIComponent(roomId || '')}`
}

function uid() {
  return globalThis.crypto?.randomUUID?.() ?? `ln_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function readStored(roomId) {
  try {
    const raw = localStorage.getItem(storageKey(roomId))
    if (!raw) return { annotations: '', links: [] }
    const data = JSON.parse(raw)
    return {
      annotations: typeof data.annotations === 'string' ? data.annotations : '',
      links: Array.isArray(data.links)
        ? data.links
            .filter((l) => l && typeof l.url === 'string')
            .map((l) => ({
              id: String(l.id || uid()),
              label: String(l.label || '').trim() || 'Link',
              url: String(l.url || '').trim(),
            }))
            .filter((l) => l.url)
        : [],
    }
  } catch {
    return { annotations: '', links: [] }
  }
}

function writeStored(roomId, payload) {
  try {
    localStorage.setItem(storageKey(roomId), JSON.stringify(payload))
  } catch {
    /* quota or private mode */
  }
}

/**
 * Per-room sprint notes + quick links. Persisted in localStorage for this browser only.
 */
export default function RoomNotesPanel({ roomId }) {
  const [annotations, setAnnotations] = useState('')
  const [links, setLinks] = useState([])
  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const saveTimer = useRef(null)

  useEffect(() => {
    const { annotations: a, links: l } = readStored(roomId)
    setAnnotations(a)
    setLinks(l)
  }, [roomId])

  const persist = useCallback(
    (nextAnnotations, nextLinks) => {
      writeStored(roomId, { annotations: nextAnnotations, links: nextLinks })
    },
    [roomId],
  )

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      persist(annotations, links)
    }, 400)
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [annotations, links, persist])

  function addLink(e) {
    e.preventDefault()
    const url = linkUrl.trim()
    if (!url) return
    let normalized = url
    if (!/^https?:\/\//i.test(url)) normalized = `https://${url}`
    const label = linkLabel.trim() || 'Link'
    setLinks((prev) => [...prev, { id: uid(), label, url: normalized }])
    setLinkLabel('')
    setLinkUrl('')
  }

  function removeLink(id) {
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }

  return (
    <div className="space-y-6 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-100">Sprint annotations</h2>
        <p className="mt-1 text-xs text-slate-500">
          Goals, decisions, and blockers for this room. Saved in this browser only.
        </p>
        <textarea
          value={annotations}
          onChange={(e) => setAnnotations(e.target.value)}
          rows={10}
          placeholder="e.g. Sprint goal: ship moderation queue&#10;— Decision: use SQLite for v1&#10;— Blocker: waiting on design tokens"
          className="mt-3 w-full resize-y rounded-xl border border-white/[0.08] bg-[#07111f] px-3 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-sky-500/40"
        />
      </div>

      <div>
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Link2 className="h-4 w-4 text-sky-400" strokeWidth={2} />
          Links
        </h2>
        <p className="mt-1 text-xs text-slate-500">Specs, tickets, and references — open in a new tab.</p>

        <form onSubmit={addLink} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-500">Label</span>
            <input
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder="Ticket / doc name"
              className="w-full rounded-lg border border-white/[0.08] bg-[#07111f] px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500/40"
            />
          </label>
          <label className="min-w-0 flex-[2]">
            <span className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-slate-500">URL</span>
            <input
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded-lg border border-white/[0.08] bg-[#07111f] px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-500/40"
            />
          </label>
          <ActionButton type="submit" variant="secondary" className="shrink-0 gap-1.5 sm:mb-0">
            <Plus className="h-4 w-4" />
            Add
          </ActionButton>
        </form>

        {links.length === 0 ? (
          <p className="mt-4 text-center text-xs text-slate-600">No links yet.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {links.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 flex-1 truncate font-medium text-sky-400 hover:text-sky-300"
                >
                  {item.label}
                </a>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 rounded p-1 text-slate-500 hover:bg-white/10 hover:text-slate-300"
                  aria-label="Open link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => removeLink(item.id)}
                  className="shrink-0 rounded p-1 text-slate-500 hover:bg-red-500/15 hover:text-red-300"
                  aria-label="Remove link"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
