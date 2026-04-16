import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Bell, Lock, Palette, User } from 'lucide-react'
import PageHeader from '../components/connectly/PageHeader'
import ConnectlyPanel from '../components/connectly/ConnectlyPanel'
import SectionHeader from '../components/connectly/SectionHeader'
import Input from '../components/ui/Input'
import ActionButton from '../components/connectly/ActionButton'
import { useAppStore } from '../store/useAppStore'
import { useAuth } from '../contexts/useAuth'
import { Link } from 'react-router-dom'
import { cn } from '../lib/utils'
import { SoundButton, useSoundSettings } from '@/ui-sounds'

const schema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
})

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Lock },
]

function SettingsPage() {
  const { enabled: uiSoundsEnabled, setEnabled: setUiSoundsEnabled } = useSoundSettings()
  const pushToast = useAppStore((state) => state.pushToast)
  const { user } = useAuth()
  const [tab, setTab] = useState('profile')
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Tune how Connectly feels and behaves. Changes apply to this browser session."
      />

      <div className="flex flex-col gap-6 lg:flex-row">
        <nav className="flex shrink-0 flex-wrap gap-2 lg:w-52 lg:flex-col">
          {tabs.map((t) => {
            const Icon = t.icon
            return (
              <SoundButton
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition',
                  tab === t.id
                    ? 'border-blue-500/35 bg-blue-500/10 text-blue-100 shadow-[0_0_20px_-10px_rgba(59,130,246,0.45)]'
                    : 'border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.12] hover:text-slate-200',
                )}
              >
                <Icon className="h-4 w-4 opacity-80" strokeWidth={2} />
                {t.label}
              </SoundButton>
            )
          })}
        </nav>

        <div className="min-w-0 flex-1 space-y-4">
          {tab === 'profile' && (
            <ConnectlyPanel>
              <SectionHeader title="Profile" description="Your identity in the workspace" />
              <p className="text-sm text-slate-400">
                Signed in as <span className="font-medium text-slate-200">{user?.email}</span>
              </p>
              <Link
                to="/app/profile"
                className="mt-4 inline-flex text-sm font-medium text-blue-400 hover:text-blue-300"
              >
                Open full profile →
              </Link>
            </ConnectlyPanel>
          )}

          {tab === 'appearance' && (
            <ConnectlyPanel>
              <SectionHeader title="Appearance" description="Dark-first workspace (toggle also in the top bar)" />
              <p className="text-sm text-slate-500">
                Connectly is optimized for deep navy surfaces. Use the sun/moon control in the header to switch when you
                need it.
              </p>
              <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm transition hover:border-white/[0.12]">
                <span>
                  <span className="block font-medium text-slate-200">UI interaction sounds</span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Subtle hover and click feedback across buttons and links. Stored in this browser.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={uiSoundsEnabled}
                  onChange={(e) => setUiSoundsEnabled(e.target.checked)}
                  className="accent-blue-500"
                />
              </label>
            </ConnectlyPanel>
          )}

          {tab === 'notifications' && (
            <ConnectlyPanel>
              <SectionHeader title="Notifications" />
              <div className="space-y-2">
                {[
                  ['Push notifications', true],
                  ['Message sounds (chat)', true],
                  ['Email digests', false],
                ].map(([label, def]) => (
                  <label
                    key={label}
                    className="flex cursor-pointer items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm transition hover:border-white/[0.12]"
                  >
                    <span className="text-slate-200">{label}</span>
                    <input type="checkbox" defaultChecked={def} className="accent-blue-500" />
                  </label>
                ))}
              </div>
            </ConnectlyPanel>
          )}

          {tab === 'security' && (
            <ConnectlyPanel>
              <SectionHeader title="Security" description="Password changes go through your Connectly account" />
              <form
                onSubmit={handleSubmit(() =>
                  pushToast({ title: 'Saved', description: 'Password update simulated for this demo.' }),
                )}
                className="mt-2 max-w-md space-y-3"
              >
                <Input type="password" placeholder="Current password" {...register('currentPassword')} />
                <Input type="password" placeholder="New password" {...register('newPassword')} />
                <ActionButton variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Update password'}
                </ActionButton>
              </form>
            </ConnectlyPanel>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
