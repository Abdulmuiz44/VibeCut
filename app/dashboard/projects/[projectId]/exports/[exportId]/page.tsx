import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/session';
import { ExportActions } from '@/components/export/export-actions';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export default async function ExportPage({ params }: { params: Promise<{ projectId: string; exportId: string }> }) {
  const { exportId, projectId } = await params;
  const { supabase, user } = await requireUser();
  const { data: exportRow } = await supabase.from('exports').select('*').eq('id', exportId).eq('user_id', user.id).maybeSingle();

  if (!exportRow) notFound();

  const progress = Math.max(0, Math.min(100, Math.round((exportRow.progress ?? 0) * 100)));
  const statusLabel = exportRow.status ? exportRow.status.replaceAll('_', ' ') : 'unknown';
  const admin = getSupabaseAdmin();
  const { data: signedDownload } =
    exportRow.output_storage_path
      ? await admin.storage.from('source-videos').createSignedUrl(exportRow.output_storage_path, 60 * 60)
      : { data: null };
  const outputUrl = exportRow.output_url ?? signedDownload?.signedUrl ?? null;

  return (
    <main className="page-shell py-10 lg:py-14">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="hero-card spotlight-border p-6 sm:p-8 lg:p-10">
          <span className="section-label">Export delivery</span>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[hsl(var(--foreground))] sm:text-5xl">
            Track the render, then deliver the finished cut.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-[hsl(var(--muted-foreground))]">
            Monitor export progress, retry if needed, and jump back to the editor when the sequence needs another pass.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="glass-card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-label">Current export</p>
                <h2 className="mt-4 break-all text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-3xl">{exportRow.id}</h2>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">Status: {statusLabel}</p>
              </div>
              <span className="rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.7)] px-3 py-1 text-xs text-[hsl(var(--muted-foreground))]">
                {progress}%
              </span>
            </div>

            <div className="mt-6 space-y-3">
              <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--secondary))]">
                <div className="h-full rounded-full bg-[hsl(var(--primary))] transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">Progress updates reflect the remote render job state.</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] p-4">
                <p className="text-[hsl(var(--muted-foreground))]">Preset</p>
                <p className="mt-2 font-medium text-[hsl(var(--foreground))]">{exportRow.preset}</p>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] p-4">
                <p className="text-[hsl(var(--muted-foreground))]">Mode</p>
                <p className="mt-2 font-medium text-[hsl(var(--foreground))]">{exportRow.render_mode}</p>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] p-4">
                <p className="text-[hsl(var(--muted-foreground))]">Duration</p>
                <p className="mt-2 font-medium text-[hsl(var(--foreground))]">{exportRow.duration_ms ? `${Math.round(exportRow.duration_ms / 1000)}s` : 'Pending'}</p>
              </div>
            </div>

            <div className="mt-6">
              <ExportActions
                exportId={exportRow.id}
                projectId={projectId}
                sequenceId={exportRow.sequence_id}
                preset={exportRow.preset}
                outputUrl={outputUrl}
                canRetry={exportRow.status === 'failed'}
              />
            </div>
          </section>

          <section className="surface-card p-6 sm:p-8">
            <p className="section-label">Project loop</p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[hsl(var(--foreground))]">Need another pass before publishing?</h2>
            <p className="mt-3 text-sm leading-7 text-[hsl(var(--muted-foreground))]">
              Return to the project editor to trim the sequence, restore a snapshot, or queue a fresh export from the same workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="btn-primary" href={`/dashboard/projects/${projectId}`}>
                Back to editor
              </Link>
              <Link className="btn-ghost" href="/dashboard">
                Dashboard
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
