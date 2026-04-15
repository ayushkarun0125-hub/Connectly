import { Link } from 'react-router-dom'

const steps = [
  { title: 'Create your workspace', desc: 'Sign up and initialize your private-first Connectly environment.' },
  { title: 'Set up your profile', desc: 'Complete onboarding with handle, role, and collaboration preferences.' },
  { title: 'Invite your team', desc: 'Add members and grant room access with clear collaboration boundaries.' },
  { title: 'Launch execution rooms', desc: 'Use chat, whiteboard, and files to run daily workflows.' },
]

export default function GetStartedPage() {
  return (
    <div className="pb-20 pt-4 md:pb-28">
      <section className="rounded-[28px] border border-white/[0.09] bg-[#0a101c]/88 p-8 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400/90">Get Started</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">Launch Connectly in minutes</h1>
        <p className="mt-5 max-w-3xl text-lg text-slate-400">
          A clean onboarding path for modern teams, from account creation to production collaboration.
        </p>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {steps.map((step, index) => (
          <article key={step.title} className="rounded-2xl border border-white/[0.08] bg-[#0a0f1a]/85 p-6">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-200">
              {index + 1}
            </span>
            <h2 className="mt-4 text-xl font-semibold text-white">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.desc}</p>
          </article>
        ))}
      </section>

      <section className="mt-10 rounded-2xl border border-white/[0.1] bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-cyan-500/20 p-8 text-center">
        <h3 className="text-2xl font-semibold text-white">Start your workspace now</h3>
        <p className="mt-2 text-slate-300">Create an account, finish onboarding, and invite collaborators.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/sign-up" className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
            Sign Up
          </Link>
          <Link to="/contact" className="rounded-xl border border-white/[0.14] bg-white/[0.05] px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/[0.08]">
            Talk to sales
          </Link>
        </div>
      </section>
    </div>
  )
}

