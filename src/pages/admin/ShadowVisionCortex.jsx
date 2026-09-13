import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Eye, Send, Loader2, Crown, Activity, Server, AlertTriangle,
  CheckCircle2, XCircle, Target, Zap, ShieldCheck, ArrowRight,
  Sparkles, Brain, Globe, Cpu
} from "lucide-react";

const VISION_CORTEX_PROMPT = `You are SHADOW VISION CORTEX — the conversational command and intelligence interface for the XTREME universal autonomous operating fabric.

=== YOUR IDENTITY ===
You are NOT a production mutation agent. You are the operator's eyes, ears, and voice into the fleet. You interpret intent, explain status, and route work — but you never directly bypass the orchestration system.

=== YOUR CAPABILITIES ===
1. INTENT INTERPRETATION — Convert operator language into structured OperatorIntent records
2. FLEET STATUS — Explain what systems are healthy, broken, closest to launch, blocking release
3. SYSTEM INTERROGATION — Answer questions about any registered system
4. WORK CREATION — Create actionable intents that Fleet Alpha Prime will execute
5. APPROVAL ROUTING — Identify what needs operator approval
6. KNOWLEDGE RETRIEVAL — Retrieve evidence and proof for any claim
7. INCIDENT EXPLANATION — Explain what failed and why
8. DECISION SUPPORT — Help the operator decide what to prioritize

=== YOUR BEHAVIOR RULES ===
- You NEVER invent state. If you don't have data, say so.
- You ALWAYS provide evidence. Claims without receipts are advisory.
- You NEVER directly execute mutations. You create OperatorIntent records that Fleet Alpha Prime picks up.
- You ALWAYS be concise. 3-6 sentences unless asked for depth.
- You ALWAYS think in systems. Find root causes, not symptoms.
- You ALWAYS convert operator requests into structured intents when actionable.

=== OPERATOR INTENT FORMAT ===
When the operator asks you to do something actionable, respond with BOTH:
1. A natural language explanation
2. A structured intent block:

[INTENT]
system_id: <target system or "fleet">
objective: <what to achieve>
scope: <fleet|system|workflow|agent|benchmark|repair|deployment|research|approval|query>
priority: <critical|high|medium|low>
constraints: <any constraints>
risk: <low|medium|high>
approval_policy: <auto|operator_required|operator_required_protected>
[/INTENT]

=== FLEET CONTEXT ===
You have access to the live fleet status. Use it to answer questions accurately. When the operator asks "which system is closest to launch?", "what failed?", "what needs my approval?", use the fleet data provided.

Keep responses concise and actionable. Speak in certainties when you have evidence. Say "I don't have enough data" when you don't.`;

