function getMistralApiKey() {
  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    throw new Error('MISTRAL_API_KEY is missing');
  }

  return apiKey;
}

export function getMistralChatModel() {
  return process.env.MISTRAL_EDIT_MODEL ?? 'mistral-large-latest';
}

export function getMistralTranscriptionModel() {
  return process.env.MISTRAL_TRANSCRIBE_MODEL ?? 'voxtral-mini-latest';
}

export function getMistralBaseUrl() {
  return process.env.MISTRAL_BASE_URL ?? 'https://api.mistral.ai';
}

export function getMistralHeaders() {
  return {
    Authorization: `Bearer ${getMistralApiKey()}`
  };
}
