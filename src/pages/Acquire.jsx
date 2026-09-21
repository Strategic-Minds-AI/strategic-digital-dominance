import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Search, Zap, Award, ArrowRight, CheckCircle2, Building2, Globe2 } from "lucide-react";
import ListingCard from "@/components/marketplace/ListingCard";
import AcquireLeadForm from "@/components/marketplace/AcquireLeadForm";
import BackButton from "@/components/BackButton";
import Logo from "@/components/Logo";

export default function Acquire() {
  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["marketplaceListings"],
    queryFn: async () => {
      const res = await base44.entities.MarketplaceListing.filter({ status: "for_sale" }, "-asking_price", 50);
      return res;
    },
  });

  const stats = {
    total: listings.length,
    totalLeads: listings.reduce((s, l) => s + (l.monthly_leads || 0), 0),
    avgRank: listings.length > 0 ? Math.round(listings.reduce((s, l) => s + (l.google_rank || 10), 0) / listings.length) : 0,
    totalRevenue: listings.reduce((s, l) => s + (l.monthly_revenue || 0), 0),
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="relative max-w-6xl mx-auto px-5 pt-8 pb-16">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <BackButton className="text-stone-400 hover:text-white" showLabel={false} />
              <Logo colorClass="text-white" />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-6">
            <Award className="h-3.5 w-3.5" /> Acquisition Marketplace
          </div>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-5">
            Own a <span className="text-amber-500">Turnkey Lead Generation Business</span>
            <br />Already on the First Page of Google
          </h1>
          <p className="text-lg text-stone-400 max-w-2xl mb-8">
            Buy a proven website with leads already flowing — or have us build one custom for your trade. Every site comes with a complete system: SEO ranking, lead capture, automated follow-up, and a domain that owns its market.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#inventory" className="px-6 py-3 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:filter hover:brightness-110 transition flex items-center gap-2">
              Browse Inventory <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#done-for-you" className="px-6 py-3 rounded-xl border border-stone-700 text-white font-bold text-sm hover:border-amber-500 transition">
              Done For Me
            </a>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-y border-stone-800 bg-stone-900/50">
        <div className="max-w-6xl mx-auto px-5 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBlock icon={Building2} value={stats.total} label="Sites Available" />
          <StatBlock icon={TrendingUp} value={`${stats.totalLeads}/mo`} label="Total Leads Flowing" />
          <StatBlock icon={Search} value={`#${stats.avgRank}`} label="Avg Google Rank" />
          <StatBlock icon={Zap} value={`$${(stats.totalRevenue / 1000).toFixed(0)}K/mo`} label="Combined Revenue" />
        </div>
      </div>

      {/* Value props */}
      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ValueProp
            icon={Search}
            title="First Page of Google"
            desc="Every site is already ranking for its primary keyword. You're buying position #1-3, not hoping to get there."
          />
          <ValueProp
            icon={TrendingUp}
            title="Leads Already Flowing"
            desc="These aren't promises — they're producing leads today. You see the numbers before you buy."
          />
          <ValueProp
            icon={Zap}
            title="Immediate System"
            desc="Lead capture, automated follow-up, CRM integration, and a proven funnel — all built and running."
          />
        </div>
      </div>

      {/* Inventory */}
      <div id="inventory" className="max-w-6xl mx-auto px-5 pb-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Available Sites</h2>
            <p className="text-stone-400 text-sm">Proven lead-gen websites ready to transfer</p>
          </div>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-stone-700 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-stone-900 border border-stone-800 rounded-2xl p-12 text-center">
            <Globe2 className="h-10 w-10 text-stone-600 mx-auto mb-3" />
            <p className="text-stone-400 mb-1">No sites currently listed for sale.</p>
            <p className="text-stone-500 text-sm">New inventory is added as sites reach first-page ranking. Request a custom build below.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </div>

      {/* Done For You */}
      <div id="done-for-you" className="bg-gradient-to-b from-stone-900 to-stone-950 border-y border-stone-800">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
                <Zap className="h-3.5 w-3.5" /> Done For You
              </div>
              <h2 className="text-3xl font-bold mb-4">Don't See Your Industry? We'll Build It.</h2>
              <p className="text-stone-400 mb-6">
                Tell us your trade and target city. We'll secure the domain, build the site, rank it on Google, and deliver it to you with leads already coming in. Typical timeline: 60-90 days to first page.
              </p>
              <div className="space-y-3">
                {[
                  "Domain research & acquisition included",
                  "SEO-optimized site built for your trade",
                  "First-page Google ranking guaranteed",
                  "Lead capture + CRM + auto-follow-up system",
                  "You own everything — domain, site, leads, system",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-amber-500 shrink-0" />
                    <span className="text-stone-300 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Request Access</h3>
              <AcquireLeadForm />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-stone-800 bg-stone-950">
        <div className="max-w-6xl mx-auto px-5 py-8 text-center">
          <p className="text-stone-500 text-sm">Turnkey lead generation websites for investors, business owners, and trade entrepreneurs.</p>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
        <Icon className="h-5 w-5 text-amber-500" />
      </div>
      <div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-xs text-stone-500 uppercase tracking-wide">{label}</div>
      </div>
    </div>
  );
}

function ValueProp({ icon: Icon, title, desc }) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 hover:border-amber-500/30 transition">
      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-amber-500" />
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-stone-400 text-sm">{desc}</p>
    </div>
  );
}