import { createClientFromRequest } from "npm:@base44/sdk@0.8.40";

// ============================================================
// Trade Industry Crystal Ball — REAL BLS data + deterministic projections
// ============================================================
// Fetches real employment and wage data from the U.S. Bureau of Labor
// Statistics (BLS) Current Employment Statistics (CES) program.
// Calculates 10-year CAGR, recent growth, and projects forward X years
// using deterministic compound growth. No AI, no guessing.
//
// BLS API: https://api.bls.gov/publicAPI/v2/timeseries/data/
// Free, no auth needed (50 series per request, 500/day unregistered)
// ============================================================

// Trade industries with BLS CES series IDs
// CES format: CEU + 8-digit industry code + 2-digit data type
// Construction supersector = 20, so industry code = 20 + 6-digit NAICS
// Data type 01 = All Employees (thousands), 03 = Average Hourly Earnings ($/hr)
const TRADE_INDUSTRIES = [
  { naics: "238330", name: "Flooring Contractors", category: "Flooring", emp_series: "CEU2023833001", wage_series: "CEU2023833003" },
  { naics: "238320", name: "Painting & Wall Covering", category: "Painting", emp_series: "CEU2023832001", wage_series: "CEU2023832003" },
  { naics: "238310", name: "Drywall & Insulation", category: "Drywall", emp_series: "CEU2023831001", wage_series: "CEU2023831003" },
  { naics: "238110", name: "Poured Concrete Foundation", category: "Concrete", emp_series: "CEU2023811001", wage_series: "CEU2023811003" },
  { naics: "238160", name: "Roofing Contractors", category: "Roofing", emp_series: "CEU2023816001", wage_series: "CEU2023816003" },
  { naics: "238210", name: "Electrical Contractors", category: "Electrical", emp_series: "CEU2023821001", wage_series: "CEU2023821003" },
  { naics: "238220", name: "Plumbing & HVAC", category: "Plumbing", emp_series: "CEU2023822001", wage_series: "CEU2023822003" },
  { naics: "238350", name: "Finish Carpentry", category: "Carpentry", emp_series: "CEU2023835001", wage_series: "CEU2023835003" },
  { naics: "238990", name: "Other Specialty Trade", category: "Other", emp_series: "CEU2023899001", wage_series: "CEU2023899003" },
  { naics: "236220", name: "Commercial Construction", category: "Construction", emp_series: "CEU2023622001", wage_series: "CEU2023622003" },
];

interface AnnualData {
  year: string;
  employment: number | null;
  wages: number | null;
}

interface IndustryResult {
  naics: string;
  name: string;
  category: string;
  current_employment: number;
  current_wages: number;
  employment_10yr_cagr: number;
  employment_3yr_growth: number;
  wage_10yr_cagr: number;
  projected_employment: number;
  projected_growth_pct: number;
  growth_velocity_score: number;
  verdict: string;
  history: { year: string; employment: number; wages: number }[];
  projection: { year: string; employment: number; projected: boolean }[];
  data_source: string;
}

async function fetchBLSSeries(seriesIds: string[], startYear: string, endYear: string): Promise<any[]> {
  const apiKey = Deno.env.get("BLS_API_KEY") || "";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const body: any = { seriesid: seriesIds, startyear: startYear, endyear: endYear };
  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
    body.registrationkey = apiKey;
  }

  // Try v2 first, then v1 as fallback
  for (const url of ["https://api.bls.gov/publicAPI/v2/timeseries/data/", "https://api.bls.gov/publicAPI/v1/timeseries/data/"]) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });
      if (res.status === 429) {
        // Rate limited — wait 2s and retry once
        await new Promise((r) => setTimeout(r, 2000));
        const retry = await fetch(url, { method: "POST", headers, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
        if (!retry.ok) continue;
        const retryData = await retry.json();
        if (retryData.status === "REQUEST_SUCCEEDED") return retryData.Results?.series || [];
        continue;
      }
      if (!res.ok) continue;
      const data = await res.json();
      if (data.status === "REQUEST_SUCCEEDED") return data.Results?.series || [];
    } catch {
      continue;
    }
  }
  throw new Error("BLS API rate limited or unavailable. Try again in a few minutes or add a BLS_API_KEY secret for higher limits.");
}

function getAnnualValue(seriesData: any[], year: string): number | null {
  // Prefer M12 (December) as the annual figure, fallback to any period that year
  const m12 = seriesData.find((d) => d.year === year && d.period === "M12");
  if (m12) return parseFloat(m12.value);
  const yearEntries = seriesData.filter((d) => d.year === year);
  if (yearEntries.length > 0) return parseFloat(yearEntries[0].value);
  return null;
}

function calculateCAGR(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || endValue <= 0 || years <= 0) return 0;
  return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
}

function projectValue(currentValue: number, cagr: number, years: number): number {
  return currentValue * Math.pow(1 + cagr / 100, years);
}

function scoreIndustry(empCAGR: number, wageCAGR: number, currentEmp: number): number {
  // Growth Velocity Score 0-100 — weighted blend
  // Employment growth (50%), wage growth (30%), industry size (20%)
  const growthScore = Math.min(100, Math.max(0, empCAGR * 25)); // 4% CAGR = 100
  const wageScore = Math.min(100, Math.max(0, wageCAGR * 25)); // 4% CAGR = 100
  const sizeScore = Math.min(100, (currentEmp / 500) * 100); // normalize against 500k workers
  return Math.round(growthScore * 0.5 + wageScore * 0.3 + sizeScore * 0.2);
}

function getVerdict(score: number, empCAGR: number): string {
  if (score >= 75 || empCAGR >= 4) return "Skyrocketing";
  if (score >= 60 || empCAGR >= 2.5) return "Strong Growth";
  if (score >= 45 || empCAGR >= 1) return "Steady";
  if (score >= 30) return "Stagnant";
  return "Declining";
}

