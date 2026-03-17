import { z } from 'zod';

export const operationTypeSchema = z.enum([
  'CUT_SEGMENT',
  'RESTORE_SEGMENT',
  'REMOVE_SILENCE',
  'REMOVE_FILLER_WORDS',
  'TIGHTEN_PACING',
  'SET_ASPECT_RATIO',
  'SET_CAPTION_THEME',
  'ADD_TITLE_CARD',
  'ADD_OUTRO_CARD',
  'GENERATE_SHORT_CUT',
  'UPDATE_SEQUENCE_SETTINGS'
]);

const cutSegmentOperationSchema = z.object({
  operationType: z.literal('CUT_SEGMENT'),
  payload: z.object({ segmentId: z.string().uuid() }),
  summary: z.string().optional()
});

const restoreSegmentOperationSchema = z.object({
  operationType: z.literal('RESTORE_SEGMENT'),
  payload: z.object({ segmentId: z.string().uuid() }),
  summary: z.string().optional()
});

const removeSilenceOperationSchema = z.object({
  operationType: z.literal('REMOVE_SILENCE'),
  payload: z.object({ thresholdMs: z.number().int().min(100) }),
  summary: z.string().optional()
});

const removeFillerWordsOperationSchema = z.object({
  operationType: z.literal('REMOVE_FILLER_WORDS'),
  payload: z.object({ words: z.array(z.string()), caseInsensitive: z.boolean().default(true) }),
  summary: z.string().optional()
});

const tightenPacingOperationSchema = z.object({
  operationType: z.literal('TIGHTEN_PACING'),
  payload: z.object({ maxGapMs: z.number().int().min(50).max(1500) }),
  summary: z.string().optional()
});

const setAspectRatioOperationSchema = z.object({
  operationType: z.literal('SET_ASPECT_RATIO'),
  payload: z.object({ aspectRatio: z.enum(['9:16', '1:1', '16:9']) }),
  summary: z.string().optional()
});

const setCaptionThemeOperationSchema = z.object({
  operationType: z.literal('SET_CAPTION_THEME'),
  payload: z.object({ theme: z.enum(['clean', 'bold_social', 'minimal']) }),
  summary: z.string().optional()
});

const addTitleCardOperationSchema = z.object({
  operationType: z.literal('ADD_TITLE_CARD'),
  payload: z.object({ text: z.string().min(1) }),
  summary: z.string().optional()
});

const addOutroCardOperationSchema = z.object({
  operationType: z.literal('ADD_OUTRO_CARD'),
  payload: z.object({ text: z.string().min(1) }),
  summary: z.string().optional()
});

const generateShortCutOperationSchema = z.object({
  operationType: z.literal('GENERATE_SHORT_CUT'),
  payload: z.object({ maxDurationMs: z.number().int().min(10000) }),
  summary: z.string().optional()
});

const updateSequenceSettingsOperationSchema = z.object({
  operationType: z.literal('UPDATE_SEQUENCE_SETTINGS'),
  payload: z.record(z.string(), z.any()),
  summary: z.string().optional()
});

export const editOperationSchema = z.discriminatedUnion('operationType', [
  cutSegmentOperationSchema,
  restoreSegmentOperationSchema,
  removeSilenceOperationSchema,
  removeFillerWordsOperationSchema,
  tightenPacingOperationSchema,
  setAspectRatioOperationSchema,
  setCaptionThemeOperationSchema,
  addTitleCardOperationSchema,
  addOutroCardOperationSchema,
  generateShortCutOperationSchema,
  updateSequenceSettingsOperationSchema
]);

export type EditOperationInput = z.infer<typeof editOperationSchema>;
