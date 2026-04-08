'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Player, type PlayerRef } from '@remotion/player';
import { VibeCutComposition } from '@/remotion/compositions/VibeCutComposition';
import { deriveSequence, SequenceSegment } from '@/lib/edits/derive-sequence';
import type { EditOperationInput } from '@/lib/validation/operations';
import {
  createEditorStorageKey,
  formatExportStatus,
  formatOperationLabel,
  isTerminalExportStatus,
  normalizeOperationEntry,
  parsePersistedEditorState,
  type OperationHistoryEntry,
  type OperationRecordLike
} from '@/lib/editor/utils';
import { TimelineEditor, type TimelineTranscriptSegment } from '@/components/editor/timeline-editor';

type Project = { id: string; title: string };
type Sequence = { id: string; sequence_segments: SequenceSegment[] };
type TranscriptSegment = TimelineTranscriptSegment;
type SnapshotRecord = {
  id: string;
  label: string;
  created_at: string;
  operations_snapshot: EditOperationInput[];
};
type ExportRecord = {
  id: string;
  preset: string;
  status: string;
  progress: number | null;
  output_url: string | null;
  error_message: string | null;
  created_at: string;
};

type ApplyOperationResponse = {
  operation?: OperationRecordLike | null;
};

const FPS = 30;
const EXPORT_PRESETS = [
  { value: 'social_vertical_1080x1920', label: 'Vertical 9:16' },
  { value: 'square_1080x1080', label: 'Square 1:1' },
  { value: 'landscape_1920x1080', label: 'Landscape 16:9' }
] as const;

function clampFrame(frame: number, durationInFrames: number) {
  return Math.max(0, Math.min(durationInFrames, frame));
}

function frameToMs(frame: number) {
  return Math.round((frame / FPS) * 1000);
}

function formatRelativeTime(timestamp: string) {
  const value = new Date(timestamp);
  const diff = Date.now() - value.getTime();
  if (diff < 60_000) return 'just now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return value.toLocaleDateString();
}

