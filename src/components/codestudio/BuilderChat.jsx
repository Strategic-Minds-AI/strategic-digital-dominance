import React, { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { uploadFile } from "@/lib/gateway";
import ReactMarkdown from "react-markdown";
import { Bot, Send, Plus, Loader2, Paperclip, X } from "lucide-react";

const AGENT_NAME = "system_operator";

function ToolCallDisplay({ toolCall }) {
  const [expanded, setExpanded] = useState(false);
  const status = toolCall.status || "pending";
  const isFailed = status === "failed" || status === "error";
  const isRunning = ["pending", "running", "in_progress"].includes(status);
  const label = toolCall.display_projection?.label || toolCall.name || "tool_call";

  let results = null, args = null;
  try { results = typeof toolCall.results === "string" ? JSON.parse(toolCall.results) : toolCall.results; } catch { results = toolCall.results; }
  try { args = typeof toolCall.arguments_string === "string" ? JSON.parse(toolCall.arguments_string) : toolCall.arguments_string; } catch { args = toolCall.arguments_string; }

  return (
    <div className="mt-1.5 text-xs border border-stone-200 rounded-lg overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className={`w-full flex items-center gap-1.5 px-2.5 py-1.5 text-left ${isFailed ? "bg-red-50" : isRunning ? "bg-amber-50" : "bg-stone-50"}`}>
        {isRunning ? <Loader2 className="h-3 w-3 animate-spin text-amber-500 shrink-0" /> : isFailed ? <span className="text-red-500 shrink-0">✕</span> : <span className="text-emerald-500 shrink-0">✓</span>}
        <span className="font-mono font-semibold text-stone-600 truncate flex-1 text-[11px]">{label}</span>
      </button>
      {expanded && (
        <div className="px-2.5 py-2 space-y-1.5 bg-white">
          {args && <pre className="text-[10px] text-stone-500 font-mono whitespace-pre-wrap break-all max-h-32 overflow-y-auto">{JSON.stringify(args, null, 2)}</pre>}
          {results && <pre className={`text-[10px] font-mono whitespace-pre-wrap break-all max-h-32 overflow-y-auto ${isFailed ? "text-red-600" : "text-stone-500"}`}>{JSON.stringify(results, null, 2)}</pre>}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[90%] ${isUser ? "order-2" : ""}`}>
        {!isUser && (
          <div className="flex items-center gap-1 mb-0.5">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 grid place-items-center"><Bot className="h-2.5 w-2.5 text-stone-950" /></div>
            <span className="text-[9px] font-bold text-stone-400 uppercase">Operator</span>
          </div>
        )}
        <div className={`rounded-xl px-3 py-2 text-sm ${isUser ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-800"}`}>
          {message.content && (isUser ? <p className="whitespace-pre-wrap text-[13px]">{message.content}</p> : <div className="text-[13px] prose prose-sm max-w-none prose-p:my-0.5 prose-ul:my-0.5 prose-li:my-0"><ReactMarkdown>{message.content}</ReactMarkdown></div>)}
          {message.tool_calls?.map((tc, i) => <ToolCallDisplay key={i} toolCall={tc} />)}
        </div>
      </div>
    </div>
  );
}

export default function BuilderChat({ onFileAttached }) {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const loadConversations = useCallback(async () => {
    try {
      const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      setConversations(list || []);
      if (list && list.length > 0 && !activeConv) setActiveConv(list[0]);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadConversations(); }, []);

  useEffect(() => {
    if (!activeConv) { setMessages([]); return; }
    setMessages(activeConv.messages || []);
    try {
      const unsub = base44.agents.subscribeToConversation(activeConv.id, (data) => setMessages(data.messages || []));
      return () => { try { unsub?.(); } catch {} };
    } catch (e) {
      console.error("subscribeToConversation error:", e);
    }
  }, [activeConv?.id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await uploadFile(file);
      setAttachments([...attachments, { name: file.name, url: file_url }]);
      onFileAttached?.(file_url);
    } catch (e) { console.error(e); }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async (text) => {
    const content = text || input.trim();
    if (!content || sending) return;
    let conv = activeConv;
    try {
      if (!conv) {
        conv = await base44.agents.createConversation({ agent_name: AGENT_NAME, metadata: { name: content.slice(0, 50), description: "Code Studio session" } });
        setConversations([conv, ...conversations]);
        setActiveConv(conv);
      }
      const fullContent = attachments.length > 0 ? `${content}\n\nAttached files:\n${attachments.map(a => `- [${a.name}](${a.url})`).join('\n')}` : content;
      setSending(true);
      setInput("");
      setAttachments([]);
      await base44.agents.addMessage(conv, { role: "user", content: fullContent });
    } catch (e) {
      console.error("sendMessage error:", e);
      setError(e.message || "Failed to send message");
    }
    setSending(false);
  };

  const newConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({ agent_name: AGENT_NAME, metadata: { name: `Code Studio — ${new Date().toLocaleTimeString()}`, description: "Code Studio session" } });
      setConversations([conv, ...conversations]);
      setActiveConv(conv);
      setMessages([]);
      inputRef.current?.focus();
    } catch (e) {
      console.error("newConversation error:", e);
      setError(e.message || "Failed to create conversation");
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-50">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-stone-200 bg-white shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 grid place-items-center shrink-0"><Bot className="h-4 w-4 text-stone-950" /></div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-stone-900">AI Builder Agent</div>
          <div className="text-[10px] text-stone-400">System Operator — full platform control</div>
        </div>
        <button onClick={newConversation} className="text-xs font-bold text-amber-600 hover:text-amber-700 shrink-0">+ New</button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-3 mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 flex items-center justify-between shrink-0">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {messages.length === 0 && !sending ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-3"><Bot className="h-7 w-7 text-stone-950" /></div>
            <p className="text-sm font-bold text-stone-900">What would you like to build?</p>
            <p className="text-xs text-stone-400 mt-1">Ask the agent to create pages, inject code, or manage the platform.</p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}
            {sending && <div className="flex items-center gap-2 rounded-xl bg-white border border-stone-200 px-3 py-2 w-fit"><Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" /><span className="text-xs text-stone-400">Building...</span></div>}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="px-3 pb-1 flex flex-wrap gap-1">
          {attachments.map((a, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] text-amber-700">
              <Paperclip className="h-2.5 w-2.5" /> {a.name}
              <button onClick={() => setAttachments(attachments.filter((_, j) => j !== i))} className="ml-0.5"><X className="h-2.5 w-2.5" /></button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-stone-200 bg-white p-2.5 shrink-0">
        <div className="flex items-end gap-1.5">
          <input ref={fileInputRef} type="file" onChange={handleUpload} className="hidden" accept="image/*,.json,.txt,.md,.css,.js,.html" />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="h-9 w-9 rounded-lg border border-stone-200 grid place-items-center text-stone-500 hover:border-amber-400 hover:text-amber-600 transition shrink-0 disabled:opacity-50">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="Build something..."
            rows={1}
            className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm resize-none focus:border-amber-500 outline-none max-h-32"
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || sending} className="h-9 w-9 rounded-lg bg-stone-900 text-white grid place-items-center hover:bg-amber-500 hover:text-stone-950 transition disabled:opacity-40 shrink-0">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}