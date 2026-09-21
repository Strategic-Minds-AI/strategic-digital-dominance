import React from 'react';
import { Search, TrendingUp, BarChart3, Globe } from 'lucide-react';

// ── 20 critical Google search queries for entrepreneurs ──
// Based on statistical relevance for business decision-making
const GOOGLE_SEARCHES = [
  { label: 'Google Trends', query: 'site:trends.google.com trending searches 2026', icon: TrendingUp, color: 'border-green-500 bg-green-50 text-green-700' },
  { label: 'Market Size Data', query: 'market size analysis statistics 2026', icon: BarChart3, color: 'border-blue-500 bg-blue-50 text-blue-700' },
  { label: 'Startup Failure Rates', query: 'startup failure rate statistics by industry 2026', icon: BarChart3, color: 'border-red-500 bg-red-50 text-red-700' },
  { label: 'Industry Growth', query: 'fastest growing industries 2026 statistics', icon: TrendingUp, color: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { label: 'Consumer Trends', query: 'consumer behavior trends 2026 statistics data', icon: Globe, color: 'border-purple-500 bg-purple-50 text-purple-700' },
  { label: 'SaaS Benchmarks', query: 'SaaS metrics benchmarks 2026 churn CAC LTV', icon: BarChart3, color: 'border-indigo-500 bg-indigo-50 text-indigo-700' },
  { label: 'E-commerce Growth', query: 'e-commerce growth statistics 2026 market share', icon: TrendingUp, color: 'border-amber-500 bg-amber-50 text-amber-700' },
  { label: 'AI Adoption', query: 'AI adoption rate business statistics 2026', icon: TrendingUp, color: 'border-cyan-500 bg-cyan-50 text-cyan-700' },
  { label: 'Mobile App Usage', query: 'mobile app usage statistics 2026 screen time', icon: BarChart3, color: 'border-pink-500 bg-pink-50 text-pink-700' },
  { label: 'Lead Gen Stats', query: 'lead generation conversion rate statistics 2026', icon: BarChart3, color: 'border-orange-500 bg-orange-50 text-orange-700' },
  { label: 'CAC by Industry', query: 'customer acquisition cost by industry 2026 benchmark', icon: BarChart3, color: 'border-teal-500 bg-teal-50 text-teal-700' },
  { label: 'LTV Benchmarks', query: 'customer lifetime value benchmarks by industry 2026', icon: BarChart3, color: 'border-lime-500 bg-lime-50 text-lime-700' },
  { label: 'SEO Statistics', query: 'SEO statistics 2026 organic traffic conversion rates', icon: Search, color: 'border-stone-700 bg-stone-100 text-stone-700' },
  { label: 'Social Engagement', query: 'social media engagement rate statistics 2026 by platform', icon: Globe, color: 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700' },
  { label: 'Email Marketing', query: 'email marketing open rate click rate statistics 2026', icon: BarChart3, color: 'border-violet-500 bg-violet-50 text-violet-700' },
  { label: 'Content ROI', query: 'content marketing ROI statistics 2026 benchmarks', icon: TrendingUp, color: 'border-green-600 bg-green-50 text-green-700' },
  { label: 'Automation Stats', query: 'business automation statistics 2026 productivity gains', icon: TrendingUp, color: 'border-sky-500 bg-sky-50 text-sky-700' },
  { label: 'Success Rates', query: 'entrepreneur success rate statistics by age industry 2026', icon: BarChart3, color: 'border-rose-500 bg-rose-50 text-rose-700' },
  { label: 'VC Funding', query: 'venture capital funding trends 2026 by sector statistics', icon: TrendingUp, color: 'border-amber-600 bg-amber-50 text-amber-700' },
  { label: 'Marketing Spend', query: 'digital marketing spend statistics 2026 by channel', icon: BarChart3, color: 'border-blue-600 bg-blue-50 text-blue-700' },
];

export default function GoogleSearchTool() {
  const openSearch = (query) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Search className="h-5 w-5 text-amber-500" />
        <h3 className="text-sm font-black text-stone-900">Market Intelligence Search</h3>
      </div>
      <p className="text-xs text-stone-500 mb-4">
        20 critical data searches — click any button to open live Google statistics for that topic.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {GOOGLE_SEARCHES.map((s, i) => {
          const Icon = s.icon;
          return (
            <button
              key={i}
              onClick={() => openSearch(s.query)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center transition hover:scale-105 ${s.color}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-bold leading-tight">{s.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}