import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { secrets } from 'base44:runtime';

// ─────────────────────────────────────────────────────────────────────────────
// vercelAiGateway — Free/cheap AI via Vercel AI Gateway.
//
// This is a drop-in alternative to the blocked Base44 Core integrations
// (InvokeLLM, GenerateImage). It routes through Vercel's AI Gateway which
// has its own billing separate from Base44 integration credits.
//
// Actions:
//   generateText  — LLM text generation (replaces InvokeLLM)
//   generateImage — Text-to-image generation (replaces GenerateImage)
//   editImage     — Image editing with a reference image (for floor visualizer)
//
// Models (defaults set to the absolute best available):
//   Text:  anthropic/claude-opus-4.7 (best — most capable), openai/gpt-5.4 (fast + smart), openai/gpt-5.4-mini (cheapest)
//   Image: openai/gpt-image-2 (best for generation), google/gemini-3.1-flash-image-preview (best for editing — Nano Banana)
//
// Generated images are uploaded to Supabase Storage and returned as public URLs.
// ─────────────────────────────────────────────────────────────────────────────

const GATEWAY_BASE = 'https://ai-gateway.vercel.sh/v1';
const BUCKET_NAME = 'epoxy-uploads';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = secrets.get('VERCEL_API_TOKEN');
    if (!apiKey) return Response.json({ error: 'VERCEL_API_TOKEN secret not set' }, { status: 500 });

    const body = await req.json();
    const { action } = body;

    // ── generateText: LLM text generation ──
    if (action === 'generateText') {
      const { prompt, model, system_prompt, response_json_schema, file_urls } = body;
      if (!prompt) return Response.json({ error: 'prompt required' }, { status: 400 });

      const messages: any[] = [];
      if (system_prompt) messages.push({ role: 'system', content: system_prompt });

      // Build user message — support text + optional image inputs
      const content: any[] = [{ type: 'text', text: prompt }];
      if (file_urls && Array.isArray(file_urls) && file_urls.length > 0) {
        for (const url of file_urls) {
          content.push({ type: 'image_url', image_url: { url } });
        }
      }
      messages.push({ role: 'user', content });

      const payload: any = {
        model: model || 'anthropic/claude-opus-4.7',
        messages,
      };

      // Structured output (JSON schema)
      if (response_json_schema) {
        payload.response_format = { type: 'json_schema', json_schema: { name: 'response', schema: response_json_schema } };
      }

      const res = await fetch(`${GATEWAY_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `AI Gateway error: ${err}`, status: res.status }, { status: 500 });
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || '';

      // If JSON schema was requested, parse the response
      let parsed = text;
      if (response_json_schema) {
        try { parsed = JSON.parse(text); } catch { parsed = text; }
      }

      return Response.json({ ok: true, text, parsed, usage: data.usage, model: data.model });
    }

    // ── generateImage: Text-to-image generation ──
    if (action === 'generateImage') {
      const { prompt, model, n, size } = body;
      if (!prompt) return Response.json({ error: 'prompt required' }, { status: 400 });

      const imageModel = model || 'openai/gpt-image-2';
      const payload: any = {
        model: imageModel,
        prompt,
        n: n || 1,
        response_format: 'b64_json',
      };
      if (size) payload.size = size;

      const res = await fetch(`${GATEWAY_BASE}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `AI Gateway image error: ${err}`, status: res.status }, { status: 500 });
      }

      const data = await res.json();
      const images = data.data || [];

      // Upload each image to Supabase Storage and return public URLs
      const urls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const b64 = images[i].b64_json;
        if (!b64) continue;
        const dataUrl = `data:image/png;base64,${b64}`;
        const uploadRes = await base44.functions.invoke('supabaseUpload', {
          file_data: dataUrl,
          filename: `ai-gen-${Date.now()}-${i}.png`,
          content_type: 'image/png',
        });
        if (uploadRes.data?.file_url) urls.push(uploadRes.data.file_url);
      }

      return Response.json({ ok: true, urls, count: urls.length, model: imageModel });
    }

    // ── editImage: Image editing with a reference image (floor visualizer) ──
    // Uses a multimodal LLM (Nano Banana / Gemini Flash Image) via chat completions.
    // The reference image is sent as input, and the model generates a new edited image.
    if (action === 'editImage') {
      const { prompt, reference_image_url, model } = body;
      if (!prompt || !reference_image_url) {
        return Response.json({ error: 'prompt and reference_image_url required' }, { status: 400 });
      }

      const editModel = model || 'google/gemini-3.1-flash-image-preview';

      const payload = {
        model: editModel,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: reference_image_url } },
            ],
          },
        ],
      };

      const res = await fetch(`${GATEWAY_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.text();
        return Response.json({ error: `AI Gateway edit error: ${err}`, status: res.status }, { status: 500 });
      }

      const data = await res.json();
      const message = data.choices?.[0]?.message;

      // Extract generated image from the response
      let imageUrl: string | null = null;
      if (message?.images && message.images.length > 0) {
        imageUrl = message.images[0].image_url?.url || null;
      }

      if (!imageUrl) {
        // Some models return the image inline in content as a data URL
        const content = message?.content || '';
        const dataUrlMatch = typeof content === 'string' && content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
        if (dataUrlMatch) imageUrl = dataUrlMatch[0];
      }

      if (!imageUrl) {
        return Response.json({ error: 'No image generated in response', raw: JSON.stringify(message).slice(0, 500) }, { status: 500 });
      }

      // Upload to Supabase Storage and return public URL
      const uploadRes = await base44.functions.invoke('supabaseUpload', {
        file_data: imageUrl,
        filename: `ai-edit-${Date.now()}.png`,
        content_type: 'image/png',
      });

      return Response.json({
        ok: true,
        url: uploadRes.data?.file_url || null,
        model: editModel,
        text: typeof message?.content === 'string' ? message.content.slice(0, 200) : '',
      });
    }

    // ── listModels: List available models (proxy to Vercel) ──
    if (action === 'listModels') {
      const res = await fetch('https://vercel.com/ai-gateway/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      const html = await res.text();
      return Response.json({ ok: true, note: 'Visit https://vercel.com/ai-gateway/models to browse models' });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[vercelAiGateway] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}