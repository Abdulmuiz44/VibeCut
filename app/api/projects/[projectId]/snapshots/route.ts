import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { createSnapshotSchema } from '@/lib/validation/project';
import { requireActiveBilling } from '@/lib/billing/account';

export async function GET(_: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from('sequence_snapshots')
    .select('*')
    .eq('project_id', projectId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ snapshots: data ?? [] });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const { supabase, user } = await requireUser();
  const billing = await requireActiveBilling(supabase, user.id);
  if (!billing.active) {
    return NextResponse.json({ error: 'Billing required to save snapshots', billing_required: true }, { status: 402 });
  }

  const parsed = createSnapshotSchema.parse(await request.json());

  const { data: sequence } = await supabase.from('sequences').select('id').eq('id', parsed.sequenceId).eq('project_id', projectId).maybeSingle();
  if (!sequence) {
    return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
  }

  const { data: operations, error: operationsError } = await supabase
    .from('edit_operations')
    .select('operation_type,payload,summary,status,source')
    .eq('project_id', projectId)
    .eq('sequence_id', parsed.sequenceId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (operationsError) {
    return NextResponse.json({ error: operationsError.message }, { status: 400 });
  }

  const label = parsed.label ?? `Restore point ${new Date().toLocaleString()}`;
  const { data, error } = await supabase
    .from('sequence_snapshots')
    .insert({
      user_id: user.id,
      project_id: projectId,
      sequence_id: parsed.sequenceId,
      label,
      operations_snapshot: operations ?? []
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(data);
}
