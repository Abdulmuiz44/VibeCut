'use client';

import { useMemo, useState } from 'react';
import { Player } from '@remotion/player';
import { VibeCutComposition } from '@/remotion/compositions/VibeCutComposition';
import { deriveSequence, SequenceSegment } from '@/lib/edits/derive-sequence';
import type { EditOperationInput } from '@/lib/validation/operations';
import { AiPromptPanel } from '@/components/ai/ai-prompt-panel';

type Project = { id: string; title: string };
type Sequence = { id: string; sequence_segments: SequenceSegment[] };
type TranscriptSegment = { id: string; text: string; start_ms: number; end_ms: number };

export function EditorShell({ project, sequence, transcriptSegments }: { project: Project; sequence: Sequence; transcriptSegments: TranscriptSegment[] }) {
  const [operations, setOperations] = useState<EditOperationInput[]>([]);
  const [undoStack, setUndoStack] = useState<EditOperationInput[]>([]);

  const currentSegments = useMemo(() => deriveSequence(sequence?.sequence_segments ?? [], operations), [sequence, operations]);

  async function applyOperation(op: EditOperationInput) {
    await fetch('/api/edits/apply', { method: 'POST', body: JSON.stringify({ projectId: project.id, sequenceId: sequence.id, ...op }) });
    setOperations((prev) => [...prev, op]);
    setUndoStack([]);
  }

  function undo() {
    setOperations((prev) => {
      const next = [...prev];
      const popped = next.pop();
      if (popped) setUndoStack((stack) => [...stack, popped]);
      return next;
    });
  }

  function redo() {
    setUndoStack((prev) => {
      const next = [...prev];
      const popped = next.pop();
      if (popped) setOperations((stack) => [...stack, popped]);
      return next;
    });
  }

  return (
    <div className="grid h-full grid-rows-[auto_1fr] gap-4">
      <header className="glass-card flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="font-semibold tracking-tight">{project.title}</h1>
          <p className="text-xs text-slate-400">Auto-saved edit operations</p>
        </div>
        <button
          className="btn-primary"
          onClick={async () => {
            const res = await fetch('/api/exports/create', { method: 'POST', body: JSON.stringify({ projectId: project.id, sequenceId: sequence.id, preset: 'social_vertical_1080x1920' }) });
            const data = await res.json();
            location.href = `/dashboard/projects/${project.id}/exports/${data.id}`;
          }}
        >
          Export
        </button>
      </header>
      <div className="grid min-h-0 grid-cols-[220px_1fr_360px] gap-4">
        <aside className="glass-card p-4">
          <h2 className="font-semibold tracking-tight">Quick actions</h2>
          <button className="btn-ghost mt-3 block w-full text-left" onClick={() => applyOperation({ operationType: 'SET_ASPECT_RATIO', payload: { aspectRatio: '9:16' } })}>9:16</button>
          <button className="btn-ghost mt-2 block w-full text-left" onClick={() => applyOperation({ operationType: 'SET_CAPTION_THEME', payload: { theme: 'bold_social' } })}>Bold captions</button>
          <button className="btn-ghost mt-2 block w-full text-left" onClick={undo}>Undo</button>
          <button className="btn-ghost mt-2 block w-full text-left disabled:opacity-50" disabled={undoStack.length === 0} onClick={redo}>Redo</button>
        </aside>
        <section className="grid grid-rows-[1fr_220px] gap-4">
          <div className="glass-card p-4">
            <Player component={VibeCutComposition} inputProps={{ sequenceSegments: currentSegments, transcriptSegments }} fps={30} durationInFrames={900} compositionHeight={960} compositionWidth={540} controls style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="glass-card p-4">
            <h3 className="mb-2 font-medium">Transcript</h3>
            <div className="max-h-40 space-y-2 overflow-y-auto text-sm">
              {transcriptSegments.map((segment) => (
                <div key={segment.id} className="flex items-start justify-between rounded-xl border border-slate-700 bg-slate-950/60 p-2">
                  <button className="text-left text-slate-200" onClick={() => applyOperation({ operationType: 'CUT_SEGMENT', payload: { segmentId: segment.id }, summary: 'Manual cut from transcript' })}>{segment.text}</button>
                  <button className="btn-ghost px-2 py-1" onClick={() => applyOperation({ operationType: 'RESTORE_SEGMENT', payload: { segmentId: segment.id } })}>Restore</button>
                </div>
              ))}
            </div>
          </div>
        </section>
        <AiPromptPanel onApply={applyOperation} projectId={project.id} sequenceId={sequence.id} />
      </div>
    </div>
  );
}
