import { secrets } from "base44:runtime";

// ─────────────────────────────────────────────────────────────────────────────
// Xtreme Communications gateway client (shared).
// Same gateway the xtremeComms backend function calls, extracted here so
// scheduled/orchestration functions can reach it without a user session.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = "https://xtreme-communications.com/api/functions";

export async function xtremeCall(functionName: string, payload: any): Promise<any> {
  const apiKey = secrets.get("XTREME_COMMUNICATION_API_KEY");
  if (!apiKey) throw new Error("XTREME_COMMUNICATION_API_KEY not set");
  const res = await fetch(`${API_BASE}/${functionName}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ ...payload, api_key: apiKey }),
    signal: AbortSignal.timeout(30000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Xtreme Comms ${res.status}: ${data.error || data.detail || data.message || res.statusText}`);
  }
  return data;
}

export async function sendSms(to: string, message: string, from?: string): Promise<any> {
  return xtremeCall("gatewayMessages", { channel: "sms", to, body: message, from });
}

export async function sendMms(to: string, message: string, from?: string, mediaUrls?: string[]): Promise<any> {
  return xtremeCall("gatewayMessages", { channel: "mms", to, body: message, from, media_urls: mediaUrls });
}

export async function sendEmail(to: string, subject: string, body: string): Promise<any> {
  return xtremeCall("gatewayEmail", { to, subject, body });
}

export async function makeCall(to: string, from: string, agentId?: string, systemPrompt?: string): Promise<any> {
  return xtremeCall("gatewayCalls", { to, from, agent_id: agentId, system_prompt: systemPrompt });
}