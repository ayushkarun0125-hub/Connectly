import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Starter',
    price: '$29',
    suffix: '/seat/mo',
    bestFor: 'Small product teams',
    features: ['Up to 10 seats', '5 live rooms', 'Realtime chat + files', '7-day history', 'Email support'],
    cta: 'Start with Starter',
  },
  {
    name: 'Pro',
    price: '$79',
    suffix: '/seat/mo',
    bestFor: 'Scaling product and engineering orgs',
    features: ['Up to 50 seats', 'Unlimited rooms', 'Whiteboard + pins', '90-day history + exports', 'Priority support'],
    cta: 'Choose Pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    suffix: 'billing',
    bestFor: 'Security-focused, multi-team organizations',
    features: ['Unlimited seats', 'SSO + SCIM', '99.9% uptime SLA', 'Compliance package', 'Dedicated success manager'],
    cta: 'Contact sales',
  },
]

export default function PricingPage() {
  return (
    <div className="pb-20 pt-4 md:pb-28">
      <section className="rounded-[28px] border border-white/[0.09] bg-[#0a101c]/88 p-8 md:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400/90">Pricing</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-6xl">Plans that scale with your team</h1>
        <p className="mt-5 max-w-3xl text-lg text-slate-400">
          Transparent pricing for modern collaboration, from early startups to enterprise rollout.
        </p>
      </section>

      <section className="mt-10 grid gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-2xl border p-7 ${
              plan.highlighted
                ? 'border-blue-500/45 bg-[#0a101c]/95 shadow-[0_0_48px_-12px_rgba(59,130,246,0.45)]'
                : 'border-white/[0.08] bg-[#0a0f1a]/85'
            }`}
          >
            {plan.highlighted ? (
              <span className="inline-flex rounded-full border border-blue-400/30 bg-blue-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-200">
                Most popular
              </span>
            ) : null}
            <h2 className="mt-4 text-2xl font-semibold text-white">{plan.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{plan.bestFor}</p>
            <p className="mt-5 text-4xl font-bold text-white">
              {plan.price} <span className="text-base font-medium text-slate-500">{plan.suffix}</span>
            </p>
            <ul className="mt-5 space-y-2.5">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-slate-300">
                  <span className="grid h-5 w-5 place-items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                    <Check className="h-3 w-3" strokeWidth={2.5} />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <Link
              to={plan.name === 'Enterprise' ? '/contact' : '/sign-up'}
              className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition ${
                plan.highlighted ? 'bg-blue-600 text-white hover:bg-blue-500' : 'border border-white/[0.12] bg-white/[0.04] text-slate-100 hover:bg-white/[0.08]'
              }`}
            >
              {plan.cta}
            </Link>
          </article>
        ))}
      </section>

      <section className="mt-10 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0a0f1a]/82">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-white/[0.08] bg-white/[0.03] text-slate-300">
            <tr>
              <th className="px-5 py-4 font-semibold">Comparison</th>
              <th className="px-5 py-4 font-semibold">Starter</th>
              <th className="px-5 py-4 font-semibold text-blue-300">Pro</th>
              <th className="px-5 py-4 font-semibold">Enterprise</th>
            </tr>
          </thead>
          <tbody className="text-slate-400">
            {[
              ['Realtime chat rooms', 'Yes', 'Yes', 'Yes'],
              ['Whiteboard collaboration', 'Limited', 'Full', 'Full + controls'],
              ['Audit and compliance', 'Basic', 'Standard', 'Advanced'],
              ['Support SLA', 'Business hours', 'Priority', 'Dedicated'],
            ].map((row) => (
              <tr key={row[0]} className="border-b border-white/[0.05] last:border-0">
                <td className="px-5 py-3.5 text-slate-200">{row[0]}</td>
                <td className="px-5 py-3.5">{row[1]}</td>
                <td className="px-5 py-3.5 text-blue-300">{row[2]}</td>
                <td className="px-5 py-3.5">{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

