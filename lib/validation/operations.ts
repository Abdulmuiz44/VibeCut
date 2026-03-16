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

const payloadSchemas = {
  CUT_SEGMENT: z.object({ segmentId: z.string().uuid() }),
  RESTORE_SEGMENT: z.object({ segmentId: z.string().uuid() }),
  REMOVE_SILENCE: z.object({ thresholdMs: z.number().int().min(100) }),
  REMOVE_FILLER_WORDS: z.object({ words: z.array(z.string()), caseInsensitive: z.boolean().default(true) }),
  TIGHTEN_PACING: z.object({ maxGapMs: z.number().int().min(50).max(1500) }),
  SET_ASPECT_RATIO: z.object({ aspectRatio: z.enum(['9:16', '1:1', '16:9']) }),
  SET_CAPTION_THEME: z.object({ theme: z.enum(['clean', 'bold_social', 'minimal']) }),
  ADD_TITLE_CARD: z.object({ text: z.string().min(1) }),
  ADD_OUTRO_CARD: z.object({ text: z.string().min(1) }),
  GENERATE_SHORT_CUT: z.object({ maxDurationMs: z.number().int().min(10000) }),
  UPDATE_SEQUENCE_SETTINGS: z.record(z.string(), z.any())
};

export const editOperationSchema = z.discriminatedUnion('operationType',
  Object.entries(payloadSchemas).map(([operationType, payload]) =>
    z.object({ operationType: z.literal(operationType as keyof typeof payloadSchemas), payload, summary: z.string().optional() })
  ) as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]
);

export type EditOperationInput = z.infer<typeof editOperationSchema>;
