import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Play, Brain, Mail, CheckCircle2, Target, Zap } from "lucide-react";
import { PSYCHOLOGY_PROFILES } from "@/data/universalNiches";

export default function FunnelCreator({ selectedNiche }) {
  const [keyword, setKeyword] = useState(selectedNiche?.keyword || "epoxy garage floor");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [template, setTemplate] = useState("emergency_service");
  const [psychology, setPsychology] = useState(selectedNiche?.psychology || "PANIC_URGENCY");
  const [loading, setLoading] = useState(false);
  const [funnel, setFunnel] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setError("");
    setFunnel(null);
    try {
      const res = await base44.functions.invoke("domainGoldRush", {
        action: "generateFunnel",
        keyword, city, state,
        template,
        psychologyProfile: psychology,
        niche: selectedNiche?.id,
      });
      setFunnel(res.data?.funnel);
    } catch (e) {
      setError(e.message || "Funnel generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Brain className="h-5 w-5 text-amber-500" />
            Funnel Creator (Psychology-Based)
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            Multi-template funnel creator designed to operate based on human psychology. Each step is engineered to match the emotional driver behind the search.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Keyword</label>
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">City</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Template</label>
            <select value={template} onChange={(e) => setTemplate(e.target.value)} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none bg-white">
              <option value="emergency_service">Emergency Service</option>
              <option value="scheduled_service">Scheduled Service</option>
              <option value="product_purchase">Product Purchase</option>
              <option value="consultation">Consultation Booking</option>
              <option value="quote_request">Quote Request</option>
              <option value="lead_magnet">Lead Magnet</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Psychology</label>
            <select value={psychology} onChange={(e) => setPsychology(e.target.value)} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:border-amber-500 outline-none bg-white">
              {Object.entries(PSYCHOLOGY_PROFILES).map(([key, p]) => (
                <option key={key} value={key}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-700">
            <strong>Psychology Profile:</strong> {PSYCHOLOGY_PROFILES[psychology]?.desc}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            <strong>Emotional Drivers:</strong> {PSYCHOLOGY_PROFILES[psychology]?.factors?.join(", ")}
          </p>
        </div>

        <button onClick={handleGenerate} disabled={loading || !keyword.trim()} className="w-full py-2.5 rounded-lg bg-stone-900 text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-stone-800 disabled:opacity-50">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          {loading ? "Generating psychology-based funnel..." : "Generate Funnel"}
        </button>
        {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
      </div>

      {loading && !funnel && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-sm text-stone-500">Designing funnel based on {PSYCHOLOGY_PROFILES[psychology]?.label} psychology...</p>
        </div>
      )}

      {funnel && (
        <div className="space-y-4">
          {/* Expected conversion rate */}
          {funnel.expected_conversion_rate && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-5 text-center">
              <Target className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <div className="text-3xl font-black text-emerald-600">{funnel.expected_conversion_rate}%</div>
              <div className="text-sm text-emerald-700 mt-1">Expected Conversion Rate</div>
            </div>
          )}

          {/* Landing Page */}
          {funnel.landing_page && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-amber-500" /> Step 1: Landing Page
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase">Headline</p>
                  <p className="text-lg font-bold text-stone-900">{funnel.landing_page.headline}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase">Sub-headline</p>
                  <p className="text-sm text-stone-700">{funnel.landing_page.subheadline}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase">Hero CTA</p>
                  <p className="text-sm text-amber-600 font-semibold">{funnel.landing_page.hero_cta}</p>
                </div>
                {funnel.landing_page.trust_signals?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase mb-1">Trust Signals</p>
                    <ul className="text-sm text-stone-600 list-disc list-inside space-y-0.5">
                      {funnel.landing_page.trust_signals.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                )}
                {funnel.landing_page.urgency_elements?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-red-500 uppercase mb-1">Urgency Elements</p>
                    <div className="flex flex-wrap gap-2">
                      {funnel.landing_page.urgency_elements.map((u, i) => (
                        <span key={i} className="px-2 py-1 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">{u}</span>
                      ))}
                    </div>
                  </div>
                )}
                {funnel.landing_page.social_proof?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase mb-1">Social Proof</p>
                    <ul className="text-sm text-stone-600 list-disc list-inside space-y-0.5">
                      {funnel.landing_page.social_proof.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {funnel.landing_page.faq_objections?.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-stone-500 uppercase mb-1">FAQ / Objection Handling</p>
                    <ul className="text-sm text-stone-600 list-disc list-inside space-y-0.5">
                      {funnel.landing_page.faq_objections.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase">Final CTA</p>
                  <p className="text-sm text-amber-600 font-bold">{funnel.landing_page.final_cta}</p>
                </div>
              </div>
            </div>
          )}

          {/* Lead Capture */}
          {funnel.lead_capture && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-amber-500" /> Step 2: Lead Capture
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase mb-1">Form Fields (minimal friction)</p>
                  <div className="flex flex-wrap gap-2">
                    {funnel.lead_capture.fields?.map((f, i) => (
                      <span key={i} className="px-2 py-1 rounded-lg bg-stone-100 text-xs text-stone-700">{f}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase">Submit Button</p>
                  <p className="text-sm text-amber-600 font-semibold">{funnel.lead_capture.submit_button}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-500 uppercase">Trust Microcopy</p>
                  <p className="text-sm text-stone-600 italic">{funnel.lead_capture.trust_microcopy}</p>
                </div>
              </div>
            </div>
          )}

          {/* Thank You */}
          {funnel.thank_you && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Step 3: Thank You Page
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-stone-900">{funnel.thank_you.confirmation}</p>
                {funnel.thank_you.next_steps?.length > 0 && (
                  <ul className="text-sm text-stone-600 list-disc list-inside">
                    {funnel.thank_you.next_steps.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                )}
                {funnel.thank_you.upsell && <p className="text-sm text-amber-600 font-semibold">Upsell: {funnel.thank_you.upsell}</p>}
              </div>
            </div>
          )}

          {/* Follow Up Sequence */}
          {funnel.follow_up?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <Mail className="h-4 w-4 text-amber-500" /> Step 4: Follow-Up Sequence
              </h3>
              <div className="space-y-3">
                {funnel.follow_up.map((f, i) => (
                  <div key={i} className="flex gap-3 pb-3 border-b border-stone-100 last:border-0">
                    <div className="flex-shrink-0 w-20">
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">{f.timing}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-900">{f.step} <span className="text-xs text-stone-400">({f.channel})</span></p>
                      <p className="text-xs text-stone-600 mt-0.5">{f.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Psychology Triggers */}
          {funnel.psychology_triggers?.length > 0 && (
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
              <h3 className="font-bold text-amber-700 flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4" /> Psychology Triggers Used
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {funnel.psychology_triggers.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white">
                    <Brain className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-xs text-stone-700">{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversion Optimization */}
          {funnel.conversion_optimization?.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-amber-500" /> A/B Test Suggestions
              </h3>
              <ul className="space-y-1">
                {funnel.conversion_optimization.map((c, i) => (
                  <li key={i} className="text-sm text-stone-600 flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}