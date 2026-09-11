import React from "react";
import { Share2, Megaphone, Facebook, Instagram, Linkedin, Youtube, Music2 as TikTok, Twitter } from "lucide-react";
import ModuleShell, { Toggle, Slider } from "./ModuleShell";

// Social media + paid ads modules
export default function AmplifyModules({ modules, onChange }) {
  const { social = {}, ads = {} } = modules;

  const updateSoc = (patch) => onChange({ ...modules, social: { ...social, ...patch } });
  const updateAds = (patch) => onChange({ ...modules, ads: { ...ads, ...patch } });

  const platforms = [
    { key: "facebook", label: "Facebook", icon: Facebook },
    { key: "instagram", label: "Instagram", icon: Instagram },
    { key: "linkedin", label: "LinkedIn", icon: Linkedin },
    { key: "youtube", label: "YouTube", icon: Youtube },
    { key: "tiktok", label: "TikTok", icon: TikTok },
    { key: "x_twitter", label: "X (Twitter)", icon: Twitter },
  ];

  const presencePts = (social.facebook ? 10 : 0) + (social.instagram ? 8 : 0) + (social.linkedin ? 6 : 0) + (social.youtube ? 8 : 0) + (social.tiktok ? 6 : 0) + (social.x_twitter ? 4 : 0) + ([social.facebook, social.instagram, social.linkedin, social.youtube, social.tiktok, social.x_twitter].filter(Boolean).length === 6 ? 8 : 0);
  const freqPts = Number(social.posting_frequency) >= 8 ? 25 : Number(social.posting_frequency) >= 4 ? 18 : Number(social.posting_frequency) >= 2 ? 12 : Number(social.posting_frequency) >= 1 ? 6 : 0;
  const engPts = Math.round((Number(social.engagement_rate) || 0) / 100 * 25);
  const socialScore = presencePts + freqPts + engPts;

  const adsScore = (ads.google_ads_active ? 50 : 0) + (ads.facebook_ads_active ? 30 : 0) + (Number(ads.monthly_budget) >= 2000 ? 20 : Number(ads.monthly_budget) >= 500 ? 12 : Number(ads.monthly_budget) >= 100 ? 6 : 0);

  return (
    <div className="space-y-3">
      <ModuleShell title="Social Media Presence" icon={Share2} score={socialScore} maxScore={100} impact={Math.round(socialScore * 0.10 * 10) / 10}>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-2 block">Platform Presence</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {platforms.map(({ key, label, icon: I }) => (
              <button
                key={key}
                onClick={() => updateSoc({ [key]: !social[key] })}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition ${social[key] ? "border-amber-500 bg-amber-500/10 text-amber-400" : "border-stone-700 bg-stone-800 text-stone-500 hover:border-stone-600"}`}
              >
                <I className="h-4 w-4" />
                {label}
                {social[key] && <span className="ml-auto text-[10px]">✓</span>}
              </button>
            ))}
          </div>
          <Slider label="Posting frequency" value={Number(social.posting_frequency) || 0} onChange={(v) => updateSoc({ posting_frequency: v })} min={0} max={14} suffix=" posts/week" />
          <Slider label="Engagement rate" value={Number(social.engagement_rate) || 0} onChange={(v) => updateSoc({ engagement_rate: v })} min={0} max={100} suffix="%" />
        </div>
      </ModuleShell>

      <ModuleShell title="Paid Advertising (Amplification)" icon={Megaphone} score={adsScore} maxScore={100} impact={Math.round(adsScore * 0.05 * 10) / 10} defaultOpen={false}>
        <div className="grid md:grid-cols-2 gap-x-6">
          <Toggle label="Google Ads active" checked={!!ads.google_ads_active} onChange={(v) => updateAds({ google_ads_active: v })} hint="Search & display campaigns running" />
          <Toggle label="Facebook Ads active" checked={!!ads.facebook_ads_active} onChange={(v) => updateAds({ facebook_ads_active: v })} hint="Meta ad campaigns running" />
          <Slider label="Monthly ad budget" value={Number(ads.monthly_budget) || 0} onChange={(v) => updateAds({ monthly_budget: v })} min={0} max={5000} step={50} suffix="$" />
        </div>
      </ModuleShell>
    </div>
  );
}