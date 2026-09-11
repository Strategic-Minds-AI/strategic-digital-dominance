import { secrets } from 'base44:runtime';

// Cloud Browser engine — drives an isolated browser session for covert browsing,
// scraping, and live site auditing. Uses the CLOUD_BROWSER_ENGINE_URL + ENGINE_API_KEY secrets.
const cbUrl = () => (secrets.get('CLOUD_BROWSER_ENGINE_URL') || '').replace(/\/$/, '');
const cbKey = () => secrets.get('ENGINE_API_KEY') || '';

export async function engine(path: string, method: string, payload?: any) {
  const url = cbUrl();
  if (!url || !cbKey()) throw new Error('CLOUD_BROWSER_ENGINE_URL / ENGINE_API_KEY secrets not set');
  const res = await fetch(`${url}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'x-api-key': cbKey() },
    body: payload ? JSON.stringify(payload) : undefined,
    signal: AbortSignal.timeout(45000),
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`engine ${method} ${path} ${res.status}: ${json?.error || text}`);
  return json;
}

export const str = (v: any, max?: number) => String(v ?? '').slice(0, max);
export const arr = (v: any, max: number, itemMax: number) => (Array.isArray(v) ? v.slice(0, max).map((s: any) => str(s, itemMax)) : []);

// Spins up an isolated browser session routed through the engine's Proxy Pool
// so each session egresses from a rotated proxy, keeping Shadow's origin unlinkable.
export async function browseSession(url: string, maxChars = 40000) {
  if (!cbUrl() || !cbKey()) throw new Error('CLOUD_BROWSER_ENGINE_URL / ENGINE_API_KEY secrets not set');
  const sess = await engine('/sessions', 'POST', { usePool: true });
  const sid = sess?.sessionId;
  if (!sid) throw new Error('engine returned no sessionId');
  let pageText = '';
  try {
    await engine(`/sessions/${sid}/execute`, 'POST', { action_type: 'goto', value: url });
    const ex = await engine(`/sessions/${sid}/execute`, 'POST', { action_type: 'ai_extract' });
    pageText = str(ex?.data, maxChars);
  } finally {
    await engine(`/sessions/${sid}`, 'DELETE').catch(() => {});
  }
  return pageText;
}

// Stealth browse — anti-detection: IP rotation via proxy pool, navigator.webdriver patch,
// scroll + jittered delay to mimic human reading. Auto-retry with rotation on failure.
export async function browseStealth(url: string, opts: any = {}) {
  const {
    maxChars = 40000,
    sessionId = null,
    country = null,
    retries = 3,
    scroll = true,
    delayMs = 600,
    antiDetect = true,
  } = opts;

  if (!cbUrl() || !cbKey()) throw new Error('CLOUD_BROWSER_ENGINE_URL / ENGINE_API_KEY secrets not set');

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    let sid: string | null = null;
    try {
      const sessPayload: any = { usePool: true };
      if (sessionId) sessPayload.sessionId = attempt === 0 ? sessionId : `${sessionId}-r${attempt}`;
      if (country) sessPayload.country = country;
      const sess = await engine('/sessions', 'POST', sessPayload);
      sid = sess?.sessionId;
      if (!sid) throw new Error('engine returned no sessionId');

      if (antiDetect) {
        await engine(`/sessions/${sid}/execute`, 'POST', {
          action_type: 'evaluate',
          value: 'Object.defineProperty(navigator,"webdriver",{get:()=>undefined});window.chrome={runtime:{}};',
        }).catch(() => {});
      }

      await engine(`/sessions/${sid}/execute`, 'POST', { action_type: 'goto', value: url });

      if (scroll) {
        await engine(`/sessions/${sid}/execute`, 'POST', { action_type: 'scroll', value: 'down' }).catch(() => {});
      }
      const jitter = delayMs + Math.floor(Math.random() * 500);
      await engine(`/sessions/${sid}/execute`, 'POST', { action_type: 'wait', value: jitter }).catch(() => {});

      const ex = await engine(`/sessions/${sid}/execute`, 'POST', { action_type: 'ai_extract' });
      const pageText = str(ex?.data, maxChars);
      if (pageText && pageText.length >= 50) {
        return { text: pageText, attempts: attempt + 1, sessionId: sid, success: true };
      }
      lastErr = new Error(`extract too short (${pageText?.length || 0} chars) on attempt ${attempt + 1}`);
    } catch (e: any) {
      lastErr = e;
    } finally {
      if (sid) await engine(`/sessions/${sid}`, 'DELETE').catch(() => {});
    }
  }
  throw lastErr || new Error('stealth browse failed after all retries');
}