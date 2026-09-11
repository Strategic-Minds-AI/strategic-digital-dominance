import React from "react";
import { Code2, Link2, Brain } from "lucide-react";
import ModuleShell, { Toggle, Slider } from "./ModuleShell";

// Content & technical modules: Technical SEO, Backlinks, AEO
export default function ContentModules({ modules, onChange }) {
  const { technical = {}, backlinks = {}, aeo = {} } = modules;

  const updateTech = (patch) => onChange({ ...modules, technical: { ...technical, ...patch } });
  const updateBl = (patch) => onChange({ ...modules, backlinks: { ...backlinks, ...patch } });
  const updateAeo = (patch) => onChange({ ...modules, aeo: { ...aeo, ...patch } });

  const techScore = (technical.https !== false ? 12 : 0) + (technical.mobile_friendly ? 15 : 0) + Math.round((Number(technical.page_speed_score) || 0) / 100 * 20) + (technical.has_sitemap ? 10 : 0) + (technical.has_robots ? 8 : 0) + (technical.has_schema ? 15 : 0) + (technical.core_web_vitals ? 20 : 0);
  const blScore = (Number(backlinks.referring_domains) >= 100 ? 35 : Number(backlinks.referring_domains) >= 50 ? 28 : Number(backlinks.referring_domains) >= 20 ? 20 : Number(backlinks.referring_domains) >= 10 ? 12 : Number(backlinks.referring_domains) >= 5 ? 7 : Number(backlinks.referring_domains) >= 1 ? 3 : 0) + Math.round((Number(backlinks.domain_authority) || 0) / 100 * 30) + Math.round((Number(backlinks.anchor_diversity) || 0) / 100 * 20) + (Number(backlinks.link_velocity) >= 10 ? 15 : Number(backlinks.link_velocity) >= 5 ? 10 : Number(backlinks.link_velocity) >= 1 ? 5 : 0);
  const aeoScore = (aeo.has_faq_schema ? 18 : 0) + (aeo.has_qa_content ? 16 : 0) + (aeo.has_product_schema ? 12 : 0) + (aeo.has_review_schema ? 12 : 0) + (aeo.has_localbusiness_schema ? 12 : 0) + (aeo.concise_answers ? 15 : 0) + Math.min(Number(aeo.entity_mentions) * 2, 15);

  return (
    <div className="space-y-3">
      <ModuleShell title="Technical SEO" icon={Code2} score={techScore} maxScore={100} impact={Math.round(techScore * 0.18 * 10) / 10}>
        <div className="grid md:grid-cols-2 gap-x-6">
          <Toggle label="HTTPS enabled" checked={technical.https !== false} onChange={(v) => updateTech({ https: v })} hint="SSL certificate active" />
          <Toggle label="Mobile-friendly" checked={!!technical.mobile_friendly} onChange={(v) => updateTech({ mobile_friendly: v })} hint="Responsive design" />
          <Toggle label="XML sitemap" checked={!!technical.has_sitemap} onChange={(v) => updateTech({ has_sitemap: v })} hint="Sitemap submitted to GSC" />
          <Toggle label="robots.txt" checked={!!technical.has_robots} onChange={(v) => updateTech({ has_robots: v })} hint="Crawl directives" />
          <Toggle label="Schema markup" checked={!!technical.has_schema} onChange={(v) => updateTech({ has_schema: v })} hint="Structured data present" />
          <Toggle label="Core Web Vitals pass" checked={!!technical.core_web_vitals} onChange={(v) => updateTech({ core_web_vitals: v })} hint="LCP, FID, CLS thresholds met" />
          <Slider label="Page speed score" value={Number(technical.page_speed_score) || 0} onChange={(v) => updateTech({ page_speed_score: v })} min={0} max={100} suffix="/100" />
        </div>
      </ModuleShell>

      <ModuleShell title="Backlinks & Domain Authority" icon={Link2} score={blScore} maxScore={100} impact={Math.round(blScore * 0.28 * 10) / 10}>
        <div className="grid md:grid-cols-2 gap-x-6">
          <Slider label="Referring domains" value={Number(backlinks.referring_domains) || 0} onChange={(v) => updateBl({ referring_domains: v })} min={0} max={500} suffix=" domains" />
          <Slider label="Domain authority" value={Number(backlinks.domain_authority) || 0} onChange={(v) => updateBl({ domain_authority: v })} min={0} max={100} suffix="/100" />
          <Slider label="Anchor text diversity" value={Number(backlinks.anchor_diversity) || 0} onChange={(v) => updateBl({ anchor_diversity: v })} min={0} max={100} suffix="%" />
          <Slider label="Link velocity (new/mo)" value={Number(backlinks.link_velocity) || 0} onChange={(v) => updateBl({ link_velocity: v })} min={0} max={50} suffix="/mo" />
        </div>
      </ModuleShell>

      <ModuleShell title="AEO — Answer Engine Optimization" icon={Brain} score={aeoScore} maxScore={100} impact={Math.round(aeoScore * 0.05 * 10) / 10}>
        <div className="grid md:grid-cols-2 gap-x-6">
          <Toggle label="FAQ schema" checked={!!aeo.has_faq_schema} onChange={(v) => updateAeo({ has_faq_schema: v })} hint="Structured FAQ markup" />
          <Toggle label="Q&A content format" checked={!!aeo.has_qa_content} onChange={(v) => updateAeo({ has_qa_content: v })} hint="Question-answer sections" />
          <Toggle label="Product schema" checked={!!aeo.has_product_schema} onChange={(v) => updateAeo({ has_product_schema: v })} hint="Product structured data" />
          <Toggle label="Review schema" checked={!!aeo.has_review_schema} onChange={(v) => updateAeo({ has_review_schema: v })} hint="Review structured data" />
          <Toggle label="LocalBusiness schema" checked={!!aeo.has_localbusiness_schema} onChange={(v) => updateAeo({ has_localbusiness_schema: v })} hint="Local business structured data" />
          <Toggle label="Concise answer format" checked={!!aeo.concise_answers} onChange={(v) => updateAeo({ concise_answers: v })} hint="Snippet-ready 40-60 word answers" />
          <Slider label="Entity mentions" value={Number(aeo.entity_mentions) || 0} onChange={(v) => updateAeo({ entity_mentions: v })} min={0} max={20} suffix=" mentions" />
        </div>
      </ModuleShell>
    </div>
  );
}