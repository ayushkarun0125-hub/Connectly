import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, MessageSquareText, PenTool, Users, FolderUp } from 'lucide-react'
import { cn } from '../lib/utils'

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
    <div className="pb-20 pt-2 md:pb-28">
      <section className="relative overflow-hidden rounded-[32px] border border-white/[0.09] bg-gradient-to-b from-[#0c1220]/95 to-[#080d18]/95 p-8 shadow-[0_32px_120px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.04)_inset] sm:p-11 md:p-14 lg:min-h-[min(620px,calc(100vh-12rem))] lg:p-16 xl:p-[4.5rem]">
        <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-indigo-500/12 blur-3xl" />
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
              Bring chat, whiteboarding, presence, and shared files into one premium workspace built for fast-moving modern teams.
            </p>
            <div className="mt-10 flex flex-col gap-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link to="/get-started" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_32px_-6px_rgba(37,99,235,0.65)] transition hover:bg-blue-500">
                Start Free
              </Link>
              <Link to="/demo" className="inline-flex items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-8 py-4 text-base font-semibold text-slate-100 transition hover:border-white/[0.18] hover:bg-white/[0.07]">
                Explore Live Demo
              </Link>
            </div>
          </motion.div>
          <div className="lg:pl-2">
            <HeroPreview />
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Real-time Chat', icon: MessageSquareText, desc: 'Room-based messaging and threaded context.' },
          { title: 'Whiteboard', icon: PenTool, desc: 'Visual collaboration with low-latency strokes.' },
          { title: 'Live Presence', icon: Users, desc: 'See who is online, typing, and active now.' },
          { title: 'File Activity', icon: FolderUp, desc: 'Share docs, images, and links in context.' },
        ].map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-white/[0.08] bg-[#0a0f1a]/80 p-6 transition hover:-translate-y-0.5 hover:border-white/[0.12]"
          >
            <item.icon className="h-5 w-5 text-blue-300" />
            <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
          </article>
        ))}
      </section>

      <section className="mt-16 rounded-[28px] border border-white/[0.09] bg-[#0a101c]/88 p-8 md:p-12">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">Built for teams who ship fast</h2>
        <p className="mt-4 max-w-3xl text-lg text-slate-400">
          Move from idea to execution with one connected workflow. Connectly keeps communication, collaboration, and decisions in one place.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/features" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
            See all features <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/pricing" className="inline-flex items-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]">
            View pricing
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
