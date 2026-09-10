import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Sparkles, Calendar, ShoppingBag, Loader2, CheckCircle2 } from "lucide-react";

export default function PortalMaintenance({ project }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project?.id) return;
    (async () => {
      try {
        const plans = await base44.entities.MaintenancePlan.filter(
          { project_id: project.id },
          "-created_date",
          1
        );
        setPlan(plans?.[0] || null);
      } catch {}
      setLoading(false);
    })();
  }, [project?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <Sparkles className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <h3 className="font-semibold text-stone-900 mb-1">Maintenance Plan Coming Soon</h3>
        <p className="text-sm text-stone-500">
          Your personalized floor care guide will be available here after installation is complete.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + download */}
      <div className="rounded-2xl bg-stone-950 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" /> Floor Care Guide
            </h2>
            <p className="text-sm text-stone-400 mt-1">
              {plan.floor_system || project?.floor_system || "Your Floor System"}
            </p>
          </div>
          {plan.pdf_url && (
            <a
              href={plan.pdf_url}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400"
            >
              <Download className="h-4 w-4" /> Download PDF
            </a>
          )}
        </div>
      </div>

      {/* Cleaning instructions */}
      {plan.cleaning_instructions && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h3 className="font-semibold text-stone-900 mb-3">Cleaning Instructions</h3>
          <p className="text-sm text-stone-700 whitespace-pre-line">{plan.cleaning_instructions}</p>
        </div>
      )}

      {/* Seasonal reminders */}
      {plan.seasonal_reminders?.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" /> Seasonal Care Reminders
          </h3>
          <div className="space-y-3">
            {plan.seasonal_reminders.map((r, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg bg-stone-50 p-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 text-amber-700 font-bold text-xs">
                  {r.month?.slice(0, 3) || r.season?.slice(0, 3)}
                </div>
                <div>
                  <div className="font-semibold text-stone-900 text-sm">{r.season || r.month}</div>
                  <div className="text-sm text-stone-600">{r.task}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended products */}
      {plan.recommended_products?.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-amber-500" /> Recommended Products
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {plan.recommended_products.map((p, i) => (
              <div key={i} className="rounded-lg border border-stone-200 p-4">
                <div className="font-semibold text-stone-900">{p.name}</div>
                <div className="text-sm text-stone-500 mt-1">{p.purpose}</div>
                <div className="text-xs text-amber-600 font-semibold mt-2">Frequency: {p.frequency}</div>
                <a
                  href={`https://xtremepolishingsystems.com/search?q=${encodeURIComponent(p.name || "")}`}
                  target="_blank"
                  rel="noopener"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
                >
                  <ShoppingBag className="h-3.5 w-3.5" /> Buy on XPS →
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warranty terms */}
      {plan.warranty_terms && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <h3 className="font-semibold text-stone-900 mb-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-amber-500" /> Warranty Terms
          </h3>
          <p className="text-sm text-stone-700 whitespace-pre-line">{plan.warranty_terms}</p>
        </div>
      )}
    </div>
  );
}