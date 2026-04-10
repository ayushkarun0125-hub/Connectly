import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Mail, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import PageHeader from '../components/connectly/PageHeader'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'
import SearchInput from '../components/connectly/SearchInput'
import ActionButton from '../components/connectly/ActionButton'
import Badge from '../components/ui/Badge'
import { useAuth } from '../contexts/useAuth'
import { mockUsers } from '../mock/data'
import { useAppStore } from '../store/useAppStore'

function TeamPage() {
  const { user } = useAuth()
  const pushToast = useAppStore((s) => s.pushToast)
  const [q, setQ] = useState('')

  const rows = useMemo(() => {
    const me = user
      ? [
          {
            id: user.id || 'me',
            name: user.displayName || user.email || 'You',
            email: user.email || '',
            role: user.role || 'user',
            online: true,
            lastActive: 'Now',
            isSelf: true,
          },
        ]
      : []
    const rest = mockUsers.map((u, i) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      online: i < 2,
      lastActive: i < 2 ? 'Now' : `${2 + i}h ago`,
      isSelf: false,
    }))
    const merged = [...me, ...rest.filter((r) => r.email !== user?.email)]
    const s = q.trim().toLowerCase()
    if (!s) return merged
    return merged.filter(
      (r) => r.name.toLowerCase().includes(s) || r.email.toLowerCase().includes(s),
    )
  }, [user, q])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description="People in your workspace. Presence and roles update from the directory and chat."
        action={(
          <ActionButton
            variant="primary"
            onClick={() =>
              pushToast({
                title: 'Invites',
                description: 'Share room invite codes from any chat header to add teammates.',
              })
            }
          >
            <UserPlus className="h-4 w-4" strokeWidth={2} />
            Invite member
          </ActionButton>
        )}
      />

      <ConnectlyPanel>
        <div className="mb-6 flex max-w-lg flex-col gap-4 sm:flex-row sm:items-center">
          <SearchInput
            placeholder="Search people..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1"
            iconClassName="left-3.5"
          />
          <Link
            to="/app/profile"
            className="shrink-0 text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            My profile →
          </Link>
        </div>

        <ul className="grid gap-3 md:grid-cols-2">
          {rows.map((member) => (
            <motion.li
              key={member.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4 transition hover:border-white/[0.14] hover:bg-white/[0.05]"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500/30 to-indigo-600/40 text-lg font-bold text-white">
                    {member.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0d1729] ${
                      member.online ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]' : 'bg-slate-500'
                    }`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">{member.name}</span>
                    {member.isSelf ? (
                      <Badge color="blue">You</Badge>
                    ) : (
                      <Badge color={member.role === 'admin' ? 'blue' : 'slate'}>{member.role}</Badge>
                    )}
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Mail className="h-3 w-3" />
                    {member.email}
                  </p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                    <Clock className="h-3 w-3 text-slate-500" strokeWidth={2} />
                    Last active · <span className="text-slate-400">{member.lastActive}</span>
                  </p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </ConnectlyPanel>
    </div>
  )
}

export default TeamPage
