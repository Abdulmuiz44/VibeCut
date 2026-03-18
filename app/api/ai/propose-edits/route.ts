import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/session';
import { proposeOperations } from '@/lib/mistral/propose-operations';

export async function POST(request: NextRequest) {
  const { supabase, user } = await requireUser();
  const { projectId, prompt } = await request.json();
  const { data: segments } = await supabase.from('transcript_segments').select('text,start_ms,end_ms').eq('project_id', projectId).limit(40);
  const context = JSON.stringify({ userId: user.id, segments });

  try {
    const operations = await proposeOperations(prompt, context);
    return NextResponse.json({ operations });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'AI proposal failed' }, { status: 400 });
  }
}

