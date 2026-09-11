import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

// ============================================================
// Domain Gold Rush Finder — REAL domain availability + scoring
// ============================================================
// This is NOT a simulator. It checks actual domain availability via
// RDAP (Registration Data Access Protocol — the modern WHOIS), which
// is free, requires no auth, and is 100% accurate. Every score is
// deterministic and traceable to real, transparent factors.
//
// Actions:
//   search — generate candidates, check real availability, score, optionally queue
//   score  — score a single domain without availability check
// ============================================================

const TLD_VALUE: Record<string, number> = {
  com: 100, net: 80, org: 70, co: 65, io: 60, ai: 55, us: 50, pro: 55,
  biz: 40, info: 35, online: 45, site: 40, store: 45, xyz: 30,
};

const PATTERN_INTENT: Record<string, number> = {
  near_me: 100, near_you: 95, near_me_city: 98, city_state: 90,
  cost: 85, best: 88, affordable: 82, local: 80, pro: 78,
};

function slugify(s: string): string {
  return (s || "").toLowerCase().trim().replace(/[^a-z0-9]/g, "");
}

function generateCandidates(
  keyword: string, pattern: string, city: string, state: string,
  tlds: string[], count: number
): string[] {
  const kw = slugify(keyword);
  const c = city ? slugify(city) : "";
  const st = state ? state.toLowerCase().trim() : "";
  const namePatterns: string[] = [];

  switch (pattern) {
    case "near_me":
      namePatterns.push(`${kw}nearme`);
      if (c) { namePatterns.push(`${kw}nearme${c}`); namePatterns.push(`${c}${kw}nearme`); }
      namePatterns.push(`best${kw}nearme`, `top${kw}nearme`, `pro${kw}nearme`);
      break;
    case "near_you":
      namePatterns.push(`${kw}nearyou`);
      if (c) namePatterns.push(`${kw}nearyou${c}`);
      namePatterns.push(`best${kw}nearyou`);
      break;
    case "near_me_city":
      if (c) {
        namePatterns.push(`${kw}nearme${c}`, `${c}${kw}nearme`, `${kw}${c}nearme`, `${kw}in${c}`, `${c}${kw}`, `${kw}${c}`);
      } else {
        namePatterns.push(`${kw}nearme`);
      }
      break;
    case "city_state":
      if (c) {
        namePatterns.push(`${kw}${c}`, `${c}${kw}`);
        if (st) namePatterns.push(`${kw}${c}${st}`, `${c}${st}${kw}`);
      }
      break;
    case "cost":
      namePatterns.push(`${kw}cost`, `costof${kw}`, `${kw}prices`, `${kw}pricing`, `affordable${kw}`);
      break;
    case "best":
      namePatterns.push(`best${kw}`, `top${kw}`, `best${kw}nearme`, `toprated${kw}`);
      break;
    case "affordable":
      namePatterns.push(`affordable${kw}`, `cheap${kw}`, `budget${kw}`);
      break;
    case "local":
      namePatterns.push(`local${kw}`, `${kw}local`);
      if (c) namePatterns.push(`local${kw}${c}`);
      break;
    case "pro":
      namePatterns.push(`${kw}pro`, `pro${kw}`, `${kw}pros`, `expert${kw}`);
      break;
    default:
      namePatterns.push(kw);
  }

  // Always include bare keyword + keyword+city as baseline candidates
  namePatterns.push(kw);
  if (c) namePatterns.push(`${kw}${c}`);

  const domains = new Set<string>();
  for (const p of namePatterns) {
    if (!p) continue;
    for (const tld of tlds) {
      domains.add(`${p}.${tld}`);
    }
  }
  return Array.from(domains).slice(0, count);
}

