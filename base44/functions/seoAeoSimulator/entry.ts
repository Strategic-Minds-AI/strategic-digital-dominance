import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';

// ─────────────────────────────────────────────────────────────────────────────
// seoAeoSimulator — DEEP-method deterministic SEO/AEO scoring engine.
//
// Discover: identify every ranking factor Google/AI engines evaluate.
// Evaluate:  score each factor with a fixed formula (no LLM — fully deterministic).
// Execute:   aggregate weighted sub-scores into SEO / AEO / Local / Social scores.
// Prove:     return a transparent breakdown so every number is auditable.
//
// Actions:
//   calculate  — score a simulation state (page content + module toggles)
//   analyzeUrl — fetch a live URL, extract on-page signals, score it
//   estimateKd — deterministic keyword difficulty estimate
//
// Invoke: base44.functions.invoke('seoAeoSimulator', { action: 'calculate', simulation: {...} })
// ─────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════
// SCORING ENGINE — fixed formulas based on published ranking-factor studies
// (Backlinko 11.8M results, Ahrefs DR/UR, BrightLocal local factors, SEMrush)
// ═══════════════════════════════════════════════════════════════════════════

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, n));
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

// ── Keyword Difficulty (deterministic heuristic) ──
// Shorter + commercial + "near me" = harder; long-tail + local + informational = easier
function estimateKeywordDifficulty(keyword: string): number {
  if (!keyword) return 50;
  const kw = keyword.toLowerCase().trim();
  const words = kw.split(/\s+/).filter(Boolean);
  let kd = 55;

  // Word count: short keywords are harder
  if (words.length <= 2) kd += 12;
  else if (words.length === 3) kd += 6;
  else if (words.length === 4) kd -= 2;
  else if (words.length >= 5) kd -= 8;

  // Intent modifiers
  if (kw.includes('near me') || kw.includes('near you')) kd += 8;
  if (kw.includes('cost') || kw.includes('price')) kd -= 4;
  if (kw.includes('best')) kd += 5;
  if (kw.includes('affordable')) kd -= 3;
  if (kw.includes('how to') || kw.includes('what is')) kd -= 6;

  // Commercial intent
  const commercialWords = ['install', 'contractor', 'service', 'company', 'pro', 'expert', 'professional'];
  if (commercialWords.some(w => kw.includes(w))) kd += 4;

  // City specificity lowers difficulty (less national competition)
  if (words.length > 2 && /\b(FL|TX|CA|NY|GA|OH|NC|AZ|NV|PA|IL|MI|NJ|VA|WA|CO|MA|MD|TN|IN|MO|WI|MN|OR|CT|UT|AL|KY|LA|OK|AR|IA|KS|MS|NE|NM|ID|NH|ME|MT|WV|WY|ND|SD|DE|RI|VT)\b/.test(kw)) {
    kd -= 10;
  }

  return clamp(Math.round(kd), 10, 95);
}

