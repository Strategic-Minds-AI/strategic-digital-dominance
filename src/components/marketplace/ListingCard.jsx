import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Users, DollarSign, Search, MapPin, ArrowRight } from "lucide-react";

const NICHE_LABELS = {
  epoxy_garage: "Epoxy Garage",
  decorative_concrete: "Decorative Concrete",
  polished_concrete: "Polished Concrete",
  epoxy_flooring: "Epoxy Flooring",
  garage_coating: "Garage Coating",
  concrete_resurfacing: "Concrete Resurfacing",
  roofing: "Roofing",
  plumbing: "Plumbing",
  electrical: "Electrical",
  hvac: "HVAC",
  painting: "Painting",
  drywall: "Drywall",
  flooring: "Flooring",
  other: "Other",
};

export default function ListingCard({ listing }) {
  const formatPrice = (n) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 group flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-stone-800">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-amber-500 uppercase">{NICHE_LABELS[listing.niche] || listing.niche}</span>
            <h3 className="text-lg font-bold text-white font-mono mt-0.5">{listing.domain}</h3>
          </div>
          {listing.google_rank && listing.google_rank <= 3 && (
            <span className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">
              #{listing.google_rank} on Google
            </span>
          )}
        </div>
        <p className="text-sm text-stone-400 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {listing.city ? `${listing.city}, ${listing.state}` : "National"}
        </p>
      </div>

      {/* Stats */}
      <div className="p-5 grid grid-cols-3 gap-3 flex-1">
        <div>
          <div className="flex items-center gap-1 text-stone-500 text-[10px] uppercase tracking-wide font-bold mb-1">
            <Users className="h-3 w-3" /> Leads/mo
          </div>
          <div className="text-xl font-bold text-white">{listing.monthly_leads || 0}</div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-stone-500 text-[10px] uppercase tracking-wide font-bold mb-1">
            <DollarSign className="h-3 w-3" /> Rev/mo
          </div>
          <div className="text-xl font-bold text-white">{formatPrice(listing.monthly_revenue || 0)}</div>
        </div>
        <div>
          <div className="flex items-center gap-1 text-stone-500 text-[10px] uppercase tracking-wide font-bold mb-1">
            <Search className="h-3 w-3" /> Rank
          </div>
          <div className="text-xl font-bold text-white">#{listing.google_rank || "—"}</div>
        </div>
      </div>

      {/* Highlights */}
      {listing.highlights && listing.highlights.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1.5">
          {listing.highlights.slice(0, 3).map((h, i) => (
            <span key={i} className="px-2 py-1 rounded-md bg-stone-800 text-stone-400 text-[10px] font-medium">{h}</span>
          ))}
        </div>
      )}

      {/* Price + CTA */}
      <div className="p-5 border-t border-stone-800 mt-auto">
        <div className="flex items-end justify-between mb-3">
          <div>
            <div className="text-[10px] uppercase tracking-wide text-stone-500 font-bold">Asking Price</div>
            <div className="text-2xl font-bold text-amber-500">{formatPrice(listing.asking_price)}</div>
          </div>
          {listing.years_live > 0 && (
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wide text-stone-500 font-bold">Live</div>
              <div className="text-sm font-semibold text-stone-300">{listing.years_live} yr{listing.years_live !== 1 ? "s" : ""}</div>
            </div>
          )}
        </div>
        <Link
          to="/acquire"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm group-hover:filter group-hover:brightness-110 transition"
        >
          Inquire <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}