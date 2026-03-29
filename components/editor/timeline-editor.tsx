'use client';

import { Pause, Play, RotateCcw, Scissors, SkipBack, SkipForward } from 'lucide-react';
import type { SequenceSegment } from '@/lib/edits/derive-sequence';

export type TimelineTranscriptSegment = {
  id: string;
  text: string;
  start_ms: number;
  end_ms: number;
};

export type TimelineEditorProps = {
  durationInFrames: number;
  fps: number;
  currentFrame: number;
  isPlaying: boolean;
  sequenceSegments: SequenceSegment[];
  transcriptSegments: TimelineTranscriptSegment[];
  currentTranscriptSegmentId?: string | null;
  onSeekFrame: (frame: number) => void;
  onTogglePlayback: () => void;
  onCutSegment: (segmentId: string) => void;
  onRestoreSegment: (segmentId: string) => void;
};

function formatTimecode(ms: number) {
  const safeMs = Math.max(0, Math.round(ms));
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((safeMs % 1000) / 100);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

export function TimelineEditor({
  durationInFrames,
  fps,
  currentFrame,
  isPlaying,
  sequenceSegments,
  transcriptSegments,
  currentTranscriptSegmentId,
  onSeekFrame,
  onTogglePlayback,
  onCutSegment,
  onRestoreSegment
}: TimelineEditorProps) {
  const durationMs = Math.max(1, Math.round((durationInFrames / fps) * 1000));
  const currentTimeMs = Math.round((currentFrame / fps) * 1000);
  const progress = Math.min(100, Math.max(0, (currentFrame / durationInFrames) * 100));

  return (
    <div className="glass-card flex min-h-0 flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Timeline</h2>
          <p className="muted mt-1">Scrub, jump, and edit segments directly from the sequence.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1">{formatTimecode(currentTimeMs)}</span>
          <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1">{formatTimecode(durationMs)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-ghost inline-flex items-center gap-2 px-3 py-2" onClick={onTogglePlayback}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button className="btn-ghost inline-flex items-center gap-2 px-3 py-2" onClick={() => onSeekFrame(0)}>
          <SkipBack size={16} />
          Start
        </button>
        <button className="btn-ghost inline-flex items-center gap-2 px-3 py-2" onClick={() => onSeekFrame(Math.max(0, currentFrame - Math.round(fps * 5)))}>
          <RotateCcw size={16} />
          -5s
        </button>
        <button className="btn-ghost inline-flex items-center gap-2 px-3 py-2" onClick={() => onSeekFrame(Math.min(durationInFrames, currentFrame + Math.round(fps * 5)))}>
          <SkipForward size={16} />
          +5s
        </button>
      </div>

      <label className="block">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>Playhead</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <input
          className="w-full accent-emerald-400"
          type="range"
          min={0}
          max={durationInFrames}
          value={Math.min(durationInFrames, currentFrame)}
          onChange={(event) => onSeekFrame(Number(event.target.value))}
        />
      </label>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>Sequence map</span>
          <span>{sequenceSegments.length} segments</span>
        </div>
        <div className="relative h-16 overflow-hidden rounded-xl border border-slate-800 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_100%]">
          <div className="absolute inset-x-0 top-1/2 h-px bg-slate-800" />
          <div className="absolute bottom-2 left-0 h-8 border-l border-emerald-400/70" style={{ left: `${progress}%` }} />
          <div className="absolute inset-0 flex">
            {sequenceSegments.map((segment) => {
              const segmentStart = Math.max(0, segment.start_ms);
              const segmentEnd = Math.max(segmentStart + 1, segment.end_ms);
              const width = Math.max(3, ((segmentEnd - segmentStart) / durationMs) * 100);
              const left = (segmentStart / durationMs) * 100;
              const isActive = currentTimeMs >= segmentStart && currentTimeMs <= segmentEnd;
              const isIncluded = segment.include_in_export !== false;

              return (
                <button
                  key={segment.id}
                  type="button"
                  className={[
                    'absolute top-2 flex h-12 items-center rounded-xl border px-2 text-left text-[11px] leading-tight transition',
                    isIncluded
                      ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-50 hover:bg-emerald-500/30'
                      : 'border-slate-700 bg-slate-900/60 text-slate-400 line-through hover:border-slate-500',
                    isActive ? 'ring-2 ring-emerald-300/70' : ''
                  ].join(' ')}
                  style={{ left: `${left}%`, width: `${width}%` }}
                  onClick={() => onSeekFrame(Math.round((segment.start_ms / 1000) * fps))}
                >
                  <span className="truncate">{segment.id.slice(0, 8)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid min-h-0 gap-3 md:grid-cols-[1fr_280px]">
        <div className="min-h-0 rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-tight">Transcript rail</h3>
            <span className="text-xs text-slate-400">{transcriptSegments.length} markers</span>
          </div>
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {transcriptSegments.map((segment) => {
              const isActive = segment.id === currentTranscriptSegmentId;
              return (
                <div
                  key={segment.id}
                  className={[
                    'rounded-xl border p-3 transition',
                    isActive ? 'border-emerald-400/60 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/50'
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <button className="text-left text-sm text-slate-100" onClick={() => onSeekFrame(Math.round((segment.start_ms / 1000) * fps))}>
                      {segment.text}
                    </button>
                    <span className="whitespace-nowrap text-[11px] text-slate-500">
                      {formatTimecode(segment.start_ms)} - {formatTimecode(segment.end_ms)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-3">
          <h3 className="text-sm font-semibold tracking-tight">Segment actions</h3>
          <p className="muted mt-1">Cut or restore directly from the timeline map.</p>
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
            {sequenceSegments.map((segment) => (
              <div key={segment.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-100">{segment.include_in_export !== false ? 'Included' : 'Hidden'}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatTimecode(segment.start_ms)} - {formatTimecode(segment.end_ms)}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-500">{segment.id.slice(0, 8)}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-ghost inline-flex items-center gap-2 px-3 py-1.5 text-xs" onClick={() => onSeekFrame(Math.round((segment.start_ms / 1000) * fps))}>
                    Jump
                  </button>
                  <button
                    className="btn-ghost inline-flex items-center gap-2 px-3 py-1.5 text-xs"
                    onClick={() => (segment.include_in_export !== false ? onCutSegment(segment.id) : onRestoreSegment(segment.id))}
                  >
                    <Scissors size={14} />
                    {segment.include_in_export !== false ? 'Cut' : 'Restore'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}