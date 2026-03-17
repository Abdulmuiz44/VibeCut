import { openai } from '@/lib/openai/client';

export async function transcribeFromUrl(file: File) {
  return openai.audio.transcriptions.create({
    file,
    model: 'gpt-4o-mini-transcribe',
    response_format: 'verbose_json',
    timestamp_granularities: ['segment', 'word']
  });
}
