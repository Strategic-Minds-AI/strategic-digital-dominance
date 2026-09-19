import React, { useState } from "react";
import { Share2, Loader2, CheckCircle2, ExternalLink, Calendar, Building2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useSandbox } from "./SandboxContext";
import SandboxCard, { StatusBadge } from "./SandboxCard";

const PLATFORMS = [
  { id: "google_business", label: "Google Business Profile", icon: Building2, color: "blue" },
  { id: "linkedin", label: "LinkedIn Company Page", icon: Share2, color: "blue" },
  { id: "tiktok", label: "TikTok Business", icon: Share2, color: "stone" },
  { id: "instagram", label: "Instagram Business", icon: Share2, color: "pink" },
  { id: "facebook", label: "Facebook Page", icon: Share2, color: "blue" },
  { id: "youtube", label: "YouTube Channel", icon: Share2, color: "red" },
];

const DIRECTORIES = [
  { name: "Yelp", url: "https://biz.yelp.com/add_business" },
  { name: "BBB", url: "https://www.bbb.org/business-reviews/add" },
  { name: "Yellow Pages", url: "https://www.yellowpages.com/add-business" },
  { name: "Apple Maps", url: "https://business.apple.com/" },
  { name: "Bing Places", url: "https://www.bingplaces.com/" },
  { name: "HomeAdvisor", url: "https://www.homeadvisor.com/c.43333.pro.html" },
  { name: "Angi", url: "https://www.angi.com/pro/" },
  { name: "Thumbtack", url: "https://www.thumbtack.com/pro" },
  { name: "Houzz", url: "https://www.houzz.com/proSignUps" },
  { name: "Manta", url: "https://www.manta.com/claim" },
];

export default function SocialTab() {
  const { campaign, updateCampaign, markTabComplete, setActiveTab } = useSandbox();
  const [generating, setGenerating] = useState(false);
  const [posts, setPosts] = useState([]);
  const [submitted, setSubmitted] = useState({});

  const generatePosts = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("socialStudio", {
        action: "generateContent",
        business_name: campaign.businessName,
        niche: campaign.keyword,
        city: campaign.city,
        platforms: PLATFORMS.map((p) => p.id),
        post_count: 3,
      });
      setPosts(res?.data?.posts || []);
      updateCampaign({ socialConfig: { platforms: PLATFORMS.map((p) => p.id), posts: res?.data?.posts || [] } });
    } catch {
      setPosts([]);
    } finally {
      setGenerating(false);
    }
  };

  const markSubmitted = (name) => {
    setSubmitted((prev) => ({ ...prev, [name]: true }));
  };

  const advance = () => {
    markTabComplete("social");
    setActiveTab("simulation");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Social platforms */}
        <SandboxCard title="Social Media Empire" icon={Share2} subtitle="6 platforms × 3 posts/day">
          <button onClick={generatePosts} disabled={generating || !campaign.businessName} className="ds-btn-primary mb-3">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Share2 className="h-4 w-4" />}
            {generating ? "Generating Posts..." : "Generate Social Content"}
          </button>
          <div className="grid grid-cols-2 gap-2">
            {PLATFORMS.map((p) => (
              <div key={p.id} className="flex items-center gap-2 px-3 py-2 border border-stone-200 rounded">
                <p.icon className="h-4 w-4 text-stone-600" />
                <span className="text-xs font-medium text-stone-900">{p.label}</span>
              </div>
            ))}
          </div>
          {posts.length > 0 && (
            <div className="mt-3 space-y-1 max-h-48 overflow-y-auto">
              {posts.slice(0, 6).map((post, i) => (
                <div key={i} className="text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded p-2">
                  <span className="ds-label text-amber-600">{post.platform || PLATFORMS[i % PLATFORMS.length].label}</span>
                  <p className="mt-1 line-clamp-2">{post.content || post.caption || "Generated post"}</p>
                </div>
              ))}
            </div>
          )}
        </SandboxCard>

        {/* Directory submissions */}
        <SandboxCard title="Directory Submission List" icon={Building2} subtitle="10 high-authority directories">
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {DIRECTORIES.map((d) => (
              <div key={d.name} className="flex items-center gap-2 px-3 py-2 border border-stone-200 rounded">
                <span className="text-sm font-medium text-stone-900 flex-1">{d.name}</span>
                {submitted[d.name] ? (
                  <StatusBadge status="passed" label="SUBMITTED" />
                ) : (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => markSubmitted(d.name)}
                    className="ds-btn-ghost text-xs"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Submit
                  </a>
                )}
              </div>
            ))}
          </div>
        </SandboxCard>
      </div>

      {/* Social calendar */}
      <SandboxCard title="Social Content Calendar" icon={Calendar} subtitle="3 posts/day across all platforms">
        <div className="grid grid-cols-7 gap-1">
          {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day, di) => (
            <div key={day} className="border border-stone-200 rounded p-2">
              <div className="ds-label text-stone-500 mb-1 text-center">{day}</div>
              {[1, 2, 3].map((slot) => (
                <div key={slot} className="text-xs text-stone-400 bg-stone-50 border border-stone-100 rounded px-1.5 py-1 mb-1 truncate">
                  Post {slot}
                </div>
              ))}
            </div>
          ))}
        </div>
      </SandboxCard>

      <div className="flex justify-end">
        <button onClick={advance} className="ds-btn-primary">
          <CheckCircle2 className="h-4 w-4" /> Save Social Plan & Advance to Simulation
        </button>
      </div>
    </div>
  );
}