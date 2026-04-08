import Link from 'next/link';
import { auth } from '@/auth';

const audience = ['Talking-head creators', 'Podcast repurposing teams', 'Weekly short-form publishers'];

const outcomes = [
  {
    title: 'Find the best moments fast',
    description: 'Jump through the transcript instead of scrubbing a timeline to guess where the good clip starts.'
  },
  {
    title: 'Tighten without losing control',
    description: 'Use AI suggestions, but review every change before it becomes part of the final cut.'
  },
  {
    title: 'Publish more consistently',
    description: 'Keep edits, restore points, and exports in one flow so weekly publishing feels lighter.'
  }
];

const objections = [
  {
    title: 'Timelines are slow for spoken content',
    description: 'VibeCut puts the transcript first, so you can cut ideas and sentences before touching timing details.'
  },
  {
    title: 'AI editors often feel risky',
    description: 'Every edit stays reviewable, undoable, and easy to restore, so speed never costs trust.'
  },
  {
    title: 'Export is usually the messy last mile',
    description: 'Queue the right aspect ratio, watch progress, and rerun the export without breaking the project flow.'
  }
];

const steps = [
  ['01', 'Upload the source', 'Bring in a long-form recording and let VibeCut generate the transcript and edit context.'],
  ['02', 'Trim by transcript', 'Cut weak beats, remove dead air, and tighten pacing while seeing the story clearly.'],
  ['03', 'Export the final cut', 'Render vertical, square, or landscape formats for the channel you are publishing to.']
] as const;

const bullets = [
  'Transcript-backed timeline editing',
  'Restore points before risky changes',
  'Export presets for social formats',
  'Project duplication for repeat workflows',
  'AI suggestions with visible history',
  'Built for repeat publishing, not one-off edits'
];

const faqs = [
  {
    question: 'Who is VibeCut best for?',
    answer: 'Creators and teams working with talking-head, interview, podcast, and educational content that benefits from transcript-first editing.'
  },
  {
    question: 'Does AI make changes automatically?',
    answer: 'No. AI can propose edits, but the workflow is designed so changes stay visible, reviewable, and reversible.'
  },
  {
    question: 'Can I return to an older version?',
    answer: 'Yes. Restore points and project history are built into the editing flow so you can safely iterate.'
  },
  {
    question: 'What formats can I export?',
    answer: 'VibeCut is set up for common social outputs like vertical, square, and landscape exports.'
  }
];

