import { secrets } from 'base44:runtime';

// ─────────────────────────────────────────────────────────────────────────────
// aiGateway — Shared Vercel AI Gateway helper for backend functions.
//
// Drop-in replacement for the credit-blocked Base44 Core integrations
// (InvokeLLM, GenerateImage). Routes through Vercel's AI Gateway which has
// its own billing separate from Base44 integration credits.
//
// Usage:
//   import { generateText } from '../../shared/aiGateway.ts';
//   const { parsed } = await generateText({ prompt, model, response_json_schema });
//
// For images, call the vercelAiGateway function instead (it handles upload):
//   await base44.functions.invoke('vercelAiGateway', { action: 'generateImage', prompt });
// ─────────────────────────────────────────────────────────────────────────────

const GATEWAY_BASE = 'https://ai-gateway.vercel.sh/v1';

export async function generateText(opts: {
  prompt: string;
  system_prompt?: string;
  model?: string;
  response_json_schema?: any;
  file_urls?: string[];
}): Promise<{ text: string; parsed: any; usage: any; model: string }> {
  const apiKey = secrets.get('VERCEL_AI_GATEWAY_API_KEY') || secrets.get('VERCEL_API_TOKEN');
  if (!apiKey) throw new Error('VERCEL_AI_GATEWAY_API_KEY secret not set');

  const messages: any[] = [];
  if (opts.system_prompt) messages.push({ role: 'system', content: opts.system_prompt });

  const content: any[] = [{ type: 'text', text: opts.prompt }];
  if (opts.file_urls && Array.isArray(opts.file_urls) && opts.file_urls.length > 0) {
    for (const url of opts.file_urls) content.push({ type: 'image_url', image_url: { url } });
  }
  messages.push({ role: 'user', content });

  const payload: any = {
    model: opts.model || 'anthropic/claude-opus-4.7',
    messages,
  };

  if (opts.response_json_schema) {
    payload.response_format = { type: 'json_schema', json_schema: { name: 'response', schema: opts.response_json_schema } };
  }

  const res = await fetch(`${GATEWAY_BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI Gateway error: ${err}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';

  let parsed: any = text;
  if (opts.response_json_schema) {
    try { parsed = JSON.parse(text); } catch { parsed = text; }
  }

  return { text, parsed, usage: data.usage, model: data.model };
}