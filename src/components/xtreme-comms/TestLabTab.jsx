import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FlaskConical, Send, RefreshCw, AlertCircle, CheckCircle2, Plus, Repeat, PhoneCall, MessageSquare, Smartphone, MessageCircle } from "lucide-react";

const CHANNELS = [
  { id: "sms", label: "SMS", icon: Smartphone, action: "sendSms" },
  { id: "mms", label: "MMS", icon: Smartphone, action: "sendMms" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, action: "sendWhatsApp" },
  { id: "voice", label: "Voice Call", icon: PhoneCall, action: "makeCall" },
];

export default function TestLabTab({ companyFacts }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    loopLabel: "",
    to: "",
    from: "",
    channel: "sms",
    personaId: "",
    message: "This is a closed-loop test message from the Xtreme Comms Test Lab.",
    mediaUrls: "",
  });
  const [personas, setPersonas] = useState([]);
  const [running, setRunning] = useState(false);
  const [loopRunning, setLoopRunning] = useState(false);
  const [loopCount, setLoopCount] = useState(5);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  const { data: history } = useQuery({
    queryKey: ["test-runs"],
    queryFn: () => base44.entities.TestRun.list("-created_date", 20),
  });

  useEffect(() => {
    base44.entities.AgentPersona.list("-created_date", 50).then(setPersonas).catch(() => {});
  }, []);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const runOne = useCallback(async (label) => {
    const ch = CHANNELS.find((c) => c.id === form.channel);
    const persona = personas.find((p) => p.id === form.personaId);
    const payload = {
      to: form.to,
      message: form.message,
      from: form.from || companyFacts?.automation_phone || undefined,
      mediaUrls: form.mediaUrls ? form.mediaUrls.split(",").map((s) => s.trim()) : undefined,
      agentId: form.channel === "voice" ? form.personaId || undefined : undefined,
      systemPrompt: form.channel === "voice" && persona ? persona.system_prompt : undefined,
    };
    const t0 = Date.now();
    try {
      const res = await base44.functions.invoke("xtremeComms", { action: ch.action, ...payload });
      const duration_ms = Date.now() - t0;
      const run = await base44.entities.TestRun.create({
        loop_label: label || form.loopLabel || null,
        channel: form.channel,
        to_number: form.to,
        from_number: payload.from || "",
        persona_id: form.personaId || "",
        persona_name: persona?.name || "",
        message: form.message,
        media_urls: payload.mediaUrls || [],
        status: "sent",
        provider_response: JSON.stringify(res?.data || res).slice(0, 4000),
        duration_ms,
      });
      setLastResult({ ok: true, run, data: res?.data });
      queryClient.invalidateQueries({ queryKey: ["test-runs"] });
      return run;
    } catch (e) {
      const duration_ms = Date.now() - t0;
      const msg = e.response?.data?.error || e.message;
      await base44.entities.TestRun.create({
        loop_label: label || form.loopLabel || null,
        channel: form.channel,
        to_number: form.to,
        from_number: payload.from || "",
        persona_id: form.personaId || "",
        persona_name: persona?.name || "",
        message: form.message,
        status: "failed",
        error: msg,
        duration_ms,
      }).catch(() => {});
      setError(msg);
      setLastResult({ ok: false, error: msg });
      queryClient.invalidateQueries({ queryKey: ["test-runs"] });
      return null;
    }
  }, [form, personas, companyFacts, queryClient]);

  const handleRun = async () => {
    setError(null); setLastResult(null);
    if (!form.to) { setError("Add a test number first."); return; }
    setRunning(true);
    try { await runOne(); } finally { setRunning(false); }
  };

  const handleLoop = async () => {
    setError(null); setLastResult(null);
    if (!form.to) { setError("Add a test number first."); return; }
    setLoopRunning(true);
    const label = form.loopLabel || `Loop ${new Date().toLocaleTimeString()}`;
    for (let i = 0; i < loopCount; i++) {
      await runOne(`${label} #${i + 1}`);
      await new Promise((r) => setTimeout(r, 800));
    }
    setLoopRunning(false);
  };

  const inputCls = "w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none";
  const textareaCls = "w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none";
  const btnCls = "h-10 rounded-lg bg-stone-900 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2";

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-stone-900 flex items-center gap-2"><FlaskConical className="h-5 w-5 text-amber-500" /> Test Lab — Closed-Loop Testing Chamber</h3>
        <p className="text-sm text-stone-500 mt-1">Add an extra number, pick a channel, and fire a test through the full Xtreme Comms loop. Every send is logged to <strong>TestRun</strong> for audit.</p>
      </div>

      {/* Channel picker — visual app + desktop screen */}
      <div className="grid grid-cols-4 gap-2">
        {CHANNELS.map((c) => {
          const Icon = c.icon;
          const active = form.channel === c.id;
          return (
            <button key={c.id} onClick={() => update("channel", c.id)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition ${active ? "border-amber-500 bg-amber-50 text-amber-700" : "border-stone-200 bg-white text-stone-500 hover:border-stone-300"}`}>
              <Icon className="h-5 w-5" /> {c.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input placeholder="Test number (+1 555…)" value={form.to} onChange={(e) => update("to", e.target.value)} className={inputCls} />
        <input placeholder="From (optional — defaults to automation line)" value={form.from} onChange={(e) => update("from", e.target.value)} className={inputCls} />
      </div>
      <input placeholder="Loop label (optional — groups repeated runs)" value={form.loopLabel} onChange={(e) => update("loopLabel", e.target.value)} className={inputCls} />

      {form.channel === "voice" && (
        <select value={form.personaId} onChange={(e) => update("personaId", e.target.value)} className={inputCls}>
          <option value="">— Select an AI persona —</option>
          {personas.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.persona_type})</option>)}
        </select>
      )}
      {(form.channel === "mms" || form.channel === "whatsapp") && (
        <input placeholder="Media URLs (comma-separated)" value={form.mediaUrls} onChange={(e) => update("mediaUrls", e.target.value)} className={inputCls} />
      )}
      <textarea placeholder="Test message…" value={form.message} onChange={(e) => update("message", e.target.value)} rows={3} className={textareaCls} />

      <div className="flex flex-wrap gap-2 items-center">
        <button onClick={handleRun} disabled={running || loopRunning} className={btnCls + " flex-1 min-w-[140px]"}>
          {running ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Run Test
        </button>
        <div className="flex items-center gap-2">
          <input type="number" min={1} max={20} value={loopCount} onChange={(e) => setLoopCount(Number(e.target.value))} className="w-16 h-10 px-2 rounded-lg border border-stone-200 text-sm text-center" />
          <button onClick={handleLoop} disabled={running || loopRunning} className={btnCls + " bg-amber-600"}>
            {loopRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Repeat className="h-4 w-4" />} Run Loop
          </button>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2"><AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /><span className="text-sm text-red-700">{error}</span></div>}
      {lastResult?.ok && <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div className="text-sm text-green-700">Test sent — logged to TestRun.</div></div>}

      {/* History */}
      <div className="border-t border-stone-100 pt-4">
        <h4 className="font-semibold text-stone-700 text-sm mb-2 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-stone-400" /> Recent Test Runs</h4>
        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          {(history || []).map((r) => (
            <div key={r.id} className="rounded-lg border border-stone-200 bg-white p-2.5 flex items-center gap-3 text-xs">
              <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${r.status === "sent" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{r.status}</span>
              <span className="font-semibold text-stone-700 uppercase">{r.channel}</span>
              <span className="text-stone-500 truncate">{r.to_number}</span>
              {r.loop_label && <span className="text-amber-600 font-medium truncate">{r.loop_label}</span>}
              <span className="text-stone-400 ml-auto whitespace-nowrap">{r.duration_ms}ms</span>
            </div>
          ))}
          {(!history || history.length === 0) && <p className="text-sm text-stone-400">No test runs yet.</p>}
        </div>
      </div>
    </div>
  );
}