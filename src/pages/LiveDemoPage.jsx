import { Link } from 'react-router-dom'
import { Activity, FileText, PenTool, Users } from 'lucide-react'

function DemoCard({ title, children, className = '' }) {
  return (
    <article className={`rounded-2xl border border-white/[0.08] bg-[#0a0f1a]/88 p-5 ${className}`}>
      <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-400">{title}</h3>
      <div className="mt-4">{children}</div>
    </article>
  )
}

export default function LiveDemoPage() {
  return (
    <div className="pb-20 pt-4 md:pb-28">
      <section className="rounded-[28px] border border-white/[0.09] bg-[#0a101c]/88 p-8 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400/90">Live Demo</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">Interactive product showcase</h1>
        <p className="mt-5 max-w-3xl text-lg text-slate-400">
          Explore how chat, whiteboard, presence, and file activity feel together in a single real-time workspace.
        </p>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <DemoCard title="Chat stream">
          <div className="space-y-3">
            {[
              ['Aaryan', 'Pushed moderation patch to #ops.'],
              ['Ayush', 'Whiteboard flow approved.'],
              ['Dhruv', 'Deploy ETA 2 minutes.'],
            ].map(([who, text]) => (
              <div key={who} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <p className="text-sm font-medium text-slate-200">{who}</p>
                <p className="mt-1 text-sm text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </DemoCard>

        <div className="grid gap-5">
          <DemoCard title="Presence">
            <p className="flex items-center gap-2 text-slate-300"><Users className="h-4 w-4 text-emerald-300" /> 9 active collaborators</p>
            <p className="mt-2 flex items-center gap-2 text-slate-300"><Activity className="h-4 w-4 text-blue-300" /> 3 rooms actively typing</p>
          </DemoCard>
          <DemoCard title="Whiteboard activity">
            <p className="flex items-center gap-2 text-slate-300"><PenTool className="h-4 w-4 text-blue-300" /> 24 live strokes synced</p>
            <p className="mt-2 text-sm text-slate-400">Design review board updated 12s ago.</p>
          </DemoCard>
          <DemoCard title="File feed">
            <p className="flex items-center gap-2 text-slate-300"><FileText className="h-4 w-4 text-blue-300" /> wireframe-v2.png uploaded</p>
            <p className="mt-2 text-sm text-slate-400">roadmap-q3.pdf pinned in #product.</p>
          </DemoCard>
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-white/[0.08] bg-[#0a0f1a]/85 p-7 text-center">
        <h3 className="text-2xl font-semibold text-white">Ready to try the full experience?</h3>
        <p className="mt-2 text-slate-400">Launch Connectly and run your own workspace in minutes.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/sign-up" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
            Create account
          </Link>
          <Link to="/app" className="rounded-xl border border-emerald-500/35 bg-emerald-500/[0.08] px-5 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/[0.14]">
            Open app
          </Link>
        </div>
      </section>
    </div>
  )
}

