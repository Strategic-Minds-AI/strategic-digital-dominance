import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Share2, Sparkles, Image as ImageIcon, Video, FileImage, Send, RefreshCw,
  Calendar, Clock, CheckCircle2, AlertCircle, Trash2, Facebook, Zap,
  TrendingUp, Hash, Search, Loader2, Megaphone, Rocket,
} from "lucide-react";

const THEME_LABELS = {
  before_after: "Before & After", testimonial: "Testimonial", educational: "Educational",
  promotion: "Promotion", faq: "FAQ", tip: "Pro Tip", behind_scenes: "Behind the Scenes", trend: "Trend",
};

const STATUS_STYLES = {
  scheduled: { color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-500", label: "Scheduled" },
  publishing: { color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-500", label: "Publishing" },
  published: { color: "text-green-600", bg: "bg-green-50", dot: "bg-green-500", label: "Published" },
  failed: { color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500", label: "Failed" },
  draft: { color: "text-stone-500", bg: "bg-stone-100", dot: "bg-stone-400", label: "Draft" },
};

export default function SocialStudio() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("scheduler");
  const [loading, setLoading] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedPage, setSelectedPage] = useState(null);

  // Auto-generate form
  const [autoForm, setAutoForm] = useState({ theme: "", mediaType: "image" });
  // Content studio
  const [studio, setStudio] = useState({ prompt: "", theme: "educational", mediaType: "image" });
  const [studioOutput, setStudioOutput] = useState(null);

  const { data: pagesRes } = useQuery({
    queryKey: ["fb-pages"],
    queryFn: () => base44.functions.invoke("socialStudio", { action: "listPages" }),
  });
  const pages = pagesRes?.data?.pages || [];

  const { data: postsRes, isLoading: postsLoading } = useQuery({
    queryKey: ["social-posts"],
    queryFn: () => base44.functions.invoke("socialStudio", { action: "list", limit: 100 }),
    refetchInterval: 30000,
  });
  const posts = postsRes?.data?.posts || [];
  const themes = postsRes?.data?.themes || THEME_LABELS;

  const scheduled = posts.filter((p) => p.status === "scheduled").sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
  const published = posts.filter((p) => p.status === "published").sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

  const run = async (label, payload) => {
    setLoading(label); setError(null); setResult(null);
    try {
      const res = await base44.functions.invoke("socialStudio", payload);
      setResult(res.data);
      queryClient.invalidateQueries({ queryKey: ["social-posts"] });
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setLoading(null); }
  };

  const runStudio = async (kind) => {
    setLoading(`studio-${kind}`); setError(null); setStudioOutput(null);
    try {
      let res;
      if (kind === "content") {
        res = await base44.functions.invoke("socialStudio", { action: "generateContent", theme: studio.theme });
        setStudioOutput({ type: "content", data: res.data.content });
      } else if (kind === "image") {
        res = await base44.functions.invoke("socialStudio", { action: "generateImage", prompt: studio.prompt });
        setStudioOutput({ type: "image", url: res.data.url });
      } else if (kind === "video") {
        res = await base44.functions.invoke("socialStudio", { action: "generateVideo", prompt: studio.prompt });
        setStudioOutput({ type: "video", url: res.data.url });
      } else if (kind === "flyer") {
        res = await base44.functions.invoke("socialStudio", { action: "generateFlyer", prompt: studio.prompt });
        setStudioOutput({ type: "image", url: res.data.url });
      }
      setResult(res.data);
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setLoading(null); }
  };

  const btn = "h-10 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition";
  const inputCls = "w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none";
  const textareaCls = "w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Share2 className="h-7 w-7 text-amber-500" /> Social Studio
          </h1>
          <p className="text-stone-500 mt-1">Autonomous Facebook content engine — AI captions, hashtags, SEO/AEO keywords, images, videos & flyers. Auto-posts 3× daily.</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${pages.length ? "border-green-200 bg-green-50" : "border-stone-200 bg-stone-50"}`}>
          <Facebook className={`h-5 w-5 ${pages.length ? "text-blue-600" : "text-stone-400"}`} />
          <span className="text-sm font-semibold text-stone-700">{pages.length ? `${pages.length} Page${pages.length > 1 ? "s" : ""} connected` : "Not connected"}</span>
        </div>
      </div>

      {/* Page selector */}
      {pages.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-4">
          <label className="text-xs font-semibold text-stone-500 mb-2 block">Facebook Page to post to</label>
          <div className="flex flex-wrap gap-2">
            {pages.map((p) => (
              <button key={p.id} onClick={() => setSelectedPage(p.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-semibold transition ${selectedPage === p.id ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-white hover:border-stone-300"}`}>
                {p.picture?.data?.url ? <img src={p.picture.data.url} alt="" className="h-6 w-6 rounded-full" /> : <Facebook className="h-5 w-5 text-blue-600" />}
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {[
          { id: "scheduler", label: "Scheduler", icon: Calendar },
          { id: "studio", label: "Content Studio", icon: Sparkles },
          { id: "published", label: "Published", icon: CheckCircle2 },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${tab === t.id ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300"}`}>
            <t.icon className="h-4 w-4" /> {t.label}
            {t.id === "scheduler" && scheduled.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-500 text-stone-900 text-xs font-bold">{scheduled.length}</span>}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* SCHEDULER TAB */}
      {tab === "scheduler" && (
        <div className="space-y-4">
          {/* Auto-generate */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-3"><Rocket className="h-5 w-5 text-amber-500" /> Auto-Generate Post</h3>
            <p className="text-sm text-stone-500 mb-3">AI writes a scroll-stopping caption with hashtags + SEO/AEO keywords, generates a visual, and schedules it for the next open slot (9am / 1pm / 5pm ET).</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <select value={autoForm.theme} onChange={(e) => setAutoForm({ ...autoForm, theme: e.target.value })} className={inputCls}>
                <option value="">Random theme</option>
                {Object.entries(themes).map(([k, v]) => <option key={k} value={k}>{v.label || v}</option>)}
              </select>
              <select value={autoForm.mediaType} onChange={(e) => setAutoForm({ ...autoForm, mediaType: e.target.value })} className={inputCls}>
                <option value="image">Image (photo)</option>
                <option value="flyer">Flyer / Banner</option>
                <option value="video">Video (6s, vertical)</option>
                <option value="none">Text only</option>
              </select>
            </div>
            <button onClick={() => run("auto", { action: "autoGenerate", theme: autoForm.theme || undefined, mediaType: autoForm.mediaType, pageId: selectedPage })}
              disabled={loading !== null} className={btn + " bg-amber-500 text-stone-900 hover:bg-amber-400 px-5"}>
              {loading === "auto" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate & Schedule
            </button>
          </div>

          {/* Scheduled queue */}
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-stone-900 flex items-center gap-2"><Calendar className="h-4 w-4 text-blue-500" /> Scheduled Queue ({scheduled.length})</h3>
              <button onClick={() => run("publishDue", { action: "autoPublishDue" })} disabled={loading !== null}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-green-600 text-white flex items-center gap-1.5 hover:bg-green-700 disabled:opacity-50">
                {loading === "publishDue" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Publish Due Now
              </button>
            </div>
            {postsLoading ? (
              <div className="p-8 text-center text-stone-400"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>
            ) : scheduled.length === 0 ? (
              <div className="p-8 text-center text-stone-400"><Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" /> No scheduled posts. Generate one above.</div>
            ) : (
              <div className="divide-y divide-stone-100">
                {scheduled.map((p) => {
                  const st = STATUS_STYLES[p.status] || STATUS_STYLES.draft;
                  return (
                    <div key={p.id} className="p-4 flex gap-3 hover:bg-stone-50">
                      {p.media_url ? (
                        p.media_type === "video" ? (
                          <video src={p.media_url} className="h-16 w-16 rounded-lg object-cover bg-stone-100" muted />
                        ) : (
                          <img src={p.media_url} alt="" className="h-16 w-16 rounded-lg object-cover bg-stone-100" />
                        )
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-stone-100 grid place-items-center text-stone-300"><FileImage className="h-6 w-6" /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${st.bg} ${st.color}`}>{st.label}</span>
                          <span className="text-xs text-stone-400">{THEME_LABELS[p.content_theme] || p.content_theme}</span>
                          {p.auto_generated && <span className="text-[10px] font-bold uppercase text-amber-600">AI</span>}
                        </div>
                        <p className="text-sm text-stone-700 line-clamp-2">{p.content}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-400">
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {p.scheduled_at ? new Date(p.scheduled_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}</span>
                          {p.media_type !== "none" && <span className="flex items-center gap-1">{p.media_type === "video" ? <Video className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}{p.media_type}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <button onClick={() => run(`pub-${p.id}`, { action: "publishPost", id: p.id })} disabled={loading !== null || !p.page_id}
                          title={p.page_id ? "Publish now" : "No page selected"} className="h-8 w-8 grid place-items-center rounded-lg border border-stone-200 text-green-600 hover:border-green-500 disabled:opacity-40">
                          {loading === `pub-${p.id}` ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </button>
                        <button onClick={() => run(`del-${p.id}`, { action: "delete", id: p.id })} disabled={loading !== null}
                          className="h-8 w-8 grid place-items-center rounded-lg border border-stone-200 text-stone-500 hover:border-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENT STUDIO TAB */}
      {tab === "studio" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4">
            <h3 className="font-bold text-stone-900 flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-500" /> AI Content Generator</h3>
            <p className="text-sm text-stone-500">Generate a caption with hashtags + SEO/AEO keywords, or create standalone images, videos, and flyers.</p>
            <div className="grid grid-cols-2 gap-3">
              <select value={studio.theme} onChange={(e) => setStudio({ ...studio, theme: e.target.value })} className={inputCls}>
                {Object.entries(themes).map(([k, v]) => <option key={k} value={k}>{v.label || v}</option>)}
              </select>
              <select value={studio.mediaType} onChange={(e) => setStudio({ ...studio, mediaType: e.target.value })} className={inputCls}>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="flyer">Flyer / Banner</option>
              </select>
            </div>
            <textarea placeholder="Describe the image/video/flyer to generate (for media)…" value={studio.prompt} onChange={(e) => setStudio({ ...studio, prompt: e.target.value })} rows={3} className={textareaCls} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button onClick={() => runStudio("content")} disabled={loading !== null} className={btn + " bg-stone-900 text-white px-3"}>
                {loading === "studio-content" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Hash className="h-4 w-4" />} Caption
              </button>
              <button onClick={() => runStudio("image")} disabled={loading !== null || !studio.prompt} className={btn + " bg-blue-600 text-white px-3"}>
                {loading === "studio-image" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />} Image
              </button>
              <button onClick={() => runStudio("video")} disabled={loading !== null || !studio.prompt} className={btn + " bg-purple-600 text-white px-3"}>
                {loading === "studio-video" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />} Video
              </button>
              <button onClick={() => runStudio("flyer")} disabled={loading !== null || !studio.prompt} className={btn + " bg-amber-500 text-stone-900 px-3"}>
                {loading === "studio-flyer" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileImage className="h-4 w-4" />} Flyer
              </button>
            </div>
          </div>

          {/* Studio output */}
          {studioOutput && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3">
              <h3 className="font-bold text-stone-900 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-green-500" /> Generated Output</h3>
              {studioOutput.type === "content" && studioOutput.data && (
                <div className="space-y-3">
                  <div className="rounded-lg bg-stone-50 p-3 text-sm text-stone-700 whitespace-pre-wrap">{studioOutput.data.content}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(studioOutput.data.hashtags || []).map((h) => <span key={h} className="text-xs font-mono bg-blue-50 text-blue-600 px-2 py-0.5 rounded">#{h}</span>)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-500">SEO Keywords:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(studioOutput.data.seo_keywords || []).map((k) => <span key={k} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded">{k}</span>)}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-stone-500">AEO Keywords (AI Search):</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {(studioOutput.data.aeo_keywords || []).map((k) => <span key={k} className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded">{k}</span>)}
                    </div>
                  </div>
                  {studioOutput.data.media_prompt && <div className="text-xs text-stone-400"><strong>Media prompt:</strong> {studioOutput.data.media_prompt}</div>}
                </div>
              )}
              {studioOutput.type === "image" && studioOutput.url && (
                <img src={studioOutput.url} alt="Generated" className="w-full max-w-sm rounded-xl" />
              )}
              {studioOutput.type === "video" && studioOutput.url && (
                <video src={studioOutput.url} controls className="w-full max-w-sm rounded-xl" />
              )}
            </div>
          )}
        </div>
      )}

      {/* PUBLISHED TAB */}
      {tab === "published" && (
        <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-stone-100">
            <h3 className="font-bold text-stone-900 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-500" /> Published Posts ({published.length})</h3>
          </div>
          {published.length === 0 ? (
            <div className="p-8 text-center text-stone-400"><Megaphone className="h-8 w-8 mx-auto mb-2 opacity-40" /> No published posts yet.</div>
          ) : (
            <div className="divide-y divide-stone-100">
              {published.map((p) => (
                <div key={p.id} className="p-4 flex gap-3">
                  {p.media_url && (p.media_type === "video"
                    ? <video src={p.media_url} className="h-16 w-16 rounded-lg object-cover bg-stone-100" muted />
                    : <img src={p.media_url} alt="" className="h-16 w-16 rounded-lg object-cover bg-stone-100" />)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 line-clamp-2">{p.content}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-400">
                      <span className="flex items-center gap-1 text-green-600"><CheckCircle2 className="h-3 w-3" /> {p.published_at ? new Date(p.published_at).toLocaleString() : "Published"}</span>
                      {p.fb_post_id && <span className="font-mono">FB: {p.fb_post_id.slice(0, 12)}…</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Raw result */}
      {result && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3"><CheckCircle2 className="h-5 w-5 text-green-500" /><h3 className="font-bold text-stone-900">Result</h3></div>
          <pre className="text-xs bg-stone-50 rounded-lg p-4 overflow-x-auto max-h-72 overflow-y-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}