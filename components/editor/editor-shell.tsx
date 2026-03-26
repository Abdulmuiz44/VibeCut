'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { VibeCutComposition } from '@/remotion/compositions/VibeCutComposition';
import { deriveSequence, SequenceSegment } from '@/lib/edits/derive-sequence';
import type { EditOperationInput } from '@/lib/validation/operations';
import { AiPromptPanel } from '@/components/ai/ai-prompt-panel';
import { TimelineEditor, type TimelineTranscriptSegment } from '@/components/editor/timeline-editor';

type Project = { id: string; title: string };
type Sequence = { id: string; sequence_segments: SequenceSegment[] };
type TranscriptSegment = TimelineTranscriptSegment;

const FPS = 30;

function clampFrame(frame: number, durationInFrames: number) {
  return Math.max(0, Math.min(durationInFrames, frame));
}

function frameToMs(frame: number) {
  return Math.round((frame / FPS) * 1000);
}

export function EditorShell({ project, sequence, transcriptSegments }: { project: Project; sequence: Sequence; transcriptSegments: TranscriptSegment[] }) {
  const playerRef = useRef<PlayerRef>(null);
  const [operations, setOperations] = useState<EditOperationInput[]>([]);
  const [undoStack, setUndoStack] = useState<EditOperationInput[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentSegments = useMemo(() => deriveSequence(sequence?.sequence_segments ?? [], operations), [sequence, operations]);
  const timelineDurationMs = Math.max(1, ...currentSegments.map((segment) => segment.end_ms), ...transcriptSegments.map((segment) => segment.end_ms));
  const durationInFrames = Math.max(1, Math.ceil((timelineDurationMs / 1000) * FPS));
  const currentTimeMs = frameToMs(currentFrame);
  const currentTranscriptSegment =
    transcriptSegments.find((segment) => currentTimeMs >= segment.start_ms && currentTimeMs <= segment.end_ms) ?? transcriptSegments[0] ?? null;
  const currentSequenceSegment =
    currentSegments.find((segment) => currentTimeMs >= segment.start_ms && currentTimeMs <= segment.end_ms) ?? currentSegments[0] ?? null;
  const includedSegments = currentSegments.filter((segment) => segment.include_in_export !== false);

  async function applyOperation(op: EditOperationInput) {
    await fetch('/api/edits/apply', { method: 'POST', body: JSON.stringify({ projectId: project.id, sequenceId: sequence.id, ...op }) });
    setOperations((prev) => [...prev, op]);
    setUndoStack([]);
  }

  const seekToFrame = useCallback(
    (frame: number) => {
      const nextFrame = clampFrame(frame, durationInFrames);
      playerRef.current?.seekTo(nextFrame);
      setCurrentFrame(nextFrame);
    },
    [durationInFrames]
  );

  const togglePlayback = useCallback(() => {
    playerRef.current?.toggle();
  }, []);

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

  useEffect(() => {
    const syncPlayerState = window.setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      const nextFrame = clampFrame(player.getCurrentFrame(), durationInFrames);
      setIsPlaying(player.isPlaying());
      setCurrentFrame((prev) => (prev === nextFrame ? prev : nextFrame));
    }, 120);

    return () => window.clearInterval(syncPlayerState);
  }, [durationInFrames]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.code === 'Space') {
        event.preventDefault();
        togglePlayback();
      }

      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        seekToFrame(currentFrame - FPS * 5);
      }

      if (event.code === 'ArrowRight') {
        event.preventDefault();
        seekToFrame(currentFrame + FPS * 5);
      }

      if (event.code === 'Home') {
        event.preventDefault();
        seekToFrame(0);
      }

      if (event.code === 'End') {
        event.preventDefault();
        seekToFrame(durationInFrames);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentFrame, durationInFrames, seekToFrame, togglePlayback]);

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-4">
      <header className="glass-card flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{project.title}</h1>
          <p className="text-xs text-slate-400">Auto-saved transcript edits, timeline scrubbing, and instant previews.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-ghost" onClick={undo} disabled={operations.length === 0}>
            Undo
          </button>
          <button className="btn-ghost" onClick={redo} disabled={undoStack.length === 0}>
            Redo
          </button>
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
        </div>
      </header>

      <div className="grid min-h-0 grid-cols-[280px_minmax(0,1fr)_360px] gap-4">
        <aside className="glass-card flex min-h-0 flex-col gap-4 p-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Editor state</h2>
            <p className="muted mt-1">Current playhead, visible cut, and project summary.</p>
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-3 text-sm">
            <div className="flex items-center justify-between text-slate-400">
              <span>Playhead</span>
              <span>{Math.floor(currentTimeMs / 1000)}s</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Visible segments</span>
              <span>{includedSegments.length}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Hidden segments</span>
              <span>{currentSegments.length - includedSegments.length}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Transcript markers</span>
              <span>{transcriptSegments.length}</span>
            </div>
          </div>

          <div className="space-y-2">
            <button className="btn-ghost block w-full text-left" onClick={() => applyOperation({ operationType: 'SET_ASPECT_RATIO', payload: { aspectRatio: '9:16' } })}>
              9:16 frame
            </button>
            <button className="btn-ghost block w-full text-left" onClick={() => applyOperation({ operationType: 'SET_CAPTION_THEME', payload: { theme: 'bold_social' } })}>
              Bold captions
            </button>
            <button className="btn-ghost block w-full text-left" onClick={() => applyOperation({ operationType: 'TIGHTEN_PACING', payload: { maxGapMs: 240 } })}>
              Tighten pacing
            </button>
            <button className="btn-ghost block w-full text-left" onClick={() => applyOperation({ operationType: 'REMOVE_SILENCE', payload: { thresholdMs: 600 } })}>
              Remove silence
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 text-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Active segment</p>
            <p className="mt-2 font-medium text-slate-100">{currentTranscriptSegment?.text ?? 'No active segment'}</p>
            <p className="mt-2 text-xs text-slate-500">
              {currentSequenceSegment ? `${currentSequenceSegment.start_ms}ms - ${currentSequenceSegment.end_ms}ms` : 'No sequence segment selected'}
            </p>
          </div>
        </aside>

        <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-4">
          <div className="glass-card flex min-h-0 flex-col gap-4 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Preview</h2>
                <p className="muted mt-1">Use the transport, keyboard shortcuts, or timeline to move through the cut.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1">{isPlaying ? 'Playing' : 'Paused'}</span>
                <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1">{durationInFrames} frames</span>
              </div>
            </div>

            <div className="min-h-[420px] overflow-hidden rounded-2xl border border-slate-800 bg-black">
              <Player
                ref={playerRef}
                component={VibeCutComposition}
                inputProps={{ sequenceSegments: currentSegments, transcriptSegments }}
                fps={FPS}
                durationInFrames={durationInFrames}
                compositionHeight={960}
                compositionWidth={540}
                controls={false}
                autoPlay={false}
                initialFrame={currentFrame}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>

          <TimelineEditor
            durationInFrames={durationInFrames}
            fps={FPS}
            currentFrame={currentFrame}
            isPlaying={isPlaying}
            sequenceSegments={currentSegments}
            transcriptSegments={transcriptSegments}
            currentTranscriptSegmentId={currentTranscriptSegment?.id ?? null}
            onSeekFrame={seekToFrame}
            onTogglePlayback={togglePlayback}
            onCutSegment={(segmentId) => applyOperation({ operationType: 'CUT_SEGMENT', payload: { segmentId }, summary: 'Cut from timeline' })}
            onRestoreSegment={(segmentId) => applyOperation({ operationType: 'RESTORE_SEGMENT', payload: { segmentId } })}
          />
        </section>

        <AiPromptPanel onApply={applyOperation} projectId={project.id} sequenceId={sequence.id} />
      </div>
    </div>
  );
}