import Link from 'next/link';
import { NewProjectForm } from '@/components/dashboard/new-project-form';

const reasons = [
  'Starts with a clean transcript-led workflow',
  'Drops you directly into the editor after upload',
  'Built to support recurring publishing, not one-off edits'
];

export default function NewProjectPage() {
  return (
    <main className="page-shell py-10 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex flex-col justify-center gap-6">
          <span className="section-label">Create project</span>
          <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
            Start a new edit and keep the flow moving.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-300">
            Set up a project, upload the source footage, and move straight into transcript-first editing.
          </p>
          <div className="grid gap-3">
            {reasons.map((reason) => (
              <div key={reason} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-sm text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {reason}
              </div>
            ))}
          </div>
          <Link href="/dashboard" className="btn-ghost w-fit">
            Back to dashboard
          </Link>
        </section>

        <section className="hero-card">
          <div className="rounded-[1.5rem] border border-slate-800 bg-[#0b0f14] p-6 lg:p-8">
            <p className="section-label">Project details</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">Give the project a name.</h2>
            <p className="muted mt-3 leading-7">
              A clear title makes it easier to track exports, iterations, and the final published version.
            </p>
            <NewProjectForm />
          </div>
        </section>
      </div>
    </main>
  );
}
