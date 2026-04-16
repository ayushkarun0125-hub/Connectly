import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/useAuth'
import { cn } from '../lib/utils'
import { postAuthDestination } from '../lib/postAuthRedirect'
import { SoundButton, useUISounds } from '@/ui-sounds'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/features', label: 'Features' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/why-connectly', label: 'Why Connectly' },
  { to: '/demo', label: 'Live Demo' },
  { to: '/get-started', label: 'Get Started' },
  { to: '/contact', label: 'Contact Sales' },
]

function PublicNav() {
  const { playHover, playClick } = useUISounds()
  const { isSignedIn, logout, loading, user } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const profileTarget = useMemo(() => postAuthDestination(user), [user])
  const avatarUrl = user?.avatarUrl || ''
  const displayName = user?.displayName || user?.email || 'User'
  const initials = String(displayName)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U'

  useEffect(() => {
    function onPointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])
  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-5 sm:px-6 sm:pt-6">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'pointer-events-auto flex w-full max-w-7xl flex-col gap-4 rounded-2xl border border-white/[0.08]',
          'bg-[#0a0f1a]/75 px-4 py-3.5 shadow-[0_8px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.04)_inset,0_1px_0_rgba(255,255,255,0.06)_inset]',
          'backdrop-blur-xl backdrop-saturate-150 md:flex-row md:items-center md:justify-between md:gap-4 md:px-8 md:py-4',
        )}
      >
        <Link
          to="/"
          onMouseEnter={() => playHover()}
          onClick={() => playClick()}
          className="shrink-0 text-lg font-semibold tracking-tight text-white transition hover:text-blue-200"
        >
          Connectly
        </Link>

        <div className="-mx-1 flex min-h-[2.5rem] flex-1 items-center gap-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] md:mx-0 md:flex-wrap md:justify-center md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onMouseEnter={() => playHover()}
              onClick={() => playClick()}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-lg px-2 py-1.5 text-sm transition md:text-[15px]',
                  isActive
                    ? 'bg-blue-500/15 text-blue-200 ring-1 ring-blue-400/30'
                    : 'text-slate-400 hover:bg-white/[0.06] hover:text-white',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex min-h-[2.75rem] min-w-[220px] shrink-0 items-center justify-end gap-2 sm:gap-3 md:gap-4">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-9 w-16 animate-pulse rounded-xl bg-white/[0.06]" />
              <div className="h-9 w-20 animate-pulse rounded-xl bg-white/[0.06]" />
              <div className="h-10 w-10 animate-pulse rounded-full bg-white/[0.06]" />
            </div>
          ) : !isSignedIn ? (
            <>
              <Link
                to="/login"
                onMouseEnter={() => playHover()}
                onClick={() => playClick()}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white sm:px-4 md:text-base"
              >
                Login
              </Link>
              <Link
                to="/sign-up"
                onMouseEnter={() => playHover()}
                onClick={() => playClick()}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-4px_rgba(37,99,235,0.55)] transition hover:bg-blue-500 sm:px-5 md:px-6 md:text-base"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="relative" ref={menuRef}>
              <SoundButton
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-white/[0.16] bg-white/[0.04] text-xs font-semibold text-white shadow-[0_0_22px_-10px_rgba(96,165,250,0.7)] transition hover:border-white/[0.24] hover:bg-white/[0.08]"
                aria-label="Open account menu"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </SoundButton>
              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-white/[0.12] bg-[#0a0f1a]/90 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.75)] backdrop-blur-xl">
                  <SoundButton
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate(profileTarget)
                    }}
                    className="block w-full px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-white/[0.07]"
                  >
                    Dashboard
                  </SoundButton>
                  <SoundButton
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate('/app/profile')
                    }}
                    className="block w-full px-3 py-2.5 text-left text-sm text-slate-200 transition hover:bg-white/[0.07]"
                  >
                    Profile / Account
                  </SoundButton>
                  <SoundButton
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                      navigate('/login')
                    }}
                    className="block w-full px-3 py-2.5 text-left text-sm text-rose-300 transition hover:bg-white/[0.07]"
                  >
                    Sign out
                  </SoundButton>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </motion.nav>
    </header>
  )
}

function PublicFooter() {
  return (
    <footer className="relative mt-20 border-t border-white/[0.06] bg-[#030712]/55 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-4 md:gap-12 lg:px-12">
        <div className="md:col-span-2">
          <p className="text-xl font-bold text-white">Connectly</p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-500">
            Premium real-time collaboration for fast-moving teams: chat, whiteboard, file activity, and presence in one platform.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Product</p>
          <nav className="mt-4 flex flex-col gap-2 text-sm text-slate-500">
            <Link to="/features" className="transition hover:text-slate-200">Features</Link>
            <Link to="/pricing" className="transition hover:text-slate-200">Pricing</Link>
            <Link to="/demo" className="transition hover:text-slate-200">Live Demo</Link>
            <Link to="/get-started" className="transition hover:text-slate-200">Get Started</Link>
          </nav>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Company</p>
          <nav className="mt-4 flex flex-col gap-2 text-sm text-slate-500">
            <Link to="/why-connectly" className="transition hover:text-slate-200">Why Connectly</Link>
            <Link to="/contact" className="transition hover:text-slate-200">Contact Sales</Link>
            <Link to="/login" className="transition hover:text-slate-200">Login</Link>
            <Link to="/sign-up" className="transition hover:text-slate-200">Sign Up</Link>
          </nav>
        </div>
      </div>
      <div className="border-t border-white/[0.05] py-6 text-center text-sm text-slate-600">
        Connectly © 2026 · Built for modern collaboration
      </div>
    </footer>
  )
}

function PublicLayout() {
  return (
    <div className="relative min-h-dvh overflow-x-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 100% 80% at 50% -30%, rgba(59, 130, 246, 0.22), transparent 55%),
              radial-gradient(ellipse 60% 50% at 0% 0%, rgba(99, 102, 241, 0.18), transparent 50%),
              radial-gradient(ellipse 55% 45% at 100% 10%, rgba(6, 182, 212, 0.12), transparent 45%)
            `,
          }}
        />
        <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(to_right,rgba(148,163,184,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.045)_1px,transparent_1px)] [background-size:56px_56px] [background-attachment:fixed]" />
      </div>
      <PublicNav />
      <div className="h-[5.25rem] sm:h-[5.75rem]" aria-hidden />
      <main className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 xl:px-14">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}

export default PublicLayout
