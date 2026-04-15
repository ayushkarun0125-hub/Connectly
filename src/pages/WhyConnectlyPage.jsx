import { Link } from 'react-router-dom'
import { Rocket, Target, Users } from 'lucide-react'

const useCases = [
  {
    title: 'Product squads',
    summary: 'Align PM, design, and engineering around one execution loop from planning to shipping.',
  },
  {
    title: 'Distributed teams',
    summary: 'Maintain live momentum across time zones with persistent context and synchronized activity.',
  },
  {
    title: 'Client-facing agencies',
    summary: 'Deliver polished, investor-ready collaboration workflows with structured room operations.',
  },
]

const benefits = [
  'Faster decisions with chat + whiteboard + files in one context layer.',
  'Lower coordination overhead through room-based visibility and presence.',
  'Premium product feel designed for demos, onboarding, and scale.',
  'Private-first architecture and moderation controls for safer defaults.',
]

export default function WhyConnectlyPage() {
  return (
    <div className="pb-20 pt-4 md:pb-28">
      <section className="rounded-[28px] border border-white/[0.09] bg-[#0a101c]/88 p-8 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400/90">Why Connectly</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">Built for modern teams who ship fast</h1>
        <p className="mt-5 max-w-3xl text-lg text-slate-400">
          Connectly replaces fragmented collaboration tools with one focused operational workspace.
        </p>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {[
          { icon: Rocket, title: 'Ship Faster', desc: 'Reduce handoff friction and execution latency across teams.' },
          { icon: Target, title: 'Stay Aligned', desc: 'Keep goals, conversation, and decisions linked in the same place.' },
          { icon: Users, title: 'Scale Collaboration', desc: 'Support growing teams without sacrificing clarity or speed.' },
        ].map((card) => (
          <article key={card.title} className="rounded-2xl border border-white/[0.08] bg-[#0a0f1a]/85 p-6">
            <card.icon className="h-6 w-6 text-blue-300" />
            <h2 className="mt-4 text-xl font-semibold text-white">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{card.desc}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f1a]/85 p-7">
          <h3 className="text-2xl font-semibold text-white">Use cases</h3>
          <div className="mt-4 space-y-3">
            {useCases.map((uc) => (
              <article key={uc.title} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <h4 className="font-medium text-slate-100">{uc.title}</h4>
                <p className="mt-1 text-sm text-slate-400">{uc.summary}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[#0a0f1a]/85 p-7">
          <h3 className="text-2xl font-semibold text-white">Product benefits</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            {benefits.map((b) => (
              <li key={b} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                {b}
              </li>
            ))}
          </ul>
          <Link to="/get-started" className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
            Start your rollout
          </Link>
        </div>
      </section>
    </div>
  )
}

