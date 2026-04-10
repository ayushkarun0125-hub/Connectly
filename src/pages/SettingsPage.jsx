import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useAppStore } from '../store/useAppStore'

const schema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
})

function SettingsPage() {
  const pushToast = useAppStore((state) => state.pushToast)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({ resolver: zodResolver(schema) })

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <h1 className="text-lg font-semibold">Preferences</h1>
        <div className="mt-4 space-y-3 text-sm">
          <label className="flex items-center justify-between rounded-xl border border-slate-800 p-3"><span>Push notifications</span><input type="checkbox" defaultChecked /></label>
          <label className="flex items-center justify-between rounded-xl border border-slate-800 p-3"><span>Message sounds</span><input type="checkbox" defaultChecked /></label>
          <label className="flex items-center justify-between rounded-xl border border-slate-800 p-3"><span>Auto-join recent room</span><input type="checkbox" /></label>
        </div>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold">Change Password</h2>
        <form onSubmit={handleSubmit(() => pushToast({ title: 'Saved', description: 'Password updated (mock)' }))} className="mt-4 space-y-3">
          <Input type="password" placeholder="Current password" {...register('currentPassword')} />
          <Input type="password" placeholder="New password" {...register('newPassword')} />
          <Button disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save changes'}</Button>
        </form>
      </Card>
    </div>
  )
}

export default SettingsPage
