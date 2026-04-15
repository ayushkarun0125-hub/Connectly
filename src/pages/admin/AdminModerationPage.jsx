import { useEffect, useState } from 'react'
import { DataTable } from '@/components/admin/DataTable'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { EmptyState } from '@/components/admin/EmptyState'
import { Shield } from 'lucide-react'
import { adminApi } from '@/services/adminApi'
import { connectSocket } from '@/services/socket'

export default function AdminModerationPage() {
  const [queue, setQueue] = useState([])
  const [err, setErr] = useState(null)
  const [busy, setBusy] = useState(null)

  function load() {
    adminApi
      .moderation()
      .then((d) => setQueue(d.queue || []))
      .catch((e) => setErr(e.message))
  }

  useEffect(() => {
    load()
    const socket = connectSocket()
    const handleCreated = () => load()
    socket.on('moderation-report-created', handleCreated)
    if (!socket.connected) socket.connect()
    return () => {
      socket.off('moderation-report-created', handleCreated)
    }
  }, [])

  async function resolve(id) {
    setBusy(id)
    try {
      await adminApi.resolveReport(id)
      load()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(null)
    }
  }

  async function moveStatus(id, status) {
    setBusy(id)
    try {
      await adminApi.updateReportStatus(id, status)
      load()
    } catch (e) {
      setErr(e.message)
    } finally {
      setBusy(null)
    }
  }

  const columns = [
    { key: 'type', label: 'Type' },
    { key: 'roomId', label: 'Room', render: (r) => <span className="font-mono text-xs">{r.roomId}</span> },
    { key: 'reason', label: 'Reason' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <StatusBadge variant={r.status === 'pending' ? 'warning' : r.status === 'reviewing' ? 'neutral' : 'success'}>
          {r.status}
        </StatusBadge>
      ),
    },
    {
      key: 'createdAt',
      label: 'Reported',
      render: (r) => new Date(r.createdAt).toLocaleString(),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            disabled={busy === r.id || !['pending', 'reviewing'].includes(r.status)}
            onClick={() => resolve(r.id)}
            className="rounded-lg border border-emerald-500/30 px-2 py-1 text-[11px] text-emerald-200 hover:bg-emerald-500/10"
          >
            Resolve
          </button>
          <button
            type="button"
            disabled={busy === r.id || r.status !== 'pending'}
            onClick={() => moveStatus(r.id, 'reviewing')}
            className="rounded-lg border border-sky-500/30 px-2 py-1 text-[11px] text-sky-200 hover:bg-sky-500/10 disabled:opacity-60"
          >
            Reviewing
          </button>
          <button
            type="button"
            disabled={busy === r.id || ['resolved', 'dismissed'].includes(r.status)}
            onClick={() => moveStatus(r.id, 'dismissed')}
            className="rounded-lg border border-white/15 px-2 py-1 text-[11px] text-slate-300 hover:bg-white/5 disabled:opacity-60"
          >
            Dismiss
          </button>
        </div>
      ),
    },
  ]

  const open = queue.filter((x) => ['pending', 'reviewing'].includes(x.status))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Moderation</h1>
        <p className="mt-1 text-sm text-slate-500">Review open reports stored in the database.</p>
      </div>
      {err ? <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">{err}</div> : null}
      {!open.length && !queue.length ? (
        <EmptyState
          icon={Shield}
          title="Queue clear"
          description="No open reports."
        />
      ) : (
        <DataTable columns={columns} rows={queue} emptyMessage="No reports." />
      )}
    </div>
  )
}
