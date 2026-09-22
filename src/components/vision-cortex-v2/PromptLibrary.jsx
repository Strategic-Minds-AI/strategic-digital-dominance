import React, { useState } from 'react';
import { DollarSign, Zap, TrendingUp, Search } from 'lucide-react';

// 50 money-making prompts — numbered by ease/speed/likelihood (easiest & fastest first)
// All fully digital, fastest path to revenue
export const MONEY_MAKING_PROMPTS = [
  { id: 1, topic: 'Missed-Call Text-Back Bot', niche: 'Local Services', path: 'SaaS subscription', speed: 'Fast', capital: '$0', desc: 'Auto-reply to missed calls with SMS; charge $49-199/mo per business' },
  { id: 2, topic: 'AI Lead Recovery Agent', niche: 'Any vertical', path: 'SaaS + setup fee', speed: 'Fast', capital: '$0', desc: 'Re-engage cold/lost leads automatically; performance-based pricing' },
  { id: 3, topic: 'Review Automation System', niche: 'Local Services', path: 'SaaS subscription', speed: 'Fast', capital: '$0', desc: 'Automated review request funnel; $99-299/mo per location' },
  { id: 4, topic: 'Google Business Profile Optimizer', niche: 'Local SEO', path: 'One-time + monthly', speed: 'Fast', capital: '$0', desc: 'AI-optimized GBP with auto-posts; $500 setup + $99/mo' },
  { id: 5, topic: 'AI Website Chatbot', niche: 'Any website', path: 'SaaS subscription', speed: 'Fast', capital: '$0', desc: 'Lead-capture chatbot; $49-499/mo per site' },
  { id: 6, topic: 'SMS Follow-Up Automator', niche: 'Service businesses', path: 'SaaS + usage', speed: 'Fast', capital: '$0', desc: 'Multi-step SMS sequences; $99-299/mo' },
  { id: 7, topic: 'Quote/Estimate Calculator', niche: 'Contractors', path: 'Lead gen + SaaS', speed: 'Fast', capital: '$0', desc: 'Interactive pricing tool; lead capture + $199/mo' },
  { id: 8, topic: 'Appointment Booking Bot', niche: 'Health/Services', path: 'SaaS subscription', speed: 'Fast', capital: '$0', desc: 'AI booking with reminders; $149-399/mo' },
  { id: 9, topic: 'Social Media Content Scheduler', niche: 'Any business', path: 'SaaS subscription', speed: 'Fast', capital: '$0', desc: 'AI content + auto-post; $49-199/mo' },
  { id: 10, topic: 'Email Sequence Automator', niche: 'E-commerce/SaaS', path: 'SaaS subscription', speed: 'Fast', capital: '$0', desc: 'AI-written nurture sequences; $99-299/mo' },
  { id: 11, topic: 'AI Content Writer SaaS', niche: 'Marketers', path: 'SaaS subscription', speed: 'Fast', capital: '$0', desc: 'Bulk content generation; $29-199/mo per user' },
  { id: 12, topic: 'Logo & Brand Generator', niche: 'Startups/SMBs', path: 'One-time + SaaS', speed: 'Fast', capital: '$0', desc: 'AI brand kits; $49-499 per brand' },
  { id: 13, topic: 'Website Template Rebrander', niche: 'Agencies', path: 'SaaS + white-label', speed: 'Fast', capital: '$0', desc: 'Rebrand 50+ templates; $199-999/mo' },
  { id: 14, topic: 'SEO Audit Tool', niche: 'Agencies/SMBs', path: 'SaaS subscription', speed: 'Fast', capital: '$0', desc: 'Automated SEO reports; $99-499/mo' },
  { id: 15, topic: 'Call Tracking System', niche: 'Local Services', path: 'SaaS + usage', speed: 'Fast', capital: '$0', desc: 'Attribution call tracking; $49-199/mo' },
  { id: 16, topic: 'CRM Pipeline Builder', niche: 'Sales teams', path: 'SaaS subscription', speed: 'Medium', capital: '$0', desc: 'AI-powered CRM; $99-499/mo per user' },
  { id: 17, topic: 'Invoice Generator', niche: 'Freelancers/SMBs', path: 'SaaS subscription', speed: 'Fast', capital: '$0', desc: 'AI invoicing + reminders; $19-99/mo' },
  { id: 18, topic: 'Referral Program Builder', niche: 'E-commerce/SaaS', path: 'SaaS subscription', speed: 'Medium', capital: '$0', desc: 'Automated referral loops; $99-299/mo' },
  { id: 19, topic: 'Customer Feedback Collector', niche: 'Any business', path: 'SaaS subscription', speed: 'Fast', capital: '$0', desc: 'AI survey + insights; $49-199/mo' },
  { id: 20, topic: 'AI Voice Assistant', niche: 'Service businesses', path: 'SaaS + usage', speed: 'Medium', capital: '$0', desc: 'Phone AI receptionist; $299-999/mo' },
  { id: 21, topic: 'Video Testimonial Generator', niche: 'Any business', path: 'One-time + SaaS', speed: 'Medium', capital: '$0', desc: 'AI-edited testimonials; $299-999 per project' },
  { id: 22, topic: 'YouTube Content Repurposer', niche: 'Creators/Brands', path: 'SaaS subscription', speed: 'Medium', capital: '$0', desc: 'Auto-clip long-form to shorts; $49-199/mo' },
  { id: 23, topic: 'Viral Content Creator', niche: 'Social media', path: 'SaaS + agency', speed: 'Medium', capital: '$0', desc: 'Trend-based viral content; $199-999/mo' },
  { id: 24, topic: 'Niche Marketplace Builder', niche: 'Any vertical', path: 'Transaction fees', speed: 'Medium', capital: '$0', desc: 'Two-sided marketplace; 5-15% take rate' },
  { id: 25, topic: 'SaaS MVP Generator', niche: 'Founders', path: 'One-time + equity', speed: 'Medium', capital: '$0', desc: 'Ship MVPs fast; $2K-10K per build' },
  { id: 26, topic: 'Affiliate Site Builder', niche: 'Affiliate marketers', path: 'Commission revenue', speed: 'Medium', capital: '$0', desc: 'Auto affiliate sites; $99-499/mo' },
  { id: 27, topic: 'Digital Product Creator', niche: 'Creators', path: 'Direct sales', speed: 'Fast', capital: '$0', desc: 'AI-generated courses/ebooks; $29-499 per product' },
  { id: 28, topic: 'Course Platform Builder', niche: 'Educators', path: 'SaaS + fees', speed: 'Medium', capital: '$0', desc: 'Host + sell courses; $99-499/mo + 5% fees' },
  { id: 29, topic: 'Membership Site Builder', niche: 'Communities', path: 'Recurring revenue', speed: 'Medium', capital: '$0', desc: 'Gated content sites; $99-499/mo' },
  { id: 30, topic: 'AI Agent Swarm Platform', niche: 'Enterprises', path: 'Enterprise SaaS', speed: 'Medium', capital: '$0', desc: 'Multi-agent orchestration; $499-9,999/mo' },
  { id: 31, topic: 'Autonomous Workflow Builder', niche: 'Operations teams', path: 'SaaS subscription', speed: 'Medium', capital: '$0', desc: 'No-code automations; $199-999/mo' },
  { id: 32, topic: 'Multi-tenant SaaS Generator', niche: 'SaaS founders', path: 'SaaS revenue', speed: 'Medium', capital: '$0', desc: 'Ship multi-tenant apps; $199-999/mo' },
  { id: 33, topic: 'API Integration Hub', niche: 'Developers', path: 'SaaS + usage', speed: 'Medium', capital: '$0', desc: 'Unified API gateway; $99-999/mo' },
  { id: 34, topic: 'Data Dashboard Builder', niche: 'Any data business', path: 'SaaS subscription', speed: 'Medium', capital: '$0', desc: 'Auto dashboards from data; $99-499/mo' },
  { id: 35, topic: 'Prediction Engine', niche: 'Finance/Real estate', path: 'SaaS + data', speed: 'Medium', capital: '$0', desc: 'AI forecasting; $299-2,999/mo' },
  { id: 36, topic: 'Competitor Analysis Tool', niche: 'Any vertical', path: 'SaaS subscription', speed: 'Fast', capital: '$0', desc: 'Auto competitor intel; $99-499/mo' },
  { id: 37, topic: 'Market Intelligence Platform', niche: 'Investors/Founders', path: 'SaaS + reports', speed: 'Medium', capital: '$0', desc: 'Market research AI; $199-999/mo' },
  { id: 38, topic: 'GitHub Code Scanner', niche: 'Developers', path: 'SaaS subscription', speed: 'Medium', capital: '$0', desc: 'Find & integrate top code; $99-499/mo' },
  { id: 39, topic: 'Website Cloner & Enhancer', niche: 'Agencies', path: 'SaaS + one-time', speed: 'Fast', capital: '$0', desc: 'Clone + improve sites; $199-999 per site' },
  { id: 40, topic: 'Mass Website Generator', niche: 'SEO empires', path: 'SaaS + revenue share', speed: 'Medium', capital: '$0', desc: 'Generate 100s of sites; $499-2,999/mo' },
  { id: 41, topic: 'International Content Localizer', niche: 'Global brands', path: 'SaaS + usage', speed: 'Medium', capital: '$0', desc: 'Auto-translate + localize; $199-999/mo' },
  { id: 42, topic: 'Voice AI Call Center', niche: 'Enterprises', path: 'Enterprise SaaS', speed: 'Slow', capital: '$0', desc: 'AI call center; $999-9,999/mo' },
  { id: 43, topic: 'WhatsApp Business Bot', niche: 'International markets', path: 'SaaS + usage', speed: 'Medium', capital: '$0', desc: 'WhatsApp automation; $99-499/mo' },
  { id: 44, topic: 'MMS Marketing System', niche: 'Local Services', path: 'SaaS + usage', speed: 'Medium', capital: '$0', desc: 'Rich media SMS; $149-499/mo' },
  { id: 45, topic: 'YouTube Mass Video Generator', niche: 'Content creators', path: 'Ad revenue + SaaS', speed: 'Medium', capital: '$0', desc: 'AI video at scale; $199-999/mo' },
  { id: 46, topic: 'Trending Video Benchmark Scanner', niche: 'Content brands', path: 'SaaS subscription', speed: 'Medium', capital: '$0', desc: 'Find trending videos; $99-499/mo' },
  { id: 47, topic: 'Top Sites Scanner', niche: 'Any vertical', path: 'SaaS + reports', speed: 'Medium', capital: '$0', desc: 'Benchmark top sites; $199-999/mo' },
  { id: 48, topic: 'Find the Money Generator', niche: 'Investors/Founders', path: 'SaaS + consulting', speed: 'Medium', capital: '$0', desc: 'Identify revenue systems; $299-2,999/mo' },
  { id: 49, topic: 'Autonomous Agent Monetizer', niche: 'SaaS owners', path: 'Revenue share + SaaS', speed: 'Medium', capital: '$0', desc: 'Agents that earn; $499-2,999/mo' },
  { id: 50, topic: 'Full Autonomous AI Company', niche: 'Enterprise', path: 'Enterprise license', speed: 'Slow', capital: '$0', desc: 'Complete AI company; $10K-100K/yr' },
];

