import { createClientFromRequest } from "npm:@base44/sdk@0.8.48";
import { createRunAndPoll, PRESETS } from "../../shared/railwayEngine.ts";
import { sendSms, sendMms, sendEmail, makeCall } from "../../shared/xtremeGateway.ts";

// ─────────────────────────────────────────────────────────────────────────────
// dailyLeadEngine — daily orchestration: scrape → Leads → HubSpot CRM →
// automated email outreach + SMS/MMS/voice follow-up.
//
// Runs both presets (homeowner_leads + b2b_contractors) by default.
// Invoke from the "Daily Lead Engine" scheduled workflow, or manually:
//   base44.functions.invoke('dailyLeadEngine', { presets, from_number, timeoutMs })
// ─────────────────────────────────────────────────────────────────────────────

function pick(obj: any, keys: string[]): string {
  for (const k of keys) {
    if (obj && obj[k] != null && obj[k] !== "") return String(obj[k]);
  }
  return "";
}

function normalizeLead(raw: any, preset: string) {
  const r = raw || {};
  const name = pick(r, ["name", "business_name", "company", "title", "contact_name", "businessName"]);
  const email = pick(r, ["email", "contact_email", "email_address", "mail"]);
  const phone = pick(r, ["phone", "phone_number", "tel", "contact_phone", "phoneNumber"]);
  const address = pick(r, ["address", "street", "location", "full_address", "streetAddress"]);
  const city = pick(r, ["city", "locality"]);
  const state = pick(r, ["state", "region", "province"]);
  const zip = pick(r, ["zip", "zipcode", "postal_code", "postalCode"]);
  const website = pick(r, ["url", "website", "link", "href", "domain"]);
  const parts = (name || "Unknown").trim().split(/\s+/);
  const first_name = parts[0] || "Unknown";
  const last_name = parts.slice(1).join(" ");
  return {
    first_name,
    last_name,
    email,
    phone,
    address,
    city,
    state,
    zip,
    lead_source: `railway:${preset}`,
    referrer: "railway_engine",
    notes: website ? `Website: ${website}` : "",
    status: "NEW ESTIMATE",
  };
}

async function pushToHubspot(svc: any, lead: any): Promise<string | null> {
  try {
    if (!lead.email) return null;
    const { accessToken } = await svc.connectors.getConnection("hubspot");
    const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };

    let contactId: string | null = null;
    const contactRes = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
      method: "POST",
      headers,
      body: JSON.stringify({
        properties: {
          email: lead.email,
          firstname: lead.first_name || "",
          lastname: lead.last_name || "",
          phone: lead.phone || "",
          address: lead.address || "",
          city: lead.city || "",
          state: lead.state || "",
          zip: lead.zip || "",
          lifecyclestage: "lead",
        },
      }),
    });
    const contact = await contactRes.json();
    if (contactRes.ok) {
      contactId = contact.id;
    } else {
      const search = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
        method: "POST",
        headers,
        body: JSON.stringify({
          filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: lead.email }] }],
          limit: 1,
        }),
      });
      contactId = (await search.json()).results?.[0]?.id || null;
    }

    if (contactId) {
      await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
        method: "POST",
        headers,
        body: JSON.stringify({
          properties: {
            dealname: `Railway Lead — ${lead.first_name} ${lead.last_name}`.trim(),
            dealstage: "appointmentscheduled",
            pipeline: "default",
          },
          associations: [{ to: { id: contactId }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }] }],
        }),
      });
    }
    return contactId;
  } catch (e) {
    console.error("[dailyLeadEngine] HubSpot push failed:", e.message);
    return null;
  }
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const presets = body.presets && body.presets.length ? body.presets : ["homeowner_leads", "b2b_contractors"];
    const fromNumber = body.from_number || "";
    const timeoutMs = body.timeoutMs || 300000;

    const stats = { scraped: 0, created: 0, hubspot: 0, emailed: 0, sms: 0, voice: 0, errors: [] as string[] };
    const outreach: Promise<void>[] = [];

    for (const presetKey of presets) {
      const preset = PRESETS[presetKey];
      if (!preset) { stats.errors.push(`Unknown preset: ${presetKey}`); continue; }

      let engineResult;
      try {
        engineResult = await createRunAndPoll(preset, timeoutMs);
      } catch (e) {
        stats.errors.push(`scrape ${presetKey}: ${e.message}`);
        continue;
      }

      const results = engineResult?.results?.results || engineResult?.results || [];
      const list = Array.isArray(results) ? results : [];
      stats.scraped += list.length;

      for (const raw of list) {
        const leadData = normalizeLead(raw, presetKey);
        if (!leadData.email && !leadData.phone) continue;

        let lead;
        try {
          lead = await svc.entities.Lead.create(leadData);
          stats.created++;
        } catch (e) {
          stats.errors.push(`create lead: ${e.message}`);
          continue;
        }

        // HubSpot CRM push
        outreach.push(pushToHubspot(svc, lead).then((cid) => { if (cid) stats.hubspot++; }).catch((e) => stats.errors.push(`hubspot: ${e.message}`)));

        // Email outreach
        if (lead.email) {
          outreach.push(
            sendEmail(lead.email, "Free garage floor estimate — Xtreme Polishing Systems",
              `Hi ${lead.first_name},\n\nWe'd love to give you a free, no-obligation estimate on a premium epoxy garage floor coating. Our coatings are backed by a lifetime warranty and installed by Xtreme Polishing Systems.\n\nReply to this email or call ${fromNumber || "(877) 958-5264"} to schedule.\n\n— Xtreme Polishing Systems`)
              .then(() => stats.emailed++)
              .catch((e) => stats.errors.push(`email: ${e.message}`))
          );
        }

        // SMS follow-up
        if (lead.phone) {
          outreach.push(
            sendSms(lead.phone,
              `Hi ${lead.first_name}! This is XPS — ready to transform your garage floor? Get a free estimate: ${fromNumber ? "call " + fromNumber : "(877) 958-5264"}. Reply STOP to opt out.`,
              fromNumber || undefined)
              .then(() => stats.sms++)
              .catch((e) => stats.errors.push(`sms: ${e.message}`))
          );
        }

        // Voice follow-up (requires a provisioned from-number)
        if (lead.phone && fromNumber) {
          outreach.push(
            makeCall(lead.phone, fromNumber, undefined,
              "You are the XPS outreach assistant. Briefly introduce the free garage floor estimate offer from Xtreme Polishing Systems and ask if they'd like to schedule. Keep it under 30 seconds. Be warm and concise.")
              .then(() => stats.voice++)
              .catch((e) => stats.errors.push(`voice: ${e.message}`))
          );
        }
      }
    }

    await Promise.allSettled(outreach);

    await svc.entities.SopLog.create({
      category: "integration",
      action: "daily_lead_engine",
      description: `Scraped ${stats.scraped} → created ${stats.created} leads | HubSpot ${stats.hubspot} | email ${stats.emailed} | SMS ${stats.sms} | voice ${stats.voice}`,
      source: "dailyLeadEngine",
    }).catch(() => {});

    return Response.json({ ok: true, ...stats });
  } catch (error) {
    console.error("[dailyLeadEngine] Error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}