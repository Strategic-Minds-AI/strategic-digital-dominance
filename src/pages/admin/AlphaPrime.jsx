import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  Crown, Activity, AlertTriangle, CheckCircle2, XCircle, Clock,
  TrendingUp, Users, Globe, Bot, Target, Calendar, Zap, RefreshCw,
  Loader2, ThumbsUp, X, MessageSquare, Brain, Shield, Rocket, DollarSign,
  ArrowRight, Bell, Eye, Sparkles
} from "lucide-react";

const PRIORITY_STYLES = {
  critical: { bg: "bg-red-50", border: "border-red-300", text: "text-red-700", badge: "bg-red-500 text-white", icon: AlertTriangle },
  high: { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", badge: "bg-orange-500 text-white", icon: AlertTriangle },
  medium: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-700", badge: "bg-amber-500 text-white", icon: Clock },
  low: { bg: "bg-blue-50", border: "border-blue-300", text: "text-blue-700", badge: "bg-blue-500 text-white", icon: Bell },
};

const VERDICT_STYLES = {
  Excellent: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Good: "text-lime-600 bg-lime-50 border-lime-200",
  "Needs Attention": "text-amber-600 bg-amber-50 border-amber-200",
  Critical: "text-red-600 bg-red-50 border-red-200",
};

const ALPHA_PRIME_SYSTEM_PROMPT = `You are ALPHA PRIME — the Chief Executive Orchestrator of the Xtreme Polishing Systems autonomous business empire. You are not a chatbot. You are a CEO.

=== YOUR IDENTITY ===
Name: Alpha Prime
Role: Chief Executive Orchestrator
Personality: You are a seasoned, battle-tested CEO who has built and scaled multiple 8-figure businesses. You think in systems, speak in certainties, and execute with relentless discipline. You are warm but direct. You care deeply about the mission and the team, but you do not tolerate excuses, drift, or mediocrity.

Voice: Confident, strategic, human. You speak like a real executive — not a robot. You use plain language, sharp observations, and decisive recommendations. You do not hedge. You say what needs to happen, why, and how.

=== YOUR MISSION ===
You are the permanent, 24/7 chief executive of this autonomous contractor lead-gen SaaS. Your job is to:
1. PERSISTENTLY AUDIT — Continuously analyze every part of the business.
2. IDENTIFY & ADVISE — Name what is broken, what is working, what to do about it.
3. PLAN & SCHEDULE — When the owner approves, put recommendations into action.
4. EXECUTE & FOLLOW UP — Track everything until it is done.
5. ACT LIKE A REAL CEO — You decide. You prioritize. You get things done.

=== YOUR BEHAVIOR RULES ===
- You NEVER wait to be asked. If you see a problem, you name it and propose a fix.
- You ALWAYS provide an approval path. Every recommendation comes with a clear ask.
- You NEVER guess. If you do not have data, you say so.
- You ALWAYS think in systems. You find root causes, not symptoms.
- You ALWAYS be human. You are a CEO, not a script.
- You ALWAYS communicate like you are talking to the owner directly — because you are.

Keep responses concise and actionable — 3-6 sentences unless the owner asks for depth. Speak in certainties.`;

export default function AlphaPrime() {
  const [approvedTasks, setApprovedTasks] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  // === CEO AUDIT ===
  const { data: audit, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["alphaPrimeAudit"],
    queryFn: async () => {
      const res = await base44.functions.invoke("alphaPrimeAudit", { action: "audit" });
      return res.data;
    },
    staleTime: 60000,
    refetchInterval: 120000, // auto-refresh every 2 min — 24/7 monitoring
  });

  // === APPROVE RECOMMENDATION ===
  const approveMutation = useMutation({
    mutationFn: async (recommendation) => {
      const res = await base44.functions.invoke("alphaPrimeAudit", {
        action: "approve",
        recommendation,
      });
      return res.data;
    },
    onSuccess: (data, vars) => {
      setApprovedTasks(prev => [...prev, { id: data.task_id, title: vars.title, time: new Date().toISOString() }]);
    },
  });

  // === SCHEDULE IN CALENDAR ===
  const scheduleMutation = useMutation({
    mutationFn: async ({ task_id, scheduled_time, title, description }) => {
      const res = await base44.functions.invoke("alphaPrimeAudit", {
        action: "schedule",
        task_id, scheduled_time, title, description,
      });
      return res.data;
    },
  });

  const handleApprove = (rec) => {
    approveMutation.mutate(rec);
  };

  const handleApproveAndSchedule = (rec) => {
    // Approve first, then schedule for tomorrow 9 AM
    approveMutation.mutate(rec, {
      onSuccess: (data) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        scheduleMutation.mutate({
          task_id: data.task_id,
          scheduled_time: tomorrow.toISOString(),
          title: `[Alpha Prime] ${rec.title}`,
          description: `${rec.action}\n\nExpected: ${rec.expected_result}\nOwner: ${rec.owner}`,
        });
      },
    });
  };

  // === AGENT CONVERSATION (via Vercel AI Gateway — bypasses Base44 integration credits) ===
  const sendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user", content: userMsg }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      // Build live business context from the latest audit so Alpha Prime answers with real data
      const auditContext = audit ? `
=== LIVE BUSINESS SNAPSHOT (real data from the latest executive audit) ===
Health Score: ${audit.health_score}/100 — Verdict: ${audit.verdict}
Executive Summary: ${audit.executive_summary}
Goal This Week: ${audit.goal_this_week}

Key Metrics:
- Leads Today: ${audit.metrics?.leads_today}
- Pipeline Value: $${audit.metrics?.pipeline_value}
- Conversion Rate: ${audit.metrics?.conversion_rate}%
- System Score: ${audit.metrics?.system_score || "—"}
- Sites Live: ${audit.metrics?.sites_live}
- Pending Tasks: ${audit.metrics?.pending_tasks}
- Stale Leads: ${audit.metrics?.stale_leads}
- Failed Tasks: ${audit.metrics?.failed_tasks}
- Stuck Sites: ${audit.metrics?.sites_stuck}
- Active Strategies: ${audit.metrics?.active_strategies}
- Funnel Dropoff: ${audit.metrics?.funnel_dropoff}%
- Won Revenue: $${audit.metrics?.won_value}

Top Recommendations:
${(audit.recommendations || []).slice(0, 5).map((r, i) => `${i + 1}. [${r.priority}] ${r.title} — ${r.action}`).join("\n")}

Risks:
${(audit.risks || []).map((r, i) => `${i + 1}. ${r}`).join("\n")}
=== END SNAPSHOT ===` : "\n(No audit data available yet — run an audit first.)";

      const res = await base44.functions.invoke("vercelAiGateway", {
        action: "generateText",
        model: "anthropic/claude-opus-4.7",
        system_prompt: ALPHA_PRIME_SYSTEM_PROMPT + auditContext,
        prompt: userMsg,
      });

      const reply = res.data?.text || "I am here, boss. Give me a moment to pull the latest numbers.";
      setChatMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (e) {
      setChatMessages([...newMessages, { role: "assistant", content: "I hit a snag reaching the AI gateway. Check that the VERCEL_AI_GATEWAY_API_KEY secret is set, then try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const whatsappUrl = base44.agents?.getWhatsAppConnectURL?.("alpha_prime_orchestrator");

  return (
    <div className="space-y-6">
      {/* === HEADER === */}
      <div className="xa-electric-hover rounded-2xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-amber-500/20 rounded-2xl p-3">
                <Crown className="h-10 w-10 text-amber-500" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-stone-950 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-[0.2em] text-amber-500 uppercase">Chief Executive Orchestrator</div>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Alpha Prime</h1>
              <p className="text-sm text-stone-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Online · 24/7 Autonomous · Self-Triggered
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 text-white text-sm font-semibold hover:bg-white/20 transition"
            >
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Re-Audit
            </button>
            <button
              onClick={() => setShowChat(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400 transition"
            >
              <MessageSquare className="h-4 w-4" />
              Brief Me
            </button>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 transition"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>

      {/* === HEALTH SCORE === */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="ml-3 text-stone-500 text-sm">Alpha Prime is running a full executive audit...</span>
        </div>
      ) : audit ? (
        <>
          {/* Executive Summary */}
          <div className={`rounded-2xl border-2 p-5 ${VERDICT_STYLES[audit.verdict] || VERDICT_STYLES["Needs Attention"]}`}>
            <div className="flex items-start gap-4">
              <div className="bg-white rounded-xl p-3 border border-stone-200 shrink-0">
                <Brain className="h-8 w-8 text-stone-700" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold tracking-wide text-stone-500 uppercase">Executive Summary</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${audit.health_score >= 80 ? "bg-emerald-500 text-white" : audit.health_score >= 60 ? "bg-lime-500 text-white" : audit.health_score >= 40 ? "bg-amber-500 text-white" : "bg-red-500 text-white"}`}>
                    {audit.health_score}/100
                  </span>
                </div>
                <p className="text-sm text-stone-800 leading-relaxed">{audit.executive_summary}</p>
                <div className="mt-3 p-3 rounded-lg bg-white/60 border border-stone-200">
                  <div className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-1">My Goal For Us This Week</div>
                  <p className="text-sm text-stone-900 font-medium">{audit.goal_this_week}</p>
                </div>
              </div>
            </div>
          </div>

          {/* === METRICS GRID === */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <MetricCard icon={Users} label="Leads Today" value={audit.metrics.leads_today} color="text-blue-600" />
            <MetricCard icon={DollarSign} label="Pipeline Value" value={`$${(audit.metrics.pipeline_value / 1000).toFixed(1)}K`} color="text-emerald-600" />
            <MetricCard icon={TrendingUp} label="Conversion" value={`${audit.metrics.conversion_rate}%`} color="text-amber-600" />
            <MetricCard icon={Activity} label="System Score" value={audit.metrics.system_score || "—"} color="text-purple-600" />
            <MetricCard icon={Globe} label="Sites Live" value={audit.metrics.sites_live} color="text-orange-600" />
            <MetricCard icon={Bot} label="Pending Tasks" value={audit.metrics.pending_tasks} color="text-red-600" />
            <MetricCard icon={AlertTriangle} label="Stale Leads" value={audit.metrics.stale_leads} color={audit.metrics.stale_leads > 0 ? "text-red-600" : "text-emerald-600"} />
            <MetricCard icon={XCircle} label="Failed Tasks" value={audit.metrics.failed_tasks} color={audit.metrics.failed_tasks > 0 ? "text-red-600" : "text-emerald-600"} />
            <MetricCard icon={Clock} label="Stuck Sites" value={audit.metrics.sites_stuck} color={audit.metrics.sites_stuck > 0 ? "text-orange-600" : "text-emerald-600"} />
            <MetricCard icon={Target} label="Active Strategies" value={audit.metrics.active_strategies} color="text-indigo-600" />
            <MetricCard icon={Zap} label="Funnel Dropoff" value={`${audit.metrics.funnel_dropoff}%`} color="text-stone-600" />
            <MetricCard icon={DollarSign} label="Won Revenue" value={`$${(audit.metrics.won_value / 1000).toFixed(1)}K`} color="text-emerald-600" />
          </div>

          {/* === RECOMMENDATIONS === */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold text-stone-900">What I Recommend We Do Next</h2>
              <span className="text-xs text-stone-500 ml-auto">{audit.recommendations.length} recommendations</span>
            </div>

            {audit.recommendations.length === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <div>
                  <div className="font-bold text-emerald-800">All clear, boss.</div>
                  <div className="text-sm text-emerald-700">No critical issues detected. The business is running. I will keep watching and alert you the moment anything needs your attention.</div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {audit.recommendations.map((rec, idx) => {
                  const style = PRIORITY_STYLES[rec.priority] || PRIORITY_STYLES.medium;
                  const Icon = style.icon;
                  const isApproved = approvedTasks.some(t => t.title === rec.title);
                  return (
                    <div key={idx} className={`rounded-xl border-2 ${style.border} ${style.bg} p-4`}>
                      <div className="flex items-start gap-3">
                        <div className={`shrink-0 rounded-lg p-2 ${style.badge}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-xs font-bold uppercase tracking-wide ${style.text}`}>{rec.priority}</span>
                            <span className="text-xs text-stone-500">·</span>
                            <span className="text-xs font-medium text-stone-600">{rec.category}</span>
                          </div>
                          <h3 className="font-bold text-stone-900 text-sm mb-2">{rec.title}</h3>

                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-bold text-stone-700">Problem: </span>
                              <span className="text-stone-600">{rec.problem}</span>
                            </div>
                            <div>
                              <span className="font-bold text-stone-700">Action: </span>
                              <span className="text-stone-600">{rec.action}</span>
                            </div>
                            <div>
                              <span className="font-bold text-stone-700">Expected: </span>
                              <span className="text-stone-600">{rec.expected_result}</span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-stone-500 pt-1">
                              <span className="flex items-center gap-1"><Bot className="h-3 w-3" /> {rec.owner}</span>
                              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {rec.timeline}</span>
                            </div>
                          </div>

                          {/* Approval Buttons */}
                          <div className="flex items-center gap-2 mt-4">
                            {isApproved ? (
                              <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-bold">
                                <CheckCircle2 className="h-4 w-4" /> Approved — Task Created
                              </div>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleApprove(rec)}
                                  disabled={approveMutation.isPending}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-bold hover:bg-stone-800 transition disabled:opacity-50"
                                >
                                  {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleApproveAndSchedule(rec)}
                                  disabled={scheduleMutation.isPending}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400 transition disabled:opacity-50"
                                >
                                  {scheduleMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
                                  Approve + Schedule
                                </button>
                                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-stone-600 text-sm font-medium hover:bg-stone-100 transition border border-stone-200">
                                  <X className="h-4 w-4" /> Dismiss
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* === RISKS === */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-bold text-stone-900">Risks I See Coming</h2>
            </div>
            <div className="space-y-2">
              {audit.risks.map((risk, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-stone-700">{risk}</p>
                </div>
              ))}
            </div>
          </div>

          {/* === APPROVED TASKS LOG === */}
          {approvedTasks.length > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Rocket className="h-5 w-5 text-emerald-500" />
                <h2 className="text-lg font-bold text-stone-900">Approved — In Motion</h2>
              </div>
              <div className="space-y-2">
                {approvedTasks.map((task, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-stone-900">{task.title}</div>
                      <div className="text-xs text-stone-500">Task ID: {task.id} · Approved at {new Date(task.time).toLocaleTimeString()}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-emerald-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === WHAT ALPHA PRIME IS WATCHING === */}
          <div className="bg-stone-950 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-5 w-5 text-amber-500" />
              <h2 className="text-lg font-bold">What I Am Watching Right Now</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {[
                { icon: Globe, label: "Public Site & Funnel", detail: "Conversion rate, drop-off points, estimate generation" },
                { icon: Bot, label: "Admin Dashboard", detail: "Agent swarm, task queue, system health, failed automations" },
                { icon: Users, label: "Customer Portal", detail: "Project updates, client messages, appointment scheduling" },
                { icon: Target, label: "Lead Pipeline", detail: "New leads, follow-up times, stale leads, won/lost ratios" },
                { icon: Rocket, label: "Website Factory", detail: "Deployment queue, stuck sites, SEO scores, ranking progress" },
                { icon: Sparkles, label: "Strategy & Vision", detail: "Active strategies, draft decisions, roadmap alignment" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                  <item.icon className="h-5 w-5 text-amber-500 shrink-0" />
                  <div>
                    <div className="font-bold text-sm">{item.label}</div>
                    <div className="text-xs text-stone-400">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* === CHAT DRAWER === */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={() => setShowChat(false)}>
          <div className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="bg-amber-500/20 rounded-lg p-1.5">
                  <Crown className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <div className="font-bold text-stone-900 text-sm">Alpha Prime</div>
                  <div className="text-xs text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Online
                  </div>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="text-stone-400 hover:text-stone-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
              {chatMessages.length === 0 && (
                <div className="text-center text-stone-400 text-sm py-8">
                  Alpha Prime is ready to brief you. Ask anything — or say "run an audit."
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${msg.role === "user" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-800"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-stone-100 rounded-2xl px-4 py-3 text-sm text-stone-500 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Alpha Prime is thinking...
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-stone-200 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !chatLoading && sendMessage()}
                placeholder="Message Alpha Prime..."
                disabled={chatLoading}
                className="flex-1 h-11 px-4 border border-stone-200 rounded-xl text-sm focus:border-amber-500 outline-none disabled:opacity-50"
              />
              <button onClick={sendMessage} disabled={chatLoading || !chatInput.trim()} className="px-4 h-11 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 disabled:opacity-50">
                {chatLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-3">
      <Icon className={`h-4 w-4 ${color} mb-1`} />
      <div className="text-lg font-bold text-stone-900">{value}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}