export default function PromptLibrary({ onPromptSelect }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = MONEY_MAKING_PROMPTS.filter((p) => {
    const matchSearch = !search || p.topic.toLowerCase().includes(search.toLowerCase()) || p.niche.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || (filter === 'fast' && p.speed === 'Fast') || (filter === 'medium' && p.speed === 'Medium');
    return matchSearch && matchFilter;
  });

  return (
    <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-white p-5">
      <div className="flex items-center gap-2 mb-3">
        <DollarSign className="h-5 w-5 text-amber-600" />
        <h3 className="text-lg font-black text-stone-900">Money-Making Prompt Library</h3>
        <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">{filtered.length} prompts</span>
      </div>
      <p className="text-xs text-stone-500 mb-3">Numbered by ease, speed & likelihood — #1 is the fastest path to revenue. Click any prompt to load it into the vision pipeline.</p>

      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search prompts..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none"
          />
        </div>
        <div className="flex gap-1">
          <button onClick={() => setFilter('all')} className={`px-3 py-2 rounded-lg text-xs font-bold transition ${filter === 'all' ? 'bg-amber-500 text-stone-950' : 'bg-white border border-stone-200 text-stone-600'}`}>All</button>
          <button onClick={() => setFilter('fast')} className={`px-3 py-2 rounded-lg text-xs font-bold transition ${filter === 'fast' ? 'bg-amber-500 text-stone-950' : 'bg-white border border-stone-200 text-stone-600'}`}><Zap className="h-3 w-3 inline" /> Fast</button>
          <button onClick={() => setFilter('medium')} className={`px-3 py-2 rounded-lg text-xs font-bold transition ${filter === 'medium' ? 'bg-amber-500 text-stone-950' : 'bg-white border border-stone-200 text-stone-600'}`}><TrendingUp className="h-3 w-3 inline" /> Medium</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 max-h-80 overflow-y-auto">
        {filtered.map((p) => (
          <button
            key={p.id}
            onClick={() => onPromptSelect?.(p)}
            title={p.desc}
            className="text-left rounded-lg border border-stone-200 bg-white p-2.5 hover:border-amber-500 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="h-5 w-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white text-[10px] font-black grid place-items-center shrink-0">{p.id}</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${p.speed === 'Fast' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{p.speed}</span>
            </div>
            <p className="text-xs font-bold text-stone-900 group-hover:text-amber-600 leading-tight">{p.topic}</p>
            <p className="text-[10px] text-stone-400 mt-0.5">{p.niche}</p>
          </button>
        ))}
      </div>
    </div>
  );
}