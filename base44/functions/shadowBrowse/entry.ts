import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { browseSession, browseStealth, str } from '../../shared/cloudBrowser.ts';

// ─────────────────────────────────────────────────────────────────────────────
// shadowBrowse — Covert cloud browser. Drives an isolated browser session
// through the proxy pool and returns page content ONLY to the caller.
// Nothing is persisted — no entity writes, no logs, no trace.
//
// Actions:
//   browse   — open a URL and return raw page text (no LLM)
//   extract  — open a URL, extract page text, then structure it via vercelAiGateway
//   stealth  — anti-detection browse with proxy rotation + human-like behavior
//
// Uses vercelAiGateway (not Core.InvokeLLM) for LLM extraction so it works
// even when Base44 integration credits are exhausted.
// ─────────────────────────────────────────────────────────────────────────────

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Owner only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const url = str(body?.url, 500).trim();
    const prompt = str(body?.prompt, 4000);
    const action = body?.action || 'browse';
    const stealth = !!body?.stealth;
    if (!url) return Response.json({ error: 'url is required' }, { status: 400 });

    let pageText: string;
    let meta: any = {};

    if (stealth || action === 'stealth') {
      const result = await browseStealth(url, { maxChars: 40000, country: body?.country || null });
      pageText = result.text;
      meta = { attempts: result.attempts, sessionId: result.sessionId };
    } else {
      pageText = await browseSession(url, 40000);
    }

    if (!pageText || pageText.length < 50) {
      return Response.json({ url, textChars: pageText.length, error: 'no usable page text extracted', ...meta });
    }

    // Raw covert read — return page text directly, no LLM, no persistence.
    if (action === 'browse' || !prompt) {
      return Response.json({ url, textChars: pageText.length, text: pageText, ...meta });
    }

    // LLM structuring via vercelAiGateway (bypasses Base44 credit exhaustion)
    if (action === 'extract' && prompt) {
      const llmRes = await base44.functions.invoke('vercelAiGateway', {
        action: 'generateText',
        model: 'openai/gpt-5.4-mini',
        system_prompt: 'You are a covert intelligence extractor. Return ONLY the extracted information in clear, structured format. No preamble.',
        prompt: `${prompt}\n\nPage URL: ${url}\n\nPage content:\n"""\n${pageText}\n"""`,
      });
      return Response.json({ url, textChars: pageText.length, result: llmRes.data?.text || '', ...meta });
    }

    return Response.json({ url, textChars: pageText.length, text: pageText, ...meta });
  } catch (error) {
    console.error('[shadowBrowse] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}