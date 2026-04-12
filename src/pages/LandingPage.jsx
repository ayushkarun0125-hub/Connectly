import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  MessageSquareText,
  PenTool,
  Users,
  FolderUp,
  Database,
  Sparkles,
  Globe,
  Send,
  Rocket,
  MessageCircle,
} from 'lucide-react'
import { useAuth } from '../contexts/useAuth'
import { cn } from '../lib/utils'
import PricingSection4 from '../components/ui/pricing-section-4'

const sectionReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
}

const features = [
  {
    title: 'Multi-room Real-time Chat',
    description:
      'Keep engineering, design, and product aligned with room-based messaging that updates instantly.',
    icon: MessageSquareText,
  },
  {
    title: 'Collaborative Whiteboard',
    description:
      'Sketch architecture, flows, and ideas together with low-latency drawing for distributed teams.',
    icon: PenTool,
  },
  {
    title: 'Live Presence System',
    description:
      'Know who is active, typing, or joining in real time so conversations feel human and immediate.',
    icon: Users,
  },
  {
    title: 'File and Media Sharing',
    description:
      'Share screenshots, docs, and assets directly in context with clean previews and metadata.',
    icon: FolderUp,
  },
  {
    title: 'Persistent Room History',
    description:
      'Never lose context. Message history and room activity stay accessible for fast onboarding.',
    icon: Database,
  },
  {
    title: 'Startup-ready Experience',
    description:
      'A polished collaboration layer that looks investor-ready for demos, launches, and production MVPs.',
    icon: Sparkles,
  },
]

const whyBullets = [
  'Create or join a room for your team workflow',
  'Collaborate through chat, whiteboard, and shared files',
  'Stay synchronized with real-time events and persistent history',
]

function FadeSection({ children, className, id }) {
  const reduce = useReducedMotion()
  if (reduce) {
    return (
      <section id={id} className={className}>
        {children}
      </section>
    )
  }
  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -8% 0px' }}
      variants={sectionReveal}
    >
      {children}
    </motion.section>
  )
}

const landingNavLinkClass =
  'whitespace-nowrap rounded-lg px-2 py-1.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-white'

function NavBar() {
  const { isSignedIn, logout } = useAuth()

  return (
    <header className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-5 sm:px-6 sm:pt-6">
      <motion.nav
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'pointer-events-auto flex w-full max-w-6xl flex-col gap-4 rounded-2xl border border-white/[0.08]',
          'bg-[#0a0f1a]/75 px-4 py-3.5 shadow-[0_8px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.04)_inset,0_1px_0_rgba(255,255,255,0.06)_inset]',
          'backdrop-blur-xl backdrop-saturate-150 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-4 md:px-8 md:py-4',
        )}
        aria-label="Primary"
      >
        <div className="flex min-w-0 items-center justify-between gap-3 md:min-w-[8.5rem] md:justify-start">
          <Link
            to="/"
            className="shrink-0 text-base font-semibold tracking-tight text-white transition hover:text-blue-200 md:text-lg"
          >
            Connectly
          </Link>
        </div>

        <div
          className={cn(
            '-mx-1 flex min-h-[2.5rem] flex-1 items-center gap-1 overflow-x-auto px-1 pb-0.5 [scrollbar-width:none] sm:mx-0 sm:gap-0.5 sm:px-0 sm:pb-0 md:flex-wrap md:justify-center md:overflow-visible',
            '[&::-webkit-scrollbar]:hidden',
          )}
          role="navigation"
          aria-label="On this page"
        >
          <a href="#overview" className={cn(landingNavLinkClass, 'text-sm md:text-[15px]')}>
            Overview
          </a>
          <a href="#features" className={cn(landingNavLinkClass, 'text-sm md:text-[15px]')}>
            Features
          </a>
          <a href="#pricing" className={cn(landingNavLinkClass, 'text-sm md:text-[15px]')}>
            Pricing
          </a>
          <a href="#why-connectly" className={cn(landingNavLinkClass, 'text-sm md:text-[15px]')}>
            Why Connectly
          </a>
          <a href="#get-started" className={cn(landingNavLinkClass, 'text-sm md:text-[15px]')}>
            Get started
          </a>
          <Link to="/app" className={cn(landingNavLinkClass, 'text-sm md:text-[15px]')}>
            Live demo
          </Link>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3 md:gap-4">
          {!isSignedIn ? (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white sm:px-4 md:text-base"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_24px_-4px_rgba(37,99,235,0.55)] transition hover:bg-blue-500 hover:shadow-[0_0_28px_-4px_rgba(59,130,246,0.65)] sm:px-5 md:px-6 md:text-base"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/app"
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-300/95 transition hover:bg-white/[0.06] sm:px-4 md:text-base"
              >
                Open app
              </Link>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-white/[0.1] bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08] sm:px-4 md:text-base"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </motion.nav>
    </header>
  )
}

