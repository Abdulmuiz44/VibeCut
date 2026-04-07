import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { proposeOperations } from '@/lib/mistral/propose-operations';
import { requireActiveBilling } from '@/lib/billing/account';

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  const billing = await requireActiveBilling(supabase, user.id);
  if (!billing.active) {
    return NextResponse.json({ error: 'Billing required to use AI edits', billing_required: true }, { status: 402 });
  }

  const { projectId, prompt } = await request.json();
  const { data: segments } = await supabase.from('transcript_segments').select('text,start_ms,end_ms').eq('project_id', projectId).order('segment_index', { ascending: true }).limit(40);
  const { data: project } = await supabase.from('projects').select('id').eq('id', projectId).eq('user_id', user.id).maybeSingle();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  if (!segments?.length) {
    return NextResponse.json({ error: 'No transcript segments are available yet' }, { status: 400 });
  }

  const context = JSON.stringify({ userId: user.id, segments });

  try {
    const operations = await proposeOperations(prompt, context);
    return NextResponse.json({ operations });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'AI proposal failed' }, { status: 400 });
  }
}

