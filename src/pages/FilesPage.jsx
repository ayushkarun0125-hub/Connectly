import { useEffect, useMemo, useState } from 'react'
import { FileText, Filter, Pin } from 'lucide-react'
import PageHeader from '../components/connectly/PageHeader'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'
import SearchInput from '../components/connectly/SearchInput'
import SectionHeader from '../components/connectly/SectionHeader'
import EmptyState from '../components/connectly/EmptyState'
import { fetchUploadedFiles } from '../services/chatService'
import { fetchRoomPins } from '../services/pinService'
import { getServerBaseUrl } from '@/config/serverUrl'
import { mockFiles } from '../mock/data'
import Skeleton from '../components/ui/Skeleton'

function formatSize(bytes) {
  if (bytes == null) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function extFromName(name) {
  const m = String(name || '').match(/\.([^.]+)$/)
  return m ? m[1].toUpperCase() : 'FILE'
}

function FilesPage() {
  const [loading, setLoading] = useState(true)
  const [serverFiles, setServerFiles] = useState([])
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [roomPins, setRoomPins] = useState([])

  useEffect(() => {
    let cancelled = false
    fetchRoomPins('room_general')
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
    let cancelled = false
    fetchUploadedFiles()
      .then((result) => {
        if (!cancelled) {
          setServerFiles(Array.isArray(result) ? result : [])
          setError(null)
        }
      })
      .catch(() => {
        if (!cancelled) setError('Could not load files from the server.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const normalized = useMemo(() => {
    const fromServer = serverFiles.map((f) => ({
      id: f.id || f.name,
      name: f.name,
      sender: f.sender || 'Upload',
      room: f.roomId || '—',
      type: extFromName(f.name),
      uploadedAt: f.uploadedAt ? new Date(f.uploadedAt).toLocaleString() : '—',
      size: f.size,
      href: f.url?.startsWith('/') ? `${getServerBaseUrl()}${f.url}` : f.url,
      source: 'server',
    }))
    const fromMock = mockFiles.map((f) => ({
      id: f.id,
      name: f.name,
      sender: f.sender,
      room: f.roomId,
      type: extFromName(f.name),
      uploadedAt: f.uploadedAt,
      size: null,
      href: f.preview || null,
      source: 'demo',
    }))
    return [...fromServer, ...fromMock]
  }, [serverFiles])

  const filtered = useMemo(() => {
    let list = normalized
    const s = q.trim().toLowerCase()
    if (s) {
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(s) ||
          f.room.toLowerCase().includes(s) ||
          f.sender.toLowerCase().includes(s),
      )
    }
    if (filter === 'images') {
      list = list.filter((f) => /\.(png|jpe?g|gif|webp)$/i.test(f.name))
    }
    if (filter === 'docs') {
      list = list.filter((f) => /\.(pdf|docx?|pptx?|txt)$/i.test(f.name))
    }
    return list
  }, [normalized, q, filter])

  const pinnedFromApi = roomPins.map((p) => ({
    id: `pin-${p.id}`,
    name: p.name,
    href: p.url?.startsWith('/uploads') ? `${getServerBaseUrl()}${p.url}` : p.url,
    room: 'room_general',
  }))
  const pinned =
    pinnedFromApi.length > 0
      ? pinnedFromApi.slice(0, 6)
      : filtered.filter((f) => /sprint|wireframe/i.test(f.name)).slice(0, 3).map((f) => ({
          id: f.id,
          name: f.name,
          href: f.href,
          room: '—',
        }))
  const recent = filtered.slice(0, 8)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Files"
        description="Everything shared in your workspace. Open server uploads in a new tab to download."
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="max-w-lg flex-1">
          <SearchInput
            placeholder="Search by name, room, or uploader..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'all', label: 'All' },
            { id: 'images', label: 'Images' },
            { id: 'docs', label: 'Documents' },
          ].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setFilter(opt.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                filter === opt.id
                  ? 'border-blue-500/40 bg-blue-500/15 text-blue-100 shadow-[0_0_20px_-8px_rgba(59,130,246,0.6)]'
                  : 'border-white/[0.1] bg-white/[0.04] text-slate-400 hover:border-white/[0.16] hover:text-slate-200'
              }`}
            >
              <Filter className="h-3 w-3 opacity-70" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ConnectlyPanel>
        <SectionHeader title="Pinned" description="Important assets surfaced for quick access" />
        {loading ? (
          <Skeleton className="h-24 rounded-2xl bg-slate-200/50 dark:bg-white/[0.06]" />
        ) : pinned.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200/80 py-8 text-center text-sm text-slate-500 dark:border-white/[0.08]">
            No pinned files yet. Pin a file or Drive link from any chat room.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-3">
            {pinned.map((file) => (
              <li
                key={file.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-blue-500/40 dark:border-white/[0.1] dark:bg-white/[0.04] dark:hover:border-blue-500/30"
              >
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-300">
                  <Pin className="h-4 w-4" strokeWidth={2} />
                  <span className="text-xs font-semibold uppercase tracking-wide">Pinned</span>
                </div>
                <a
                  href={file.href || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 block truncate text-sm font-medium text-slate-900 hover:text-blue-600 hover:underline dark:text-white dark:hover:text-blue-200"
                >
                  {file.name}
                </a>
                <p className="mt-1 text-xs text-slate-500">{file.room}</p>
              </li>
            ))}
          </ul>
        )}
      </ConnectlyPanel>

      <ConnectlyPanel>
        <SectionHeader title="Recent uploads" />
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-xl bg-white/[0.06]" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-rose-300">{error}</p>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No files yet"
            description="Upload from any chat room. Files appear here for the whole workspace."
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/[0.06]">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">File</th>
                  <th className="px-4 py-3 font-semibold">Uploaded by</th>
                  <th className="px-4 py-3 font-semibold">Room</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((file) => (
                  <tr key={file.id} className="border-b border-white/[0.04] transition hover:bg-white/[0.03] last:border-0">
                    <td className="px-4 py-3">
                      <a
                        href={file.href || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-blue-300 hover:underline"
                      >
                        {file.name}
                      </a>
                      <p className="text-[10px] text-slate-600">{formatSize(file.size)}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{file.sender}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{file.room}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-lg bg-white/[0.06] px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                        {file.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{file.uploadedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ConnectlyPanel>
    </div>
  )
}

export default FilesPage
