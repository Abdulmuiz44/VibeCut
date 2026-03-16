import type { VideoRenderer, RenderInput } from './types';

export class LocalVideoRenderer implements VideoRenderer {
  async render(input: RenderInput) {
    // Stub for MVP repository bootstrap; wire renderMedia in deployment env.
    return { outputPath: input.outputPath, durationMs: 1200 };
  }
}
