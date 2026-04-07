import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(1).max(120)
});

export const createUploadSchema = z.object({
  projectId: z.string().uuid(),
  fileName: z.string().min(1),
  mimeType: z.enum(['video/mp4', 'video/quicktime', 'video/webm']),
  sizeBytes: z.number().int().min(1).max(2_000_000_000)
});

export const exportPresetSchema = z.enum(['social_vertical_1080x1920', 'square_1080x1080', 'landscape_1920x1080']);

export const createExportSchema = z.object({
  projectId: z.string().uuid(),
  sequenceId: z.string().uuid(),
  preset: exportPresetSchema
});

export const createSnapshotSchema = z.object({
  projectId: z.string().uuid(),
  sequenceId: z.string().uuid(),
  label: z.string().min(1).max(120).optional()
});
