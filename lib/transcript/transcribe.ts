import { getMistralBaseUrl, getMistralHeaders, getMistralTranscriptionModel } from '@/lib/mistral/client';

export async function transcribeFromUrl(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', getMistralTranscriptionModel());
  formData.append('timestamp_granularities', 'segment');
  formData.append('timestamp_granularities', 'word');

  const response = await fetch(`${getMistralBaseUrl()}/v1/audio/transcriptions`, {
    method: 'POST',
    headers: getMistralHeaders(),
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mistral transcription failed (${response.status}): ${errorText}`);
  }

  return response.json();
}