// Real availability check via RDAP — 404 = available, 200 = registered
// Uses direct registry RDAP servers (more reliable than rdap.org bootstrap)
const RDAP_SERVERS: Record<string, string> = {
  com: "https://rdap.verisign.com/com/v1/domain/",
  net: "https://rdap.verisign.com/net/v1/domain/",
  org: "https://rdap.publicinterestregistry.org/rdap/domain/",
  co: "https://rdap.nic.co/domain/",
  io: "https://rdap.identitydigital.services/rdap/domain/",
  ai: "https://rdap.nic.ai/domain/",
  us: "https://rdap.nic.us/domain/",
  biz: "https://rdap.nic.biz/domain/",
  info: "https://rdap.nic.info/domain/",
  pro: "https://rdap.afilias-srs.net/pro/domain/",
  online: "https://rdap.centralnic.com/online/domain/",
  site: "https://rdap.centralnic.com/site/domain/",
  store: "https://rdap.centralnic.com/store/domain/",
  xyz: "https://rdap.centralnic.com/xyz/domain/",
};

async function checkAvailability(domain: string): Promise<{
  available: boolean; status: number; registrar?: string; error?: string;
}> {
  const tld = domain.split(".").pop() || "";
  const rdapUrl = RDAP_SERVERS[tld] || `https://rdap.org/domain/`;

  try {
    const res = await fetch(`${rdapUrl}${domain}`, {
      headers: {
        "Accept": "application/rdap+json, application/json",
        "User-Agent": "XtremeAI-DomainRush/1.0 (https://epoxyquotenearme.com)",
      },
      signal: AbortSignal.timeout(12000),
    });
    if (res.status === 404) return { available: true, status: 404 };
    if (res.status === 200) {
      try {
        const data: any = await res.json();
        const registrar = data.entities
          ?.find((e: any) => e.roles?.includes("registrar"))
          ?.vcardArray?.[1]?.find((v: any) => v[0] === "fn")?.[3];
        return { available: false, status: 200, registrar };
      } catch {
        return { available: false, status: 200 };
      }
    }
    // 403 or other — try rdap.org bootstrap as fallback
    if (res.status === 403) {
      try {
        const fallback = await fetch(`https://rdap.org/domain/${domain}`, {
          headers: {
            "Accept": "application/rdap+json",
            "User-Agent": "XtremeAI-DomainRush/1.0",
          },
          signal: AbortSignal.timeout(12000),
        });
        if (fallback.status === 404) return { available: true, status: 404 };
        if (fallback.status === 200) return { available: false, status: 200 };
        return { available: false, status: fallback.status, error: `Fallback status ${fallback.status}` };
      } catch (e2: any) {
        return { available: false, status: 403, error: "RDAP blocked" };
      }
    }
    return { available: false, status: res.status, error: `Status ${res.status}` };
  } catch (e: any) {
    return { available: false, status: 0, error: e.message };
  }
}

