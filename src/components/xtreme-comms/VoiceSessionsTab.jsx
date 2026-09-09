import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PhoneCall, Play, RefreshCw, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function VoiceSessionsTab({ companyFacts }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ personaId: "", to: "", from: "" });
  const [personas, setPersonas] = useState([]);
  const [starting, setStarting] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [error, setError] = useState(null);

  const { data: sessions } = useQuery({
    queryKey: ["voice-sessions"],
    queryFn: () => base44.entities.AiVoiceSession.list("-created_date", 20),
    refetchInterval: 5000,
  });

  React.useEffect(() => {
    base44.entities.AgentPersona.filter({ persona_type: "voice" }, "-created_date", 50).then(setPersonas).catch(() => {});
  }, []);

  const update = (k, v) => setForm({ ...form, [k]: v });

  const startSession = async () => {
    setError(null); setLastResult(null);
    if (!form.to) { setError("Enter a number to call."); return; }
    setStarting(true);
    const persona = personas.find((p) => p.id === form.personaId);
    const from = form.from || companyFacts?.automation_phone || undefined;
    const t0 = new Date().toISOString();
    try {
      const res = await base44.functions.invoke("xtremeComms", {
        action: "startVoiceSession",
        to: form.to,
        from,
        agentId: form.personaId || undefined,
        systemPrompt: persona?.system_prompt || undefined,
      });
      const data = res?.data || {};
      await base44.entities.AiVoiceSession.create({
        conversation_id: data.conversation_id || data.call_id || data.id || "",
        persona_id: form.personaId || "",
        persona_name: persona?.name || "",
        to_number: form.to,
        from_number: from || "",
        status: "streaming",
        started_at: t0,
        tts_audio_url: data.audio_url || data.tts_audio_url || "",
        provider_response: JSON.stringify(data).slice(0, 4000),
      });
      setLastResult({ ok: true, data });
      queryClient.invalidateQueries({ queryKey: ["voice-sessions"] });
    } catch (e) {
      const msg = e.response?.data?.error || e.message;
      await base44.entities.AiVoiceSession.create({
        to_number: form.to,
        from_number: from || "",
        persona_id: form.personaId || "",
        persona_name: persona?.name || "",
        status: "failed",
        started_at: t0,
        provider_response: msg,
      }).catch(() => {});
      setError(msg);
    } finally { setStarting(false); }
  };

  const inputCls = "w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none";
  const btnCls = "h-10 rounded-lg bg-stone-900 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2";

  const statusColor = (s) => ({
    streaming: "bg-blue-100 text-blue-700",
    listening: "bg-blue-100 text-blue-700",
    speaking: "bg-blue-100 text-blue-700",
    ended: "bg-stone-200 text-stone-600",
    failed: "bg-red-100 text-red-700",
    interrupted: "bg-amber-100 text-amber-700",
    summarized: "bg-green-100 text-green-700",
  }[s] || "bg-stone-100 text-stone-600");

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-bold text-stone-900 flex items-center gap-2"><PhoneCall className="h-5 w-5 text-amber-500" /> AI Voice Sessions</h3>
        <p className="text-sm text-stone-500 mt-1">Start an AI voice session with a persona. Each session is logged to <strong>AiVoiceSession</strong> with transcript, audio, and sentiment.</p>
      </div>

      <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-4 space-y-3">
        <select value={form.personaId} onChange={(e) => update("personaId", e.target.value)} className={inputCls}>
          <option value="">— Select a voice persona —</option>
          {personas.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="To (+1 555…)" value={form.to} onChange={(e) => update("to", e.target.value)} className={inputCls} />
          <input placeholder="From (optional)" value={form.from} onChange={(e) => update("from", e.target.value)} className={inputCls} />
        </div>
        <button onClick={startSession} disabled={starting} className={btnCls + " w-full bg-amber-600"}>
          {starting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Start Voice Session
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2"><AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" /><span className="text-sm text-red-700">{error}</span></div>}
      {lastResult?.ok && <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /><div className="text-sm text-green-700">Voice session started — logged to AiVoiceSession.</div></div>}

      <div className="border-t border-stone-100 pt-4">
        <h4 className="font-semibold text-stone-700 text-sm mb-2 flex items-center gap-2"><Clock className="h-4 w-4 text-stone-400" /> Recent Sessions</h4>
        <div className="space-y-1.5 max-h-72 overflow-y-auto">
          {(sessions || []).map((s) => (
            <div key={s.id} className="rounded-lg border border-stone-200 bg-white p-2.5 flex items-center gap-3 text-xs">
              <span className={`px-1.5 py-0.5 rounded font-bold uppercase ${statusColor(s.status)}`}>{s.status}</span>
              {s.persona_name && <span className="font-semibold text-stone-700 truncate">{s.persona_name}</span>}
              <span className="text-stone-500 truncate">{s.to_number}</span>
              <span className="text-stone-400 ml-auto whitespace-nowrap">{s.started_at ? new Date(s.started_at).toLocaleTimeString() : ""}</span>
            </div>
          ))}
          {(!sessions || sessions.length === 0) && <p className="text-sm text-stone-400">No voice sessions yet.</p>}
        </div>
      </div>
    </div>
  );
}