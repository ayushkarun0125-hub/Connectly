import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import {
  MessageSquareText,
  PenTool,
  Users,
  FolderUp,
  Database,
  Sparkles,
  Globe,
  Rocket,
  Send,
} from 'lucide-react'

function LandingPage() {
  const MotionDiv = motion.div
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

  const howItWorks = [
    'Create or join a room for your team workflow',
    'Collaborate through chat, whiteboard, and shared files',
    'Stay synchronized with real-time events and persistent history',
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-20 top-20 h-80 w-80 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute right-10 top-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute bottom-20 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,#94a3b8_1px,transparent_1px),linear-gradient(to_bottom,#94a3b8_1px,transparent_1px)] [background-size:42px_42px]" />
      </div>

      <header className="sticky top-4 z-30 px-6 sm:px-8 lg:px-12">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between rounded-2xl border border-slate-700/70 bg-slate-900/70 px-5 py-3 shadow-xl backdrop-blur-xl sm:px-6">
          <h1 className="text-lg font-bold tracking-tight sm:text-xl">Connectly</h1>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Show when="signed-out">
              <SignInButton mode="redirect" forceRedirectUrl="/app">
                <button type="button" className="rounded-xl px-4 py-2 text-sm font-medium transition hover:bg-slate-800 sm:px-5 sm:py-2.5">
                  Login
                </button>
              </SignInButton>
              <SignUpButton mode="redirect" forceRedirectUrl="/app">
                <button type="button" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-500 sm:px-5 sm:py-2.5">
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <Link to="/app" className="rounded-xl px-4 py-2 text-sm font-medium text-emerald-300 transition hover:bg-slate-800 sm:px-5 sm:py-2.5">
                Open app
              </Link>
              <UserButton afterSignOutUrl="/" />
            </Show>
          </nav>
        </div>
      </header>

      <section className="relative mx-auto w-full max-w-[1400px] px-6 pb-20 pt-16 sm:px-8 lg:px-12 lg:pt-24">
        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/70 p-8 shadow-2xl sm:p-10 lg:min-h-[72vh] lg:p-14"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.16em] text-blue-300">
                Real-time collaboration operating system
              </p>

              <h2 className="mt-6 text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                Connectly
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg lg:text-xl">
                Bring chat, whiteboarding, presence, and shared files into one premium workspace built for fast-moving modern teams.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup" className="rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-semibold transition hover:bg-blue-500 sm:text-base">
                  Start Free
                </Link>
                <Link to="/login" className="rounded-2xl border border-slate-600 bg-slate-800/70 px-6 py-3.5 text-sm font-semibold transition hover:border-slate-500 sm:text-base">
                  Login
                </Link>
                <Link to="/app" className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3.5 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20 sm:text-base">
                  Explore Demo
                </Link>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-cyan-500/20 blur-2xl" />
              <div className="relative rounded-3xl border border-slate-700/70 bg-slate-950/90 p-5 shadow-2xl sm:p-6">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-200">Product Preview</p>
                  <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-300">
                    Live
                  </span>
                </div>
                <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">Chat Stream</p>
                    <div className="space-y-2">
                      <div className="rounded-xl bg-slate-800/80 p-2 text-xs text-slate-300">Aaryan: pushed room moderation update</div>
                      <div className="rounded-xl bg-blue-500/15 p-2 text-xs text-blue-200">Ayush: whiteboard flow looks great</div>
                      <div className="rounded-xl bg-slate-800/80 p-2 text-xs text-slate-300">Dhruv: deploying socket patch now</div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                    <p className="mb-3 text-xs uppercase tracking-wide text-slate-400">Presence + Files</p>
                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="rounded-xl border border-slate-700 p-2">9 active users</div>
                      <div className="rounded-xl border border-slate-700 p-2">wireframe-v2.png uploaded</div>
                      <div className="rounded-xl border border-slate-700 p-2">room_general synchronized</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </MotionDiv>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="mb-10 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.14em] text-blue-300">Core capabilities</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Everything teams need for real-time collaboration
          </h3>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            Connectly combines messaging, visual collaboration, and shared context in one cohesive platform.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-6 sm:p-7"
              >
                <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10" />
                </div>
                <div className="relative">
                  <div className="mb-5 inline-flex rounded-xl border border-slate-700 bg-slate-800/80 p-2.5 text-blue-300">
                    <Icon size={20} />
                  </div>
                  <h4 className="text-lg font-semibold sm:text-xl">{feature.title}</h4>
                  <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
                    {feature.description}
                  </p>
                </div>
              </motion.article>
            )
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-6 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-8 sm:p-10 lg:grid-cols-2">
          <div>
            <p className="inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-wide text-blue-300">
              Why teams choose Connectly
            </p>
            <h3 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Built for modern teams who ship fast
            </h3>
            <p className="mt-4 text-slate-300 sm:text-lg">
              From async updates to live workshop sessions, Connectly keeps collaboration clear, fast, and aligned.
            </p>
          </div>
          <div className="space-y-3">
            {howItWorks.map((item) => (
              <div key={item} className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-300 sm:text-base">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1400px] px-6 pb-20 pt-8 sm:px-8 lg:px-12 lg:pb-24">
        <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-blue-600/20 via-indigo-500/10 to-cyan-500/20 p-8 text-center sm:p-12">
          <h3 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Ready to run your team on Connectly?
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-slate-200 sm:text-lg">
            Launch your collaborative workspace in minutes and turn every room into a high-velocity execution hub.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/signup" className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold transition hover:bg-blue-500 sm:text-base">
              Create Workspace
            </Link>
            <Link to="/app" className="rounded-2xl border border-slate-300/25 bg-slate-900/50 px-6 py-3 text-sm font-semibold transition hover:bg-slate-800/70 sm:text-base">
              Explore Live Demo
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800/80 bg-slate-950/80">
        <div className="mx-auto grid w-full max-w-[1400px] gap-8 px-6 py-14 sm:px-8 lg:grid-cols-3 lg:px-12">
          <div>
            <h4 className="text-lg font-bold">Connectly</h4>
            <p className="mt-3 max-w-sm text-sm text-slate-400">
              Real-time communication platform for teams that need chat, whiteboard, presence, and shared execution in one place.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Navigation</p>
            <div className="mt-3 space-y-2 text-sm text-slate-400">
              <p><Link to="/">Home</Link></p>
              <p><Link to="/signup">Sign Up</Link></p>
              <p><Link to="/login">Login</Link></p>
              <p><Link to="/app">Demo</Link></p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">Social</p>
            <div className="mt-3 flex items-center gap-3 text-slate-400">
              <span className="rounded-xl border border-slate-700 p-2"><Rocket size={16} /></span>
              <span className="rounded-xl border border-slate-700 p-2"><Send size={16} /></span>
              <span className="rounded-xl border border-slate-700 p-2"><Globe size={16} /></span>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
          Connectly © 2026 · Built for modern collaboration
        </div>
      </footer>
    </main>
  )
}

export default LandingPage