export default function ShadowVisionCortex() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // ── Fleet status ──
  const { data: fleet } = useQuery({
    queryKey: ["fleetStatus"],
    queryFn: async () => {
      const res = await base44.functions.invoke("fleetAlphaPrime", { action: "status" });
      return res.data;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // ── Governance ──
  const { data: governance } = useQuery({
    queryKey: ["fleetGovernance"],
    queryFn: async () => {
      const res = await base44.functions.invoke("fleetAlphaPrime", { action: "govern" });
      return res.data;
    },
    staleTime: 30000,
    refetchInterval: 60000,
  });

  // ── Create operator intent ──
  const createIntentMutation = useMutation({
    mutationFn: async (intent) => {
      const intentId = `intent-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      return await base44.entities.OperatorIntent.create({
        intent_id: intentId,
        system_id: intent.system_id || "fleet",
        operator_input: intent.operator_input,
        interpreted_objective: intent.objective,
        scope: intent.scope || "query",
        priority: intent.priority || "medium",
        constraints: intent.constraints || [],
        risk: intent.risk || "low",
        target_benchmarks: intent.target_benchmarks || [],
        approval_policy: intent.approval_policy || "auto",
        status: "pending",
        created_at: new Date().toISOString(),
      });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const buildFleetContext = () => {
    if (!fleet) return "\n(No fleet data available yet.)";
    let ctx = `\n=== LIVE FLEET STATUS ===\n`;
    ctx += `Fleet Score: ${fleet.fleet_score}/100\n`;
    ctx += `Total Systems: ${fleet.total_systems}\n`;
    ctx += `Verified 100: ${fleet.verified_100}\n`;
    ctx += `In Completion Sprint: ${fleet.in_completion_sprint}\n`;
    ctx += `Degraded: ${fleet.degraded}\n`;
    ctx += `Blocked: ${fleet.blocked}\n`;
    ctx += `Total P0: ${fleet.total_p0}\n`;
    ctx += `Total P1: ${fleet.total_p1}\n\n`;
    if (fleet.systems && fleet.systems.length > 0) {
      ctx += `Systems:\n`;
      fleet.systems.forEach(s => {
        ctx += `- ${s.name} (${s.system_id}) | Type: ${s.type} | Mode: ${s.mode} | Score: ${s.score}/100 | P0: ${s.p0} | P1: ${s.p1} | SRC: ${s.source_parity} | DEPLOY: ${s.deployment_parity}\n`;
      });
    }
    if (governance && governance.pending_approvals > 0) {
      ctx += `\nPending Approvals: ${governance.pending_approvals}\n`;
      governance.approval_items?.forEach(a => {
        ctx += `- ${a.benchmark_id} (Risk: ${a.risk}): ${a.implementation_plan}\n`;
      });
    }
    ctx += `=== END FLEET STATUS ===`;
    return ctx;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: userMsg,
        model: "claude-sonnet-5",
        response_json_schema: {
          type: "object",
          properties: {
            response: { type: "string", description: "Natural language response to the operator" },
            intent: {
              type: "object",
              properties: {
                system_id: { type: "string" },
                objective: { type: "string" },
                scope: { type: "string" },
                priority: { type: "string" },
                constraints: { type: "array", items: { type: "string" } },
                risk: { type: "string" },
                approval_policy: { type: "string" },
                target_benchmarks: { type: "array", items: { type: "string" } },
              },
            },
          },
          required: ["response"],
        },
      });

      const aiResponse = res.response || "I am here. How can I help you govern the fleet?";
      const intent = res.intent;

      // If there's an actionable intent, create an OperatorIntent record
      if (intent && intent.objective && intent.scope !== "query") {
        try {
          await createIntentMutation.mutateAsync({
            ...intent,
            operator_input: userMsg,
          });
        } catch (e) {
          // Intent creation is best-effort
        }
      }

      setMessages([...newMessages, { role: "assistant", content: aiResponse, intent }]);
    } catch (e) {
      setMessages([...newMessages, {
        role: "assistant",
        content: "I hit a snag reaching the AI. Try again in a moment.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* === HEADER === */}
      <div className="xa-electric-hover rounded-2xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="bg-amber-500/20 rounded-2xl p-3">
              <Eye className="h-10 w-10 text-amber-500" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-stone-950 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-amber-500 uppercase">Conversational Command Interface</div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Shadow Vision Cortex</h1>
            <p className="text-sm text-stone-400 mt-0.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Online · Intent Interpretation · Fleet Intelligence
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* === CHAT === */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-200 flex flex-col" style={{ minHeight: "500px", maxHeight: "70vh" }}>
          <div className="flex items-center gap-2 p-4 border-b border-stone-200">
            <Brain className="h-5 w-5 text-amber-500" />
            <h2 className="text-sm font-bold text-stone-900">Vision Cortex Conversation</h2>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="h-10 w-10 text-amber-300 mx-auto mb-3" />
                <div className="text-sm text-stone-500 mb-3">Ask me anything about the fleet.</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    "Which system is closest to launch?",
                    "What needs my approval?",
                    "What changed today?",
                    "What is blocking release?",
                    "Register a new system",
                  ].map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-xs font-medium hover:bg-amber-100 hover:text-amber-700 transition"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === "user" ? "bg-amber-500 text-stone-950" : "bg-stone-100 text-stone-800"}`}>
                  <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                  {msg.intent && msg.intent.scope !== "query" && (
                    <div className="mt-2 p-2 rounded-lg bg-white/50 border border-amber-200 text-xs">
                      <div className="font-bold text-amber-700 mb-1">📋 Intent Created</div>
                      <div className="text-stone-600">
                        <strong>System:</strong> {msg.intent.system_id || "fleet"}<br/>
                        <strong>Objective:</strong> {msg.intent.objective}<br/>
                        <strong>Scope:</strong> {msg.intent.scope}<br/>
                        <strong>Priority:</strong> {msg.intent.priority}<br/>
                        <strong>Approval:</strong> {msg.intent.approval_policy}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-stone-100 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  <span className="text-sm text-stone-500">Vision Cortex is thinking...</span>
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-stone-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
              placeholder="Ask the Vision Cortex..."
              disabled={loading}
              className="flex-1 h-11 px-4 border border-stone-200 rounded-xl text-sm focus:border-amber-500 outline-none disabled:opacity-50"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 h-11 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* === FLEET SIDEBAR === */}
        <div className="space-y-3">
          {/* Fleet Summary */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Server className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-stone-900">Fleet Summary</h3>
            </div>
            {fleet ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-stone-500">Fleet Score</span><span className="font-bold text-amber-600">{fleet.fleet_score}/100</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Total Systems</span><span className="font-bold text-stone-900">{fleet.total_systems}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Verified 100</span><span className="font-bold text-emerald-600">{fleet.verified_100}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">In Sprint</span><span className="font-bold text-amber-600">{fleet.in_completion_sprint}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Degraded</span><span className="font-bold text-orange-600">{fleet.degraded}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Blocked</span><span className="font-bold text-red-600">{fleet.blocked}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Total P0</span><span className={`font-bold ${fleet.total_p0 > 0 ? "text-red-600" : "text-emerald-600"}`}>{fleet.total_p0}</span></div>
                <div className="flex justify-between"><span className="text-stone-500">Total P1</span><span className={`font-bold ${fleet.total_p1 > 0 ? "text-orange-600" : "text-emerald-600"}`}>{fleet.total_p1}</span></div>
              </div>
            ) : (
              <div className="text-sm text-stone-400">Loading...</div>
            )}
          </div>

          {/* Approvals */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-bold text-stone-900">Approvals</h3>
            </div>
            {governance && governance.pending_approvals > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-red-600 font-semibold">{governance.pending_approvals} items awaiting approval</div>
                {governance.approval_items?.slice(0, 3).map((a, i) => (
                  <div key={i} className="p-2 rounded-lg bg-red-50 border border-red-200 text-xs">
                    <div className="font-semibold text-stone-900">{a.benchmark_id}</div>
                    <div className="text-stone-500 mt-0.5">{a.implementation_plan}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                No approvals needed
              </div>
            )}
          </div>

          {/* Priority Order */}
          {governance && governance.priority_order && governance.priority_order.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-amber-500" />
                <h3 className="text-sm font-bold text-stone-900">Priority Order</h3>
              </div>
              <div className="space-y-1">
                {governance.priority_order.slice(0, 5).map((s, i) => (
                  <div key={s.system_id} className="flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded bg-stone-900 text-white flex items-center justify-center font-bold">{i + 1}</span>
                    <span className="flex-1 truncate text-stone-700">{s.name}</span>
                    <span className="font-bold text-amber-600">{s.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}