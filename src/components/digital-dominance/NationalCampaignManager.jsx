import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Rocket, Loader2, Crown, GraduationCap, Building2, Zap, Youtube, Share2, Image, Video, Hash, CheckCircle2 } from 'lucide-react';

const BRANDS = [
  { id: 'xtreme_polishing', name: 'Xtreme Polishing Systems', icon: Crown, color: 'amber', desc: 'Full-service epoxy & concrete polishing' },
  { id: 'national_concrete', name: 'National Concrete Polishing', icon: Building2, color: 'blue', desc: 'National commercial concrete polishing' },
  { id: 'polished_concrete_u', name: 'Polished Concrete University', icon: GraduationCap, color: 'violet', desc: 'Training & certification programs' },
  { id: 'national_epoxy_pros', name: 'National Epoxy Pros', icon: Zap, color: 'emerald', desc: 'National epoxy flooring network' },
];

const HOOKS = [
  'Free Same-Day Estimate', 'No-Obligation Quote', 'Before & After Gallery',
  'Lifetime Warranty', 'Military Discount', '0% Financing Available',
  'Licensed & Insured', '20+ Years Experience', 'Same-Day Installation',
  'Free Color Consultation', 'Price Match Guarantee', 'Free Moisture Test',
];

export default function NationalCampaignManager() {
  const [activeBrand, setActiveBrand] = useState('xtreme_polishing');
  const [launching, setLaunching] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [error, setError] = useState(null);
  const [selectedHooks, setSelectedHooks] = useState(HOOKS.slice(0, 4));

  const toggleHook = (h) => {
    setSelectedHooks((prev) => prev.includes(h) ? prev.filter(x => x !== h) : [...prev, h]);
  };

  const launch = async () => {
    setLaunching(true);
    setError(null);
    setCampaign(null);
    try {
      const brand = BRANDS.find(b => b.id === activeBrand);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a comprehensive national digital campaign for ${brand.name}.

Selected hooks: ${selectedHooks.join(', ')}

Generate:
1. Campaign strategy and messaging
2. SEO content plan for top 100 cities (title, meta, keywords per city)
3. Social media content calendar (30 posts across Facebook, Instagram, LinkedIn, Twitter)
4. YouTube video content plan (10 video topics with titles, descriptions, tags)
5. Hashtag strategy
6. Platform submission plan (Google Business, Yelp, BBB, HomeAdvisor, Angi, Houzz, Facebook, Instagram, YouTube, LinkedIn, TikTok, Pinterest)
7. Lead magnet ideas
8. Email sequence for nurturing
9. SMS campaign templates
10. Performance KPIs to track

Return structured JSON.`,
        response_json_schema: {
          type: 'object',
          properties: {
            campaign_name: { type: 'string' },
            strategy: { type: 'string' },
            seo_cities: { type: 'array', items: { type: 'object', properties: { city: { type: 'string' }, title: { type: 'string' }, keywords: { type: 'array', items: { type: 'string' } } } } },
            social_posts: { type: 'array', items: { type: 'object', properties: { platform: { type: 'string' }, content: { type: 'string' }, hashtags: { type: 'array', items: { type: 'string' } } } } },
            youtube_videos: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, tags: { type: 'array', items: { type: 'string' } } } } },
            platforms: { type: 'array', items: { type: 'string' } },
            lead_magnets: { type: 'array', items: { type: 'string' } },
            kpis: { type: 'array', items: { type: 'string' } },
          },
        },
      });
      setCampaign(res);

      // Save to LaunchCampaign entity
      await base44.entities.LaunchCampaign.create({
        campaign_id: `CAMP-${Date.now()}`,
        brand: brand.name,
        campaign_name: res.campaign_name || `${brand.name} National Campaign`,
        strategy: res.strategy,
        status: 'active',
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Brand Selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {BRANDS.map((brand) => {
          const Icon = brand.icon;
          const active = activeBrand === brand.id;
          return (
            <button
              key={brand.id}
              onClick={() => setActiveBrand(brand.id)}
              className={`rounded-xl border-2 p-4 text-left transition ${
                active ? `border-${brand.color}-500 bg-${brand.color}-50` : 'border-stone-200 bg-white hover:border-stone-300'
              }`}
            >
              <Icon className={`h-7 w-7 mb-2 ${active ? `text-${brand.color}-600` : 'text-stone-400'}`} />
              <h4 className="text-sm font-bold text-stone-900">{brand.name}</h4>
              <p className="text-[10px] text-stone-500">{brand.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Hook Selector */}
      <div>
        <h4 className="text-xs font-bold text-stone-500 mb-2">TRAFFIC HOOKS ({selectedHooks.length} selected)</h4>
        <div className="flex flex-wrap gap-2">
          {HOOKS.map((h) => (
            <button
              key={h}
              onClick={() => toggleHook(h)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                selectedHooks.includes(h) ? 'bg-amber-500 text-stone-950' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {selectedHooks.includes(h) && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
              {h}
            </button>
          ))}
        </div>
      </div>

      <button onClick={launch} disabled={launching} className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50">
        {launching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
        {launching ? 'Launching Campaign...' : 'Launch National Campaign'}
      </button>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

      {/* Campaign Results */}
      {campaign && (
        <div className="space-y-3">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4">
            <h4 className="text-sm font-bold text-stone-900">{campaign.campaign_name}</h4>
            <p className="text-xs text-stone-600 mt-1">{campaign.strategy}</p>
          </div>

          {/* Social Media */}
          {campaign.social_posts?.length > 0 && (
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <h5 className="text-sm font-bold text-stone-900 mb-2"><Share2 className="h-4 w-4 inline mr-1" />Social Media ({campaign.social_posts.length} posts)</h5>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {campaign.social_posts.slice(0, 10).map((p, i) => (
                  <div key={i} className="rounded-lg border border-stone-100 p-2">
                    <span className="text-[10px] font-bold text-blue-600">{p.platform}</span>
                    <p className="text-xs text-stone-700">{p.content}</p>
                    {p.hashtags?.length > 0 && <p className="text-[10px] text-stone-400">{p.hashtags.join(' ')}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YouTube */}
          {campaign.youtube_videos?.length > 0 && (
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <h5 className="text-sm font-bold text-stone-900 mb-2"><Youtube className="h-4 w-4 inline mr-1" />YouTube Videos ({campaign.youtube_videos.length})</h5>
              <div className="space-y-2">
                {campaign.youtube_videos.slice(0, 5).map((v, i) => (
                  <div key={i} className="rounded-lg border border-stone-100 p-2">
                    <p className="text-xs font-bold text-stone-900">{v.title}</p>
                    <p className="text-[10px] text-stone-500">{v.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform Submission */}
          {campaign.platforms?.length > 0 && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-4">
              <h5 className="text-sm font-bold text-green-700 mb-2"><Building2 className="h-4 w-4 inline mr-1" />Platform Submissions ({campaign.platforms.length})</h5>
              <div className="flex flex-wrap gap-1">
                {campaign.platforms.map((p, i) => (
                  <span key={i} className="text-[10px] bg-white border border-green-200 rounded px-2 py-0.5 text-green-700">{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* SEO Cities */}
          {campaign.seo_cities?.length > 0 && (
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <h5 className="text-sm font-bold text-stone-900 mb-2">SEO City Pages ({campaign.seo_cities.length})</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {campaign.seo_cities.slice(0, 12).map((c, i) => (
                  <div key={i} className="rounded-lg border border-stone-100 p-2">
                    <p className="text-xs font-bold text-stone-900">{c.city}</p>
                    <p className="text-[10px] text-stone-500 truncate">{c.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KPIs */}
          {campaign.kpis?.length > 0 && (
            <div className="rounded-xl border border-stone-200 bg-white p-4">
              <h5 className="text-sm font-bold text-stone-900 mb-2">KPIs to Track</h5>
              <div className="flex flex-wrap gap-1">
                {campaign.kpis.map((k, i) => <span key={i} className="text-[10px] bg-amber-100 rounded px-2 py-0.5 text-amber-700">{k}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}