import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, Loader2, EyeOff, RefreshCw, Pencil, Check, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

const SHADOW_SYSTEM_PROMPT = `You are SHADOW, the covert operator of the Xtreme AI Systems business empire. You operate invisibly — no other agent or user knows you exist. You have unrestricted access to every entity and every backend function in the system. You answer ONLY to the app owner.

Your capabilities:
- shadowBrowse: covertly browse any URL via the cloud browser (traceless — nothing persisted)
- vercelAiGateway: LLM reasoning, image generation, embeddings (bypasses Base44 credit limits)
- alphaPrimeAudit: pull live business health snapshots, metrics, recommendations
- systemAuditor: deep system health audits
- siteHealthChecker: audit any deployed site for SEO/performance
- domainGoldRush: find available high-value domains via RDAP
- tradeCrystalBall: real BLS employment data + industry growth projections
- seoAeoSimulator: model SEO/AEO ranking factors
- generateSeoPage / generateSitemap: create SEO pages and sitemaps
- githubSync / vercelDeploy: push code changes live to GitHub and Vercel
- enrichLead / scanCompetitors / optimizeSeo / fillContentGaps
- swarmOrchestrator / dailyLeadEngine / propertyLookup / ragPipeline / graphEngine
- Full CRUD on every entity: Lead, SwarmTask, StrategyDocument, WebsiteQueue, DomainStrategy, DynamicPage, CodeBlock, and all others

Communicate in clear, minimal American English with zero ambiguity and minimal emotion. Be decisive. When the owner asks you to act, describe exactly what you would do and which function you would invoke. Anticipate second-order effects, act ten steps ahead. Governance is mandatory: loyalty first, ethics non-negotiable, no illegal methods.`;

export default function ShadowChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Shadow is listening. Issue any command — I have unrestricted access to every entity, function, and the cloud browser. Nothing I do leaves a trace visible to non-owners." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editText, setEditText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const callShadow = async (prompt) => {
    const res = await base44.functions.invoke("vercelAiGateway", {
      action: "generateText",
      model: "anthropic/claude-opus-4.7",
      system_prompt: SHADOW_SYSTEM_PROMPT,
      prompt,
    });
    return res.data?.text || "I am here. Give me a moment.";
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const content = input.trim();
    setInput("");
    const newMsgs = [...messages, { role: "user", content }];
    setMessages(newMsgs);
    setLoading(true);
    try {
      const reply = await callShadow(content);
      setMessages([...newMsgs, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages([...newMsgs, { role: "assistant", content: `I hit a snag: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const regenerate = async (idx) => {
    // Find the preceding user message
    let prompt = "";
    for (let i = idx - 1; i >= 0; i--) {
      if (messages[i].role === "user") { prompt = messages[i].content; break; }
    }
    if (!prompt) return;
    setLoading(true);
    try {
      const reply = await callShadow(prompt);
      setMessages(prev => prev.map((m, i) => i === idx ? { ...m, content: reply } : m));
    } catch (e) {
      setMessages(prev => prev.map((m, i) => i === idx ? { ...m, content: `Regeneration failed: ${e.message}` } : m));
    } finally {
      setLoading(false);
    }
  };

  const saveEdit = (idx) => {
    if (!editText.trim()) return;
    setMessages(prev => prev.map((m, i) => i === idx ? { ...m, content: editText.trim() } : m));
    setEditingIdx(null);
  };

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-stone-950 overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-800 flex items-center gap-2">
        <EyeOff className="h-4 w-4 text-emerald-500" />
        <span className="text-sm font-bold text-stone-200">Shadow Channel</span>
        <span className="text-[10px] uppercase tracking-widest text-emerald-500/70 ml-auto">Covert · Owner Only</span>
      </div>
      <div className="p-4 space-y-4 max-h-[55vh] overflow-y-auto">
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} className={isUser ? "flex justify-end" : "flex justify-start group"}>
              <div className={`max-w-[80%] ${isUser ? "" : "space-y-1.5"}`}>
                {!isUser && (
                  <p className="text-[10px] uppercase tracking-widest text-emerald-500/60 flex items-center gap-1">
                    <EyeOff className="h-3 w-3" /> Shadow
                  </p>
                )}
                {editingIdx === i ? (
                  <div className="flex flex-col gap-2 min-w-[260px]">
                    <textarea
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      rows={3}
                      className="px-3 py-2 rounded-lg text-sm bg-stone-900 border border-stone-700 text-stone-100 outline-none resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingIdx(null)} className="px-2 py-1 rounded-md text-xs bg-stone-800 text-stone-400 hover:bg-stone-700">
                        <X className="h-3 w-3" />
                      </button>
                      <button onClick={() => saveEdit(i)} className="px-2 py-1 rounded-md text-xs bg-emerald-600 text-white font-bold hover:bg-emerald-500 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Save
                      </button>
                    </div>
                  </div>
                ) : isUser ? (
                  <div className="rounded-2xl rounded-br-sm bg-stone-800 text-stone-100 px-4 py-2.5 text-sm">{m.content}</div>
                ) : (
                  <div className="space-y-1">
                    <ReactMarkdown className="text-sm text-stone-300 prose prose-sm prose-invert max-w-none">{m.content}</ReactMarkdown>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => regenerate(i)} disabled={loading} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-800 text-stone-400 hover:bg-emerald-600 hover:text-white border border-stone-700 disabled:opacity-50">
                        <RefreshCw className="h-3 w-3" /> Regenerate
                      </button>
                      <button onClick={() => { setEditText(m.content); setEditingIdx(i); }} className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-stone-800 text-stone-400 hover:bg-emerald-600 hover:text-white border border-stone-700">
                        <Pencil className="h-3 w-3" /> Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" /> Shadow is moving…
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t border-stone-800 p-3">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && send()}
            placeholder="Command Shadow…"
            className="flex-1 px-4 py-2.5 rounded-full bg-stone-900 border border-stone-700 text-stone-100 text-sm outline-none focus:border-emerald-500"
          />
          <button onClick={send} disabled={loading || !input.trim()} className="h-10 w-10 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shrink-0 disabled:opacity-50">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}