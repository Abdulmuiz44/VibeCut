import { describe, expect, test } from 'vitest';
import { editOperationSchema } from '@/lib/validation/operations';
import { deriveSequence, generateSilenceCuts, removeFillerWords } from '@/lib/edits/derive-sequence';

describe('operation schema', () => {
  test('accepts known operation payload', () => {
    const parsed = editOperationSchema.parse({ operationType: 'SET_ASPECT_RATIO', payload: { aspectRatio: '9:16' } });
    expect(parsed.operationType).toBe('SET_ASPECT_RATIO');
  });

  test('rejects unknown operation', () => {
    expect(() => editOperationSchema.parse({ operationType: 'DROP_TABLE', payload: {} })).toThrow();
  });
});

describe('heuristic edits', () => {
  test('detects silence gaps', () => {
    const ops = generateSilenceCuts([
      { id: 'a', text: 'one', start_ms: 0, end_ms: 1000, include_in_export: true },
      { id: 'b', text: 'two', start_ms: 2500, end_ms: 3000, include_in_export: true }
    ], 1000);
    expect(ops.length).toBe(1);
    expect(ops[0].operationType).toBe('REMOVE_SILENCE');
  });

  test('removes filler words', () => {
    expect(removeFillerWords('um this is like really great', ['um', 'like'])).toBe('this is really great');
  });

  test('cuts sequence with operation log', () => {
    const out = deriveSequence([{ id: 'seg', text: 'hello', start_ms: 0, end_ms: 1000, include_in_export: true }], [{ operationType: 'CUT_SEGMENT', payload: { segmentId: 'seg' } }]);
    expect(out[0].include_in_export).toBe(false);
  });
});
