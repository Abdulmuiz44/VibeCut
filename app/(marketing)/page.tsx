import Link from 'next/link';
import { auth } from '@/auth';

const features = [
  {
    title: 'Edit by meaning, not frames',
    description: 'Trim, cut, and tighten by transcript so the edit feels fast even when the footage is long.'
  },
  {
    title: 'Keep full control',
    description: 'Every AI suggestion is reviewable, reversible, and tied to a visible timeline so you never lose the cut.'
  },
  {
    title: 'Ship social-ready output',
    description: 'Build polished shorts, talking-head clips, and promo edits that look deliberate instead of auto-generated.'
  }
];

const steps = [
  {
    title: 'Upload a source video',
    description: 'Bring in a talking-head recording or long-form clip and VibeCut builds the edit context.'
  },
  {
    title: 'Edit by transcript and prompt',
    description: 'Cut filler, tighten pacing, and ask for changes in plain English with AI-backed suggestions.'
  },
  {
    title: 'Export and publish',
    description: 'Render the final cut as a social-ready export and keep iterating without losing momentum.'
  }
];

const trustPoints = [
  'Transcript-first workflow designed for speed',
  'Undoable edit operations and visible timeline state',
  'Built for repeated publishing, not one-off edits',
  'Dark, focused interface that keeps attention on the cut'
];

const faqs = [
  {
    question: 'Why not use a normal video editor?',
    answer:
      'Traditional editors are precise but slow for talking-head content. VibeCut removes busywork by letting you work from transcript, prompt, and timeline together.'
  },
  {
    question: 'Who is VibeCut for?',
    answer:
      'Creators, editors, and social teams who publish recurring video content and care about speed, consistency, and polished output.'
  },
  {
    question: 'Why would someone pay for it every month?',
    answer:
      'Because the value compounds with repeat use. The more you publish, the more time VibeCut saves on cutting, polishing, and exporting content.'
  }
];

export default async function MarketingPage() {
  const session = await auth();
  const primaryHref = session?.user ? '/dashboard' : '/sign-in';
  const primaryLabel = session?.user ? 'Go to dashboard' : 'Start free';

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] bg-[radial-gradient(circle_at_top,rgba(62,207,142,0.22),transparent_45%),linear-gradient(180deg,rgba(15,17,23,0.95),rgba(15,17,23,0.2))]" />
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-8 lg:pb-28">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/10 text-sm font-semibold text-emerald-300">
              VC
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight">VibeCut</p>
              <p className="text-xs text-slate-500">Transcript-first AI video editing</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="#how-it-works" className="btn-ghost hidden sm:inline-flex">
              See how it works
            </Link>
            <Link href={primaryHref} className="btn-primary">
              {primaryLabel}
            </Link>
          </div>
        </header>

        <div className="grid items-center gap-14 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300">
              Built for creators who ship every week
            </span>
            <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Edit videos in the time it usually takes to rewatch them.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              VibeCut turns long talking-head footage into polished social content with transcript-first editing, AI prompts,
              and a timeline that keeps you in control.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={primaryHref} className="btn-primary">
                {primaryLabel}
              </Link>
              <Link href="#pricing" className="btn-ghost">
                Why people pay for it
              </Link>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-2xl font-semibold text-white">Transcript-first</p>
                <p className="mt-1 text-sm text-slate-400">Work from words, not guesswork.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-2xl font-semibold text-white">Fast export</p>
                <p className="mt-1 text-sm text-slate-400">Move from idea to publishable cut quickly.</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-2xl font-semibold text-white">Built to repeat</p>
                <p className="mt-1 text-sm text-slate-400">Useful every week, not just once.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-emerald-500/10 blur-3xl" />
            <div className="relative rounded-[2rem] border border-slate-800 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-2xl shadow-black/30">
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
                    <div className="mt-4 flex items-center gap-2">
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">Cut</span>
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">Restore</span>
                      <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">Tighten pacing</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">AI prompt</p>
                      <p className="mt-2 text-sm text-slate-200">“Cut the filler, make the hook stronger, and keep the best moments.”</p>
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
          {features.map((feature) => (
            <div key={feature.title} className="glass-card p-6">
              <h2 className="text-xl font-semibold tracking-tight text-white">{feature.title}</h2>
              <p className="muted mt-3 leading-7">{feature.description}</p>
            </div>
          ))}
        </section>

        <section id="how-it-works" className="py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">How it works</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">A better workflow for repeat video publishing.</h2>
            <p className="muted mt-4 max-w-xl leading-7">
              VibeCut is built around a simple loop: get the footage in, shape the story fast, and export the cut without
              getting buried in manual timeline work.
            </p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {steps.map((step, index) => (
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

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Why it matters</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">It saves time on every upload, not just the first one.</h2>
            <p className="muted mt-4 leading-7">
              The real value of VibeCut is recurring: every video you publish becomes faster to shape, faster to revise, and
              easier to turn into multiple outputs.
            </p>
            <div className="mt-6 space-y-3">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass-card p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Speed</p>
              <p className="mt-3 text-2xl font-semibold text-white">Move from raw footage to usable cut faster.</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Control</p>
              <p className="mt-3 text-2xl font-semibold text-white">Every AI edit stays visible and undoable.</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Quality</p>
              <p className="mt-3 text-2xl font-semibold text-white">Polished edits that feel intentional.</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Retention</p>
              <p className="mt-3 text-2xl font-semibold text-white">Built for creators who publish again and again.</p>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24">
          <div className="glass-card grid gap-8 p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Paid value</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">Worth paying for when your publishing cadence matters.</h2>
              <p className="muted mt-4 max-w-2xl leading-7">
                VibeCut is not a one-off novelty. It is the workflow layer that helps you make more clips, polish them faster,
                and keep your content pipeline moving.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={primaryHref} className="btn-primary">
                  {primaryLabel}
                </Link>
                <Link href="#faq" className="btn-ghost">
                  Read the FAQ
                </Link>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/60 p-6">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Recurring value</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-200">
                <li className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">Less time editing per video</li>
                <li className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">Faster iterations on hooks and pacing</li>
                <li className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">More publishable output from the same footage</li>
                <li className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3">A workflow you can reuse every week</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="faq" className="pb-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">FAQ</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white">Questions people ask before they subscribe.</h2>
          </div>
          <div className="mt-8 grid gap-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="glass-card group p-6">
                <summary className="cursor-pointer list-none text-lg font-semibold tracking-tight text-white">
                  {faq.question}
                </summary>
                <p className="muted mt-4 max-w-3xl leading-7">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="glass-card flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Start now</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Make your next clip faster, cleaner, and easier to repeat.</h2>
            <p className="muted mt-3 leading-7">
              If you are publishing video regularly, VibeCut gives you a better editing loop and a reason to keep coming back.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={primaryHref} className="btn-primary">
              {primaryLabel}
            </Link>
            <Link href="/dashboard" className="btn-ghost">
              Go to dashboard
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}