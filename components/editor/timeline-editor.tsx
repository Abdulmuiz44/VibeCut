'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
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
  currentSequenceSegmentId?: string | null;
  currentTranscriptSegmentId?: string | null;
  onSeekFrame: (frame: number) => void;
  onTogglePlayback: () => void;
  onCutSegment: (segmentId: string) => void;
  onRestoreSegment: (segmentId: string) => void;
  onTrimSegment: (segmentId: string, trimSide: 'start' | 'end', newTimeMs: number) => void;
};

type TrimState = {
  segmentId: string;
  trimSide: 'start' | 'end';
  previewMs: number;
};

type ScrubState = {
  active: boolean;
};

function formatTimecode(ms: number) {
  const safeMs = Math.max(0, Math.round(ms));
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((safeMs % 1000) / 100);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function compactText(text: string) {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 4)
    .join(' ');
}

export function TimelineEditor({
  durationInFrames,
  fps,
  currentFrame,
  isPlaying,
  sequenceSegments,
  transcriptSegments,
  currentSequenceSegmentId,
  currentTranscriptSegmentId,
  onSeekFrame,
  onTogglePlayback,
  onCutSegment,
  onRestoreSegment,
  onTrimSegment
}: TimelineEditorProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [activeTrim, setActiveTrim] = useState<TrimState | null>(null);
  const [scrubState, setScrubState] = useState<ScrubState | null>(null);
  const durationMs = Math.max(1, Math.round((durationInFrames / fps) * 1000));
  const currentTimeMs = Math.round((currentFrame / fps) * 1000);
  const progress = Math.min(100, Math.max(0, (currentFrame / durationInFrames) * 100));
  const trimPreview = activeTrim;

  const timelineCues = useMemo(
    () =>
      sequenceSegments.map((segment) => {
        const relatedTranscript = transcriptSegments.filter((transcript) => transcript.start_ms < segment.end_ms && transcript.end_ms > segment.start_ms);
        const joinedTranscript = relatedTranscript.map((transcript) => transcript.text).join(' ');
        const cueText = compactText(joinedTranscript || segment.id);
        const lengthRatio = Math.max(0.08, (segment.end_ms - segment.start_ms) / durationMs);
        const cueBars = Array.from({ length: 8 }).map((_, index) => {
          const base = hashString(`${segment.id}:${cueText}:${index}`);
          const amplitude = 18 + (base % 46);
          return Math.max(12, Math.min(72, Math.round(amplitude * lengthRatio * 1.7)));
        });

        return {
          id: segment.id,
          cueText,
          cueBars,
          start_ms: segment.start_ms,
          end_ms: segment.end_ms,
          include_in_export: segment.include_in_export !== false
        };
      }),
    [durationMs, sequenceSegments, transcriptSegments]
  );

  const msFromClientX = useCallback((clientX: number) => {
    const rect = railRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return Math.round(ratio * durationMs);
  }, [durationMs]);

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const nextTimeMs = msFromClientX(clientX);
      onSeekFrame(Math.round((nextTimeMs / 1000) * fps));
    },
    [fps, msFromClientX, onSeekFrame]
  );

  const beginTrim = (segmentId: string, trimSide: 'start' | 'end', event: ReactPointerEvent<HTMLButtonElement>, initialMs: number) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveTrim({ segmentId, trimSide, previewMs: initialMs });
  };

  useEffect(() => {
    if (!activeTrim) return;

    const moveHandler = (event: PointerEvent) => {
      setActiveTrim((current) => {
        if (!current) return null;
        return { ...current, previewMs: msFromClientX(event.clientX) };
      });
    };

    const upHandler = (event: PointerEvent) => {
      const nextTimeMs = msFromClientX(event.clientX);
      onTrimSegment(activeTrim.segmentId, activeTrim.trimSide, nextTimeMs);
      setActiveTrim(null);
    };

    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerup', upHandler, { once: true });

    return () => {
      window.removeEventListener('pointermove', moveHandler);
    };
  }, [activeTrim, msFromClientX, onTrimSegment]);

  useEffect(() => {
    if (!scrubState?.active) return;

    const moveHandler = (event: PointerEvent) => {
      seekFromClientX(event.clientX);
    };

    const upHandler = () => {
      setScrubState(null);
    };

    window.addEventListener('pointermove', moveHandler);
    window.addEventListener('pointerup', upHandler, { once: true });

    return () => {
      window.removeEventListener('pointermove', moveHandler);
    };
  }, [scrubState, seekFromClientX]);

  const stripFrames = useMemo(() => {
    const source = timelineCues.length ? timelineCues : sequenceSegments.map((segment) => ({ id: segment.id, cueText: segment.id, start_ms: segment.start_ms, end_ms: segment.end_ms }));
    const totalFrames = Math.min(10, Math.max(4, source.length));

    return Array.from({ length: totalFrames }).map((_, index) => {
      const cue = source[Math.min(source.length - 1, Math.floor((index / totalFrames) * source.length))];
      const tone = 20 + ((hashString(`${cue.id}:${index}`) % 5) * 6);

      return {
        id: `${cue.id}-${index}`,
        label: compactText(cue.cueText),
        time: formatTimecode(cue.start_ms),
        tone,
        start_ms: cue.start_ms
      };
    });
  }, [sequenceSegments, timelineCues]);

  return (
    <div className="glass-card flex min-h-0 flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Timeline</h2>
          <p className="muted mt-1">Scrub, jump, trim, and edit segments directly from the sequence.</p>
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
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
          <span>Timeline cues</span>
          <span>Waveform and segment hints</span>
        </div>
        <div className="mb-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/80 p-2">
          <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-slate-500">
            <span>Thumbnail strip</span>
            <span>{stripFrames.length} frames</span>
          </div>
          <div className="grid gap-2 md:grid-cols-5">
            {stripFrames.map((frame) => (
              <button
                key={frame.id}
                type="button"
                className="group overflow-hidden rounded-lg border border-slate-800 bg-slate-900/70 text-left transition hover:border-emerald-400/40"
                onClick={() => onSeekFrame(Math.round((frame.start_ms / 1000) * fps))}
              >
                <div
                  className="flex h-20 items-end justify-between bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-3"
                  style={{ backgroundColor: `rgba(${frame.tone}, ${frame.tone + 6}, ${frame.tone + 12}, 0.18)` }}
                >
                  <span className="max-w-[70%] truncate text-xs font-medium text-slate-100">{frame.label}</span>
                  <span className="text-[10px] text-slate-400">{frame.time}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4 grid gap-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70 p-2 md:grid-cols-4">
          {timelineCues.slice(0, 4).map((cue) => (
            <button
              key={cue.id}
              type="button"
              className={[
                'group min-w-0 rounded-lg border p-3 text-left transition',
                cue.include_in_export ? 'border-slate-700 bg-slate-900/70 hover:border-emerald-400/40' : 'border-slate-800 bg-slate-950/40 opacity-60'
              ].join(' ')}
              onClick={() => onSeekFrame(Math.round((cue.start_ms / 1000) * fps))}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-100">{cue.cueText}</p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {formatTimecode(cue.start_ms)} - {formatTimecode(cue.end_ms)}
                  </p>
                </div>
                <span className="rounded-full border border-slate-700 bg-slate-950/80 px-2 py-0.5 text-[10px] text-slate-400">{cue.cueBars.length} bars</span>
              </div>
              <div className="mt-3 flex h-14 items-end gap-[3px] overflow-hidden rounded-md bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] px-2 py-2">
                {cue.cueBars.map((height, index) => (
                  <span
                    key={`${cue.id}-cue-${index}`}
                    className="w-full rounded-full bg-emerald-300/70 transition group-hover:bg-emerald-300"
                    style={{ height: `${height}%`, opacity: 0.55 + index * 0.04 }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>

        <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
          <span>Sequence map</span>
          <span>{sequenceSegments.length} segments</span>
        </div>
        <div
          ref={railRef}
          className="relative h-20 overflow-hidden rounded-xl border border-slate-800 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_100%]"
          onPointerDown={(event) => {
            const target = event.target as HTMLElement | null;
            if (target?.closest('button')) return;
            seekFromClientX(event.clientX);
            setScrubState({ active: true });
          }}
        >
          <div className="absolute inset-x-0 top-1/2 h-px bg-slate-800" />
          <div className="absolute inset-x-0 top-2 flex items-center gap-1 px-2">
            {transcriptSegments.slice(0, 24).map((segment) => (
              <span
                key={segment.id}
                className={[
                  'h-1.5 rounded-full transition',
                  segment.id === currentTranscriptSegmentId ? 'bg-emerald-300' : 'bg-slate-600/80'
                ].join(' ')}
                style={{ width: `${Math.max(6, ((segment.end_ms - segment.start_ms) / durationMs) * 100)}%` }}
              />
            ))}
          </div>
          <div className="absolute bottom-2 left-0 h-8 border-l border-emerald-400/70" style={{ left: `${progress}%` }} />
          <div className="absolute inset-0 flex">
            {sequenceSegments.map((segment) => {
              const segmentStart = Math.max(0, segment.start_ms);
              const segmentEnd = Math.max(segmentStart + 1, segment.end_ms);
              const width = Math.max(3, ((segmentEnd - segmentStart) / durationMs) * 100);
              const left = (segmentStart / durationMs) * 100;
              const isActive = segment.id === currentSequenceSegmentId || (currentTimeMs >= segmentStart && currentTimeMs <= segmentEnd);
              const isIncluded = segment.include_in_export !== false;
              const isTrimmed = trimPreview?.segmentId === segment.id;

              return (
                <div
                  key={segment.id}
                  className="absolute top-2 h-14 rounded-xl transition"
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  <button
                    type="button"
                    className={[
                      'relative flex h-full w-full items-center overflow-hidden rounded-xl border px-2 text-left text-[11px] leading-tight transition',
                      isIncluded
                        ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-50 hover:bg-emerald-500/30'
                        : 'border-slate-700 bg-slate-900/60 text-slate-400 line-through hover:border-slate-500',
                      isActive ? 'ring-2 ring-emerald-300/70' : '',
                      isTrimmed ? 'shadow-[0_0_0_1px_rgba(125,211,252,0.35)]' : ''
                    ].join(' ')}
                    onClick={() => onSeekFrame(Math.round((segment.start_ms / 1000) * fps))}
                  >
                    <div className="flex w-full items-center gap-1">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <span
                          key={`${segment.id}-wave-${index}`}
                          className="w-1 rounded-full bg-current opacity-60"
                          style={{ height: `${18 + ((index + segment.id.length) % 5) * 5}px` }}
                        />
                      ))}
                      <span className="ml-2 truncate">{segment.id.slice(0, 8)}</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="absolute left-0 top-0 h-full w-3 cursor-ew-resize rounded-l-xl bg-white/0 hover:bg-sky-400/20"
                    onPointerDown={(event) => beginTrim(segment.id, 'start', event, segment.start_ms)}
                    aria-label={`Trim start of ${segment.id}`}
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full w-3 cursor-ew-resize rounded-r-xl bg-white/0 hover:bg-sky-400/20"
                    onPointerDown={(event) => beginTrim(segment.id, 'end', event, segment.end_ms)}
                    aria-label={`Trim end of ${segment.id}`}
                  />
                </div>
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
              <div
                key={segment.id}
                className={[
                  'rounded-xl border p-3 text-sm transition',
                  segment.id === currentSequenceSegmentId ? 'border-emerald-400/50 bg-emerald-500/10' : 'border-slate-800 bg-slate-900/50'
                ].join(' ')}
              >
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
