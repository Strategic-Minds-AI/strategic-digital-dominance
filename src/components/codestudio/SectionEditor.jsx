import React from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";

const SECTION_TYPES = [
  { type: "hero", label: "Hero Banner", fields: [
    { key: "title", label: "Title", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "text" },
    { key: "bg_image", label: "Background Image URL", type: "text" },
    { key: "cta_text", label: "Button Text", type: "text" },
    { key: "cta_link", label: "Button Link", type: "text" },
  ]},
  { type: "text", label: "Text Block", fields: [
    { key: "heading", label: "Heading", type: "text" },
    { key: "body", label: "Body (Markdown)", type: "textarea" },
    { key: "image_url", label: "Image URL", type: "text" },
    { key: "image_position", label: "Image Position", type: "select", options: ["none", "left", "right"] },
  ]},
  { type: "gallery", label: "Image Gallery", fields: [
    { key: "title", label: "Section Title", type: "text" },
    { key: "images", label: "Images (JSON array: [{url, caption}])", type: "json" },
  ]},
  { type: "cta", label: "Call to Action", fields: [
    { key: "title", label: "Title", type: "text" },
    { key: "subtitle", label: "Subtitle", type: "text" },
    { key: "button_text", label: "Button Text", type: "text" },
    { key: "button_link", label: "Button Link", type: "text" },
  ]},
  { type: "faq", label: "FAQ Section", fields: [
    { key: "title", label: "Section Title", type: "text" },
    { key: "items", label: "FAQ Items (JSON: [{question, answer}])", type: "json" },
  ]},
  { type: "testimonials", label: "Testimonials", fields: [
    { key: "title", label: "Section Title", type: "text" },
    { key: "items", label: "Testimonials (JSON: [{name, quote, rating, location}])", type: "json" },
  ]},
  { type: "html", label: "Custom HTML", fields: [
    { key: "content", label: "HTML Content", type: "textarea" },
  ]},
  { type: "form", label: "Contact Form", fields: [
    { key: "title", label: "Form Title", type: "text" },
    { key: "fields", label: "Fields (JSON: [{name, label, type, required}])", type: "json" },
  ]},
  { type: "spacer", label: "Spacer", fields: [
    { key: "height", label: "Height (px)", type: "number" },
  ]},
];

const inputCls = "w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none font-mono";

export default function SectionEditor({ section, onChange, onRemove, onMove, canUp, canDown }) {
  const def = SECTION_TYPES.find((s) => s.type === section.type);
  if (!def) return null;

  const setProp = (key, val) => onChange({ ...section, props: { ...section.props, [key]: val } });

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wide text-amber-600 bg-amber-50 px-2 py-1 rounded">{def.label}</span>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => onMove(-1)} disabled={!canUp} className="p-1 rounded hover:bg-stone-100 disabled:opacity-30"><ChevronUp className="h-4 w-4 text-stone-500" /></button>
          <button onClick={() => onMove(1)} disabled={!canDown} className="p-1 rounded hover:bg-stone-100 disabled:opacity-30"><ChevronDown className="h-4 w-4 text-stone-500" /></button>
          <button onClick={onRemove} className="p-1 rounded hover:bg-red-50"><Trash2 className="h-4 w-4 text-red-500" /></button>
        </div>
      </div>
      <div className="space-y-3">
        {def.fields.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-bold text-stone-500 block mb-1">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea value={section.props?.[f.key] || ""} onChange={(e) => setProp(f.key, e.target.value)} rows={6} className={inputCls} />
            ) : f.type === "select" ? (
              <select value={section.props?.[f.key] || ""} onChange={(e) => setProp(f.key, e.target.value)} className={inputCls}>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : f.type === "json" ? (
              <textarea value={typeof section.props?.[f.key] === "string" ? section.props[f.key] : JSON.stringify(section.props?.[f.key] || [], null, 2)} onChange={(e) => setProp(f.key, e.target.value)} rows={6} className={inputCls} />
            ) : (
              <input type={f.type || "text"} value={section.props?.[f.key] || ""} onChange={(e) => setProp(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)} className={inputCls} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export { SECTION_TYPES };