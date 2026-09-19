import React from "react";
import { TOP_20_INDUSTRIES, ACCENT_PRESETS } from "@/data/topIndustries";
import { Check, ArrowRight, Zap } from "lucide-react";

export default function IndustryPicker({ config, update, onNext }) {
  const selected = config.industry;

  const handleSelect = (industry) => {
    update({
      industry,
      businessName: config.businessName || "",
      accentColor: industry.accentColor,
      accentName: industry.accentName,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-stone-900">Step 1 — Pick Your Industry</h2>
        <p className="text-sm text-stone-500 mt-1">
          Each template uses the existing website structure, adapted for the industry's emergency level,
          psychology, and service categories. Top 20 by search volume and order value.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {TOP_20_INDUSTRIES.map((industry) => {
          const isSelected = selected?.id === industry.id;
          const accent = ACCENT_PRESETS.find((a) => a.value === industry.accentColor);
          return (
            <button
              key={industry.id}
              onClick={() => handleSelect(industry)}
              className={`relative text-left rounded-xl border-2 p-4 transition-all ${
                isSelected
                  ? "border-amber-500 bg-amber-50 shadow-md"
                  : "border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm"
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                  <Check className="h-4 w-4 text-stone-950" />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                  style={{ backgroundColor: industry.accentColor }}
                >
                  {industry.label.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-stone-900">{industry.label}</div>
                  <div className="text-[10px] text-stone-500">{industry.keyword}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    industry.emergency === "CRITICAL"
                      ? "bg-red-100 text-red-700"
                      : industry.emergency === "HIGH"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {industry.emergency}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-600">
                  ${industry.avgOrder.toLocaleString()} avg
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                  {industry.searchVolume} volume
                </span>
              </div>
              <p className="text-xs text-stone-500 line-clamp-2">{industry.heroHeadline}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {industry.services.slice(0, 3).map((s) => (
                  <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500">
                    {s}
                  </span>
                ))}
                {industry.services.length > 3 && (
                  <span className="text-[10px] text-stone-400">+{industry.services.length - 3} more</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
          <h3 className="font-bold text-stone-900 flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" /> Business Name
          </h3>
          <input
            value={config.businessName}
            onChange={(e) => update({ businessName: e.target.value })}
            placeholder={`e.g. ${selected.label.split(" ")[0]} Pro ${config.city || "Your City"}`}
            className="w-full px-4 py-3 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500">
              This will be used for your domain, logo, and all generated content.
            </p>
            <button
              onClick={onNext}
              disabled={!config.businessName.trim()}
              className="px-6 py-2.5 rounded-lg bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-50 flex items-center gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}