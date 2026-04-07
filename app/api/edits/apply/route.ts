import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { editOperationSchema } from '@/lib/validation/operations';
import { requireActiveBilling } from '@/lib/billing/account';

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  const billing = await requireActiveBilling(supabase, user.id);
  if (!billing.active) {
    return NextResponse.json({ error: 'Billing required to save edits', billing_required: true }, { status: 402 });
  }

  const body = await request.json();
  const parsed = editOperationSchema.parse({ operationType: body.operationType, payload: body.payload, summary: body.summary });

  const { data: sequence } = await supabase.from('sequences').select('id,project_id').eq('id', body.sequenceId).eq('project_id', body.projectId).eq('user_id', user.id).maybeSingle();
  if (!sequence) {
    return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
  }

  const { error } = await supabase.from('edit_operations').insert({
    user_id: user.id,
    project_id: body.projectId,
    sequence_id: body.sequenceId,
    operation_type: parsed.operationType,
    source: 'user',
    payload: parsed.payload,
    summary: parsed.summary ?? null
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
