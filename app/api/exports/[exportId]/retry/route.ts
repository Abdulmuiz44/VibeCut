import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { inngest } from '@/lib/inngest/client';
import { requireActiveBilling } from '@/lib/billing/account';

export async function POST(_: NextRequest, { params }: { params: Promise<{ exportId: string }> }) {
  const { exportId } = await params;
  const { supabase, user } = await requireUser();
  const billing = await requireActiveBilling(supabase, user.id);
  if (!billing.active) {
    return NextResponse.json({ error: 'Billing required to retry exports', billing_required: true }, { status: 402 });
  }

  const { data: exportRow, error } = await supabase.from('exports').select('*').eq('id', exportId).eq('user_id', user.id).maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!exportRow) {
    return NextResponse.json({ error: 'Export not found' }, { status: 404 });
  }

  const { error: updateError } = await supabase
    .from('exports')
    .update({ status: 'queued', progress: 0, error_message: null })
    .eq('id', exportId)
    .eq('user_id', user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 });
  }

  await supabase.from('job_runs').insert({
    user_id: user.id,
    project_id: exportRow.project_id,
    job_type: 'export_render',
    status: 'queued',
    metadata: { exportId, retry: true, preset: exportRow.preset }
  });

  await inngest.send({ name: 'vibecut/export.requested', data: { exportId } });
  return NextResponse.json({ ok: true });
}
