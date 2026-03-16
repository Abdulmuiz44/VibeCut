import { openai } from './client';
import { editOperationSchema } from '@/lib/validation/operations';

export async function proposeOperations(prompt: string, context: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: 'Convert user intent into safe edit operations JSON: {"operations": EditOperation[]}' },
      { role: 'user', content: `Context: ${context}\nPrompt: ${prompt}` }
    ]
  });

  const raw = completion.choices[0]?.message?.content ?? '{"operations": []}';
  const parsed = JSON.parse(raw);
  const operations = (parsed.operations ?? []).map((value: unknown) => editOperationSchema.parse(value));
  return operations;
}
