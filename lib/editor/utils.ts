import type { EditOperationInput } from '@/lib/validation/operations';

export type OperationHistoryEntry = EditOperationInput & {
  id: string;
  created_at: string;
  source: string | null;
};

export type OperationRecordLike = {
  id?: string;
  created_at?: string;
  source?: string | null;
  operationType?: EditOperationInput['operationType'];
  operation_type?: EditOperationInput['operationType'];
  payload: EditOperationInput['payload'];
  summary?: string | null;
};

export type PersistedEditorState = {
  currentFrame: number;
  exportPreset: string;
  snapshotLabel: string;
};

export function createEditorStorageKey(projectId: string) {
  return `vibecut:editor:${projectId}`;
}

export function normalizeOperationEntry(operation: OperationRecordLike): OperationHistoryEntry {
  const operationType = operation.operationType ?? operation.operation_type;
  if (!operationType) {
    throw new Error('Operation type is required');
  }

  return {
    id: operation.id ?? crypto.randomUUID(),
    created_at: operation.created_at ?? new Date().toISOString(),
    source: operation.source ?? 'user',
    operationType,
    payload: operation.payload,
    summary: operation.summary ?? undefined
  } as OperationHistoryEntry;
}

export function formatOperationLabel(operation: Pick<EditOperationInput, 'operationType' | 'summary'>) {
  if (operation.summary?.trim()) {
    return operation.summary.trim();
  }

  return operation.operationType
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatExportStatus(status: string) {
  return status.replaceAll('_', ' ');
}

export function isTerminalExportStatus(status: string) {
  return status === 'completed' || status === 'failed';
}

export function parsePersistedEditorState(raw: string | null, allowedPresets: readonly string[]): PersistedEditorState | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<PersistedEditorState>;
    if (typeof parsed.currentFrame !== 'number' || parsed.currentFrame < 0) return null;
    if (typeof parsed.exportPreset !== 'string' || !allowedPresets.includes(parsed.exportPreset)) return null;
    if (typeof parsed.snapshotLabel !== 'string') return null;

    return {
      currentFrame: Math.round(parsed.currentFrame),
      exportPreset: parsed.exportPreset,
      snapshotLabel: parsed.snapshotLabel
    };
  } catch {
    return null;
  }
}
