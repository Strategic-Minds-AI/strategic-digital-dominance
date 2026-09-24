import { generateText as generateGatewayText } from './aiGateway.ts';
import { sendEmail as sendXtremeEmail } from './xtremeGateway.ts';
import { generateText as generateSdkText } from 'npm:ai';
import { createGateway } from 'npm:@ai-sdk/gateway';
import { secrets } from 'base44:runtime';

const MODEL_ALIASES: Record<string, string> = {
  automatic: 'openai/gpt-5.6-sol',
  gemini_3_flash: 'google/gemini-3.6-flash',
  gemini_3_1_pro: 'google/gemini-3.1-pro-preview',
  'claude-sonnet-5': 'anthropic/claude-sonnet-5',
  claude_opus_5: 'anthropic/claude-opus-5',
  gpt_5_4: 'openai/gpt-5.4',
  gpt_5_mini: 'openai/gpt-5.4-mini',
  gpt_5_6_sol: 'openai/gpt-5.6-sol',
  gpt_5_6_luna: 'openai/gpt-5.6-sol',
};

export function normalizeModel(model?: string): string | undefined {
  if (!model) return undefined;
  return MODEL_ALIASES[model] || model;
}

function parseJsonLoose(value: string): any {
  const raw = String(value || '').trim();
  try { return JSON.parse(raw); } catch {}
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()); } catch {}
  }
  const object = raw.match(/\{[\s\S]*\}/);
  if (object) {
    try { return JSON.parse(object[0]); } catch {}
  }
  const array = raw.match(/\[[\s\S]*\]/);
  if (array) {
    try { return JSON.parse(array[0]); } catch {}
  }
  return raw;
}

async function webGroundedText(options: any): Promise<string> {
  const apiKey = secrets.get('VERCEL_AI_GATEWAY_API_KEY') || secrets.get('AI_GATEWAY_API_KEY') || secrets.get('VERCEL_API_TOKEN');
  if (!apiKey) throw new Error('AI Gateway key is not configured');

  const gateway = createGateway({ apiKey });
  const modelId = normalizeModel(options?.model) || 'openai/gpt-5.6-sol';
  const result = await generateSdkText({
    model: gateway(modelId),
    system: options?.system_prompt || undefined,
    prompt: options?.prompt || '',
    temperature: options?.temperature ?? 0.2,
    tools: {
      web_search: gateway.tools.perplexitySearch({
        maxResults: 10,
        maxTokens: 25000,
        maxTokensPerPage: 2048,
      }),
    },
  });
  return result.text || '';
}

// Drop-in semantic replacement for Core.InvokeLLM.
// Keeps the old call contract while moving execution to Vercel AI Gateway.
export async function invokeIndependentAi(_base44: any, options: any) {
  if (!options?.prompt) throw new Error('prompt required');

  let text: string;
  let parsed: any;

  if (options.add_context_from_internet) {
    text = await webGroundedText(options);
    parsed = options.response_json_schema ? parseJsonLoose(text) : text;
  } else {
    const result = await generateGatewayText({
      prompt: options.prompt,
      system_prompt: options.system_prompt,
      model: normalizeModel(options.model),
      response_json_schema: options.response_json_schema,
      file_urls: options.file_urls,
    });
    text = result.text;
    parsed = options.response_json_schema ? result.parsed : result.text;
  }

  if (options.response_json_schema && (parsed === undefined || parsed === null || typeof parsed === 'string')) {
    const reparsed = parseJsonLoose(text);
    if (typeof reparsed === 'string') {
      throw new Error('Independent AI did not return valid structured data');
    }
    parsed = reparsed;
  }

  return options.response_json_schema ? parsed : text;
}

export async function sendIndependentEmail(_base44: any, options: any) {
  if (!options?.to || !options?.subject) throw new Error('to and subject required');
  return sendXtremeEmail(
    options.to,
    options.subject,
    options.body || options.text || (typeof options.html === 'string' ? options.html.replace(/<[^>]+>/g, ' ') : '')
  );
}
