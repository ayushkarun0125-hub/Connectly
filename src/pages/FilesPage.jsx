import { useEffect, useMemo, useRef, useState } from 'react'
import { FileText, Filter, Pin, PinOff, Trash2, Upload } from 'lucide-react'
import PageHeader from '../components/connectly/PageHeader'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'
import SearchInput from '../components/connectly/SearchInput'
import SectionHeader from '../components/connectly/SectionHeader'
import EmptyState from '../components/connectly/EmptyState'
import { deleteUploadedFile, fetchUploadedFiles, uploadFileToServer } from '../services/chatService'
import { useAuth } from '../contexts/useAuth'
import { useAppStore } from '../store/useAppStore'
import ActionButton from '../components/connectly/ActionButton'
import Modal from '../components/ui/Modal'
import { addRoomPin, fetchRoomPins, removeRoomPin } from '../services/pinService'
import { getServerBaseUrl } from '@/config/serverUrl'
import Skeleton from '../components/ui/Skeleton'

const PIN_ROOM_ID = 'room_design'

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
  const { user } = useAuth()
  const pushToast = useAppStore((s) => s.pushToast)
  const [loading, setLoading] = useState(true)
  const [serverFiles, setServerFiles] = useState([])
  const [error, setError] = useState(null)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState('all')
  const [roomPins, setRoomPins] = useState([])
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [pinningId, setPinningId] = useState(null)
  const [unpinningId, setUnpinningId] = useState(null)
  const [uploadBusy, setUploadBusy] = useState(false)
  const uploadInputRef = useRef(null)

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

  function findPinForFile(file) {
    const href = file.href || ''
    const name = file.name || ''
    return (
      roomPins.find((p) => {
        const u = p.url || ''
        if (href && u === href) return true
        if (name && (u.includes(name) || u.endsWith(name))) return true
        return false
      }) || null
    )
  }

  function isFilePinned(file) {
    return Boolean(findPinForFile(file))
  }

  async function handlePinFile(file) {
    if (!user || !file.href) {
      pushToast({ title: 'Cannot pin', description: 'Sign in and open a file link first.' })
      return
    }
    if (isFilePinned(file)) {
      pushToast({ title: 'Already pinned', description: `${file.name} is already in Pinned for #general.` })
      return
    }
    setPinningId(file.id)
    try {
      await addRoomPin(PIN_ROOM_ID, {
        name: file.name,
        url: file.href,
        messageId: null,
        sender: user.displayName || user.email || 'User',
      })
      await refreshPins()
      pushToast({ title: 'Pinned', description: `${file.name} is pinned in #general.` })
    } catch (err) {
      pushToast({
        title: 'Could not pin',
        description: err?.message || 'Sign in and try again.',
      })
    } finally {
      setPinningId(null)
    }
  }

  async function handleUnpinFile(file) {
    const pin = findPinForFile(file)
    if (!user || !pin?.id) {
      pushToast({ title: 'Cannot unpin', description: 'No matching pin found for this file.' })
      return
    }
    setUnpinningId(file.id)
    try {
      await removeRoomPin(PIN_ROOM_ID, pin.id)
      await refreshPins()
      pushToast({ title: 'Unpinned', description: `${file.name} was removed from Pinned in #general.` })
    } catch (err) {
      pushToast({
        title: 'Could not unpin',
        description: err?.message || 'Sign in and try again.',
      })
    } finally {
      setUnpinningId(null)
    }
  }

  async function handleAddFiles(event) {
    const input = event.target
    const files = input.files
    if (!files?.length) return
    setUploadBusy(true)
    let ok = 0
    try {
      for (const file of files) {
        await uploadFileToServer(file)
        ok += 1
      }
      const result = await fetchUploadedFiles()
      setServerFiles(Array.isArray(result) ? result : [])
      pushToast({
        title: ok === 1 ? 'File uploaded' : `${ok} files uploaded`,
        description: 'They appear below and in #general chat.',
      })
    } catch (err) {
      pushToast({
        title: 'Upload failed',
        description: err?.message || 'Check the API is running and file size (max ~8 MB).',
      })
    } finally {
      setUploadBusy(false)
      input.value = ''
    }
  }

  async function confirmDeleteFile() {
    if (!deleteTarget?.name) return
    setDeleteBusy(true)
    try {
      await deleteUploadedFile(deleteTarget.name)
      pushToast({ title: 'File removed', description: `${deleteTarget.name} was deleted from the server.` })
      setDeleteTarget(null)
      const result = await fetchUploadedFiles()
      setServerFiles(Array.isArray(result) ? result : [])
      await refreshPins()
    } catch (err) {
      pushToast({
        title: 'Could not remove file',
        description: err?.message || 'Sign in to remove files.',
      })
    } finally {
      setDeleteBusy(false)
    }
  }

  const normalized = useMemo(() => {
    return serverFiles.map((f) => ({
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
    room: PIN_ROOM_ID,
  }))
  const pinned = pinnedFromApi.slice(0, 6)
  const recent = filtered.slice(0, 8)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Files"
        description="Everything shared in your workspace. Open server uploads in a new tab to download."
        action={(
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={uploadInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleAddFiles}
            />
            <ActionButton
              variant="primary"
              disabled={uploadBusy}
              onClick={() => uploadInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" strokeWidth={2} />
              {uploadBusy ? 'Uploading…' : 'Add files'}
            </ActionButton>
          </div>
        )}
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
            No pinned files yet. Pin from the list below or from any chat room (#general).
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
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.03] text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">File</th>
                  <th className="px-4 py-3 font-semibold">Uploaded by</th>
                  <th className="px-4 py-3 font-semibold">Room</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
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
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
                        {user && file.href ? (
                          isFilePinned(file) ? (
                            <button
                              type="button"
                              title="Remove from Pinned (#general)"
                              disabled={unpinningId === file.id}
                              onClick={() => handleUnpinFile(file)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-500/35 bg-white/[0.06] px-2 py-1 text-xs font-medium text-slate-200 transition hover:border-slate-400/45 hover:bg-white/[0.1] disabled:opacity-60"
                            >
                              <PinOff className="h-3.5 w-3.5" strokeWidth={2} />
                              {unpinningId === file.id ? 'Unpinning…' : 'Unpin'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              title="Pin to #general"
                              disabled={pinningId === file.id}
                              onClick={() => handlePinFile(file)}
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-500/35 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-100 transition hover:border-blue-400/55 hover:bg-blue-500/20 disabled:opacity-60"
                            >
                              <Pin className="h-3.5 w-3.5" strokeWidth={2} />
                              {pinningId === file.id ? 'Pinning…' : 'Pin'}
                            </button>
                          )
                        ) : null}
                        {file.source === 'server' && user ? (
                          <button
                            type="button"
                            title="Remove file from server"
                            onClick={() => setDeleteTarget({ name: file.name })}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-200 transition hover:border-rose-400/50 hover:bg-rose-500/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                            Remove
                          </button>
                        ) : !user || !file.href ? (
                          <span className="text-xs text-slate-600">—</span>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ConnectlyPanel>

      <Modal open={Boolean(deleteTarget)} title="Remove this file?" onClose={() => !deleteBusy && setDeleteTarget(null)}>
        <p className="text-sm text-slate-300">
          This deletes the file from the server for everyone, removes it from chat history, and unpins it if it was pinned.
          {deleteTarget?.name ? (
            <>
              {' '}
              <span className="font-mono text-slate-200">{deleteTarget.name}</span>
            </>
          ) : null}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <ActionButton variant="ghost" disabled={deleteBusy} onClick={() => setDeleteTarget(null)}>
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            className="!bg-rose-600 hover:!bg-rose-500"
            disabled={deleteBusy}
            onClick={confirmDeleteFile}
          >
            {deleteBusy ? 'Removing…' : 'Remove file'}
          </ActionButton>
        </div>
      </Modal>
    </div>
  )
}

export default FilesPage
