import Link from 'next/link';
import { auth } from '@/auth';

const valueProps = [
  {
    title: 'Edit by transcript, not guesswork',
    description: 'Cut filler, tighten pacing, and move directly to the moments that matter without endless scrubbing.'
  },
  {
    title: 'AI that keeps you in control',
    description: 'Prompt the edit, review every change, and keep the timeline visible so the final cut stays intentional.'
  },
  {
    title: 'Built for repeat publishing',
    description: 'The workflow gets faster every week, which is why VibeCut keeps paying off after the first upload.'
  }
];

const workflowSteps = [
  {
    title: 'Upload',
    description: 'Drop in a talking-head clip or long-form recording and let VibeCut build the edit context.'
  },
  {
    title: 'Shape the story',
    description: 'Trim by transcript, tighten pacing, and ask AI to remove the parts that do not belong.'
  },
  {
    title: 'Export',
    description: 'Render a social-ready cut and publish faster with fewer manual edits.'
  }
];

const founderProof = [
  {
    label: 'Founder-built',
    title: 'Designed around the editing loop creators repeat every week',
    description: 'This product focuses on the real workflow after the footage is already captured.'
  },
  {
    label: 'Outcome-first',
    title: 'Less time editing and more time publishing',
    description: 'The product reduces busywork, not just automation for its own sake.'
  },
  {
    label: 'Quality control',
    title: 'AI suggestions stay visible, reviewable, and reversible',
    description: 'You keep the final say on every edit, so the output stays polished instead of generic.'
  }
];

const monthlyTiers = [
  {
    name: 'Starter',
    price: '$19',
    cadence: 'per month',
    description: 'For solo creators who want the fastest way to turn raw footage into polished clips.',
    features: ['Transcript-first editing', 'Prompt-based edit suggestions', 'Social export presets']
  },
  {
    name: 'Creator',
    price: '$39',
    cadence: 'per month',
    description: 'For creators publishing regularly who want more speed, polish, and flexibility.',
    features: ['Everything in Starter', 'Priority export queue', 'More edit automation', 'Saved workflow presets'],
    featured: true
  },
  {
    name: 'Studio',
    price: '$79',
    cadence: 'per month',
    description: 'For teams or heavy publishers who need a repeatable editing engine and higher throughput.',
    features: ['Everything in Creator', 'Team-ready workflow', 'Higher volume usage', 'Advanced export handling']
  }
];

const annualPlan = {
  name: 'Annual Pro',
  price: '$399',
  cadence: 'per year',
  description: 'One paid plan for creators who already know they want to use VibeCut every month.',
  features: ['Best value for consistent creators', 'All Creator features included', 'Locked-in yearly pricing', 'Built for repeat publishing']
};

const objections = [
  {
    question: 'Why not use a normal video editor?',
    answer: 'Traditional editors are precise but slow for talking-head content. VibeCut removes repetitive work by letting you edit from transcript, prompt, and timeline together.'
  },
  {
    question: 'Who is this for?',
    answer: 'Creators, editors, and small teams that publish recurring video content and care about speed, consistency, and a polished final result.'
  },
  {
    question: 'Why should someone pay every month?',
    answer: 'The product becomes more valuable the more you publish. It saves time on every edit, not just the first one.'
  },
  {
    question: 'Is there a free plan?',
    answer: 'No free plan. VibeCut is positioned as a paid productivity tool for creators who want a workflow they can rely on.'
  }
];

