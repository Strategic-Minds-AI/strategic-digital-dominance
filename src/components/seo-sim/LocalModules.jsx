import React from "react";
import { MapPin, Star, Building2 } from "lucide-react";
import ModuleShell, { Toggle, Slider } from "./ModuleShell";

// Local SEO modules: Google Business Profile, Reviews, Citations (Bing, Yelp, BBB, Apple Maps)
export default function LocalModules({ modules, onChange }) {
  const { google_business = {}, reviews = {}, citations = {} } = modules;

  const updateGb = (patch) => onChange({ ...modules, google_business: { ...google_business, ...patch } });
  const updateRev = (patch) => onChange({ ...modules, reviews: { ...reviews, ...patch } });
  const updateCit = (patch) => onChange({ ...modules, citations: { ...citations, ...patch } });

  // Quick scores for impact display
  const gbScore = (google_business.profile_complete ? 12 : 0) + (Number(google_business.photos_count) >= 10 ? 8 : Number(google_business.photos_count) >= 3 ? 4 : 0) + (Number(google_business.posts_count) >= 5 ? 6 : Number(google_business.posts_count) >= 1 ? 3 : 0) + (google_business.has_qa ? 4 : 0) + (google_business.has_services ? 5 : 0);
  const revScore = (Number(reviews.review_count) >= 50 ? 12 : Number(reviews.review_count) >= 20 ? 8 : Number(reviews.review_count) >= 10 ? 5 : Number(reviews.review_count) >= 1 ? 2 : 0) + (Number(reviews.avg_rating) >= 4.5 ? 8 : Number(reviews.avg_rating) >= 4 ? 5 : 0) + Math.round((Number(reviews.response_rate) || 0) / 100 * 8) + (Number(reviews.recent_reviews) >= 5 ? 7 : Number(reviews.recent_reviews) >= 1 ? 3 : 0);
  const citScore = (citations.bing_listed ? 6 : 0) + (citations.yelp_listed ? 6 : 0) + (citations.bbb_member ? 5 : 0) + (citations.apple_maps ? 5 : 0) + (citations.nap_consistent ? 8 : 0);

  return (
    <div className="space-y-3">
      <ModuleShell title="Google Business Profile" icon={MapPin} score={gbScore} maxScore={35} impact={Math.round(gbScore * 0.17 * 10) / 10}>
        <div className="grid md:grid-cols-2 gap-x-6">
          <Toggle label="Profile 100% complete" checked={!!google_business.profile_complete} onChange={(v) => updateGb({ profile_complete: v })} hint="All sections filled: hours, services, description, attributes" />
          <Toggle label="Services list published" checked={!!google_business.has_services} onChange={(v) => updateGb({ has_services: v })} hint="Service catalog visible on GBP" />
          <Toggle label="Q&A section active" checked={!!google_business.has_qa} onChange={(v) => updateGb({ has_qa: v })} hint="Customer questions answered" />
          <Slider label="Photos uploaded" value={Number(google_business.photos_count) || 0} onChange={(v) => updateGb({ photos_count: v })} min={0} max={50} suffix=" photos" />
          <Slider label="GBP posts published" value={Number(google_business.posts_count) || 0} onChange={(v) => updateGb({ posts_count: v })} min={0} max={30} suffix=" posts" />
        </div>
      </ModuleShell>

      <ModuleShell title="Reviews & Reputation" icon={Star} score={revScore} maxScore={35} impact={Math.round(revScore * 0.17 * 10) / 10}>
        <div className="grid md:grid-cols-2 gap-x-6">
          <Slider label="Total review count" value={Number(reviews.review_count) || 0} onChange={(v) => updateRev({ review_count: v })} min={0} max={200} suffix=" reviews" />
          <Slider label="Average rating" value={Number(reviews.avg_rating) || 0} onChange={(v) => updateRev({ avg_rating: v })} min={0} max={5} step={0.1} suffix=" ★" />
          <Slider label="Owner response rate" value={Number(reviews.response_rate) || 0} onChange={(v) => updateRev({ response_rate: v })} min={0} max={100} suffix="%" />
          <Slider label="Reviews in last 30 days" value={Number(reviews.recent_reviews) || 0} onChange={(v) => updateRev({ recent_reviews: v })} min={0} max={50} suffix=" recent" />
        </div>
      </ModuleShell>

      <ModuleShell title="Citations & Directory Listings" icon={Building2} score={citScore} maxScore={30} impact={Math.round(citScore * 0.17 * 10) / 10}>
        <div className="grid md:grid-cols-2 gap-x-6">
          <Toggle label="Bing Places listing" checked={!!citations.bing_listed} onChange={(v) => updateCit({ bing_listed: v })} hint="Business listed on Bing Places" />
          <Toggle label="Yelp business page" checked={!!citations.yelp_listed} onChange={(v) => updateCit({ yelp_listed: v })} hint="Claimed Yelp listing" />
          <Toggle label="BBB accreditation" checked={!!citations.bbb_member} onChange={(v) => updateCit({ bbb_member: v })} hint="Better Business Bureau member" />
          <Toggle label="Apple Maps listing" checked={!!citations.apple_maps} onChange={(v) => updateCit({ apple_maps: v })} hint="Listed on Apple Maps" />
          <Toggle label="NAP consistency (name/address/phone)" checked={!!citations.nap_consistent} onChange={(v) => updateCit({ nap_consistent: v })} hint="Identical across all directories" />
        </div>
      </ModuleShell>
    </div>
  );
}