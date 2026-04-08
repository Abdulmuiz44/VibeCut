import Link from 'next/link';
import { NewProjectForm } from '@/components/dashboard/new-project-form';

const reasons = [
  'Transcript-first from the first upload',
  'Restore points and revision-safe workflow',
  'Built for repeat social publishing'
];

export default function NewProjectPage() {
  return (
    <main className="page-shell py-10 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
        <section className="hero-card spotlight-border flex flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10">
          <div>
            <span className="section-label">Create project</span>
            <h1 className="mt-4 max-w-2xl text-5xl font-semibold tracking-[-0.04em] text-[hsl(var(--foreground))] sm:text-6xl">
              Name the edit and move straight into the source upload.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))] sm:text-lg">
              A clear title makes it easier to track exports, duplicate concepts, and keep your weekly publishing system organized.
            </p>
          </div>

          <div className="grid gap-3">
            {reasons.map((reason) => (
              <div key={reason} className="rounded-[1.4rem] border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.55)] px-4 py-4 text-sm text-[hsl(var(--foreground))]">
                {reason}
              </div>
            ))}
          </div>

          <Link href="/dashboard" className="btn-ghost w-fit">
            Back to dashboard
          </Link>
        </section>

        <section className="glass-card p-6 sm:p-8">
          <p className="section-label">Project details</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))]">Give this edit a clear starting point.</h2>
          <p className="mt-3 text-sm leading-7 text-[hsl(var(--muted-foreground))]">
            Once the project exists, you can upload the source clip, generate the transcript, and move into the editor.
          </p>
          <NewProjectForm />
        </section>
      </div>
    </main>
  );
}
