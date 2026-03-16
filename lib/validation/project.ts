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
