import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { inngest } from '@/lib/inngest/client';
import { createExportSchema } from '@/lib/validation/project';
import { requireActiveBilling } from '@/lib/billing/account';

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  const billing = await requireActiveBilling(supabase, user.id);
  if (!billing.active) {
    return NextResponse.json({ error: 'Billing required to export', billing_required: true }, { status: 402 });
  }

  const parsed = createExportSchema.parse(await request.json());

  const { data: sequence } = await supabase.from('sequences').select('id,project_id').eq('id', parsed.sequenceId).eq('project_id', parsed.projectId).eq('user_id', user.id).maybeSingle();
  if (!sequence) {
    return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
  }

  const { data: row, error } = await supabase
    .from('exports')
    .insert({
      user_id: user.id,
      project_id: parsed.projectId,
      sequence_id: parsed.sequenceId,
      preset: parsed.preset,
      render_mode: process.env.REMOTION_RENDER_MODE ?? 'local',
      status: 'queued',
      progress: 0
    })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.from('job_runs').insert({
    user_id: user.id,
    project_id: parsed.projectId,
    job_type: 'export_render',
    status: 'queued',
    metadata: { exportId: row.id, preset: parsed.preset }
  });

  await inngest.send({ name: 'vibecut/export.requested', data: { exportId: row.id } });
  return NextResponse.json(row);
}
