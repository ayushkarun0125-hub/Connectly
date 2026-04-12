import { useCallback, useEffect, useMemo, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { FilterBar } from '@/components/admin/FilterBar'
import { ConfirmModal } from '@/components/admin/ConfirmModal'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminApi } from '@/services/adminApi'
import { getServerBaseUrl } from '@/config/serverUrl'
import { useAuth } from '@/contexts/useAuth'

function formatSize(n) {
  if (n == null) return '—'
  if (n < 1024) return `${n} B`
  return `${(n / 1024).toFixed(1)} KB`
}

export default function AdminFilesPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [rows, setRows] = useState([])
  const [q, setQ] = useState('')
  const [err, setErr] = useState(null)
  const [target, setTarget] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    adminApi
      .files()
      .then(setRows)
      .catch((e) => setErr(e.message))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return rows
    return rows.filter((r) => r.name?.toLowerCase().includes(s) || r.type?.toLowerCase().includes(s))
  }, [rows, q])

  async function remove() {
    if (!target) return
    setBusy(true)
    try {
      await adminApi.deleteFile(target.id)
      setTarget(null)
      load()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    { key: 'name', label: 'File' },
    { key: 'type', label: 'Type' },
    { key: 'uploader', label: 'Uploader' },
    { key: 'room', label: 'Room' },
    { key: 'size', label: 'Size', render: (r) => formatSize(r.size) },
    {
      key: 'uploadedAt',
      label: 'Uploaded',
      render: (r) => new Date(r.uploadedAt).toLocaleString(),
    },
    {
      key: 'flagged',
      label: 'Flagged',
      render: (r) => <StatusBadge variant={r.flagged ? 'danger' : 'success'}>{r.flagged ? 'yes' : 'no'}</StatusBadge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <a
            href={r.url?.startsWith('/') ? `${getServerBaseUrl()}${r.url}` : r.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-sky-500/30 px-2 py-1 text-[11px] text-sky-200"
          >
            Open
          </a>
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setTarget(r)}
              className="rounded-lg border border-rose-500/40 px-2 py-1 text-[11px] text-rose-200"
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
        <h1 className="text-2xl font-bold text-white">Files</h1>
        <p className="mt-1 text-sm text-slate-500">Upload inventory from server disk. Pin state is per-room in the main app.</p>
      </div>
      {err ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">{err}</div> : null}
      <FilterBar value={q} onChange={setQ} placeholder="Search files" />
      <DataTable columns={columns} rows={filtered} />
      <ConfirmModal
        open={Boolean(target)}
        title="Delete file from storage?"
        message={target ? `Remove ${target.name} from uploads?` : ''}
        danger
        busy={busy}
        onClose={() => setTarget(null)}
        onConfirm={remove}
      />
    </div>
  )
}
