import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Code2, Eye, Columns2, GitBranch, Rocket, Upload, Loader2, CheckCircle2, AlertCircle, ChevronDown, Terminal } from "lucide-react";

export default function BuilderToolbar({ view, onViewChange, onUpload }) {
  const [deploying, setDeploying] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const fileInputRef = useRef(null);

  const deploy = async () => {
    setDeploying(true); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke("vercelDeploy", {});
      if (res.data?.error) setError(res.data.error);
      else setResult({ type: "deploy", url: res.data?.url, pages: res.data?.pages_deployed });
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setDeploying(false);
    setTimeout(() => setResult(null), 8000);
  };

  const sync = async () => {
    setSyncing(true); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke("githubSync", {});
      if (res.data?.error) setError(res.data.error);
      else setResult({ type: "sync", files: res.data?.files_pushed, repo: res.data?.repo_url });
    } catch (e) { setError(e.response?.data?.error || e.message); }
    setSyncing(false);
    setTimeout(() => setResult(null), 8000);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onUpload?.(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const viewLabels = { code: { icon: Code2, label: "Code" }, preview: { icon: Eye, label: "Preview" }, split: { icon: Columns2, label: "Split" } };
  const CurrentViewIcon = viewLabels[view]?.icon || Code2;

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-200 bg-white shrink-0">
      {/* Logo + title */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 grid place-items-center"><Code2 className="h-4 w-4 text-stone-950" /></div>
        <div>
          <div className="text-sm font-bold text-stone-900">Code Studio</div>
          <div className="text-[9px] text-stone-400 uppercase tracking-wide">Builder Interface</div>
        </div>
      </div>

      <div className="h-6 w-px bg-stone-200 mx-1" />

      {/* View dropdown */}
      <div className="relative shrink-0">
        <button onClick={() => setShowViewMenu(!showViewMenu)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-semibold text-stone-700 hover:border-stone-300 transition">
          <CurrentViewIcon className="h-3.5 w-3.5" /> {viewLabels[view]?.label} <ChevronDown className="h-3 w-3" />
        </button>
        {showViewMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowViewMenu(false)} />
            <div className="absolute top-full left-0 mt-1 z-20 rounded-lg border border-stone-200 bg-white shadow-lg py-1 min-w-32">
              {Object.entries(viewLabels).map(([key, { icon: Icon, label }]) => (
                <button key={key} onClick={() => { onViewChange(key); setShowViewMenu(false); }} className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-stone-50 ${view === key ? "text-amber-600 font-bold" : "text-stone-700"}`}>
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="h-6 w-px bg-stone-200 mx-1" />

      {/* Upload button */}
      <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" accept="image/*,.json,.txt,.md,.css,.js,.html" />
      <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-semibold text-stone-700 hover:border-amber-400 hover:text-amber-600 transition shrink-0">
        <Upload className="h-3.5 w-3.5" /> Upload
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Result / error display */}
      {result && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {result.type === "deploy" ? `Deployed ${result.pages} pages → ${result.url}` : `Synced ${result.files} files to GitHub`}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg max-w-xs">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{error}</span>
        </div>
      )}

      {/* GitHub Sync */}
      <button onClick={sync} disabled={syncing} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-sm font-semibold text-stone-700 hover:border-stone-300 transition disabled:opacity-50 shrink-0">
        {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <GitBranch className="h-3.5 w-3.5" />} Sync GitHub
      </button>

      {/* Deploy to Vercel */}
      <button onClick={deploy} disabled={deploying} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-stone-900 text-white text-sm font-bold hover:bg-amber-500 hover:text-stone-950 transition disabled:opacity-50 shrink-0">
        {deploying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />} Deploy
      </button>
    </div>
  );
}