export function EditorShell({
  project,
  sequence,
  transcriptSegments,
  initialOperations,
  snapshots,
  exports
}: {
  project: Project;
  sequence: Sequence;
  transcriptSegments: TranscriptSegment[];
  initialOperations: OperationRecordLike[];
  snapshots: SnapshotRecord[];
  exports: ExportRecord[];
}) {
  const router = useRouter();
  const [historyEntries, setHistoryEntries] = useState<OperationHistoryEntry[]>(() => initialOperations.map(normalizeOperationEntry));
  const [redoStack, setRedoStack] = useState<OperationHistoryEntry[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<PlayerRef>(null);
  const currentFrameRef = useRef(0);
  const currentTimeMsRef = useRef(0);
  const currentSequenceSegmentRef = useRef<Sequence['sequence_segments'][number] | null>(null);
  const [saveState, setSaveState] = useState<{ kind: 'idle' | 'saving' | 'error'; message: string }>({
    kind: 'idle',
    message: 'All changes are stored in the project history.'
  });
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const initialExportPreset = (exports[0]?.preset as (typeof EXPORT_PRESETS)[number]['value'] | undefined) ?? 'social_vertical_1080x1920';
  const [exportPreset, setExportPreset] = useState<(typeof EXPORT_PRESETS)[number]['value']>(initialExportPreset);
  const [isExporting, setIsExporting] = useState(false);
  const [exportItems, setExportItems] = useState(exports);
  const exportPresetRef = useRef(initialExportPreset);
  const snapshotLabelRef = useRef('');
  const hydratedEditorStateRef = useRef(false);
  const editorStorageKey = useMemo(() => createEditorStorageKey(project.id), [project.id]);

  useEffect(() => {
    setHistoryEntries(initialOperations.map(normalizeOperationEntry));
    setRedoStack([]);
  }, [initialOperations]);

  useEffect(() => {
    setExportItems(exports);
  }, [exports]);

  const operations = useMemo<EditOperationInput[]>(
    () => historyEntries.map(({ operationType, payload, summary }) => ({ operationType, payload, summary }) as EditOperationInput),
    [historyEntries]
  );

  const currentSegments = useMemo(() => deriveSequence(sequence?.sequence_segments ?? [], operations), [sequence, operations]);
  const timelineDurationMs = Math.max(1, ...currentSegments.map((segment) => segment.end_ms), ...transcriptSegments.map((segment) => segment.end_ms));
  const durationInFrames = Math.max(1, Math.ceil((timelineDurationMs / 1000) * FPS));
  const currentTimeMs = frameToMs(currentFrame);

  const currentTranscriptSegment =
    transcriptSegments.find((segment) => currentTimeMs >= segment.start_ms && currentTimeMs <= segment.end_ms) ?? transcriptSegments[0] ?? null;
  const currentSequenceSegment =
    currentSegments.find((segment) => currentTimeMs >= segment.start_ms && currentTimeMs <= segment.end_ms) ?? currentSegments[0] ?? null;
  const includedSegments = currentSegments.filter((segment) => segment.include_in_export !== false);

  useEffect(() => {
    currentFrameRef.current = currentFrame;
    currentTimeMsRef.current = currentTimeMs;
    currentSequenceSegmentRef.current = currentSequenceSegment ?? null;
  }, [currentFrame, currentSequenceSegment, currentTimeMs]);

  useEffect(() => {
    exportPresetRef.current = exportPreset;
    snapshotLabelRef.current = snapshotLabel;
  }, [exportPreset, snapshotLabel]);

  useEffect(() => {
    if (hydratedEditorStateRef.current || typeof window === 'undefined') return;

    const restoredState = parsePersistedEditorState(
      window.localStorage.getItem(editorStorageKey),
      EXPORT_PRESETS.map((preset) => preset.value)
    );

    if (restoredState) {
      setCurrentFrame(clampFrame(restoredState.currentFrame, durationInFrames));
      setExportPreset(restoredState.exportPreset as (typeof EXPORT_PRESETS)[number]['value']);
      setSnapshotLabel(restoredState.snapshotLabel);
      setSaveState({ kind: 'idle', message: 'Restored your local editor state.' });
    }

    hydratedEditorStateRef.current = true;
  }, [durationInFrames, editorStorageKey]);

  useEffect(() => {
    if (!hydratedEditorStateRef.current || typeof window === 'undefined') return;

    const persist = () => {
      window.localStorage.setItem(
        editorStorageKey,
        JSON.stringify({
          currentFrame: currentFrameRef.current,
          exportPreset: exportPresetRef.current,
          snapshotLabel: snapshotLabelRef.current
        })
      );
    };

    if (!isPlaying) {
      const timeout = window.setTimeout(persist, 200);
      return () => window.clearTimeout(timeout);
    }

    const onBeforeUnload = () => persist();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      persist();
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [currentFrame, editorStorageKey, exportPreset, isPlaying, snapshotLabel]);

  useEffect(() => {
    const pendingExports = exportItems.filter((item) => !isTerminalExportStatus(item.status));
    if (!pendingExports.length) return;

    let cancelled = false;

    const poll = async () => {
      const nextRows = await Promise.all(
        pendingExports.map(async (item) => {
          try {
            const response = await fetch(`/api/exports/${item.id}`, { cache: 'no-store' });
            if (!response.ok) return null;
            return (await response.json()) as ExportRecord;
          } catch {
            return null;
          }
        })
      );

      if (cancelled) return;

      setExportItems((current) =>
        current.map((item) => nextRows.find((candidate) => candidate?.id === item.id) ?? item)
      );
    };

    void poll();
    const interval = window.setInterval(() => {
      void poll();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [exportItems]);

  const persistOperation = useCallback(
    async (op: EditOperationInput, options?: { preserveRedoStack?: boolean }) => {
      setSaveState({ kind: 'saving', message: 'Saving change...' });

      const response = await fetch('/api/edits/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, sequenceId: sequence.id, ...op })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Unable to save edit');
      }

      const data = (await response.json()) as ApplyOperationResponse;
      const nextHistoryEntry = data.operation ? normalizeOperationEntry(data.operation) : normalizeOperationEntry(op);

      setHistoryEntries((prev) => [...prev, nextHistoryEntry]);
      if (!options?.preserveRedoStack) {
        setRedoStack([]);
      }
      setSaveState({ kind: 'idle', message: 'Saved to project history.' });
    },
    [project.id, sequence.id]
  );

  const applyOperation = useCallback(
    async (op: EditOperationInput) => {
      try {
        await persistOperation(op);
      } catch (error) {
        setSaveState({
          kind: 'error',
          message: error instanceof Error ? error.message : 'Unable to save edit'
        });
      }
    },
    [persistOperation]
  );

  const updateCurrentSegment = useCallback(
    async (mode: 'cut-toggle' | 'trim-start' | 'trim-end') => {
      const activeSegment = currentSequenceSegmentRef.current;
      if (!activeSegment) return;

      if (mode === 'cut-toggle') {
        await applyOperation(
          activeSegment.include_in_export !== false
            ? { operationType: 'CUT_SEGMENT', payload: { segmentId: activeSegment.id }, summary: 'Cut current segment' }
            : { operationType: 'RESTORE_SEGMENT', payload: { segmentId: activeSegment.id }, summary: 'Restore current segment' }
        );
        return;
      }

      const minDurationMs = 120;
      const nextTimeMs =
        mode === 'trim-start'
          ? Math.min(currentTimeMsRef.current, activeSegment.end_ms - minDurationMs)
          : Math.max(currentTimeMsRef.current, activeSegment.start_ms + minDurationMs);

      await applyOperation({
        operationType: 'TRIM_SEGMENT',
        payload: {
          segmentId: activeSegment.id,
          trimSide: mode === 'trim-start' ? 'start' : 'end',
          newTimeMs: Math.max(0, Math.round(nextTimeMs))
        },
        summary: `Trim current segment ${mode === 'trim-start' ? 'start' : 'end'}`
      });
    },
    [applyOperation]
  );

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

  const undo = useCallback(async () => {
    if (!historyEntries.length) return;

    setSaveState({ kind: 'saving', message: 'Undoing last change...' });
    const response = await fetch('/api/edits/undo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: project.id, sequenceId: sequence.id })
    });

    if (!response.ok) {
      setSaveState({ kind: 'error', message: 'Unable to undo the last change.' });
      return;
    }

    const removedOperation = normalizeOperationEntry((await response.json()) as OperationRecordLike);
    const lastHistoryEntry = historyEntries[historyEntries.length - 1] ?? removedOperation;

    setHistoryEntries((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [...prev, lastHistoryEntry]);
    setSaveState({ kind: 'idle', message: 'Last change moved to redo.' });
  }, [historyEntries, project.id, sequence.id]);

  const redo = useCallback(async () => {
    const operation = redoStack[redoStack.length - 1];
    if (!operation) return;

    setRedoStack((prev) => prev.slice(0, -1));
    try {
      await persistOperation(
        { operationType: operation.operationType, payload: operation.payload, summary: operation.summary } as EditOperationInput,
        { preserveRedoStack: true }
      );
      setSaveState({ kind: 'idle', message: 'Restored the undone change.' });
    } catch (error) {
      setSaveState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Unable to redo the last change.'
      });
    }
  }, [persistOperation, redoStack]);

  async function createSnapshot() {
    setSaveState({ kind: 'saving', message: 'Creating restore point...' });
    const response = await fetch(`/api/projects/${project.id}/snapshots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: project.id,
        sequenceId: sequence.id,
        label: snapshotLabel.trim() || undefined
      })
    });

    if (!response.ok) {
      setSaveState({ kind: 'error', message: 'Unable to create restore point.' });
      return;
    }

    setSnapshotLabel('');
    setSaveState({ kind: 'idle', message: 'Restore point saved.' });
    router.refresh();
  }

  async function restoreSnapshot(snapshotId: string) {
    setSaveState({ kind: 'saving', message: 'Restoring snapshot...' });
    const response = await fetch(`/api/projects/${project.id}/snapshots/${snapshotId}/restore`, {
      method: 'POST'
    });

    if (!response.ok) {
      setSaveState({ kind: 'error', message: 'Unable to restore that version.' });
      return;
    }

    setSaveState({ kind: 'idle', message: 'Snapshot restored.' });
    router.refresh();
  }

  async function createExport() {
    setIsExporting(true);
    setSaveState({ kind: 'saving', message: 'Queueing export...' });

    try {
      const response = await fetch('/api/exports/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          sequenceId: sequence.id,
          preset: exportPreset
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Export request failed');
      }

      const data = (await response.json()) as { id: string };
      router.push(`/dashboard/projects/${project.id}/exports/${data.id}`);
    } catch (error) {
      setSaveState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Unable to start export'
      });
    } finally {
      setIsExporting(false);
    }
  }

  useEffect(() => {
    let raf = 0;

    const syncPlayerState = () => {
      const player = playerRef.current;
      if (player) {
        const nextFrame = clampFrame(player.getCurrentFrame(), durationInFrames);
        setIsPlaying(player.isPlaying());
        setCurrentFrame((prev) => (prev === nextFrame ? prev : nextFrame));
      }
      raf = window.requestAnimationFrame(syncPlayerState);
    };

    raf = window.requestAnimationFrame(syncPlayerState);
    return () => window.cancelAnimationFrame(raf);
  }, [durationInFrames]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;

      if (event.metaKey || event.ctrlKey) {
        if (event.key.toLowerCase() === 'z' && event.shiftKey) {
          event.preventDefault();
          void redo();
        } else if (event.key.toLowerCase() === 'z') {
          event.preventDefault();
          void undo();
        }
        return;
      }

      if (event.altKey) return;

      if (event.code === 'Space') {
        event.preventDefault();
        togglePlayback();
      }

      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        seekToFrame(currentFrameRef.current - FPS * 5);
      }

      if (event.code === 'ArrowRight') {
        event.preventDefault();
        seekToFrame(currentFrameRef.current + FPS * 5);
      }

      if (event.code === 'Home') {
        event.preventDefault();
        seekToFrame(0);
      }

      if (event.code === 'End') {
        event.preventDefault();
        seekToFrame(durationInFrames);
      }

      if (event.key.toLowerCase() === 'c') {
        event.preventDefault();
        void updateCurrentSegment('cut-toggle');
      }

      if (event.key === '[') {
        event.preventDefault();
        void updateCurrentSegment('trim-start');
      }

      if (event.key === ']') {
        event.preventDefault();
        void updateCurrentSegment('trim-end');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [durationInFrames, redo, seekToFrame, togglePlayback, undo, updateCurrentSegment]);

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr] gap-4">
      <header className="glass-card flex flex-wrap items-center justify-between gap-4 px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{project.title}</h1>
          <p className="text-xs text-slate-400">Transcript-backed edits, persistent history, and quick exports.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={[
              'rounded-full border px-3 py-1 text-xs',
              saveState.kind === 'error'
                ? 'border-rose-400/50 bg-rose-500/10 text-rose-200'
                : saveState.kind === 'saving'
                  ? 'border-amber-400/40 bg-amber-500/10 text-amber-100'
                  : 'border-slate-700 bg-slate-950/60 text-slate-300'
            ].join(' ')}
          >
            {saveState.message}
          </span>
          <button className="btn-ghost" onClick={undo} disabled={historyEntries.length === 0}>
            Undo
          </button>
          <button className="btn-ghost" onClick={redo} disabled={redoStack.length === 0}>
            Redo
          </button>
          <button className="btn-primary" onClick={createSnapshot}>
            Save restore point
          </button>
          <button className="btn-primary" onClick={createExport} disabled={isExporting}>
            {isExporting ? 'Queueing...' : 'Export'}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 grid-cols-[300px_minmax(0,1fr)_360px] gap-4">
        <aside className="glass-card flex min-h-0 flex-col gap-4 p-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Editor state</h2>
            <p className="muted mt-1">Current playhead, visible cut, and history controls.</p>
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

          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Shortcuts</p>
            <div className="mt-3 grid gap-2 text-xs text-slate-300">
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2">
                <span>Play / pause</span>
                <kbd className="rounded border border-slate-700 bg-slate-950 px-2 py-1">Space</kbd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2">
                <span>Cut or restore current segment</span>
                <kbd className="rounded border border-slate-700 bg-slate-950 px-2 py-1">C</kbd>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2">
                <span>Trim start / end at playhead</span>
                <div className="flex gap-2">
                  <kbd className="rounded border border-slate-700 bg-slate-950 px-2 py-1">[</kbd>
                  <kbd className="rounded border border-slate-700 bg-slate-950 px-2 py-1">]</kbd>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-2">
                <span>Undo / redo</span>
                <div className="flex gap-2">
                  <kbd className="rounded border border-slate-700 bg-slate-950 px-2 py-1">Ctrl+Z</kbd>
                  <kbd className="rounded border border-slate-700 bg-slate-950 px-2 py-1">Ctrl+Shift+Z</kbd>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Restore points</p>
                <p className="mt-1 text-sm text-slate-300">{snapshots.length} saved versions</p>
              </div>
            </div>
            <label className="mt-3 block">
              <span className="input-label">Label</span>
              <input
                className="soft-input mt-2"
                value={snapshotLabel}
                onChange={(event) => setSnapshotLabel(event.target.value)}
                placeholder="Before caption cleanup"
              />
            </label>
            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
              {snapshots.length ? (
                snapshots.map((snapshot) => (
                  <div key={snapshot.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-100">{snapshot.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatRelativeTime(snapshot.created_at)}</p>
                      </div>
                      <button className="btn-ghost px-3 py-1.5 text-xs" onClick={() => restoreSnapshot(snapshot.id)}>
                        Restore
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-500">Save a restore point before major edits.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recent edits</p>
                <p className="mt-1 text-sm text-slate-300">{historyEntries.length} changes in history</p>
              </div>
            </div>
            <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
              {historyEntries.length ? (
                [...historyEntries].slice(-6).reverse().map((operation) => (
                  <div key={operation.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-100">{formatOperationLabel(operation)}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatRelativeTime(operation.created_at)}</p>
                      </div>
                      <span className="rounded-full border border-slate-700 bg-slate-950/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-400">
                        {operation.source ?? 'user'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-500">Your last edits will appear here as you work.</p>
              )}
            </div>
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
            onTrimSegment={(segmentId, trimSide, newTimeMs) =>
              applyOperation({
                operationType: 'TRIM_SEGMENT',
                payload: { segmentId, trimSide, newTimeMs },
                summary: `Trim ${trimSide} handle`
              })
            }
          />
        </section>

        <aside className="glass-card flex min-h-0 flex-col gap-4 p-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Export</h2>
            <p className="muted mt-1">Choose a preset and queue the next render.</p>
          </div>

          <label className="block">
            <span className="input-label">Preset</span>
            <select className="soft-input mt-2" value={exportPreset} onChange={(event) => setExportPreset(event.target.value as (typeof EXPORT_PRESETS)[number]['value'])}>
              {EXPORT_PRESETS.map((preset) => (
                <option key={preset.value} value={preset.value}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 text-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Recent exports</p>
            <div className="mt-3 max-h-52 space-y-2 overflow-y-auto pr-1">
              {exportItems.length ? (
                exportItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-100">{item.preset}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatExportStatus(item.status)}</p>
                      </div>
                      <span className="text-xs text-slate-400">{Math.round((item.progress ?? 0) * 100)}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-900">
                      <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${Math.round((item.progress ?? 0) * 100)}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{formatRelativeTime(item.created_at)}</p>
                    {item.error_message ? <p className="mt-2 text-xs text-rose-300">{item.error_message}</p> : null}
                    <div className="mt-3 flex items-center gap-2 text-xs">
                      <a className="btn-ghost px-3 py-1.5" href={`/dashboard/projects/${project.id}/exports/${item.id}`}>
                        Open
                      </a>
                      {item.output_url ? (
                        <a className="btn-ghost px-3 py-1.5" href={item.output_url} target="_blank" rel="noreferrer">
                          Download
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-3 text-xs text-slate-500">No exports have been queued yet.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3 text-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Keyboard</p>
            <ul className="mt-3 space-y-2 text-slate-300">
              <li>Space to play or pause</li>
              <li>Arrow keys to move 5 seconds</li>
              <li>Home and End to jump to start or finish</li>
              <li>C to cut or restore the active segment</li>
              <li>[ and ] to trim around the playhead</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
