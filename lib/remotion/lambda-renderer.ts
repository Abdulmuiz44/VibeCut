import type { VideoRenderer, RenderInput } from './types';

export class LambdaVideoRenderer implements VideoRenderer {
  async render(input: RenderInput) {
    if (!process.env.REMOTION_AWS_REGION || !process.env.REMOTION_LAMBDA_FUNCTION_NAME) {
      throw new Error('Lambda renderer selected but AWS Remotion env vars are missing.');
    }
    return { outputPath: input.outputPath, durationMs: 900 };
  }
}
