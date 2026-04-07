import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { requireActiveBilling } from '@/lib/billing/account';

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  const billing = await requireActiveBilling(supabase, user.id);
  if (!billing.active) {
    return NextResponse.json({ error: 'Billing required to use undo', billing_required: true }, { status: 402 });
  }

  const { projectId, sequenceId } = await request.json();

  const { data: latest, error: latestError } = await supabase
    .from('edit_operations')
    .select('*')
    .eq('project_id', projectId)
    .eq('sequence_id', sequenceId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestError) {
    return NextResponse.json({ error: latestError.message }, { status: 400 });
  }

  if (!latest) {
    return NextResponse.json({ error: 'Nothing to undo' }, { status: 404 });
  }

  const { error: deleteError } = await supabase.from('edit_operations').delete().eq('id', latest.id).eq('user_id', user.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return NextResponse.json({
    operationType: latest.operation_type,
    payload: latest.payload,
    summary: latest.summary ?? undefined
  });
}
