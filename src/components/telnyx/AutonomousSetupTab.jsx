import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Zap, RefreshCw, CheckCircle2, AlertCircle, Loader2,
  ShieldCheck, Phone, Layers, Building2, Megaphone, Send,
  ArrowRight, ChevronRight,
} from "lucide-react";

export default function AutonomousSetupTab() {
  const [audit, setAudit] = useState(null);
  const [setupResult, setSetupResult] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [testTo, setTestTo] = useState("+17722090266");

  const runAudit = async () => {
    setLoading("audit");
    setError(null);
    setAudit(null);
    try {
      const res = await base44.functions.invoke("telnyxAutonomousSetup", { action: "runAudit" });
      setAudit(res.data.result);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const runFullSetup = async () => {
    setLoading("setup");
    setError(null);
    setSetupResult(null);
    try {
      const res = await base44.functions.invoke("telnyxAutonomousSetup", {
        action: "runFullSetup",
        sendTestSms: true,
        testTo,
      });
      setSetupResult(res.data.result);
      // Refresh audit after setup
      const auditRes = await base44.functions.invoke("telnyxAutonomousSetup", { action: "runAudit" });
      setAudit(auditRes.data.result);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const inputCls = "w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none";

  return (
    <div className="space-y-5">
      {/* Hero banner */}
      <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500 grid place-items-center shrink-0">
            <Zap className="h-6 w-6 text-stone-950" />
          </div>
          <div>
            <h3 className="font-bold text-stone-900">Autonomous Telnyx Setup</h3>
            <p className="text-sm text-stone-600 mt-0.5">
              One-click deterministic system that audits your Telnyx account, identifies all compliance gaps,
              and executes the exact steps needed to make SMS fully productional — messaging profiles, 10DLC campaigns,
              toll-free verification, and number assignment.
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={runAudit}
          disabled={loading !== null}
          className="h-11 px-5 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm font-bold disabled:opacity-50 flex items-center gap-2 hover:border-amber-400 hover:text-amber-600"
        >
          {loading === "audit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Run Audit
        </button>
        <button
          onClick={runFullSetup}
          disabled={loading !== null}
          className="h-11 px-5 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold disabled:opacity-50 flex items-center gap-2 hover:bg-amber-400"
        >
          {loading === "setup" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          Run Full Autonomous Setup
        </button>
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="tel"
            placeholder="Test SMS recipient"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            className="h-11 w-48 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none"
          />
          <span className="text-xs text-stone-400">← gets a test text after setup</span>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Audit results */}
      {audit && (
        <div className="space-y-4">
          <h3 className="font-bold text-stone-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-500" /> Account Audit
          </h3>

          {/* Gap summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <GapCard icon={Phone} label="Numbers" value={audit.numbers.length} ok={audit.numbers.length > 0} />
            <GapCard icon={Layers} label="Profiles" value={audit.profiles.length} ok={audit.profiles.length > 0} />
            <GapCard icon={Building2} label="Verified Brands" value={audit.verifiedBrands.length} ok={audit.verifiedBrands.length > 0} />
            <GapCard icon={Megaphone} label="Campaigns" value={audit.campaigns.length} ok={audit.campaigns.length > 0} />
          </div>

          {/* Gaps detail */}
          <div className="rounded-xl border border-stone-200 p-4">
            <h4 className="text-sm font-bold text-stone-700 mb-3">Compliance Gaps</h4>
            <div className="space-y-2 text-sm">
              <GapRow label="Numbers without messaging profile" value={audit.gaps.numbersWithoutProfile.length} items={audit.gaps.numbersWithoutProfile} />
              <GapRow label="10DLC campaign exists" value={audit.gaps.hasCampaign ? "Yes" : "No"} ok={audit.gaps.hasCampaign} />
              <GapRow label="Toll-free verification" value={audit.gaps.tollfreeVerificationStatus} ok={audit.gaps.tollfreeVerificationStatus === "approved" || audit.gaps.tollfreeVerificationStatus === "verified"} />
              <GapRow label="Local numbers needing campaign" value={audit.gaps.localCount} ok={audit.gaps.hasCampaign} />
              <GapRow label="Toll-free numbers needing verification" value={audit.gaps.tollfreeCount} ok={audit.gaps.tollfreeVerificationStatus === "approved" || audit.gaps.tollfreeVerificationStatus === "verified"} />
            </div>
          </div>

          {/* Numbers detail */}
          <div className="rounded-xl border border-stone-200 p-4">
            <h4 className="text-sm font-bold text-stone-700 mb-3">Phone Numbers ({audit.numbers.length})</h4>
            <div className="space-y-2">
              {audit.numbers.map((n) => (
                <div key={n.id} className="flex items-center gap-3 p-2 rounded-lg bg-stone-50">
                  <div className={"h-2 w-2 rounded-full " + (n.messaging_profile_id ? "bg-green-500" : "bg-red-500")} />
                  <span className="font-mono text-sm font-bold text-stone-900">{n.phone}</span>
                  <span className={"text-[10px] font-bold px-2 py-0.5 rounded " + (n.type === "toll_free" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                    {n.type === "toll_free" ? "TOLL-FREE" : "LOCAL"}
                  </span>
                  {n.messaging_profile_id ? (
                    <span className="text-xs text-green-600 font-semibold">✓ {n.messaging_profile_name || "Profile"}</span>
                  ) : (
                    <span className="text-xs text-red-600 font-semibold">⚠ No profile</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Brands detail */}
          {audit.brands.length > 0 && (
            <div className="rounded-xl border border-stone-200 p-4">
              <h4 className="text-sm font-bold text-stone-700 mb-3">10DLC Brands ({audit.brands.length})</h4>
              <div className="space-y-2">
                {audit.brands.map((b) => (
                  <div key={b.brandId} className="flex items-center gap-3 p-2 rounded-lg bg-stone-50">
                    <div className={"h-2 w-2 rounded-full " + (b.identityStatus === "VERIFIED" ? "bg-green-500" : "bg-amber-500")} />
                    <span className="text-sm font-bold text-stone-900">{b.companyName}</span>
                    <span className={"text-[10px] font-bold px-2 py-0.5 rounded " + (b.identityStatus === "VERIFIED" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                      {b.identityStatus}
                    </span>
                    <span className="text-xs text-stone-400">{b.assignedCampaignsCount} campaigns</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toll-free verifications */}
          {audit.tollfreeVerifications.length > 0 && (
            <div className="rounded-xl border border-stone-200 p-4">
              <h4 className="text-sm font-bold text-stone-700 mb-3">Toll-Free Verifications ({audit.tollfreeVerifications.length})</h4>
              <div className="space-y-2">
                {audit.tollfreeVerifications.map((v) => (
                  <div key={v.id} className="p-3 rounded-lg bg-stone-50">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-stone-900">{v.businessName}</span>
                      <span className={"text-[10px] font-bold px-2 py-0.5 rounded " + (
                        v.verificationStatus === "approved" || v.verificationStatus === "verified" ? "bg-green-100 text-green-700" :
                        v.verificationStatus === "rejected" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      )}>
                        {v.verificationStatus}
                      </span>
                    </div>
                    <div className="text-xs text-stone-500">Numbers: {v.phoneNumbers.join(", ")}</div>
                    {v.reason && <div className="text-xs text-red-600 mt-1">⚠ {v.reason}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Setup results */}
      {setupResult && (
        <div className="space-y-4">
          <h3 className="font-bold text-stone-900 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" /> Setup Results
          </h3>

          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
              <div className="text-3xl font-extrabold text-green-700">{setupResult.summary.succeeded}</div>
              <div className="text-xs font-semibold text-green-600 uppercase">Succeeded</div>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
              <div className="text-3xl font-extrabold text-red-700">{setupResult.summary.failed}</div>
              <div className="text-xs font-semibold text-red-600 uppercase">Failed</div>
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center">
              <div className="text-3xl font-extrabold text-stone-600">{setupResult.summary.skipped}</div>
              <div className="text-xs font-semibold text-stone-500 uppercase">Skipped</div>
            </div>
          </div>

          {/* Steps */}
          <div className="rounded-xl border border-stone-200 p-4">
            <h4 className="text-sm font-bold text-stone-700 mb-3">Execution Steps</h4>
            <div className="space-y-2">
              {setupResult.steps.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-stone-50">
                  <div className="shrink-0 mt-0.5">
                    {s.status === "done" ? <CheckCircle2 className="h-4 w-4 text-green-500" /> :
                     s.status === "failed" ? <AlertCircle className="h-4 w-4 text-red-500" /> :
                     <ChevronRight className="h-4 w-4 text-stone-400" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-500 uppercase">{s.step.replace(/_/g, " ")}</div>
                    <div className="text-sm text-stone-800">{s.summary}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test SMS result */}
          {setupResult.test_sms && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Send className="h-4 w-4 text-blue-500" />
                <span className="font-bold text-stone-900">Test SMS Result</span>
                <span className={"text-[10px] font-bold px-2 py-0.5 rounded " + (
                  setupResult.test_sms.status === "queued" || setupResult.test_sms.status === "sent" || setupResult.test_sms.status === "delivered" ?
                  "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                )}>
                  {setupResult.test_sms.status?.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-stone-600">ID: {setupResult.test_sms.message_id}</div>
            </div>
          )}

          {/* Gap comparison */}
          <div className="rounded-xl border border-stone-200 p-4">
            <h4 className="text-sm font-bold text-stone-700 mb-3">Before → After</h4>
            <div className="space-y-2 text-sm">
              <BeforeAfter label="Numbers without profile" before={setupResult.initial_gaps.numbersWithoutProfile.length} after={setupResult.final_gaps.numbersWithoutProfile.length} />
              <BeforeAfter label="Has 10DLC campaign" before={setupResult.initial_gaps.hasCampaign ? "Yes" : "No"} after={setupResult.final_gaps.hasCampaign ? "Yes" : "No"} />
              <BeforeAfter label="Toll-free verification" before={setupResult.initial_gaps.tollfreeVerificationStatus} after={setupResult.final_gaps.tollfreeVerificationStatus} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GapCard({ icon: Icon, label, value, ok }) {
  return (
    <div className={"rounded-xl border p-4 " + (ok ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
      <Icon className={"h-5 w-5 mb-2 " + (ok ? "text-green-600" : "text-red-600")} />
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}

function GapRow({ label, value, items, ok }) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <span className="text-stone-600">{label}</span>
      <div className="flex items-center gap-2">
        {items && items.length > 0 && (
          <span className="text-xs text-red-600 font-mono">{items.join(", ")}</span>
        )}
        <span className={"font-bold " + (ok ? "text-green-600" : "text-red-600")}>{value}</span>
      </div>
    </div>
  );
}

function BeforeAfter({ label, before, after }) {
  const improved = before !== after && (after === "Yes" || after === 0 || after === "approved" || after === "verified");
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-stone-600 flex-1">{label}</span>
      <span className="text-stone-500 font-mono text-xs">{String(before)}</span>
      <ArrowRight className="h-3 w-3 text-stone-400" />
      <span className={"font-bold " + (improved ? "text-green-600" : "text-stone-700")}>{String(after)}</span>
    </div>
  );
}