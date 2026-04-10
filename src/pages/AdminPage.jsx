import { useEffect, useState } from 'react'
import { Activity, Database, Radio, Users } from 'lucide-react'
import PageHeader from '../components/connectly/PageHeader'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'
import SectionHeader from '../components/connectly/SectionHeader'
import Table from '../components/ui/Table'
import ActionButton from '../components/connectly/ActionButton'
import { mockUsers } from '../mock/data'
import { fetchBackendHealth } from '../services/chatService'
import { getSocket } from '../services/socket'
import Skeleton from '../components/ui/Skeleton'

function AdminPage() {
  const [health, setHealth] = useState(null)
  const [socketSnap, setSocketSnap] = useState({ connected: false, id: '' })

  useEffect(() => {
    fetchBackendHealth().then(setHealth)
    const s = getSocket()
    const tick = () =>
      setSocketSnap({ connected: s.connected, id: s.id || '' })
    tick()
    s.on('connect', tick)
    s.on('disconnect', tick)
    return () => {
      s.off('connect', tick)
      s.off('disconnect', tick)
    }
  }, [])

  const columns = [
    { key: 'name', label: 'User' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'actions', label: 'Actions' },
  ]

  const rows = mockUsers.map((user) => ({
    ...user,
    actions: (
      <div className="flex gap-2">
        <ActionButton type="button" variant="ghost" size="sm" disabled title="Not implemented">
          Kick
        </ActionButton>
        <ActionButton type="button" variant="danger" size="sm" disabled title="Not implemented">
          Ban
        </ActionButton>
      </div>
    ),
  }))

  const apiOk = health?.ok === true

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin"
        description="Operational overview, realtime status, and moderation tools. End users do not see this area."
      />

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        <strong className="font-semibold">Prototype:</strong> moderation actions are not wired to the API yet. Use this
        dashboard to validate UX and future server hooks.
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          icon={Activity}
          label="API / HTTP"
          value={health == null ? '…' : apiOk ? 'Reachable' : 'Unreachable'}
          ok={health == null ? undefined : apiOk}
          detail={health?.port != null ? `Port ${health.port}` : null}
        />
        <StatusCard
          icon={Radio}
          label="Socket.io"
          value={socketSnap.connected ? 'Connected' : 'Disconnected'}
          ok={socketSnap.connected}
          detail={socketSnap.id ? `ID ${socketSnap.id.slice(0, 8)}…` : null}
        />
        <StatusCard
          icon={Database}
          label="Database"
          value="SQLite (server)"
          ok={health == null ? undefined : apiOk}
          detail="Assumed up when API healthy"
        />
        <StatusCard icon={Users} label="Active users (mock)" value={String(mockUsers.length)} ok={true} detail="Roster sample" />
      </div>

      <ConnectlyPanel>
        <SectionHeader title="User management" />
        <Table columns={columns} rows={rows} />
      </ConnectlyPanel>

      <div className="grid gap-4 lg:grid-cols-2">
        <ConnectlyPanel>
          <SectionHeader title="Room moderation" />
          <ul className="list-inside list-disc space-y-2 text-sm text-slate-400">
            <li>Freeze room chat</li>
            <li>Clear whiteboard history</li>
            <li>Restrict file uploads</li>
          </ul>
        </ConnectlyPanel>
        <ConnectlyPanel>
          <SectionHeader title="Logs" />
          <div className="connectly-scroll max-h-48 overflow-y-auto rounded-xl border border-white/[0.06] bg-[#07111f] p-3 font-mono text-[11px] text-slate-500">
            {health == null ? (
              <Skeleton className="h-20 rounded-lg bg-white/[0.06]" />
            ) : (
              <>
                <p>[system] health check: {apiOk ? 'ok' : 'fail'}</p>
                <p>[socket] transport: websocket</p>
                <p>[demo] moderation queue empty</p>
              </>
            )}
          </div>
        </ConnectlyPanel>
      </div>

      <ConnectlyPanel>
        <SectionHeader
          title="Reported content"
          description="Sample queue for demo purposes"
        />
        <ul className="space-y-2 text-sm text-slate-400">
          <li className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">Message flagged for spam</li>
          <li className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">Inappropriate file upload report</li>
        </ul>
      </ConnectlyPanel>
    </div>
  )
}

function StatusCard({ icon: Icon, label, value, ok, detail }) {
  const tone =
    ok === true
      ? 'border-emerald-500/25 bg-emerald-500/5'
      : ok === false
        ? 'border-rose-500/25 bg-rose-500/5'
        : 'border-white/[0.08] bg-white/[0.03]'
  return (
    <div className={`rounded-[20px] border p-5 ${tone}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.06] text-slate-300">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="text-lg font-semibold text-white">{value}</p>
          {detail ? <p className="text-[11px] text-slate-500">{detail}</p> : null}
        </div>
      </div>
    </div>
  )
}

export default AdminPage
