import { AbsoluteFill, Sequence, Video, staticFile, useCurrentFrame } from 'remotion';

export function VibeCutComposition({ sequenceSegments, transcriptSegments }: { sequenceSegments: any[]; transcriptSegments: any[] }) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {sequenceSegments.filter((segment) => segment.include_in_export !== false).map((segment, index) => (
        <Sequence key={segment.id ?? index} from={Math.floor(segment.start_ms / 33.33)} durationInFrames={Math.max(1, Math.floor((segment.end_ms - segment.start_ms) / 33.33))}>
          <Video src={staticFile('placeholder.mp4')} style={{ objectFit: 'cover' }} />
        </Sequence>
      ))}
      <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 120 }}>
        <p style={{ background: 'rgba(0,0,0,0.6)', borderRadius: 9999, padding: '12px 16px', fontSize: 30 }}>
          {transcriptSegments.find((seg) => frame * 33.33 >= seg.start_ms && frame * 33.33 <= seg.end_ms)?.text ?? ''}
        </p>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
