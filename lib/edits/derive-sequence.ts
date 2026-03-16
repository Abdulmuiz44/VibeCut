import type { EditOperationInput } from '@/lib/validation/operations';

export type SequenceSegment = {
  id: string;
  text: string;
  start_ms: number;
  end_ms: number;
  include_in_export: boolean;
};

export function deriveSequence(baseSegments: SequenceSegment[], operations: EditOperationInput[]) {
  const next = structuredClone(baseSegments);

  for (const op of operations) {
    if (op.operationType === 'CUT_SEGMENT') {
      const target = next.find((segment) => segment.id === op.payload.segmentId);
      if (target) target.include_in_export = false;
    }
    if (op.operationType === 'RESTORE_SEGMENT') {
      const target = next.find((segment) => segment.id === op.payload.segmentId);
      if (target) target.include_in_export = true;
    }
    if (op.operationType === 'TIGHTEN_PACING') {
      let cursor = 0;
      for (const segment of next.filter((s) => s.include_in_export)) {
        const duration = segment.end_ms - segment.start_ms;
        segment.start_ms = cursor;
        segment.end_ms = cursor + duration;
        cursor = segment.end_ms + Math.min(120, op.payload.maxGapMs);
      }
    }
  }

  return next;
}

export function generateSilenceCuts(segments: SequenceSegment[], thresholdMs: number) {
  const ops: EditOperationInput[] = [];
  const sorted = [...segments].sort((a, b) => a.start_ms - b.start_ms);
  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].start_ms - sorted[i - 1].end_ms;
    if (gap > thresholdMs) {
      ops.push({ operationType: 'REMOVE_SILENCE', payload: { thresholdMs }, summary: `Detected ${gap}ms silence near segment ${sorted[i].id}` });
    }
  }
  return ops;
}

export function removeFillerWords(text: string, words: string[]) {
  const pattern = new RegExp(`\\b(${words.join('|')})\\b`, 'gi');
  return text.replace(pattern, '').replace(/\s+/g, ' ').trim();
}
