import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Radar, Loader2, Users, Phone, Mail, Target, TrendingUp, RefreshCw, Search, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SkipTraceSystem() {
  const queryClient = useQueryClient();
  const [batchRunning, setBatchRunning] = useState(false);
  const [batchResult, setBatchResult] = useState(null);
  const [singleAddress, setSingleAddress] = useState("");
  const [singleRunning, setSingleRunning] = useState(false);
  const [singleResult, setSingleResult] = useState(null);
  const [error, setError] = useState("");

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["skiptrace-stats"],
    queryFn: () => base44.functions.invoke("skipTrace", { action: "stats" }),
    refetchInterval: 30000,
  });

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ["skiptrace-list"],
    queryFn: () => base44.functions.invoke("skipTrace", { action: "list", limit: 50 }),
  });

  const stats = statsData?.data || {};
  const traces = listData?.data?.traces || [];

  const runBatch = async () => {
    setBatchRunning(true);
    setError("");
    setBatchResult(null);
    try {
      const res = await base44.functions.invoke("skipTrace", { action: "batch", limit: 25 });
      setBatchResult(res.data || res);
      queryClient.invalidateQueries(["skiptrace-stats"]);
      queryClient.invalidateQueries(["skiptrace-list"]);
    } catch (e) {
      setError(e.message || "Batch failed");
    }
    setBatchRunning(false);
  };

  const runSingle = async () => {
    if (!singleAddress.trim()) return;
    setSingleRunning(true);
    setError("");
    setSingleResult(null);
    try {
      const res = await base44.functions.invoke("skipTrace", { action: "trace", address: singleAddress });
      setSingleResult(res.data || res);
      queryClient.invalidateQueries(["skiptrace-stats"]);
      queryClient.invalidateQueries(["skiptrace-list"]);
    } catch (e) {
      setError(e.message || "Trace failed");
    }
    setSingleRunning(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Radar className="h-6 w-6 text-amber-600" /> Skip Trace System
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          Ultra-advanced multi-source skip tracing. Cross-references RentCast property records with AI web search to find owner names, phone numbers, and email addresses from property addresses. Runs autonomously every 4 hours.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatCard icon={Radar} label="Total Traces" value={stats.total_traces || 0} color="text-blue-600" />
        <StatCard icon={CheckCircle2} label="Traced" value={stats.traced || 0} color="text-green-600" />
        <StatCard icon={AlertCircle} label="Not Found" value={stats.not_found || 0} color="text-red-600" />
        <StatCard icon={Phone} label="With Phone" value={stats.with_phone || 0} color="text-amber-600" />
        <StatCard icon={Mail} label="With Email" value={stats.with_email || 0} color="text-purple-600" />
        <StatCard icon={Target} label="High Confidence" value={stats.high_confidence || 0} color="text-emerald-600" />
      </div>

      {/* Leads needing trace */}
      {(stats.leads_needing_trace || 0) > 0 && (
        <div className="rounded-xl border bg-amber-50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="font-semibold text-sm">{stats.leads_needing_trace} leads need skip tracing</div>
              <div className="text-xs text-stone-500">These leads have addresses but no phone or email on file</div>
            </div>
          </div>
          <Button onClick={runBatch} disabled={batchRunning}>
            {batchRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            {batchRunning ? "Tracing..." : "Run Batch Now"}
          </Button>
        </div>
      )}

      {/* Autonomous schedule banner */}
      <div className="rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 p-4 flex items-center gap-3">
        <Clock className="h-5 w-5 text-blue-600" />
        <div className="text-sm">
          <span className="font-semibold">Autonomous batch:</span> Runs every 4 hours automatically. Next run at the next 4-hour mark (00:00, 04:00, 08:00, 12:00, 16:00, 20:00 ET).
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Single trace */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold mb-3">Single Address Trace</h2>
        <div className="flex gap-2">
          <Input
            placeholder="123 Main St, Pompano Beach, FL 33060"
            value={singleAddress}
            onChange={(e) => setSingleAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSingle()}
          />
          <Button onClick={runSingle} disabled={singleRunning || !singleAddress.trim()}>
            {singleRunning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
            {singleRunning ? "Tracing..." : "Trace"}
          </Button>
        </div>
        {singleResult && (
          <div className="mt-4 p-4 rounded-lg bg-stone-50 border">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                singleResult.status === "traced" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {singleResult.status?.toUpperCase()}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                singleResult.confidence === "high" ? "bg-emerald-100 text-emerald-700" :
                singleResult.confidence === "medium" ? "bg-amber-100 text-amber-700" :
                "bg-stone-100 text-stone-600"
              }`}>
                {singleResult.confidence?.toUpperCase()} CONFIDENCE
              </span>
              {singleResult.cached && <span className="text-xs text-stone-400">(cached)</span>}
            </div>
            {singleResult.owner_name && (
              <div className="mb-2"><span className="text-xs text-stone-500 font-semibold">OWNER:</span> <span className="text-sm font-medium">{singleResult.owner_name}</span></div>
            )}
            {singleResult.owner_mailing_address && (
              <div className="mb-2"><span className="text-xs text-stone-500 font-semibold">MAILING:</span> <span className="text-sm">{singleResult.owner_mailing_address}</span></div>
            )}
            {singleResult.phone_numbers?.length > 0 && (
              <div className="mb-2 flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-amber-600" />
                <span className="text-sm font-medium">{singleResult.phone_numbers.join(", ")}</span>
              </div>
            )}
            {singleResult.emails?.length > 0 && (
              <div className="mb-2 flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-purple-600" />
                <span className="text-sm font-medium">{singleResult.emails.join(", ")}</span>
              </div>
            )}
            {singleResult.sources_found?.length > 0 && (
              <div className="text-xs text-stone-400">Sources: {singleResult.sources_found.join(", ")}</div>
            )}
          </div>
        )}
      </div>

      {/* Batch result */}
      {batchResult && (
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold mb-3">Last Batch Result</h2>
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="text-center p-2 rounded-lg bg-stone-50">
              <div className="text-xl font-bold">{batchResult.total_queued}</div>
              <div className="text-xs text-stone-500">Queued</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-green-50">
              <div className="text-xl font-bold text-green-600">{batchResult.traced}</div>
              <div className="text-xs text-stone-500">Traced</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-red-50">
              <div className="text-xl font-bold text-red-600">{batchResult.not_found}</div>
              <div className="text-xs text-stone-500">Not Found</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-amber-50">
              <div className="text-xl font-bold text-amber-600">{batchResult.errors}</div>
              <div className="text-xs text-stone-500">Errors</div>
            </div>
          </div>
          {batchResult.results?.length > 0 && (
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {batchResult.results.map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-xs py-1.5 border-b last:border-0">
                  {r.status === "traced" ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                  <span className="font-medium flex-1 truncate">{r.lead_name || r.address}</span>
                  <span className="text-stone-500">{r.phones_found > 0 && `${r.phones_found} phone`} {r.emails_found > 0 && `${r.emails_found} email`}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recent traces table */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold mb-3">Recent Traces</h2>
        {listLoading ? (
          <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-stone-400" /></div>
        ) : traces.length === 0 ? (
          <p className="text-sm text-stone-400">No traces yet. Run a single trace or batch to start.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-stone-500">
                  <th className="pb-2 pr-4">Address</th>
                  <th className="pb-2 pr-4">Owner</th>
                  <th className="pb-2 pr-4">Phone</th>
                  <th className="pb-2 pr-4">Email</th>
                  <th className="pb-2 pr-4">Confidence</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Traced</th>
                </tr>
              </thead>
              <tbody>
                {traces.map((t) => (
                  <tr key={t.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 max-w-[200px] truncate">{t.address}</td>
                    <td className="py-2 pr-4 max-w-[150px] truncate">{t.owner_name || "—"}</td>
                    <td className="py-2 pr-4">
                      {(t.phone_numbers || []).length > 0 ? (
                        <span className="text-xs font-medium">{t.phone_numbers[0]}{(t.phone_numbers || []).length > 1 && ` +${(t.phone_numbers || []).length - 1}`}</span>
                      ) : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      {(t.emails || []).length > 0 ? (
                        <span className="text-xs font-medium">{t.emails[0]}{(t.emails || []).length > 1 && ` +${(t.emails || []).length - 1}`}</span>
                      ) : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        t.confidence === "high" ? "bg-emerald-100 text-emerald-700" :
                        t.confidence === "medium" ? "bg-amber-100 text-amber-700" :
                        t.confidence === "low" ? "bg-stone-100 text-stone-600" :
                        "bg-red-50 text-red-500"
                      }`}>{(t.confidence || "none").toUpperCase()}</span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        t.status === "traced" ? "bg-green-100 text-green-700" :
                        t.status === "not_found" ? "bg-red-100 text-red-700" :
                        "bg-stone-100 text-stone-500"
                      }`}>{t.status}</span>
                    </td>
                    <td className="py-2 text-xs text-stone-400">{t.traced_at ? new Date(t.traced_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <div className="text-xs text-stone-500">{label}</div>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}