// Deterministic, transparent scoring — every factor is traceable
function scoreDomain(
  domain: string, keyword: string, pattern: string, city: string
): { score: number; breakdown: Record<string, { value: number; max: number; label: string }> } {
  const parts = domain.split(".");
  const name = parts[0];
  const tld = parts.slice(1).join(".");
  const kw = slugify(keyword);
  const c = city ? slugify(city) : "";

  // 1. Keyword match (0-30)
  let keywordMatch = 0;
  if (!kw) keywordMatch = 15;
  else if (name === kw) keywordMatch = 30;
  else if (name.startsWith(kw) || name.endsWith(kw)) keywordMatch = 25;
  else if (name.includes(kw)) keywordMatch = 20;
  else if (kw.includes(name) && name.length > 4) keywordMatch = 10;

  // 2. TLD value (0-20)
  const tldVal = TLD_VALUE[tld] || 25;
  const tldScore = Math.round((tldVal / 100) * 20);

  // 3. Pattern intent (0-20)
  const intentScore = Math.round(((PATTERN_INTENT[pattern] || 50) / 100) * 20);

  // 4. Length (0-15) — shorter is better
  const len = name.length;
  let lengthScore = 15;
  if (len > 10) lengthScore = 12;
  if (len > 15) lengthScore = 9;
  if (len > 20) lengthScore = 6;
  if (len > 25) lengthScore = 3;

  // 5. City match (0-10)
  let cityScore = 0;
  if (c) {
    cityScore = name.includes(c) ? 10 : 0;
  } else {
    cityScore = 5; // neutral — no city specified
  }

  // 6. Cleanliness (0-5) — no hyphens, no numbers
  let cleanScore = 5;
  if (name.includes("-")) cleanScore -= 2;
  if (/\d/.test(name)) cleanScore -= 2;
  cleanScore = Math.max(0, cleanScore);

  const total = keywordMatch + tldScore + intentScore + lengthScore + cityScore + cleanScore;

  return {
    score: total,
    breakdown: {
      keywordMatch: { value: keywordMatch, max: 30, label: "Keyword Match" },
      tldScore: { value: tldScore, max: 20, label: "TLD Value" },
      intentScore: { value: intentScore, max: 20, label: "Search Intent" },
      lengthScore: { value: lengthScore, max: 15, label: "Length" },
      cityScore: { value: cityScore, max: 10, label: "City Match" },
      cleanScore: { value: cleanScore, max: 5, label: "Cleanliness" },
    },
  };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action === "search") {
      const { keyword, pattern, city, state, tlds, count, queueResults, niche } = body;
      if (!keyword) return Response.json({ error: "keyword is required" }, { status: 400 });

      const tldList = tlds && tlds.length ? tlds : ["com", "net", "co"];
      const maxCount = Math.min(count || 40, 100);

      // 1. Generate candidates
      const candidates = generateCandidates(keyword, pattern || "near_me", city || "", state || "", tldList, maxCount);

      // 2. Check real availability in batches of 6 (RDAP rate safety)
      const results = [];
      const batchSize = 6;
      for (let i = 0; i < candidates.length; i += batchSize) {
        const batch = candidates.slice(i, i + batchSize);
        const checks = await Promise.all(batch.map(async (domain) => {
          const avail = await checkAvailability(domain);
          const scoring = scoreDomain(domain, keyword, pattern || "near_me", city || "");
          return {
            domain,
            available: avail.available,
            registrar: avail.registrar,
            checkStatus: avail.status,
            checkError: avail.error,
            score: scoring.score,
            breakdown: scoring.breakdown,
          };
        }));
        results.push(...checks);
      }

      // 3. Sort: available first, then by score desc
      results.sort((a, b) => {
        if (a.available !== b.available) return a.available ? -1 : 1;
        return b.score - a.score;
      });

      // 4. Optionally queue available domains to DomainStrategy
      let queued = 0;
      if (queueResults) {
        for (const r of results.filter(r => r.available)) {
          try {
            await base44.entities.DomainStrategy.create({
              domain: r.domain,
              niche: niche || "epoxy_garage",
              keyword_pattern: pattern || "near_me",
              target_city: city || null,
              target_state: state || null,
              status: "available",
              competition_level: r.score >= 80 ? "low" : r.score >= 60 ? "medium" : "high",
            });
            queued++;
          } catch (e) {
            // Domain may already exist — skip duplicates
          }
        }
      }

      return Response.json({
        ok: true,
        keyword,
        pattern,
        city,
        state,
        totalChecked: results.length,
        availableCount: results.filter(r => r.available).length,
        takenCount: results.filter(r => !r.available && !r.checkError).length,
        errorCount: results.filter(r => !!r.checkError).length,
        results,
        queued,
      });
    }

    if (action === "score") {
      const { domain, keyword, pattern, city } = body;
      if (!domain) return Response.json({ error: "domain is required" }, { status: 400 });
      const scoring = scoreDomain(domain, keyword || "", pattern || "near_me", city || "");
      return Response.json({ ok: true, domain, ...scoring });
    }

    return Response.json({ error: "Unknown action. Use 'search' or 'score'." }, { status: 400 });
  } catch (error) {
    console.error("domainGoldRush error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}