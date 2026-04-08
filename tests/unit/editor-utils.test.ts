import { describe, expect, test } from 'vitest';
import {
  createEditorStorageKey,
  formatExportStatus,
  formatOperationLabel,
  isTerminalExportStatus,
  normalizeOperationEntry,
  parsePersistedEditorState
} from '@/lib/editor/utils';

describe('editor utils', () => {
  test('normalizes snake_case operation rows', () => {
    const operation = normalizeOperationEntry({
      id: 'row-1',
      created_at: '2026-04-08T00:00:00.000Z',
      source: 'user',
      operation_type: 'CUT_SEGMENT',
      payload: { segmentId: '11111111-1111-1111-1111-111111111111' },
      summary: 'Cut current segment'
    });

    expect(operation.operationType).toBe('CUT_SEGMENT');
    expect(operation.created_at).toBe('2026-04-08T00:00:00.000Z');
  });

  test('parses persisted editor state', () => {
    const state = parsePersistedEditorState(
      JSON.stringify({ currentFrame: 120, exportPreset: 'square_1080x1080', snapshotLabel: 'Before cleanup' }),
      ['social_vertical_1080x1920', 'square_1080x1080']
    );

    expect(state).toEqual({ currentFrame: 120, exportPreset: 'square_1080x1080', snapshotLabel: 'Before cleanup' });
  });

  test('rejects invalid persisted state', () => {
    expect(parsePersistedEditorState('{"currentFrame":-1}', ['social_vertical_1080x1920'])).toBeNull();
  });

  test('formats labels and statuses', () => {
    expect(formatOperationLabel({ operationType: 'REMOVE_SILENCE', summary: undefined })).toBe('Remove Silence');
    expect(formatExportStatus('in_progress')).toBe('in progress');
    expect(isTerminalExportStatus('completed')).toBe(true);
    expect(isTerminalExportStatus('processing')).toBe(false);
    expect(createEditorStorageKey('project-1')).toBe('vibecut:editor:project-1');
  });
});
