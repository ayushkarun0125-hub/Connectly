import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DataTable } from '@/components/admin/DataTable'
import { FilterBar } from '@/components/admin/FilterBar'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminApi } from '@/services/adminApi'
import { useAuth } from '@/contexts/useAuth'

export default function AdminRoomsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState(null)
  const [renameId, setRenameId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    adminApi
      .rooms()
      .then(setRows)
      .catch((e) => setErr(e.message))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((r) => r.name?.toLowerCase().includes(s) || r.id?.toLowerCase().includes(s))
  }, [rows, q])

  async function saveRename() {
    if (!renameId || !renameValue.trim()) return
    setBusy(true)
    try {
      await adminApi.updateRoom(renameId, { name: renameValue.trim() })
      setRenameId(null)
      load()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  async function toggleArchive(room, archived) {
    try {
      await adminApi.updateRoom(room.id, { archived })
      load()
    } catch (e) {
      setErr(e.message)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setBusy(true)
    try {
      await adminApi.deleteRoom(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    { key: 'name', label: 'Room' },
    {
      key: 'id',
      label: 'Id',
      render: (r) => <span className="font-mono text-xs text-slate-500">{r.id}</span>,
    },
    { key: 'messageCount', label: 'Messages' },
    { key: 'liveMemberCount', label: 'Live members' },
    {
      key: 'lastMessageAt',
      label: 'Last activity',
      render: (r) => (r.lastMessageAt ? new Date(r.lastMessageAt).toLocaleString() : '—'),
    },
    {
      key: 'archived',
      label: 'State',
      render: (r) => (
        <StatusBadge variant={r.archived ? 'warning' : 'success'}>{r.archived ? 'archived' : 'active'}</StatusBadge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => {
              setRenameId(r.id)
              setRenameValue(r.name || '')
            }}
            className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-slate-300 hover:bg-white/5"
          >
            Rename
          </button>
          <button
            type="button"
            onClick={() => toggleArchive(r, !r.archived)}
            className="rounded-lg border border-white/10 px-2 py-1 text-[11px] text-slate-300 hover:bg-white/5"
          >
            {r.archived ? 'Unarchive' : 'Archive'}
          </button>
          <Link
            to={`/app/rooms/${encodeURIComponent(r.id)}`}
            className="rounded-lg border border-sky-500/30 px-2 py-1 text-[11px] text-sky-200 hover:bg-sky-500/10"
          >
            Inspect
          </Link>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setDeleteTarget(r)}
              className="rounded-lg border border-rose-500/40 px-2 py-1 text-[11px] text-rose-200 hover:bg-rose-500/10"
            >
              Delete
            </button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Rooms</h1>
        <p className="mt-1 text-sm text-slate-500">Operational view. Delete is admin-only.</p>
      </div>
      {err ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">{err}</div> : null}
      <FilterBar value={q} onChange={setQ} placeholder="Search rooms" />
      <DataTable columns={columns} rows={filtered} />

      {renameId ? (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d121c] p-6">
            <h3 className="font-semibold text-white">Rename room</h3>
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="mt-3 w-full rounded-xl border border-white/10 bg-[#0c1018] px-3 py-2 text-sm text-white"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setRenameId(null)} className="rounded-lg border border-white/10 px-3 py-2 text-sm">
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={saveRename}
                className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete room permanently?"
        message="Removes messages, strokes, pins, and membership rows for this room."
        confirmLabel="Delete room"
        danger
        busy={busy}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