export default async function MarketingPage() {
  const session = await auth();
  const primaryHref = session?.user ? '/dashboard' : '/sign-in';
  const primaryLabel = session?.user ? 'Go to dashboard' : 'Start now';

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top,rgba(62,207,142,0.22),transparent_45%),linear-gradient(180deg,rgba(15,17,23,0.95),rgba(15,17,23,0.2))]" />
      <section className="page-shell pb-20 pt-8 lg:pb-28">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/10 text-sm font-semibold text-emerald-300">
              VC
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight text-white">VibeCut</p>
              <p className="text-xs text-slate-500">Transcript-first AI video editing</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="#pricing" className="btn-ghost hidden sm:inline-flex">
              Pricing
            </Link>
            <Link href={primaryHref} className="btn-primary">
              {primaryLabel}
            </Link>
          </div>
        </header>

        <div className="grid items-center gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300">
              Built for creators who publish every week
            </span>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Edit videos faster, publish more often, and keep the cut under control.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              VibeCut is the subscription editing tool for creators who want a transcript-first workflow, AI assistance when it helps, and a timeline that never gets in the way.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={primaryHref} className="btn-primary">
                {primaryLabel}
              </Link>
              <Link href="#pricing" className="btn-ghost">
                See pricing
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="stat-pill">
                <p className="text-2xl font-semibold text-white">Speed</p>
                <p className="mt-1 text-sm text-slate-400">Cut edit time dramatically.</p>
              </div>
              <div className="stat-pill">
                <p className="text-2xl font-semibold text-white">Control</p>
                <p className="mt-1 text-sm text-slate-400">AI suggestions stay visible.</p>
              </div>
              <div className="stat-pill">
                <p className="text-2xl font-semibold text-white">Repeatable</p>
                <p className="mt-1 text-sm text-slate-400">Built for recurring publishing.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-emerald-500/10 blur-3xl" />
            <div className="hero-card relative">
              <div className="rounded-[1.5rem] border border-slate-800 bg-[#0b0f14] p-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <p className="text-sm font-semibold text-white">VibeCut editor</p>
                    <p className="text-xs text-slate-500">Timeline + transcript + AI in one place</p>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                    Ready to export
                  </span>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_0.85fr]">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Timeline</span>
                      <span>9:16</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="h-4 w-3/4 rounded-full bg-emerald-500/30" />
                      <div className="h-4 w-full rounded-full bg-slate-800" />
                      <div className="h-4 w-5/6 rounded-full bg-emerald-500/20" />
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">Cut</span>
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">Restore</span>
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">Tighten pacing</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">AI prompt</p>
                      <p className="mt-2 text-sm text-slate-200">Cut the filler, make the hook stronger, and keep the best moments.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Export</p>
                      <p className="mt-2 text-sm text-slate-200">Social-ready render with captions, pacing, and a clean vertical frame.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Outcome</p>
                      <p className="mt-2 text-sm text-slate-200">More clips published, less time stuck in editing software.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          {valueProps.map((feature) => (
            <div key={feature.title} className="glass-card p-6">
              <h2 className="text-xl font-semibold tracking-tight text-white">{feature.title}</h2>
              <p className="muted mt-3 leading-7">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="page-section">
          <div className="max-w-2xl">
            <p className="section-label">How it works</p>
            <h2 className="section-title mt-4">A better workflow for recurring video publishing.</h2>
            <p className="section-copy">
              VibeCut is built around a simple loop: get the footage in, shape the story fast, and export the cut without getting buried in manual timeline work.
            </p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div key={step.title} className="glass-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-500/10 text-sm font-semibold text-emerald-300">
                  0{index + 1}
                </div>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">{step.title}</h3>
                <p className="muted mt-3 leading-7">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-card p-6">
            <p className="section-label">Founder proof</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">Built around the editing loop creators repeat every week.</h2>
            <p className="muted mt-4 leading-7">
              These are the reasons the product exists and the reasons it is worth paying for: it saves time, reduces friction, and keeps quality high.
            </p>
            <div className="mt-6 space-y-3">
              {founderProof.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">{item.label}</p>
                  <p className="mt-2 text-base font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="pricing" className="grid gap-4 sm:grid-cols-2">
            {monthlyTiers.map((tier) => (
              <div
                key={tier.name}
                className={[
                  'glass-card p-6',
                  tier.featured ? 'border-emerald-400/45 bg-emerald-500/8 shadow-[0_0_0_1px_rgba(62,207,142,0.12)]' : ''
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{tier.name}</p>
                    <p className="muted mt-2 leading-6">{tier.description}</p>
                  </div>
                  {tier.featured ? <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">Most popular</span> : null}
                </div>
                <div className="mt-6 flex items-end gap-2">
                  <p className="text-5xl font-semibold tracking-tight text-white">{tier.price}</p>
                  <p className="pb-2 text-sm text-slate-400">{tier.cadence}</p>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-slate-200">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 px-4 py-3">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href={primaryHref} className={tier.featured ? 'btn-primary mt-6 inline-flex w-full justify-center' : 'btn-ghost mt-6 inline-flex w-full justify-center'}>
                  {tier.featured ? 'Start with Creator' : 'Choose plan'}
                </Link>
              </div>
            ))}

            <div className="glass-card border-emerald-400/30 bg-emerald-500/8 p-6 sm:col-span-2">
              <p className="section-label">Single paid plan</p>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-white">{annualPlan.name}</h3>
                  <p className="muted mt-2 max-w-2xl leading-7">{annualPlan.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-semibold tracking-tight text-white">{annualPlan.price}</p>
                  <p className="text-sm text-slate-400">{annualPlan.cadence}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-4">
                {annualPlan.features.map((feature) => (
                  <div key={feature} className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-200">
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="max-w-2xl">
            <p className="section-label">FAQ</p>
            <h2 className="section-title mt-4">Questions people ask before they subscribe.</h2>
          </div>
          <div className="mt-8 grid gap-4">
            {objections.map((item) => (
              <details key={item.question} className="glass-card group p-6">
                <summary className="cursor-pointer list-none text-lg font-semibold tracking-tight text-white">{item.question}</summary>
                <p className="muted mt-4 max-w-3xl leading-7">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="glass-card flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="section-label">Start now</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Make your next clip faster, cleaner, and easier to repeat.</h2>
            <p className="muted mt-3 leading-7">
              If you are publishing video regularly, VibeCut gives you a better editing loop and a reason to keep coming back.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={primaryHref} className="btn-primary">
              {primaryLabel}
            </Link>
            <Link href="#pricing" className="btn-ghost">
              Compare plans
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
