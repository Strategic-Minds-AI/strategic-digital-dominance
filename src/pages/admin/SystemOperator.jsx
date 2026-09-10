import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import ReactMarkdown from "react-markdown";
import {
  Bot, Send, Plus, MessageSquare, Loader2, Sparkles, Zap,
  ChevronRight, Trash2, RefreshCw, Cpu, Network
} from "lucide-react";

const AGENT_NAME = "system_operator";

const SUGGESTIONS = [
  { icon: Zap, label: "Run a full swarm autonomous cycle", prompt: "Run a full autonomous swarm cycle now — audit the entire platform, fix any issues found, heal failed tasks, harden security, and optimize for AI search. Give me a summary of everything that was done." },
  { icon: Network, label: "Delegate work to swarm agents", prompt: "Show me the current swarm status — how many pending tasks, what each agent is working on, and what needs attention. Then dispatch any high-priority pending tasks." },
  { icon: Sparkles, label: "Mass-produce 5 new city sites", prompt: "I want to deploy 5 new city websites. Suggest 5 cities we don't have yet, create WebsiteTemplate records for each with rebranded configs, and generate SEO pages for them." },
  { icon: Cpu, label: "Give me a full system status report", prompt: "Give me a complete system status report: total leads, pipeline value, active projects, deployed sites, pending swarm tasks, social posts, SEO pages, and any critical issues that need my attention." },
];

function ToolCallDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const status = toolCall.status || "pending";
  const isFailed = status === "failed" || status === "error";
  const isRunning = ["pending", "running", "in_progress"].includes(status);
  const hideDetails = toolCall.display_projection?.hide_details && toolCall.display_projection?.details_redacted;

  let results = null;
  try {
    results = typeof toolCall.results === "string" ? JSON.parse(toolCall.results) : toolCall.results;
  } catch {
    results = toolCall.results;
  }

  let args = null;
  try {
    args = typeof toolCall.arguments_string === "string" ? JSON.parse(toolCall.arguments_string) : toolCall.arguments_string;
  } catch {
    args = toolCall.arguments_string;
  }

  const label = toolCall.display_projection?.label || toolCall.name || "tool_call";
  const activeLabel = toolCall.display_projection?.active_label || label;
  const errorLabel = toolCall.display_projection?.error_label || label;

  const displayLabel = hideDetails
    ? (isFailed ? errorLabel : isRunning ? activeLabel : label)
    : label;

  return (
    <div className="mt-2 text-xs border border-stone-200 rounded-lg overflow-hidden">
      <button
        onClick={() => !hideDetails && setExpanded(!expanded)}
        className={`w-full flex items-center gap-2 px-3 py-2 text-left ${isFailed ? "bg-red-50" : isRunning ? "bg-amber-50" : "bg-stone-50"}`}
      >
        {isRunning ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500 shrink-0" />
        ) : isFailed ? (
          <span className="text-red-500 shrink-0">✕</span>
        ) : (
          <span className="text-emerald-500 shrink-0">✓</span>
        )}
        <span className="font-mono font-semibold text-stone-700 truncate flex-1">{displayLabel}</span>
        {!hideDetails && (
          <ChevronRight className={`h-3.5 w-3.5 text-stone-400 shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
        )}
      </button>
      {expanded && !hideDetails && (
        <div className="px-3 py-2 space-y-2 bg-white">
          {args && (
            <div>
              <div className="text-[10px] font-bold uppercase text-stone-400 mb-1">Parameters</div>
              <pre className="text-[11px] text-stone-600 font-mono whitespace-pre-wrap break-all max-h-40 overflow-y-auto">{JSON.stringify(args, null, 2)}</pre>
            </div>
          )}
          {results && (
            <div>
              <div className="text-[10px] font-bold uppercase text-stone-400 mb-1">Result</div>
              <pre className={`text-[11px] font-mono whitespace-pre-wrap break-all max-h-40 overflow-y-auto ${isFailed ? "text-red-600" : "text-stone-600"}`}>{JSON.stringify(results, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? "order-2" : ""}`}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 grid place-items-center">
              <Bot className="h-3 w-3 text-stone-950" />
            </div>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">System Operator</span>
          </div>
        )}
        <div className={`rounded-2xl px-4 py-3 ${isUser ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-800"}`}>
          {message.content && (
            isUser ? (
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-2 prose-code:text-amber-600 prose-code:bg-amber-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            )
          )}
          {message.tool_calls?.map((tc, i) => (
            <ToolCallDisplay key={i} toolCall={tc} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SystemOperator() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      setConversations(list || []);
      if (list && list.length > 0 && !activeConv) {
        setActiveConv(list[0]);
      }
    } catch (e) {
      console.error("Failed to load conversations:", e);
    }
    setLoading(false);
  }, [activeConv]);

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (!activeConv) { setMessages([]); return; }
    setMessages(activeConv.messages || []);
    const unsub = base44.agents.subscribeToConversation(activeConv.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [activeConv?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const newConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: `System Operation — ${new Date().toLocaleString()}`, description: "System Operator session" },
      });
      setConversations([conv, ...conversations]);
      setActiveConv(conv);
      setMessages([]);
      inputRef.current?.focus();
    } catch (e) {
      console.error("Failed to create conversation:", e);
    }
  };

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || sending) return;
    if (!activeConv) {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: { name: content.slice(0, 50), description: "System Operator session" },
      });
      setConversations([conv, ...conversations]);
      setActiveConv(conv);
      await base44.agents.addMessage(conv, { role: "user", content });
      setInput("");
      return;
    }
    setSending(true);
    setInput("");
    try {
      await base44.agents.addMessage(activeConv, { role: "user", content });
    } catch (e) {
      console.error("Failed to send message:", e);
    }
    setSending(false);
  };

  const deleteConversation = async (conv) => {
    try {
      await base44.agents.updateConversation(conv.id, { metadata: { ...conv.metadata, deleted: true } });
      const updated = conversations.filter((c) => c.id !== conv.id);
      setConversations(updated);
      if (activeConv?.id === conv.id) {
        setActiveConv(updated[0] || null);
      }
    } catch (e) {
      console.error("Failed to delete conversation:", e);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-64 border-r border-stone-200 bg-stone-50 flex flex-col shrink-0">
          <div className="p-3 border-b border-stone-200">
            <button
              onClick={newConversation}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-stone-900 text-white text-sm font-bold py-2.5 hover:bg-amber-500 hover:text-stone-950 transition"
            >
              <Plus className="h-4 w-4" /> New Session
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-stone-400" /></div>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-8">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition ${activeConv?.id === conv.id ? "bg-amber-100 border border-amber-300" : "hover:bg-stone-100"}`}
                  onClick={() => setActiveConv(conv)}
                >
                  <MessageSquare className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                  <span className="text-xs font-medium text-stone-700 truncate flex-1">{conv.metadata?.name || "Untitled"}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteConversation(conv); }}
                    className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-stone-200">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 grid place-items-center shrink-0">
                <Bot className="h-3.5 w-3.5 text-stone-950" />
              </div>
              <div>
                <div className="font-bold text-stone-700">System Operator</div>
                <div className="text-[10px] text-stone-400">Full platform control</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-200 bg-white">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-1.5 rounded-lg hover:bg-stone-100 transition"
          >
            <MessageSquare className="h-4 w-4 text-stone-500" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 grid place-items-center">
              <Bot className="h-5 w-5 text-stone-950" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-stone-900">System Operator</h1>
              <p className="text-[10px] text-stone-400">Full operational control — entities, functions, swarm delegation</p>
            </div>
          </div>
          <button
            onClick={() => loadConversations()}
            className="ml-auto p-1.5 rounded-lg hover:bg-stone-100 transition"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-stone-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 bg-stone-50">
          {messages.length === 0 && !sending ? (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-4">
                  <Bot className="h-8 w-8 text-stone-950" />
                </div>
                <h2 className="text-xl font-bold text-stone-900">System Operator</h2>
                <p className="text-sm text-stone-500 mt-1">Your AI command center for the entire platform. Ask me to operate any part of the system — leads, websites, SEO, social, comms, or the autonomous swarm.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s.prompt)}
                    className="flex items-start gap-3 rounded-xl border border-stone-200 bg-white p-4 text-left hover:border-amber-400 hover:shadow-sm transition"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 grid place-items-center shrink-0">
                      <s.icon className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-stone-900">{s.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {sending && (
                <div className="flex justify-start mb-4">
                  <div className="flex items-center gap-2 rounded-2xl bg-white border border-stone-200 px-4 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                    <span className="text-sm text-stone-400">Operating...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-stone-200 bg-white p-4">
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Tell the System Operator what to do... (e.g. 'Deploy 3 new city sites and start their SEO', 'Show me all stale leads and follow up with them', 'Run a full swarm cycle')"
              rows={2}
              className="flex-1 rounded-xl border border-stone-200 px-4 py-3 text-sm resize-none focus:border-amber-500 outline-none"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              className="h-11 w-11 rounded-xl bg-stone-900 text-white grid place-items-center hover:bg-amber-500 hover:text-stone-950 transition disabled:opacity-40 shrink-0"
            >
              {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}