export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, years } = body;
    const projectionYears = Math.min(Math.max(years || 5, 1), 15);

    if (action === "analyze") {
      const currentYear = new Date().getFullYear().toString();
      const startYear = (parseInt(currentYear) - 10).toString();

      // Collect all series IDs (employment + wages for each industry)
      const allSeriesIds = TRADE_INDUSTRIES.flatMap((ind) => [ind.emp_series, ind.wage_series]);

      // Fetch 10 years of data from BLS
      const blsSeries = await fetchBLSSeries(allSeriesIds, startYear, currentYear);

      // Build a lookup: seriesID -> data array
      const seriesMap: Record<string, any[]> = {};
      for (const s of blsSeries) {
        seriesMap[s.seriesID] = s.data || [];
      }

      const results: IndustryResult[] = [];

      for (const industry of TRADE_INDUSTRIES) {
        const empData = seriesMap[industry.emp_series] || [];
        const wageData = seriesMap[industry.wage_series] || [];

        // Build annual history (newest first from BLS, so we reverse)
        const yearsAvailable = [...new Set(empData.map((d) => d.year))].sort();
        const history: { year: string; employment: number; wages: number }[] = [];

        for (const yr of yearsAvailable) {
          const emp = getAnnualValue(empData, yr);
          const wage = getAnnualValue(wageData, yr);
          if (emp !== null) {
            history.push({ year: yr, employment: emp, wages: wage || 0 });
          }
        }

        if (history.length < 2) {
          results.push({
            naics: industry.naics,
            name: industry.name,
            category: industry.category,
            current_employment: 0,
            current_wages: 0,
            employment_10yr_cagr: 0,
            employment_3yr_growth: 0,
            wage_10yr_cagr: 0,
            projected_employment: 0,
            projected_growth_pct: 0,
            growth_velocity_score: 0,
            verdict: "No Data",
            history: [],
            projection: [],
            data_source: "BLS CES (insufficient data)",
          });
          continue;
        }

        const latest = history[history.length - 1];
        const earliest = history[0];
        const yearsSpan = parseInt(latest.year) - parseInt(earliest.year);

        // 10-year (or available span) CAGR
        const empCAGR = yearsSpan > 0 ? calculateCAGR(earliest.employment, latest.employment, yearsSpan) : 0;

        // 3-year recent growth (if available)
        const threeYearsAgo = history.length >= 4 ? history[history.length - 4] : earliest;
        const threeYearSpan = parseInt(latest.year) - parseInt(threeYearsAgo.year);
        const emp3yrGrowth = threeYearSpan > 0
          ? ((latest.employment - threeYearsAgo.employment) / threeYearsAgo.employment) * 100
          : 0;

        // Wage CAGR
        const wageCAGR = yearsSpan > 0 && earliest.wages > 0
          ? calculateCAGR(earliest.wages, latest.wages, yearsSpan)
          : 0;

        // Project forward
        const projectedEmp = projectValue(latest.employment, empCAGR, projectionYears);
        const projectedGrowthPct = ((projectedEmp - latest.employment) / latest.employment) * 100;

        // Score
        const score = scoreIndustry(empCAGR, wageCAGR, latest.employment);
        const verdict = getVerdict(score, empCAGR);

        // Build projection array
        const projection = [];
        for (let i = 1; i <= projectionYears; i++) {
          const projYear = (parseInt(latest.year) + i).toString();
          projection.push({
            year: projYear,
            employment: projectValue(latest.employment, empCAGR, i),
            projected: true,
          });
        }

        results.push({
          naics: industry.naics,
          name: industry.name,
          category: industry.category,
          current_employment: latest.employment,
          current_wages: latest.wages,
          employment_10yr_cagr: Math.round(empCAGR * 100) / 100,
          employment_3yr_growth: Math.round(emp3yrGrowth * 100) / 100,
          wage_10yr_cagr: Math.round(wageCAGR * 100) / 100,
          projected_employment: Math.round(projectedEmp * 10) / 10,
          projected_growth_pct: Math.round(projectedGrowthPct * 100) / 100,
          growth_velocity_score: score,
          verdict,
          history,
          projection,
          data_source: `BLS CES ${earliest.year}-${latest.year}`,
        });
      }

      // Sort by growth velocity score (highest first)
      results.sort((a, b) => b.growth_velocity_score - a.growth_velocity_score);

      // Summary stats
      const skyrocketing = results.filter((r) => r.verdict === "Skyrocketing");
      const strongGrowth = results.filter((r) => r.verdict === "Strong Growth");
      const avgCAGR = results.reduce((sum, r) => sum + r.employment_10yr_cagr, 0) / results.length;

      return Response.json({
        ok: true,
        projection_years: projectionYears,
        data_source: "U.S. Bureau of Labor Statistics — Current Employment Statistics",
        fetched_at: new Date().toISOString(),
        industries: results,
        summary: {
          total_analyzed: results.length,
          skyrocketing_count: skyrocketing.length,
          strong_growth_count: strongGrowth.length,
          avg_employment_cagr: Math.round(avgCAGR * 100) / 100,
          top_industry: results[0]?.name || "N/A",
          top_score: results[0]?.growth_velocity_score || 0,
        },
      });
    }

    if (action === "industries") {
      return Response.json({
        ok: true,
        industries: TRADE_INDUSTRIES.map((i) => ({
          naics: i.naics,
          name: i.name,
          category: i.category,
        })),
      });
    }

    return Response.json({ error: "Unknown action. Use 'analyze' or 'industries'." }, { status: 400 });
  } catch (error) {
    console.error("tradeCrystalBall error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}