function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div
        className="pointer-events-none absolute -inset-5 rounded-[32px] bg-gradient-to-br from-blue-500/25 via-indigo-500/12 to-cyan-500/20 opacity-70 blur-2xl"
        aria-hidden
      />
      <div
        className="relative overflow-hidden rounded-[28px] border border-white/[0.1] bg-[#070b14]/90 shadow-[0_24px_80px_-20px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.05)_inset] lg:min-h-[420px]"
        style={{ backdropFilter: 'blur(20px)' }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4 md:px-7 md:py-5">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <p className="text-base font-medium text-slate-200">Product Preview</p>
          <span className="rounded-full border border-emerald-500/35 bg-emerald-500/[0.12] px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-300">
            Live
          </span>
        </div>
        <div className="grid gap-0 md:grid-cols-[1.15fr_0.85fr]">
          <div className="border-b border-white/[0.06] p-6 md:border-b-0 md:border-r md:p-7 lg:p-8">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Chat stream
            </p>
            <div className="space-y-3.5 md:space-y-4">
              {[
                { who: 'Aaryan', abbr: 'A', msg: 'Pushed room moderation update — review in #ops', tone: 'muted' },
                { who: 'Ayush', abbr: 'Ay', msg: 'Whiteboard flow looks great. Ship it?', tone: 'accent' },
                { who: 'Dhruv', abbr: 'D', msg: 'Deploying socket patch now — ETA2m', tone: 'muted' },
              ].map((row) => (
                <div
                  key={row.who}
                  className={cn(
                    'flex gap-3.5 rounded-xl border px-4 py-3 md:px-4 md:py-3.5',
                    row.tone === 'accent'
                      ? 'border-blue-500/25 bg-blue-500/[0.08]'
                      : 'border-white/[0.06] bg-white/[0.03]',
                  )}
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-sm font-bold text-white">
                    {row.abbr}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-300">{row.who}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-400">{row.msg}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 md:p-7 lg:p-8">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Presence + files
            </p>
            <div className="space-y-3 md:space-y-3.5">
              {[
                { label: '9 active users', dot: 'emerald' },
                { label: 'wireframe-v2.png uploaded', dot: 'blue' },
                { label: 'room_design synchronized', dot: 'emerald' },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center gap-3.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 md:py-3.5"
                >
                  <span
                    className={cn(
                      'h-2.5 w-2.5 shrink-0 rounded-full',
                      row.dot === 'emerald' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.45)]' : 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.45)]',
                    )}
                  />
                  <span className="text-sm text-slate-300">{row.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function LandingPage() {
  return (
    <main className="relative min-h-dvh overflow-x-hidden text-slate-100">
      {/* Accent overlays only — base color + motion come from global FlowField backdrop */}
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

      <NavBar />

      {/* Offset fixed navbar */}
      <div className="h-[5.25rem] sm:h-[5.75rem]" aria-hidden />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 xl:px-14">
        {/* Hero */}
        <section id="overview" className="relative scroll-mt-28 pb-14 pt-1 md:scroll-mt-32 md:pb-20 md:pt-2 lg:pb-24">
          <div className="relative min-h-0 overflow-hidden rounded-[32px] border border-white/[0.09] bg-gradient-to-b from-[#0c1220]/95 to-[#080d18]/95 p-8 shadow-[0_32px_120px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:p-11 md:p-14 lg:min-h-[min(620px,calc(100vh-12rem))] lg:p-16 xl:p-[4.5rem]">
            <div
              className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-indigo-500/12 blur-3xl"
              aria-hidden
            />
            <div className="relative grid items-center gap-12 lg:grid-cols-[1.12fr_0.88fr] lg:gap-16 xl:gap-20">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="lg:pr-4"
              >
                <p className="inline-flex items-center rounded-full border border-blue-500/35 bg-blue-500/[0.1] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200/95 sm:text-xs">
                  Real-time collaboration operating system
                </p>
                <h1 className="mt-8 text-6xl font-bold leading-[0.96] tracking-tight text-white sm:text-7xl md:text-8xl lg:text-[5.25rem] xl:text-[5.75rem]">
                  Connectly
                </h1>
                <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-400 md:text-xl md:leading-relaxed">
                  Bring chat, whiteboarding, presence, and shared files into one premium workspace built for
                  fast-moving modern teams.
                </p>
                <div className="mt-10 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_32px_-6px_rgba(37,99,235,0.65)] transition hover:bg-blue-500 hover:shadow-[0_0_40px_-6px_rgba(59,130,246,0.7)]"
                  >
                    Start Free
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-8 py-4 text-base font-semibold text-slate-100 transition hover:border-white/[0.18] hover:bg-white/[0.07]"
                  >
                    Login
                  </Link>
                  <Link
                    to="/app"
                    className="inline-flex items-center justify-center rounded-xl border border-emerald-500/35 bg-emerald-500/[0.08] px-8 py-4 text-base font-semibold text-emerald-200/95 transition hover:border-emerald-400/45 hover:bg-emerald-500/[0.14]"
                  >
                    Explore Demo
                  </Link>
                </div>
              </motion.div>
              <div className="lg:pl-2">
                <HeroPreview />
              </div>
            </div>
          </div>
        </section>

        {/* Core capabilities */}
        <FadeSection id="features" className="scroll-mt-28 pb-16 pt-2 md:scroll-mt-32 md:pb-24 md:pt-4 lg:pb-28">
          <div className="mx-auto max-w-4xl text-center md:mx-0 md:max-w-none md:text-left">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400/90">Core capabilities</p>
            <h2 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-[3.25rem] md:leading-[1.1] lg:text-[3.5rem]">
              Everything teams need for real-time collaboration
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-slate-400 md:mx-0 md:text-xl">
              Connectly combines messaging, visual collaboration, and shared context in one cohesive platform.
            </p>
          </div>
          <motion.div
            className="mt-12 grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.08 }}
          >
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.article
                  key={feature.title}
                  variants={sectionReveal}
                  whileHover={{ y: -5, transition: { duration: 0.22 } }}
                  className={cn(
                    'group relative overflow-hidden rounded-[22px] border border-white/[0.08] bg-[#0a0f1a]/80 p-8 sm:p-9',
                    'shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)] transition-shadow duration-300 hover:border-white/[0.12] hover:shadow-[0_20px_48px_-16px_rgba(37,99,235,0.15)]',
                  )}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.08] via-transparent to-cyan-500/[0.06]" />
                  </div>
                  <div className="relative">
                    <div className="mb-6 inline-flex rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-blue-300 shadow-[0_0_20px_-4px_rgba(59,130,246,0.35)]">
                      <Icon className="h-6 w-6" strokeWidth={1.75} />
                    </div>
                    <h3 className="text-xl font-semibold text-white sm:text-[1.35rem]">{feature.title}</h3>
                    <p className="mt-4 text-base leading-relaxed text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        </FadeSection>

        <PricingSection4 />

        {/* Why teams choose */}
        <FadeSection id="why-connectly" className="scroll-mt-28 pb-16 md:scroll-mt-32 md:pb-24 lg:pb-28">
          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.09] bg-gradient-to-br from-[#0a101c]/95 via-[#080d16]/95 to-[#060a12]/95 p-9 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)] sm:p-11 md:p-14 lg:grid lg:grid-cols-2 lg:gap-16 lg:p-16 xl:gap-20 xl:p-[4.5rem]">
            <div
              className="pointer-events-none absolute right-0 top-0 h-72 w-72 translate-x-1/4 -translate-y-1/4 rounded-full bg-blue-500/10 blur-3xl"
              aria-hidden
            />
            <div className="relative">
              <p className="inline-flex rounded-full border border-blue-500/35 bg-blue-500/[0.1] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200/95 sm:text-xs">
                Why teams choose Connectly
              </p>
              <h2 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-[3.25rem] md:leading-[1.08]">
                Built for modern teams who ship fast
              </h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400 md:text-xl">
                From async updates to live workshop sessions, Connectly keeps collaboration clear, fast, and aligned.
              </p>
            </div>
            <ul className="relative mt-12 space-y-4 lg:mt-0 lg:flex lg:flex-col lg:justify-center">
              {whyBullets.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-6 py-4 text-base text-slate-200 shadow-[0_2px_16px_-6px_rgba(0,0,0,0.4)] backdrop-blur-sm md:px-7 md:py-5 md:text-lg"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </FadeSection>

        {/* Final CTA */}
        <FadeSection id="get-started" className="scroll-mt-28 pb-20 md:scroll-mt-32 md:pb-28 lg:pb-32">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[32px] p-[1px] shadow-[0_32px_100px_-28px_rgba(37,99,235,0.35)]">
            <div
              className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-blue-500/50 via-indigo-500/25 to-cyan-500/30 opacity-80 blur-sm"
              aria-hidden
            />
            <div className="relative rounded-[31px] border border-white/[0.1] bg-[#070b14]/95 px-8 py-16 text-center sm:px-12 sm:py-20 md:py-24 lg:px-16 lg:py-28">
              <div
                className="pointer-events-none absolute left-1/2 top-0 h-56 w-[min(100%,560px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/25 blur-3xl"
                aria-hidden
              />
              <h2 className="relative text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-[3.35rem] md:leading-[1.08] lg:text-[3.5rem]">
                Ready to run your team on Connectly?
              </h2>
              <p className="relative mx-auto mt-6 max-w-2xl text-lg text-slate-400 md:text-xl">
                Launch your collaborative workspace in minutes and turn every room into a high-velocity execution hub.
              </p>
              <div className="relative mt-12 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-10 py-4 text-base font-semibold text-white shadow-[0_0_36px_-8px_rgba(37,99,235,0.7)] transition hover:bg-blue-500"
                >
                  Create Workspace
                </Link>
                <Link
                  to="/app"
                  className="inline-flex items-center justify-center rounded-xl border border-white/[0.15] bg-white/[0.05] px-10 py-4 text-base font-semibold text-white transition hover:border-white/[0.22] hover:bg-white/[0.09]"
                >
                  Explore Live Demo
                </Link>
              </div>
            </div>
          </div>
        </FadeSection>
      </div>

      <footer className="relative border-t border-white/[0.06] bg-[#030712]/55 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-3 md:gap-14 lg:px-12 xl:px-14">
          <div>
            <p className="text-xl font-bold text-white">Connectly</p>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-500">
              Real-time communication platform for teams that need chat, whiteboard, presence, and shared execution in
              one place.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Navigation</p>
            <nav className="mt-5 flex flex-col gap-3 text-base text-slate-500">
              <Link to="/" className="transition hover:text-slate-200">
                Home
              </Link>
              <Link to="/signup" className="transition hover:text-slate-200">
                Sign Up
              </Link>
              <Link to="/login" className="transition hover:text-slate-200">
                Login
              </Link>
              <Link to="/app" className="transition hover:text-slate-200">
                Demo
              </Link>
            </nav>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">Social</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {[
                { Icon: MessageCircle, label: 'Community', href: 'https://twitter.com' },
                { Icon: Send, label: 'Telegram', href: 'https://telegram.org' },
                { Icon: Globe, label: 'Website', href: 'https://example.com' },
                { Icon: Rocket, label: 'Updates', href: 'https://github.com' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 text-slate-400 transition hover:border-white/[0.14] hover:text-slate-200"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/[0.05] py-6 text-center text-sm text-slate-600">
          Connectly © 2026 · Built for modern collaboration
        </div>
      </footer>
    </main>
  )
}

export default LandingPage