export default async function MarketingPage() {
  const session = await auth();
  const primaryHref = session?.user ? '/dashboard' : '/sign-in';
  const signedOutPrimaryLabel = 'Start free in 2 minutes';
  const signedInPrimaryLabel = 'Start your next clip in minutes';
  const primaryLabel = session?.user ? signedInPrimaryLabel : signedOutPrimaryLabel;

  return (
    <main className="pb-24">
      <section className="page-shell page-section pt-10 sm:pt-14 lg:pt-16">
        <div className="hero-card spotlight-border overflow-hidden p-0">
          <div className="grid gap-10 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
            <div className="flex flex-col justify-between gap-8">
              <div className="space-y-6">
                <div className="funnel-row text-xs font-medium uppercase tracking-[0.28em] text-[hsl(var(--muted-foreground))]">
                  <span className="rounded-full border border-[hsl(var(--border))] px-3 py-1">VibeCut</span>
                  <span className="rounded-full border border-[hsl(var(--border))] px-3 py-1">Transcript-first video editing</span>
                </div>

                <div className="space-y-4">
                  <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-[hsl(var(--foreground))] sm:text-6xl lg:text-7xl">
                    The fastest way to turn long videos into clean, social-ready clips.
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))] sm:text-lg">
                    VibeCut helps talking-head and podcast creators edit from the transcript, review AI changes safely, and export faster without getting buried in the timeline.
                  </p>
                </div>

                <div className="funnel-row">
                  <Link href={primaryHref} className="btn-primary whitespace-nowrap">
                    {primaryLabel}
                  </Link>
                  <Link href="#how-it-works" className="btn-ghost">
                    See how it works
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {audience.map((item) => (
                    <div key={item} className="rounded-[1.35rem] border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.55)] px-4 py-4 text-sm text-[hsl(var(--foreground))]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="surface-card spotlight-border p-6 sm:p-7">
                <div className="flex items-center justify-between gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                  <span className="section-label">Why people switch</span>
                  <span>Less scrubbing. Faster cuts.</span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] p-4">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Before</p>
                    <p className="mt-2 text-lg font-medium text-[hsl(var(--foreground))]">Scrub, guess, trim, repeat.</p>
                  </div>
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))] p-4">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">After</p>
                    <p className="mt-2 text-lg font-medium text-[hsl(var(--foreground))]">Read the transcript, shape the story, export the cut.</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] p-4">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Workflow</p>
                    <p className="mt-2 font-medium text-[hsl(var(--foreground))]">Transcript-first</p>
                  </div>
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] p-4">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Safety</p>
                    <p className="mt-2 font-medium text-[hsl(var(--foreground))]">Undo + restore points</p>
                  </div>
                  <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] p-4">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">Output</p>
                    <p className="mt-2 font-medium text-[hsl(var(--foreground))]">Social export presets</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6">
                <p className="section-label">What you get</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {bullets.map((item) => (
                    <div key={item} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.56)] px-4 py-3 text-sm text-[hsl(var(--foreground))]">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell page-section pt-0">
        <div className="grid gap-4 lg:grid-cols-3">
          {outcomes.map((item) => (
            <div key={item.title} className="glass-card p-6">
              <p className="text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">{item.title}</p>
              <p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="page-shell page-section">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-label">How it works</span>
            <h2 className="mt-4 section-title max-w-3xl">A simple path from upload to publish.</h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">
            The goal is not more editing complexity. It is faster decisions, safer changes, and a smoother route to the finished clip.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {steps.map(([step, title, description]) => (
            <div key={step} className="surface-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[hsl(var(--muted-foreground))]">{step}</p>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell page-section pt-0">
        <div className="grid gap-4 lg:grid-cols-3">
          {objections.map((item) => (
            <div key={item.title} className="glass-card p-6">
              <p className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="page-shell page-section">
        <div className="surface-card--featured grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_340px]">
          <div>
            <span className="section-label">Why act now</span>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
              If you publish every week, the editing workflow is either your edge or your bottleneck.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))]">
              VibeCut is for creators who want a cleaner system for finding good moments, tightening spoken content, and getting more clips out without dragging every project through the same friction.
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.72)] p-6">
            <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">Start the workflow</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))]">Open your next edit faster.</p>
            <div className="mt-6 space-y-3">
              <Link href={primaryHref} className="btn-primary w-full justify-center whitespace-nowrap">
                {primaryLabel}
              </Link>
              <Link href="/dashboard/projects/new" className="btn-ghost w-full justify-center">
                Create a project
              </Link>
            </div>
            <p className="mt-4 text-xs leading-6 text-[hsl(var(--muted-foreground))]">
              Sign in with Google, create the project, upload the source, and move directly into the editor.
            </p>
          </div>
        </div>
      </section>

      <section id="faq" className="page-shell page-section pt-0">
        <div className="mb-8">
          <span className="section-label">FAQ</span>
          <h2 className="mt-4 section-title max-w-3xl">Everything a serious creator wants to know before trying the workflow.</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {faqs.map((item) => (
            <div key={item.question} className="glass-card p-6">
              <h3 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="page-shell page-section pt-0">
        <div className="hero-card spotlight-border flex flex-col items-start gap-6 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
          <div>
            <span className="section-label">Final CTA</span>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">
              Stop losing time in the timeline. Start editing from the story.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))]">
              VibeCut is built to help recurring creators cut faster, revise safely, and publish more consistently.
            </p>
          </div>

          <div className="funnel-row">
            <Link href={primaryHref} className="btn-primary whitespace-nowrap">
              {primaryLabel}
            </Link>
            <Link href="#faq" className="btn-ghost">
              Read FAQ
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
