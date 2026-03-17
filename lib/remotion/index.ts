import type { VideoRenderer } from './types';
import { LocalVideoRenderer } from './local-renderer';
import { LambdaVideoRenderer } from './lambda-renderer';

export function getRenderer(): VideoRenderer {
  return process.env.REMOTION_RENDER_MODE === 'lambda' ? new LambdaVideoRenderer() : new LocalVideoRenderer();
}
