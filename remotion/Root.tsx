import { Composition } from 'remotion';
import { VibeCutComposition } from './compositions/VibeCutComposition';

export const RemotionRoot: React.FC = () => (
  <Composition id="VibeCutComposition" component={VibeCutComposition} durationInFrames={900} fps={30} width={1080} height={1920} defaultProps={{ sequenceSegments: [], transcriptSegments: [] }} />
);
