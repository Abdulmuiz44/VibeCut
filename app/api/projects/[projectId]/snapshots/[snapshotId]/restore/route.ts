import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { requireActiveBilling } from '@/lib/billing/account';

type SnapshotOperation = {
  operation_type: string;
  payload: Record<string, unknown>;
  summary?: string | null;
};

export async function POST(_: NextRequest, { params }: { params: Promise<{ projectId: string; snapshotId: string }> }) {
  const { projectId, snapshotId } = await params;
  const { supabase, user } = await requireUser();
  const billing = await requireActiveBilling(supabase, user.id);
  if (!billing.active) {
    return NextResponse.json({ error: 'Billing required to restore snapshots', billing_required: true }, { status: 402 });
  }

  const { data: snapshot, error: snapshotError } = await supabase
    .from('sequence_snapshots')
    .select('*')
    .eq('id', snapshotId)
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (snapshotError) {
    return NextResponse.json({ error: snapshotError.message }, { status: 400 });
  }

  if (!snapshot) {
    return NextResponse.json({ error: 'Snapshot not found' }, { status: 404 });
  }

  const operations = (snapshot.operations_snapshot ?? []) as SnapshotOperation[];

  const { error: deleteError } = await supabase.from('edit_operations').delete().eq('project_id', projectId).eq('sequence_id', snapshot.sequence_id).eq('user_id', user.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  if (operations.length) {
    const { error: insertError } = await supabase.from('edit_operations').insert(
      operations.map((operation) => ({
        user_id: user.id,
        project_id: projectId,
        sequence_id: snapshot.sequence_id,
        operation_type: operation.operation_type,
        source: 'restore_point',
        status: 'applied',
        payload: operation.payload,
        summary: operation.summary ?? null
      }))
    );

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
