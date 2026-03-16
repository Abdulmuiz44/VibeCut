import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { inngest } from '@/lib/inngest/client';

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  const { projectId, sequenceId, preset } = await request.json();
  const { data: row } = await supabase
    .from('exports')
    .insert({ user_id: user.id, project_id: projectId, sequence_id: sequenceId, preset, render_mode: process.env.REMOTION_RENDER_MODE ?? 'local' })
    .select('id')
    .single();

  await inngest.send({ name: 'vibecut/export.requested', data: { exportId: row?.id } });
  return NextResponse.json(row);
}
