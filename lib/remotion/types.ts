export type RenderInput = { exportId: string; compositionProps: Record<string, unknown>; outputPath: string };
export type RenderResult = { outputPath: string; durationMs: number };

export interface VideoRenderer {
  render(input: RenderInput): Promise<RenderResult>;
}
