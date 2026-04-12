import { useEffect, useState } from 'react'
import { Cpu, Database, HardDrive, Timer, Wifi } from 'lucide-react'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminApi } from '@/services/adminApi'
import { getServerBaseUrl } from '@/config/serverUrl'

function formatUptime(sec) {
  if (sec == null) return '—'
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`
}

function formatBytes(n) {
  if (n == null) return '—'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(2)} MB`
}

export default function AdminSystemPage() {
  const [sys, setSys] = useState(null)
  const [latencyMs, setLatencyMs] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const t0 = performance.now()
        await fetch(`${getServerBaseUrl()}/health`)
        const ms = Math.round(performance.now() - t0)
        if (alive) setLatencyMs(ms)
        const s = await adminApi.system()
        if (alive) setSys(s)
      } catch (e) {
        if (alive) setErr(e.message)
      }
    }
    load()
    const id = setInterval(load, 15000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  const rows = [
    { label: 'REST API', ok: sys?.api?.ok, detail: `Port ${sys?.api?.port ?? '—'}` },
    { label: 'Socket.io engine', ok: sys?.socket?.ok, detail: `${sys?.socket?.connectedClients ?? 0} connections` },
    { label: 'Database', ok: sys?.database?.ok, detail: formatBytes(sys?.database?.sqliteBytes) },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">System status</h1>
        <p className="mt-1 text-sm text-slate-500">Live service view for the Connectly API on this host.</p>
      </div>

      {err ? (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Timer className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Uptime</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{formatUptime(sys?.uptimeSeconds)}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Wifi className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">API latency</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{latencyMs != null ? `${latencyMs} ms` : '—'}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <Cpu className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Error rate</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{sys?.errorRatePercent ?? 0}%</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-slate-500">
            <HardDrive className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Uploads volume</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{formatBytes(sys?.storage?.uploadsBytes)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-white">Service checks</h2>
          <StatusBadge variant={sys?.environment === 'production' ? 'danger' : 'info'} pulse>
            {sys?.environment || 'loading'}
          </StatusBadge>
        </div>
        <ul className="space-y-4">
          {rows.map((r) => (
            <li
              key={r.label}
              className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-slate-600" />
                <div>
                  <p className="font-medium text-slate-200">{r.label}</p>
                  <p className="text-xs text-slate-500">{r.detail}</p>
                </div>
              </div>
              <StatusBadge variant={r.ok ? 'success' : 'danger'} pulse={r.ok}>
                {r.ok ? 'Healthy' : 'Down'}
              </StatusBadge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
