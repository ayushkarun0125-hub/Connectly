import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown, Plus } from 'lucide-react'
import { iconButton, inputGlass } from './styles'
import { SoundButton } from '@/ui-sounds'

function AppTopbar({ user, isSignedIn, onLogout, onCreateRoom }) {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const display = user?.displayName || user?.email || 'Account'
  const initial = display.slice(0, 1).toUpperCase()

  return (
    <header className="sticky top-0 z-30 flex min-h-[60px] items-center gap-3 border-b border-slate-200/80 bg-white/85 px-4 py-2.5 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#07111f]/85 md:gap-4 md:px-5">
      <div className="relative min-w-0 flex-1 md:max-w-xl lg:max-w-2xl">
        <input
          type="search"
          placeholder="Search rooms, people, and files..."
          className={inputGlass}
          aria-label="Search"
        />
      </div>
      <SoundButton type="button" className={iconButton} aria-label="Notifications">
        <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </SoundButton>
      <SoundButton
        type="button"
        onClick={onCreateRoom}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-500 active:scale-95 md:hidden"
        aria-label="Create Room"
      >
        <Plus className="h-[18px] w-[18px]" strokeWidth={2.5} />
      </SoundButton>
      <SoundButton
        type="button"
        onClick={onCreateRoom}
        className="hidden shrink-0 items-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:scale-[1.02] hover:bg-blue-500 hover:shadow-blue-500/35 active:scale-[0.98] md:inline-flex"
      >
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Create Room
      </SoundButton>

      {isSignedIn && user ? (
        <div className="relative shrink-0" ref={profileRef}>
          <SoundButton
            type="button"
            onClick={() => setProfileOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-slate-200/90 bg-white py-1 pl-1 pr-2 transition hover:border-slate-300 dark:border-white/[0.08] dark:bg-[#0d1729] dark:hover:border-white/[0.14]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">
              {initial}
            </span>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition ${profileOpen ? 'rotate-180' : ''}`} />
          </SoundButton>
          {profileOpen ? (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200/90 bg-white py-1 shadow-2xl dark:border-white/[0.08] dark:bg-[#0d1729]">
              <div className="border-b border-slate-200/80 px-3 py-2.5 dark:border-white/[0.06]">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{display}</p>
                <p className="truncate text-xs text-slate-500">{user.email}</p>
              </div>
              <SoundButton
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/app/profile')
                }}
                className="block w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06]"
              >
                My profile
              </SoundButton>
              <SoundButton
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  navigate('/app/settings')
                }}
                className="block w-full px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.06]"
              >
                Settings
              </SoundButton>
              <SoundButton
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  onLogout()
                  navigate('/')
                }}
                className="block w-full px-3 py-2.5 text-left text-sm text-rose-600 hover:bg-slate-100 dark:text-rose-400 dark:hover:bg-white/[0.06]"
              >
                Sign out
              </SoundButton>
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  )
}

export default AppTopbar