// ── On-Page Content Score (0-100) ──
function scoreOnPage(page: any, keyword: string): { score: number; factors: any[] } {
  const factors: any[] = [];
  let score = 0;
  const kw = (keyword || '').toLowerCase();
  const kwWords = kw.split(/\s+/).filter(Boolean);

  const title = page?.title || '';
  const meta = page?.meta_description || '';
  const h1 = page?.h1 || '';
  const body = page?.body_content || '';
  const bodyWords = body.split(/\s+/).filter(Boolean);
  const bodyLower = body.toLowerCase();

  // Title optimization (max 20)
  let titlePts = 0;
  if (title.length >= 30 && title.length <= 60) titlePts += 10;
  else if (title.length > 0) titlePts += 4;
  if (kw && title.toLowerCase().includes(kw)) titlePts += 6;
  else if (kwWords.length > 0 && kwWords.some(w => title.toLowerCase().includes(w))) titlePts += 3;
  if (title.length > 0) titlePts += 4;
  factors.push({ factor: 'Title tag optimization', points: titlePts, max: 20 });
  score += titlePts;

  // Meta description (max 12)
  let metaPts = 0;
  if (meta.length >= 120 && meta.length <= 160) metaPts += 6;
  else if (meta.length > 0) metaPts += 3;
  if (kw && meta.toLowerCase().includes(kw)) metaPts += 4;
  if (meta.length > 0) metaPts += 2;
  factors.push({ factor: 'Meta description', points: metaPts, max: 12 });
  score += metaPts;

  // H1 (max 12)
  let h1Pts = 0;
  if (h1.length > 0) h1Pts += 4;
  if (kw && h1.toLowerCase().includes(kw)) h1Pts += 6;
  if (h1.length > 0 && h1.length <= 70) h1Pts += 2;
  factors.push({ factor: 'H1 heading', points: h1Pts, max: 12 });
  score += h1Pts;

  // Content length (max 20) — 1500+ words is ideal per Backlinko
  let contentPts = 0;
  if (bodyWords.length >= 1500) contentPts += 20;
  else if (bodyWords.length >= 900) contentPts += 14;
  else if (bodyWords.length >= 500) contentPts += 8;
  else if (bodyWords.length >= 200) contentPts += 4;
  else if (bodyWords.length > 0) contentPts += 1;
  factors.push({ factor: 'Content depth (word count)', points: contentPts, max: 20 });
  score += contentPts;

  // Keyword in first 100 words (max 8)
  let first100Pts = 0;
  const first100 = bodyLower.slice(0, 600);
  if (kw && first100.includes(kw)) first100Pts += 8;
  else if (kwWords.length > 0 && kwWords.some(w => first100.includes(w))) first100Pts += 4;
  factors.push({ factor: 'Keyword in first 100 words', points: first100Pts, max: 8 });
  score += first100Pts;

  // Keyword density (max 8) — 0.5%-2.5% is ideal
  let densityPts = 0;
  if (kw && bodyWords.length > 0) {
    const matches = (bodyLower.match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    const density = (matches * kwWords.length) / bodyWords.length * 100;
    if (density >= 0.5 && density <= 2.5) densityPts += 8;
    else if (density > 0 && density < 0.5) densityPts += 4;
    else if (density > 2.5 && density <= 4) densityPts += 3;
  }
  factors.push({ factor: 'Keyword density', points: densityPts, max: 8 });
  score += densityPts;

  // Local signals (max 10)
  let localPts = 0;
  if (page?.city) localPts += 5;
  if (page?.state) localPts += 3;
  if (page?.city && bodyLower.includes(page.city.toLowerCase())) localPts += 2;
  factors.push({ factor: 'Local content signals', points: localPts, max: 10 });
  score += localPts;

  // LSI / semantic keywords (max 10) — check for related terms
  let lsiPts = 0;
  const lsiTerms = ['garage', 'floor', 'coating', 'epoxy', 'polyaspartic', 'concrete', 'install', 'cost', 'price', 'warranty', 'professional', 'contractor', 'resurface', 'seal', 'finish'];
  const foundLsi = lsiTerms.filter(t => bodyLower.includes(t)).length;
  lsiPts = Math.min(foundLsi * 1.5, 10);
  factors.push({ factor: 'Semantic/LSI keywords', points: lsiPts, max: 10 });
  score += lsiPts;

  return { score: clamp(Math.round(score)), factors };
}

// ── Technical SEO Score (0-100) ──
function scoreTechnical(tech: any): { score: number; factors: any[] } {
  const factors: any[] = [];
  let score = 0;

  const https = tech?.https !== false;
  const mobile = !!tech?.mobile_friendly;
  const speed = Number(tech?.page_speed_score) || 0;
  const sitemap = !!tech?.has_sitemap;
  const robots = !!tech?.has_robots;
  const schema = !!tech?.has_schema;
  const cwv = !!tech?.core_web_vitals;

  if (https) { score += 12; factors.push({ factor: 'HTTPS enabled', points: 12, max: 12 }); }
  else factors.push({ factor: 'HTTPS enabled', points: 0, max: 12 });

  if (mobile) { score += 15; factors.push({ factor: 'Mobile-friendly', points: 15, max: 15 }); }
  else factors.push({ factor: 'Mobile-friendly', points: 0, max: 15 });

  const speedPts = Math.round((speed / 100) * 20);
  score += speedPts;
  factors.push({ factor: 'Page speed score', points: speedPts, max: 20 });

  if (sitemap) { score += 10; factors.push({ factor: 'XML sitemap', points: 10, max: 10 }); }
  else factors.push({ factor: 'XML sitemap', points: 0, max: 10 });

  if (robots) { score += 8; factors.push({ factor: 'robots.txt', points: 8, max: 8 }); }
  else factors.push({ factor: 'robots.txt', points: 0, max: 8 });

  if (schema) { score += 15; factors.push({ factor: 'Schema markup', points: 15, max: 15 }); }
  else factors.push({ factor: 'Schema markup', points: 0, max: 15 });

  if (cwv) { score += 20; factors.push({ factor: 'Core Web Vitals', points: 20, max: 20 }); }
  else factors.push({ factor: 'Core Web Vitals', points: 0, max: 20 });

  return { score: clamp(Math.round(score)), factors };
}

// ── Backlinks Score (0-100) ──
function scoreBacklinks(bl: any): { score: number; factors: any[] } {
  const factors: any[] = [];
  let score = 0;

  const rd = Number(bl?.referring_domains) || 0;
  const da = Number(bl?.domain_authority) || 0;
  const anchorDiv = Number(bl?.anchor_diversity) || 0;
  const velocity = Number(bl?.link_velocity) || 0;

  // Referring domains (max 35) — 50+ RD is strong, 100+ is excellent
  let rdPts = 0;
  if (rd >= 100) rdPts = 35;
  else if (rd >= 50) rdPts = 28;
  else if (rd >= 20) rdPts = 20;
  else if (rd >= 10) rdPts = 12;
  else if (rd >= 5) rdPts = 7;
  else if (rd >= 1) rdPts = 3;
  score += rdPts;
  factors.push({ factor: 'Referring domains', points: rdPts, max: 35 });

  // Domain authority (max 30)
  const daPts = Math.round((da / 100) * 30);
  score += daPts;
  factors.push({ factor: 'Domain authority', points: daPts, max: 30 });

  // Anchor text diversity (max 20)
  const anchorPts = Math.round((anchorDiv / 100) * 20);
  score += anchorPts;
  factors.push({ factor: 'Anchor text diversity', points: anchorPts, max: 20 });

  // Link velocity (max 15) — steady monthly growth
  let velPts = 0;
  if (velocity >= 10) velPts = 15;
  else if (velocity >= 5) velPts = 10;
  else if (velocity >= 1) velPts = 5;
  score += velPts;
  factors.push({ factor: 'Link velocity (new links/mo)', points: velPts, max: 15 });

  return { score: clamp(Math.round(score)), factors };
}

// ── Local SEO Score (0-100) ──
function scoreLocal(gb: any, reviews: any, citations: any): { score: number; factors: any[] } {
  const factors: any[] = [];
  let score = 0;

  // Google Business Profile (max 35)
  let gbPts = 0;
  if (gb?.profile_complete) gbPts += 12;
  if (Number(gb?.photos_count) >= 10) gbPts += 8;
  else if (Number(gb?.photos_count) >= 3) gbPts += 4;
  if (Number(gb?.posts_count) >= 5) gbPts += 6;
  else if (Number(gb?.posts_count) >= 1) gbPts += 3;
  if (gb?.has_qa) gbPts += 4;
  if (gb?.has_services) gbPts += 5;
  score += gbPts;
  factors.push({ factor: 'Google Business Profile', points: gbPts, max: 35 });

  // Reviews (max 35)
  let revPts = 0;
  const reviewCount = Number(reviews?.review_count) || 0;
  if (reviewCount >= 50) revPts += 12;
  else if (reviewCount >= 20) revPts += 8;
  else if (reviewCount >= 10) revPts += 5;
  else if (reviewCount >= 1) revPts += 2;
  const rating = Number(reviews?.avg_rating) || 0;
  if (rating >= 4.5) revPts += 8;
  else if (rating >= 4.0) revPts += 5;
  else if (rating >= 3.5) revPts += 2;
  const respRate = Number(reviews?.response_rate) || 0;
  revPts += Math.round((respRate / 100) * 8);
  if (Number(reviews?.recent_reviews) >= 5) revPts += 7;
  else if (Number(reviews?.recent_reviews) >= 1) revPts += 3;
  score += revPts;
  factors.push({ factor: 'Reviews (count, rating, recency)', points: revPts, max: 35 });

  // Citations / NAP (max 30)
  let citPts = 0;
  if (citations?.bing_listed) citPts += 6;
  if (citations?.yelp_listed) citPts += 6;
  if (citations?.bbb_member) citPts += 5;
  if (citations?.apple_maps) citPts += 5;
  if (citations?.nap_consistent) citPts += 8;
  score += citPts;
  factors.push({ factor: 'Citations (Bing, Yelp, BBB, Apple Maps, NAP)', points: citPts, max: 30 });

  return { score: clamp(Math.round(score)), factors };
}

// ── AEO Score (0-100) — Answer Engine Optimization ──
function scoreAeo(aeo: any): { score: number; factors: any[] } {
  const factors: any[] = [];
  let score = 0;

  if (aeo?.has_faq_schema) { score += 18; factors.push({ factor: 'FAQ schema', points: 18, max: 18 }); }
  else factors.push({ factor: 'FAQ schema', points: 0, max: 18 });

  if (aeo?.has_qa_content) { score += 16; factors.push({ factor: 'Q&A content format', points: 16, max: 16 }); }
  else factors.push({ factor: 'Q&A content format', points: 0, max: 16 });

  if (aeo?.has_product_schema) { score += 12; factors.push({ factor: 'Product schema', points: 12, max: 12 }); }
  else factors.push({ factor: 'Product schema', points: 0, max: 12 });

  if (aeo?.has_review_schema) { score += 12; factors.push({ factor: 'Review schema', points: 12, max: 12 }); }
  else factors.push({ factor: 'Review schema', points: 0, max: 12 });

  if (aeo?.has_localbusiness_schema) { score += 12; factors.push({ factor: 'LocalBusiness schema', points: 12, max: 12 }); }
  else factors.push({ factor: 'LocalBusiness schema', points: 0, max: 12 });

  if (aeo?.concise_answers) { score += 15; factors.push({ factor: 'Concise answer format (snippet-ready)', points: 15, max: 15 }); }
  else factors.push({ factor: 'Concise answer format (snippet-ready)', points: 0, max: 15 });

  const entityMentions = Number(aeo?.entity_mentions) || 0;
  const entPts = Math.min(entityMentions * 2, 15);
  score += entPts;
  factors.push({ factor: 'Entity mentions / knowledge graph', points: entPts, max: 15 });

  return { score: clamp(Math.round(score)), factors };
}

// ── Social Score (0-100) ──
function scoreSocial(soc: any): { score: number; factors: any[] } {
  const factors: any[] = [];
  let score = 0;

  // Platform presence (max 50)
  let presencePts = 0;
  if (soc?.facebook) presencePts += 10;
  if (soc?.instagram) presencePts += 8;
  if (soc?.linkedin) presencePts += 6;
  if (soc?.youtube) presencePts += 8;
  if (soc?.tiktok) presencePts += 6;
  if (soc?.x_twitter) presencePts += 4;
  // Bonus: all 6 = fully optimized social footprint
  const platformCount = [soc?.facebook, soc?.instagram, soc?.linkedin, soc?.youtube, soc?.tiktok, soc?.x_twitter].filter(Boolean).length;
  if (platformCount === 6) presencePts += 8;
  score += presencePts;
  factors.push({ factor: 'Social platform presence', points: presencePts, max: 50 });

  // Posting frequency (max 25)
  let freqPts = 0;
  const freq = Number(soc?.posting_frequency) || 0;
  if (freq >= 8) freqPts = 25;
  else if (freq >= 4) freqPts = 18;
  else if (freq >= 2) freqPts = 12;
  else if (freq >= 1) freqPts = 6;
  score += freqPts;
  factors.push({ factor: 'Posting frequency (posts/week)', points: freqPts, max: 25 });

  // Engagement rate (max 25)
  const engPts = Math.round((Number(soc?.engagement_rate) || 0) / 100 * 25);
  score += engPts;
  factors.push({ factor: 'Engagement rate', points: engPts, max: 25 });

  return { score: clamp(Math.round(score)), factors };
}

// ── Ads / Paid amplification bonus (0-100) ──
function scoreAds(ads: any): { score: number; factors: any[] } {
  const factors: any[] = [];
  let score = 0;

  if (ads?.google_ads_active) { score += 50; factors.push({ factor: 'Google Ads active', points: 50, max: 50 }); }
  else factors.push({ factor: 'Google Ads active', points: 0, max: 50 });

  if (ads?.facebook_ads_active) { score += 30; factors.push({ factor: 'Facebook Ads active', points: 30, max: 30 }); }
  else factors.push({ factor: 'Facebook Ads active', points: 0, max: 30 });

  const budget = Number(ads?.monthly_budget) || 0;
  let budgetPts = 0;
  if (budget >= 2000) budgetPts = 20;
  else if (budget >= 500) budgetPts = 12;
  else if (budget >= 100) budgetPts = 6;
  score += budgetPts;
  factors.push({ factor: 'Monthly ad budget', points: budgetPts, max: 20 });

  return { score: clamp(Math.round(score)), factors };
}

// ── Timeline estimate (months to page 1) ──
// Based on keyword difficulty vs overall score gap.
function estimateTimeline(kd: number, overallScore: number): number {
  const gap = kd - overallScore;
  if (gap <= -10) return 1;       // already dominating
  if (gap <= 0) return 2;          // competitive, close to page 1
  // Base time grows with KD; gap adds months
  const baseMonths = kd >= 70 ? 4 : kd >= 40 ? 3 : 2;
  const months = baseMonths + Math.round(gap / 8);
  return clamp(months, 1, 18);
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN CALCULATE — runs all scoring functions and aggregates
// ═══════════════════════════════════════════════════════════════════════════

function runFullCalculation(sim: any) {
  const page = sim.page_content || {};
  const modules = sim.modules || {};
  const keyword = sim.target_keyword || '';

  const kd = estimateKeywordDifficulty(keyword);

  const onPage = scoreOnPage(page, keyword);
  const technical = scoreTechnical(modules.technical);
  const backlinks = scoreBacklinks(modules.backlinks);
  const local = scoreLocal(modules.google_business, modules.reviews, modules.citations);
  const aeo = scoreAeo(modules.aeo);
  const social = scoreSocial(modules.social);
  const ads = scoreAds(modules.ads);

  // SEO Score = weighted blend of on-page, technical, backlinks, local, UX proxy
  // Weights based on ranking-factor studies:
  //   Backlinks 28%, On-Page 22%, Technical 18%, Local 17%, Social 10%, AEO 5%
  const seoScore = round(
    backlinks.score * 0.28 +
    onPage.score * 0.22 +
    technical.score * 0.18 +
    local.score * 0.17 +
    social.score * 0.10 +
    aeo.score * 0.05
  );

  // Overall = SEO + AEO + Local + Social weighted by keyword intent
  // For local-intent keywords (near me, city), local gets more weight
  const isLocalIntent = /near me|near you|city|state|\b[A-Z]{2}\b/.test(keyword.toLowerCase()) || !!page.city;
  const overallScore = round(
    seoScore * (isLocalIntent ? 0.45 : 0.55) +
    aeo.score * 0.15 +
    local.score * (isLocalIntent ? 0.25 : 0.15) +
    social.score * (isLocalIntent ? 0.10 : 0.10) +
    ads.score * 0.05
  );

  const timeline = estimateTimeline(kd, overallScore);

  // Findings & recommendations
  const findings: any[] = [];
  const recommendations: string[] = [];

  if (onPage.score < 60) {
    findings.push({ category: 'on_page', severity: onPage.score < 30 ? 'critical' : 'high', factor: 'On-page content is weak', detail: `Score ${onPage.score}/100 — optimize title, meta, H1, and content depth` });
    recommendations.push('Add a keyword-optimized title (30-60 chars), meta description (120-160 chars), and H1 with the target keyword');
  }
  if (technical.score < 60) {
    findings.push({ category: 'technical', severity: technical.score < 30 ? 'critical' : 'high', factor: 'Technical SEO gaps', detail: `Score ${technical.score}/100 — fix mobile, speed, schema, Core Web Vitals` });
    recommendations.push('Enable mobile-friendly design, improve page speed, add schema markup, and pass Core Web Vitals');
  }
  if (backlinks.score < 50) {
    findings.push({ category: 'backlinks', severity: 'high', factor: 'Backlink profile is thin', detail: `Score ${backlinks.score}/100 — build referring domains and domain authority` });
    recommendations.push('Build backlinks from local directories, industry sites, and guest posts to increase referring domains');
  }
  if (local.score < 60) {
    findings.push({ category: 'local', severity: local.score < 30 ? 'critical' : 'high', factor: 'Local SEO is incomplete', detail: `Score ${local.score}/100 — complete GBP, get reviews, build citations` });
    recommendations.push('Complete your Google Business Profile, actively collect reviews, and list on Bing, Yelp, BBB, and Apple Maps');
  }
  if (aeo.score < 50) {
    findings.push({ category: 'aeo', severity: 'medium', factor: 'AEO signals missing', detail: `Score ${aeo.score}/100 — add FAQ schema, Q&A content, structured data` });
    recommendations.push('Add FAQ schema, Q&A content, and structured data (Product, Review, LocalBusiness) for AI search visibility');
  }
  if (social.score < 40) {
    findings.push({ category: 'social', severity: 'medium', factor: 'Social presence is weak', detail: `Score ${social.score}/100 — claim platforms, post consistently, build engagement` });
    recommendations.push('Claim social profiles on Facebook, Instagram, YouTube, and LinkedIn; post 4+ times per week');
  }
  if (ads.score < 30) {
    findings.push({ category: 'ads', severity: 'low', factor: 'No paid amplification', detail: `Score ${ads.score}/100 — Google/Facebook ads accelerate visibility while organic builds` });
    recommendations.push('Run Google Ads to capture immediate traffic while organic rankings build');
  }

  if (overallScore >= 80) {
    recommendations.unshift('Excellent — your page is well-optimized. Focus on backlink velocity and content freshness to maintain rankings.');
  }

  return {
    seo_score: seoScore,
    aeo_score: aeo.score,
    local_score: local.score,
    social_score: social.score,
    ads_score: ads.score,
    overall_score: overallScore,
    keyword_difficulty: kd,
    timeline_months: timeline,
    is_local_intent: isLocalIntent,
    breakdown: {
      on_page: { score: onPage.score, weight: 22, factors: onPage.factors },
      technical: { score: technical.score, weight: 18, factors: technical.factors },
      backlinks: { score: backlinks.score, weight: 28, factors: backlinks.factors },
      local: { score: local.score, weight: 17, factors: local.factors },
      aeo: { score: aeo.score, weight: 5, factors: aeo.factors },
      social: { score: social.score, weight: 10, factors: social.factors },
      ads: { score: ads.score, weight: 5, factors: ads.factors },
    },
    findings,
    recommendations,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// URL ANALYSIS — fetch a live URL, extract on-page signals, score it
// ═══════════════════════════════════════════════════════════════════════════

async function analyzeUrl(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SEOSimulator/1.0)' },
    signal: AbortSignal.timeout(10000),
  });
  const html = await res.text();

  const getTitle = (h: string) => {
    const m = h.match(/<title[^>]*>([^<]*)<\/title>/i);
    return m ? m[1].trim() : '';
  };
  const getMeta = (h: string, name: string) => {
    const m = h.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'));
    return m ? m[1].trim() : '';
  };
  const getMetaProperty = (h: string, prop: string) => {
    const m = h.match(new RegExp(`<meta[^>]+property=["']${prop}["'][^>]*content=["']([^"']*)["']`, 'i'));
    return m ? m[1].trim() : '';
  };
  const getH1 = (h: string) => {
    const m = h.match(/<h1[^>]*>([^<]*)<\/h1>/i);
    return m ? m[1].trim() : '';
  };
  const countTags = (h: string, tag: string) => (h.match(new RegExp(`<${tag}[^>]*>`, 'gi')) || []).length;
  const hasSchema = (h: string) => /application\/ld\+json/i.test(h) || /itemtype=/i.test(h);

  const title = getTitle(html);
  const metaDesc = getMeta(html, 'description');
  const h1 = getH1(html);
  const bodyText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const bodyWords = bodyText.split(/\s+/).filter(Boolean);
  const ogTitle = getMetaProperty(html, 'og:title');
  const ogDesc = getMetaProperty(html, 'og:description');

  const https = url.startsWith('https://');
  const viewport = /viewport/i.test(html);
  const schema = hasSchema(html);
  const h1Count = countTags(html, 'h1');
  const h2Count = countTags(html, 'h2');
  const imgCount = countTags(html, 'img');
  const imgAltCount = (html.match(/alt=["'][^"']+["']/gi) || []).length;
  const imgAltRatio = imgCount > 0 ? imgAltCount / imgCount : 0;
  const wordCount = bodyWords.length;

  // Build a simulation state from the extracted signals
  const sim: any = {
    target_keyword: title.split(/\s+/).slice(0, 5).join(' ').toLowerCase(),
    page_content: {
      title,
      meta_description: metaDesc,
      h1: h1 || title,
      subheader: '',
      body_content: bodyText.slice(0, 5000),
      city: '',
      state: '',
    },
    modules: {
      technical: {
        https,
        mobile_friendly: viewport,
        page_speed_score: 50, // unknown — neutral default
        has_sitemap: true,   // assume present
        has_robots: true,
        has_schema: schema,
        core_web_vitals: false,
      },
      backlinks: { referring_domains: 0, domain_authority: 0, anchor_diversity: 0, link_velocity: 0 },
      google_business: { profile_complete: false, photos_count: 0, posts_count: 0, has_qa: false, has_services: false },
      reviews: { review_count: 0, avg_rating: 0, response_rate: 0, recent_reviews: 0 },
      citations: { bing_listed: false, yelp_listed: false, bbb_member: false, apple_maps: false, nap_consistent: false },
      social: { facebook: false, instagram: false, linkedin: false, youtube: false, tiktok: false, x_twitter: false, posting_frequency: 0, engagement_rate: 0 },
      aeo: {
        has_faq_schema: /faqpage/i.test(html),
        has_qa_content: /<h[23][^>]*>\s*(faq|questions?)/i.test(html),
        has_product_schema: /product/i.test(html) && schema,
        has_review_schema: /review/i.test(html) && schema,
        has_localbusiness_schema: /localbusiness/i.test(html) && schema,
        concise_answers: false,
        entity_mentions: 0,
      },
      ads: { google_ads_active: false, monthly_budget: 0, facebook_ads_active: false },
    },
  };

  const scores = runFullCalculation(sim);

  return {
    url,
    extracted: {
      title,
      meta_description: metaDesc,
      h1,
      h1_count: h1Count,
      h2_count: h2Count,
      word_count: wordCount,
      img_count: imgCount,
      img_alt_ratio: round(imgAltRatio * 100),
      has_og_tags: !!(ogTitle || ogDesc),
      https,
      mobile_friendly: viewport,
      has_schema: schema,
      has_faq_schema: sim.modules.aeo.has_faq_schema,
    },
    ...scores,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════════════════

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'calculate';

    // ── calculate: score a simulation state ──
    if (action === 'calculate') {
      const sim = body.simulation;
      if (!sim) return Response.json({ error: 'simulation state required' }, { status: 400 });
      const result = runFullCalculation(sim);

      // Optionally persist if simulation_id provided
      if (body.simulation_id) {
        const svc = base44.asServiceRole;
        await svc.entities.SeoSimulation.update(body.simulation_id, {
          page_content: sim.page_content,
          modules: sim.modules,
          target_keyword: sim.target_keyword,
          seo_score: result.seo_score,
          aeo_score: result.aeo_score,
          local_score: result.local_score,
          social_score: result.social_score,
          overall_score: result.overall_score,
          timeline_months: result.timeline_months,
          keyword_difficulty: result.keyword_difficulty,
          score_breakdown: result.breakdown,
          findings: result.findings,
          recommendations: result.recommendations,
        });
      }

      return Response.json({ ok: true, ...result });
    }

    // ── analyzeUrl: fetch and score a live URL ──
    if (action === 'analyzeUrl') {
      const url = body.url;
      if (!url) return Response.json({ error: 'url required' }, { status: 400 });
      const normalized = url.match(/^https?:\/\//) ? url : `https://${url}`;
      try {
        const result = await analyzeUrl(normalized);
        return Response.json({ ok: true, ...result });
      } catch (e: any) {
        return Response.json({ error: `Failed to fetch URL: ${e.message}` }, { status: 502 });
      }
    }

    // ── estimateKd: keyword difficulty only ──
    if (action === 'estimateKd') {
      const keyword = body.keyword || '';
      return Response.json({ ok: true, keyword_difficulty: estimateKeywordDifficulty(keyword) });
    }

    // ── save: create/update a named simulation ──
    if (action === 'save') {
      const svc = base44.asServiceRole;
      const sim = body.simulation;
      const result = runFullCalculation(sim);
      if (body.simulation_id) {
        const updated = await svc.entities.SeoSimulation.update(body.simulation_id, {
          name: body.name || sim.name || 'Untitled',
          target_keyword: sim.target_keyword,
          page_content: sim.page_content,
          modules: sim.modules,
          seo_score: result.seo_score,
          aeo_score: result.aeo_score,
          local_score: result.local_score,
          social_score: result.social_score,
          overall_score: result.overall_score,
          timeline_months: result.timeline_months,
          keyword_difficulty: result.keyword_difficulty,
          score_breakdown: result.breakdown,
          findings: result.findings,
          recommendations: result.recommendations,
          status: 'active',
        });
        return Response.json({ ok: true, simulation_id: updated.id, ...result });
      } else {
        const created = await svc.entities.SeoSimulation.create({
          name: body.name || sim.name || 'Untitled',
          target_keyword: sim.target_keyword,
          page_content: sim.page_content,
          modules: sim.modules,
          seo_score: result.seo_score,
          aeo_score: result.aeo_score,
          local_score: result.local_score,
          social_score: result.social_score,
          overall_score: result.overall_score,
          timeline_months: result.timeline_months,
          keyword_difficulty: result.keyword_difficulty,
          score_breakdown: result.breakdown,
          findings: result.findings,
          recommendations: result.recommendations,
          status: 'active',
        });
        return Response.json({ ok: true, simulation_id: created.id, ...result });
      }
    }

    // ── list: get saved simulations ──
    if (action === 'list') {
      const svc = base44.asServiceRole;
      const sims = await svc.entities.SeoSimulation.list('-updated_date', 50);
      return Response.json({ ok: true, simulations: sims });
    }

    // ── load: get a specific simulation ──
    if (action === 'load') {
      const svc = base44.asServiceRole;
      const sim = await svc.entities.SeoSimulation.get(body.simulation_id);
      return Response.json({ ok: true, simulation: sim });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[seoAeoSimulator] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}