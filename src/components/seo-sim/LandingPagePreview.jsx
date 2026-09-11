import React, { useState } from "react";
import { Edit3, Eye, ExternalLink, Menu } from "lucide-react";

// Editable landing page preview — shows a live "webpage" with nav header,
// editable title/header/subheader/body, and a toggle to switch between edit and preview mode.
export default function LandingPagePreview({ content, onChange, onScoreRefresh }) {
  const [mode, setMode] = useState("edit"); // "edit" | "preview"

  const update = (field, value) => {
    onChange({ ...content, [field]: value });
  };

  const navItems = content.nav_items || ["Home", "Services", "Gallery", "Reviews", "About", "Contact"];

  return (
    <div className="bg-stone-900 rounded-2xl border border-stone-800 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-stone-950 border-b border-stone-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <span className="text-xs text-stone-500 ml-2 font-mono">landing-page-preview</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setMode("edit")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${mode === "edit" ? "bg-amber-500 text-stone-950" : "text-stone-400 hover:text-white"}`}
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={() => setMode("preview")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${mode === "preview" ? "bg-amber-500 text-stone-950" : "text-stone-400 hover:text-white"}`}
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </button>
        </div>
      </div>

      {/* Webpage preview */}
      <div className="bg-white text-stone-900 min-h-[400px]">
        {/* Nav header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-xs">
              EG
            </div>
            {mode === "edit" ? (
              <input
                value={content.brand_name || "Epoxy Garage Floors"}
                onChange={(e) => update("brand_name", e.target.value)}
                className="font-bold text-sm bg-transparent border-b border-dashed border-stone-300 focus:border-amber-500 outline-none px-1"
              />
            ) : (
              <span className="font-bold text-sm">{content.brand_name || "Epoxy Garage Floors"}</span>
            )}
          </div>
          <nav className="hidden md:flex gap-4">
            {navItems.map((item, i) => (
              <span key={i} className="text-xs font-medium text-stone-600 hover:text-amber-600 cursor-pointer">{item}</span>
            ))}
          </nav>
          <button className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 text-white">Free Estimate</button>
        </div>

        {/* Hero section */}
        <div className="px-6 py-8 bg-gradient-to-br from-stone-50 to-stone-100">
          {mode === "edit" ? (
            <div className="space-y-3 max-w-2xl">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Page Title (title tag)</label>
                <input
                  value={content.title || ""}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="Epoxy Garage Floors Near Me | Professional Installation"
                  className="w-full text-xl font-bold bg-white border border-stone-300 rounded-lg px-3 py-2 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Meta Description</label>
                <input
                  value={content.meta_description || ""}
                  onChange={(e) => update("meta_description", e.target.value)}
                  placeholder="Get a free estimate for professional epoxy garage floor coating near you..."
                  className="w-full text-sm bg-white border border-stone-300 rounded-lg px-3 py-2 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">H1 Heading</label>
                <input
                  value={content.h1 || ""}
                  onChange={(e) => update("h1", e.target.value)}
                  placeholder="Epoxy Garage Floors Near You"
                  className="w-full text-lg font-bold bg-white border border-stone-300 rounded-lg px-3 py-2 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Sub-header</label>
                <input
                  value={content.subheader || ""}
                  onChange={(e) => update("subheader", e.target.value)}
                  placeholder="Professional installation with a 15-year warranty"
                  className="w-full text-sm bg-white border border-stone-300 rounded-lg px-3 py-2 focus:border-amber-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">City</label>
                  <input
                    value={content.city || ""}
                    onChange={(e) => update("city", e.target.value)}
                    placeholder="Orlando"
                    className="w-full text-sm bg-white border border-stone-300 rounded-lg px-3 py-2 focus:border-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">State</label>
                  <input
                    value={content.state || ""}
                    onChange={(e) => update("state", e.target.value)}
                    placeholder="FL"
                    className="w-full text-sm bg-white border border-stone-300 rounded-lg px-3 py-2 focus:border-amber-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Body Content</label>
                <textarea
                  value={content.body_content || ""}
                  onChange={(e) => update("body_content", e.target.value)}
                  placeholder="Transform your garage with professional epoxy floor coating..."
                  rows={5}
                  className="w-full text-sm bg-white border border-stone-300 rounded-lg px-3 py-2 focus:border-amber-500 outline-none resize-y"
                />
                <p className="text-[10px] text-stone-400 mt-1">{(content.body_content || "").split(/\s+/).filter(Boolean).length} words</p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl">
              <h1 className="text-3xl font-black text-stone-900">{content.h1 || "Epoxy Garage Floors Near You"}</h1>
              <p className="text-lg text-stone-600 mt-2">{content.subheader || "Professional installation with a 15-year warranty"}</p>
              <p className="text-sm text-stone-600 mt-4 leading-relaxed">{content.body_content || "Transform your garage with professional epoxy floor coating..."}</p>
              <div className="flex gap-3 mt-5">
                <button className="px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold text-sm">Get Free Estimate</button>
                <button className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm">View Gallery</button>
              </div>
            </div>
          )}
        </div>

        {/* Preview link bar */}
        <div className="px-6 py-2 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
          <span className="text-[10px] text-stone-400 font-mono">
            {content.city && content.state ? `${content.city}, ${content.state}` : "National"} — {navItems.length} nav items
          </span>
          <button
            onClick={() => setMode(mode === "edit" ? "preview" : "edit")}
            className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 hover:underline"
          >
            {mode === "edit" ? "View as visitor" : "Edit content"} <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}