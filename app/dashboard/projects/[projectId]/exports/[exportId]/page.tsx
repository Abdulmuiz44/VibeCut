import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';

export default async function ExportPage({ params }: { params: Promise<{ projectId: string; exportId: string }> }) {
  const { exportId, projectId } = await params;
  const { supabase, user } = await requireUser();
  const { data: exportRow } = await supabase.from('exports').select('*').eq('id', exportId).eq('user_id', user.id).maybeSingle();

  if (!exportRow) notFound();

  const progress = Math.max(0, Math.min(100, Math.round((exportRow.progress ?? 0) * 100)));
  const statusLabel = exportRow.status ? exportRow.status.replaceAll('_', ' ') : 'unknown';

  return (
    <main className="page-shell py-10 lg:py-14">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="glass-card p-6 lg:p-8">
          <span className="section-label">Export</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Render status and delivery.</h1>
          <p className="section-copy">
            Track the export, confirm the status, and grab the finished file when it is ready.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="surface-card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-label">Current export</p>
                <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">{exportRow.id}</h2>
                <p className="muted mt-2">Status: {statusLabel}</p>
              </div>
              <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs text-slate-300">{progress}%</span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-slate-400">Progress updates in real time while the render is running.</p>
            </div>

            {exportRow.output_url ? (
              <a className="btn-primary mt-6 inline-flex" href={exportRow.output_url} target="_blank" rel="noreferrer">
                Download MP4
              </a>
            ) : null}
          </section>

          <section className="glass-card p-6">
            <p className="section-label">Project link</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">Back to the editor when you need to revise.</h2>
            <p className="muted mt-3 leading-7">
              If you want to trim a section or change the pacing, return to the project and adjust the timeline before exporting again.
            </p>
            <Link className="btn-ghost mt-6 inline-flex" href={`/dashboard/projects/${projectId}`}>
              Back to editor
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}