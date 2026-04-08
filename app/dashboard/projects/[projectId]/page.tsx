import Link from 'next/link';
import { notFound } from 'next/navigation';
import { UploadPanel } from '@/components/upload/upload-panel';
import { EditorShell } from '@/components/editor/editor-shell';
import { requireUser } from '@/lib/auth/session';
import { DuplicateProjectButton } from '@/components/dashboard/duplicate-project-button';
import { BillingActions } from '@/components/billing/billing-actions';
import { billingPlanLabel, getBillingAccount, isBillingActive } from '@/lib/billing/account';

export default async function ProjectEditorPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { supabase, user } = await requireUser();

  const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).eq('user_id', user.id).single();
  if (!project) notFound();

  const { data: sequence } = project.active_sequence_id ? await supabase.from('sequences').select('*, sequence_segments(*)').eq('id', project.active_sequence_id).maybeSingle() : { data: null };
  const { data: transcriptSegments } = project.active_transcript_id
    ? await supabase.from('transcript_segments').select('*').eq('transcript_id', project.active_transcript_id).order('segment_index', { ascending: true })
    : { data: [] };
  const { data: operations } = await supabase.from('edit_operations').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
  const { data: snapshots } = await supabase.from('sequence_snapshots').select('*').eq('project_id', projectId).eq('user_id', user.id).order('created_at', { ascending: false });
  const { data: exports } = await supabase.from('exports').select('*').eq('project_id', projectId).eq('user_id', user.id).order('created_at', { ascending: false }).limit(8);
  const billing = await getBillingAccount(supabase, user.id);

  const isDraft = project.status === 'draft';
  const recentOperations = operations ?? [];
  const recentSnapshots = snapshots ?? [];
  const recentExports = exports ?? [];
  const transcriptRows = transcriptSegments ?? [];
  const billingActive = isBillingActive(billing);

  return (
    <main className="page-shell py-8 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div className="glass-card p-6">
            <span className="section-label">Project studio</span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))] sm:text-4xl">{project.title}</h1>
            <p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]">
              {isDraft
                ? 'Upload a source clip to generate transcript, sequence, and editing context.'
                : 'Review the current cut, adjust the timeline, and move to export when the story feels right.'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-[hsl(var(--muted-foreground))]">
              <span className="rounded-full border border-[hsl(var(--border))] px-3 py-1">{project.status}</span>
              <span className="rounded-full border border-[hsl(var(--border))] px-3 py-1">{project.active_sequence_id ? 'Sequence ready' : 'Waiting on sequence'}</span>
              <span className="rounded-full border border-[hsl(var(--border))] px-3 py-1">{project.active_transcript_id ? 'Transcript ready' : 'Waiting on transcript'}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/dashboard" className="btn-ghost">
                Back to dashboard
              </Link>
              <DuplicateProjectButton projectId={project.id} projectTitle={project.title} />
            </div>
          </div>

          <div className="surface-card p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[hsl(var(--muted-foreground))]">Workspace details</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] px-4 py-3">
                <p className="text-[hsl(var(--muted-foreground))]">Project ID</p>
                <p className="mt-1 break-all font-mono text-xs text-[hsl(var(--foreground))]">{project.id}</p>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] px-4 py-3">
                <p className="text-[hsl(var(--muted-foreground))]">Transcript markers</p>
                <p className="mt-1 text-[hsl(var(--foreground))]">{transcriptRows.length}</p>
              </div>
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.62)] px-4 py-3">
                <p className="text-[hsl(var(--muted-foreground))]">Billing</p>
                <p className="mt-1 text-[hsl(var(--foreground))]">{billingActive ? 'Subscription active' : 'Billing inactive'}</p>
                <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{billingPlanLabel(billing)}</p>
              </div>
            </div>
            <div className="mt-4">
              <BillingActions active={billingActive} planLabel={billingPlanLabel(billing)} />
            </div>
          </div>
        </aside>

        <section className="min-h-0">
          {isDraft ? (
            <div className="hero-card h-full p-6 sm:p-8">
              <p className="section-label">Upload source</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))]">Drop in the source video to start the edit.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">
                VibeCut will prepare the transcript and sequence automatically, then bring you straight back into the editor.
              </p>
              <UploadPanel projectId={project.id} />
            </div>
          ) : sequence ? (
            <div className="min-h-0 rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(224_32%_7%)]/95 p-3 shadow-2xl shadow-black/20">
              <EditorShell
                project={project}
                sequence={sequence}
                transcriptSegments={transcriptRows}
                initialOperations={recentOperations}
                snapshots={recentSnapshots}
                exports={recentExports}
              />
            </div>
          ) : (
            <div className="glass-card flex min-h-[420px] flex-col items-start justify-center p-8">
              <p className="section-label">Workspace unavailable</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[hsl(var(--foreground))]">This project is still preparing.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[hsl(var(--muted-foreground))]">
                The upload may still be processing or the editor context has not been generated yet. Refresh again in a moment.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
