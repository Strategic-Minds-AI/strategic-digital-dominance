import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Rocket, RefreshCw, Loader2, CheckCircle2, AlertTriangle, TrendingUp, Target, FileText, Zap, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SeoDominance() {
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const logs = await base44.entities.SopLog.filter({ source: "autonomousSeoDominance" }, "-created_date", 10);
      setHistory(logs);
    } catch {}
  };

  const runDominance = async () => {
    setRunning(true);
    setError("");
    setReport(null);
    try {
      const res = await base44.functions.invoke("autonomousSeoDominance", { max_new_pages: 5 });
      const d = res.data || res;
      if (d.error) throw new Error(d.error);
      setReport(d);
      await loadHistory();
    } catch (e) {
      setError(e.message || "Something went wrong");
    }
    setRunning(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Rocket className="h-6 w-6 text-amber-600" /> Autonomous SEO Dominance Engine
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          Runs every 6 hours automatically. Pulls Google Search Console data, discovers page-2+ keyword opportunities, auto-generates new content, re-optimizes underperforming pages, and submits everything for instant indexing.
        </p>
      </div>

      {/* Status banner */}
      <div className="rounded-xl border bg-gradient-to-r from-amber-50 to-orange-50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="font-semibold text-sm">Auto-run schedule: Every 6 hours</div>
            <div className="text-xs text-stone-500">Next run at the next 6-hour mark (00:00, 06:00, 12:00, 18:00 ET)</div>
          </div>
        </div>
        <Button onClick={runDominance} disabled={running}>
          {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
          {running ? "Running..." : "Run now"}
        </Button>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* Live report */}
      {report && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={Target} label="Opportunities Found" value={report.opportunities_found} color="text-blue-600" />
            <StatCard icon={FileText} label="Pages Generated" value={report.pages_generated} color="text-green-600" />
            <StatCard icon={TrendingUp} label="Pages Re-optimized" value={report.pages_reoptimized} color="text-purple-600" />
            <StatCard icon={Zap} label="URLs Submitted" value={report.urls_submitted} color="text-amber-600" />
          </div>

          {/* Step breakdown */}
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold mb-3">Cycle Steps</h2>
            <div className="space-y-2">
              {report.steps?.map((step, i) => (
                <div key={i} className="flex items-center gap-3 text-sm py-2 border-b last:border-0">
                  {step.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                  )}
                  <span className="font-mono text-xs flex-1">{step.step}</span>
                  <span className="text-stone-500 text-xs">
                    {Object.entries(step)
                      .filter(([k]) => !["step", "ok", "error"].includes(k))
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Generated pages */}
          {report.steps?.find((s) => s.step === "generate_new_pages")?.keywords?.length > 0 && (
            <div className="rounded-xl border bg-white p-5">
              <h2 className="font-semibold mb-3">New Pages Generated</h2>
              <div className="space-y-1">
                {report.steps.find((s) => s.step === "generate_new_pages").keywords.map((kw, i) => (
                  <div key={i} className="text-sm py-1.5 border-b last:border-0 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-green-500" />
                    <span className="font-medium">{kw}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Errors */}
          {report.errors?.length > 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <h2 className="font-semibold text-red-700 mb-2 text-sm">Errors ({report.errors.length})</h2>
              <div className="space-y-1">
                {report.errors.map((err, i) => (
                  <div key={i} className="text-xs text-red-600">{err}</div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Run history */}
      <div className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold mb-3">Recent Runs</h2>
        {history.length === 0 ? (
          <p className="text-sm text-stone-400">No runs yet. Click "Run now" to start the first dominance cycle.</p>
        ) : (
          <div className="space-y-2">
            {history.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-sm py-2 border-b last:border-0">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{log.description || log.action}</div>
                  <div className="text-xs text-stone-500">{new Date(log.created_date).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-stone-400">
        The dominance engine runs automatically every 6 hours. It pulls fresh Google Search Console data, finds keywords where you're on page 2+, auto-generates new content pages, re-optimizes underperforming pages, and submits all changes to Bing/Yandex/IndexNow for instant crawling.
      </p>
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