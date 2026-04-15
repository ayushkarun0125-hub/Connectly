import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Clock, Copy, Link2, Mail, MessageCircle, RotateCcw, Trash2, UserPlus } from 'lucide-react'
import { motion } from 'framer-motion'
import PageHeader from '../components/connectly/PageHeader'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'
import SearchInput from '../components/connectly/SearchInput'
import ActionButton from '../components/connectly/ActionButton'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Skeleton from '../components/ui/Skeleton'
import { useAuth } from '../contexts/useAuth'
import { useAppStore } from '../store/useAppStore'
import {
  addWorkspaceMember,
  fetchWorkspaceMembers,
  removeWorkspaceMember,
  restoreWorkspaceMember,
} from '../services/workspaceService'
import { cn } from '../lib/utils'
import { createReport } from '../services/reportService'
import { ensureDmConversation } from '../services/dmService'

function TeamPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const pushToast = useAppStore((s) => s.pushToast)
  const [q, setQ] = useState('')
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const [addOpen, setAddOpen] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addPassword, setAddPassword] = useState('')
  const [addName, setAddName] = useState('')
  const [addBusy, setAddBusy] = useState(false)

  const [removeTarget, setRemoveTarget] = useState(null)
  const [removeBusy, setRemoveBusy] = useState(false)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [reportUser, setReportUser] = useState(null)
  const [reportBusy, setReportBusy] = useState(false)

  const canManage = user?.role === 'admin' || user?.role === 'moderator'
  const canAdd = user?.role === 'admin'

  const signupUrl = typeof window !== 'undefined' ? `${window.location.origin}/signup` : ''
  const joinRoomUrl = typeof window !== 'undefined' ? `${window.location.origin}/app/rooms/join` : ''

  async function copyText(text, description) {
    try {
      await navigator.clipboard.writeText(text)
      pushToast({ title: 'Copied', description })
    } catch {
      pushToast({ title: 'Copy failed', description: 'Select and copy the link manually.' })
    }
  }

  const loadMembers = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const list = await fetchWorkspaceMembers()
      setMembers(Array.isArray(list) ? list : [])
    } catch (e) {
      setLoadError(e?.message || 'Could not load the team.')
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const visibleRows = useMemo(() => {
    let list = members
    if (!canManage) {
      list = list.filter((m) => (m.accountStatus || 'active') === 'active')
    }
    const s = q.trim().toLowerCase()
    if (s) {
      list = list.filter(
        (m) =>
          (m.displayName || '').toLowerCase().includes(s) ||
          (m.email || '').toLowerCase().includes(s),
      )
    }
    return list
  }, [members, q, canManage])

  async function submitAddMember() {
    const email = addEmail.trim().toLowerCase()
    const password = addPassword
    const displayName = addName.trim() || 'User'
    if (!email || !password) {
      pushToast({ title: 'Missing fields', description: 'Email and password are required.' })
      return
    }
    if (password.length < 6) {
      pushToast({ title: 'Password too short', description: 'Use at least 6 characters.' })
      return
    }
    setAddBusy(true)
    try {
      await addWorkspaceMember({ email, password, displayName })
      pushToast({ title: 'Member added', description: `${email} can sign in with the password you set.` })
      setAddOpen(false)
      setAddEmail('')
      setAddPassword('')
      setAddName('')
      await loadMembers()
    } catch (e) {
      pushToast({ title: 'Could not add member', description: e?.message || 'Try again.' })
    } finally {
      setAddBusy(false)
    }
  }

  async function confirmRemove() {
    if (!removeTarget?.id) return
    setRemoveBusy(true)
    try {
      await removeWorkspaceMember(removeTarget.id)
      pushToast({
        title: 'Member removed',
        description: `${removeTarget.displayName || removeTarget.email} no longer has workspace access.`,
      })
      setRemoveTarget(null)
      await loadMembers()
    } catch (e) {
      pushToast({ title: 'Could not remove', description: e?.message || 'Try again.' })
    } finally {
      setRemoveBusy(false)
    }
  }

  async function handleRestore(m) {
    try {
      await restoreWorkspaceMember(m.id)
      pushToast({ title: 'Access restored', description: `${m.displayName || m.email} can sign in again.` })
      await loadMembers()
    } catch (e) {
      pushToast({ title: 'Could not restore', description: e?.message || 'Try again.' })
    }
  }

  async function submitUserReport() {
    if (!reportUser?.id) return
    setReportBusy(true)
    try {
      await createReport({
        type: 'user',
        targetUserId: reportUser.id,
        reason: 'Harassment or abuse',
      })
      pushToast({ title: 'Report submitted', description: 'Moderators were notified.' })
      setReportUser(null)
    } catch (e) {
      pushToast({ title: 'Could not submit report', description: e?.message || 'Try again.' })
    } finally {
      setReportBusy(false)
    }
  }

  async function openDirectMessage(member) {
    try {
      const data = await ensureDmConversation(member.id)
      navigate(`/app/dm/${encodeURIComponent(data.conversationId)}`)
    } catch (e) {
      pushToast({ title: 'Could not open DM', description: e?.message || 'Try again.' })
    }
  }

  const headerDescription = canAdd
    ? 'People in your workspace. You can create accounts here; admins and moderators can remove or restore access.'
    : canManage
      ? 'People in your workspace. Use Invite to share signup links. You can remove or restore access for members.'
      : 'Browse teammates, copy contact details, and invite others with a signup link or a room invite code from chat.'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        description={headerDescription}
        action={(
          <div className="flex flex-wrap gap-2">
            {canAdd ? (
              <ActionButton variant="primary" onClick={() => setAddOpen(true)}>
                <UserPlus className="h-4 w-4" strokeWidth={2} />
                Add member
              </ActionButton>
            ) : null}
            <ActionButton variant={canAdd ? 'secondary' : 'primary'} onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4" strokeWidth={2} />
              Invite people
            </ActionButton>
          </div>
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
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link
              to="/app/profile"
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              My profile →
            </Link>
            <Link
              to="/app/rooms/room_design"
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-slate-200"
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
              #design
            </Link>
          </div>
        </div>

        {!canManage ? (
          <p className="mb-4 text-xs text-slate-500">
            Need someone on the team? Use <span className="text-slate-400">Invite people</span> for the signup link, or
            paste a room code from any chat header.
          </p>
        ) : null}

        {loading ? (
          <div className="grid gap-3 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-2xl bg-white/[0.06]" />
            ))}
          </div>
        ) : loadError ? (
          <p className="text-sm text-rose-300">{loadError}</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {visibleRows.map((member) => {
              const isSelf = member.id === user?.id
              const suspended = (member.accountStatus || 'active') !== 'active'
              return (
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
                        {(member.displayName || member.email || '?').slice(0, 1).toUpperCase()}
                      </span>
                      {!suspended ? (
                        <span
                          className={cn(
                            'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#0d1729]',
                            isSelf
                              ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]'
                              : 'bg-slate-500',
                          )}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-white">{member.displayName || 'User'}</span>
                        {isSelf ? (
                          <Badge color="blue">You</Badge>
                        ) : (
                          <Badge color={member.role === 'admin' ? 'blue' : 'slate'}>{member.role}</Badge>
                        )}
                        {suspended ? (
                          <Badge color="rose">Removed</Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Mail className="h-3 w-3" />
                        {member.email}
                      </p>
                      <p className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                        <Clock className="h-3 w-3 text-slate-500" strokeWidth={2} />
                        Joined ·{' '}
                        <span className="text-slate-400">
                          {member.createdAt
                            ? new Date(member.createdAt).toLocaleDateString()
                            : '—'}
                        </span>
                      </p>
                      {canManage && !isSelf ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {suspended ? (
                            <button
                              type="button"
                              onClick={() => handleRestore(member)}
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                            >
                              <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                              Restore access
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setRemoveTarget(member)}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-500/35 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-200 transition hover:bg-rose-500/20"
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                              Remove from workspace
                            </button>
                          )}
                        </div>
                      ) : null}
                      {!isSelf && !suspended ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              copyText(member.email, `${member.email} copied to clipboard.`)
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:bg-white/[0.09]"
                          >
                            <Copy className="h-3.5 w-3.5" strokeWidth={2} />
                            Copy email
                          </button>
                          <a
                            href={member.email ? `mailto:${member.email}` : undefined}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.05] px-2.5 py-1 text-xs font-medium text-slate-200 transition hover:bg-white/[0.09]"
                          >
                            <Mail className="h-3.5 w-3.5" strokeWidth={2} />
                            Email
                          </a>
                          <Link
                            to="/app/rooms/room_design"
                            className="inline-flex items-center gap-1 rounded-lg border border-blue-500/25 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-200 transition hover:bg-blue-500/15"
                          >
                            <MessageCircle className="h-3.5 w-3.5" strokeWidth={2} />
                            Chat in #design
                          </Link>
                          <button
                            type="button"
                            onClick={() => openDirectMessage(member)}
                            className="inline-flex items-center gap-1 rounded-lg border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-200 transition hover:bg-violet-500/20"
                          >
                            DM
                          </button>
                          <button
                            type="button"
                            onClick={() => setReportUser(member)}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200 transition hover:bg-amber-500/20"
                          >
                            Report user
                          </button>
                        </div>
                      ) : null}
                      {!canManage && isSelf ? (
                        <div className="mt-3">
                          <Link
                            to="/app/profile"
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300"
                          >
                            Edit your profile →
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.li>
              )
            })}
          </ul>
        )}

        {!loading && !loadError && visibleRows.length === 0 ? (
          <p className="text-center text-sm text-slate-500">
            {q.trim()
              ? 'No people match your search.'
              : 'No teammates listed yet. Invite others with the button above or ask an admin to add accounts.'}
          </p>
        ) : null}
      </ConnectlyPanel>

      <Modal open={inviteOpen} title="Invite people to the workspace" onClose={() => setInviteOpen(false)}>
        <p className="text-sm text-slate-400">
          Share the signup link so they can create an account, or send them to join a room with an invite code from
          chat.
        </p>
        <div className="mt-4 space-y-3 rounded-2xl border border-white/[0.08] bg-[#07111f] p-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Signup page</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-300">{signupUrl || '—'}</p>
            <ActionButton
              variant="secondary"
              className="mt-2 w-full sm:w-auto"
              onClick={() => signupUrl && copyText(signupUrl, 'Signup link copied.')}
            >
              <Copy className="mr-1 h-3.5 w-3.5" strokeWidth={2} />
              Copy signup link
            </ActionButton>
          </div>
          <div className="border-t border-white/[0.06] pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Join with a room code</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-300">{joinRoomUrl || '—'}</p>
            <ActionButton
              variant="secondary"
              className="mt-2 w-full sm:w-auto"
              onClick={() => joinRoomUrl && copyText(joinRoomUrl, 'Join page link copied.')}
            >
              <Link2 className="mr-1 h-3.5 w-3.5" strokeWidth={2} />
              Copy join page link
            </ActionButton>
          </div>
          <div className="border-t border-white/[0.06] pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Open team chat</p>
            <Link
              to="/app/rooms/room_design"
              className="mt-1 inline-flex text-sm font-medium text-blue-400 hover:text-blue-300"
              onClick={() => setInviteOpen(false)}
            >
              Go to #design →
            </Link>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <ActionButton variant="ghost" onClick={() => setInviteOpen(false)}>
            Done
          </ActionButton>
        </div>
      </Modal>

      <Modal open={addOpen} title="Add workspace member" onClose={() => !addBusy && setAddOpen(false)}>
        <p className="text-sm text-slate-400">
          Creates a new account. Share the email and password with them so they can sign in.
        </p>
        <label className="mt-4 block">
          <span className="mb-1 block text-xs text-slate-500">Email</span>
          <input
            type="email"
            value={addEmail}
            onChange={(e) => setAddEmail(e.target.value)}
            autoComplete="off"
            className="w-full rounded-xl border border-white/[0.1] bg-[#07111f] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs text-slate-500">Display name</span>
          <input
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            className="w-full rounded-xl border border-white/[0.1] bg-[#07111f] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
          />
        </label>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs text-slate-500">Temporary password</span>
          <input
            type="password"
            value={addPassword}
            onChange={(e) => setAddPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full rounded-xl border border-white/[0.1] bg-[#07111f] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500/50"
          />
        </label>
        <div className="mt-4 flex justify-end gap-2">
          <ActionButton variant="ghost" disabled={addBusy} onClick={() => setAddOpen(false)}>
            Cancel
          </ActionButton>
          <ActionButton variant="primary" disabled={addBusy} onClick={submitAddMember}>
            {addBusy ? 'Adding…' : 'Add member'}
          </ActionButton>
        </div>
      </Modal>

      <Modal
        open={Boolean(removeTarget)}
        title="Remove from workspace?"
        onClose={() => !removeBusy && setRemoveTarget(null)}
      >
        <p className="text-sm text-slate-300">
          <span className="font-medium text-white">{removeTarget?.displayName || removeTarget?.email}</span> will
          not be able to sign in until an admin or moderator restores their access.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <ActionButton variant="ghost" disabled={removeBusy} onClick={() => setRemoveTarget(null)}>
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            className="!bg-rose-600 hover:!bg-rose-500"
            disabled={removeBusy}
            onClick={confirmRemove}
          >
            {removeBusy ? 'Removing…' : 'Remove'}
          </ActionButton>
        </div>
      </Modal>

      <Modal open={Boolean(reportUser)} title="Report user" onClose={() => !reportBusy && setReportUser(null)}>
        <p className="text-sm text-slate-300">
          Report <span className="font-medium text-white">{reportUser?.displayName || reportUser?.email}</span> for moderation review.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <ActionButton variant="ghost" disabled={reportBusy} onClick={() => setReportUser(null)}>
            Cancel
          </ActionButton>
          <ActionButton variant="primary" disabled={reportBusy} onClick={submitUserReport}>
            {reportBusy ? 'Submitting…' : 'Submit report'}
          </ActionButton>
        </div>
      </Modal>
    </div>
  )
}

export default TeamPage
