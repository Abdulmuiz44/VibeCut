import { editOperationSchema } from '@/lib/validation/operations';
import { getMistralBaseUrl, getMistralChatModel, getMistralHeaders } from './client';

type MistralContentPart = { type?: string; text?: string };

function normalizeContent(content: unknown): string {
  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part;
        if (part && typeof part === 'object' && 'text' in part) {
          const candidate = (part as MistralContentPart).text;
          return typeof candidate === 'string' ? candidate : '';
        }
        return '';
      })
      .join('');
  }

  return '';
}

export async function proposeOperations(prompt: string, context: string) {
  const response = await fetch(`${getMistralBaseUrl()}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      ...getMistralHeaders(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: getMistralChatModel(),
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Convert user intent into safe edit operations JSON: {"operations": EditOperation[]}. Prefer CUT_SEGMENT, RESTORE_SEGMENT, TRIM_SEGMENT, TIGHTEN_PACING, REMOVE_SILENCE, SET_ASPECT_RATIO, and SET_CAPTION_THEME. Return only JSON.'
        },
        { role: 'user', content: `Context: ${context}\nPrompt: ${prompt}` }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mistral chat completion failed (${response.status}): ${errorText}`);
  }

  const completion = (await response.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };

  const raw = normalizeContent(completion.choices?.[0]?.message?.content) || '{"operations": []}';
  const parsed = JSON.parse(raw) as { operations?: unknown[] };

  return (parsed.operations ?? []).map((value) => editOperationSchema.parse(value));
}
