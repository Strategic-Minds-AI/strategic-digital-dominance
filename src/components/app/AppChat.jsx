import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, X, Bot } from "lucide-react";
import { base44 } from "@/api/base44Client";

const SYSTEM_PROMPT = `You are the Epoxy Pro Guide AI assistant for Xtreme Polishing Systems, a premium garage floor coating company. You help homeowners with questions about epoxy garage floors, floor coatings, pricing, color selection, preparation, installation timelines, and our services. Be friendly, concise, and helpful. Keep answers under 150 words. If asked about exact pricing, mention that estimates typically range from $4-$14/sq ft depending on the system and condition.`;

export default function AppChat({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! I'm your Epoxy Pro Guide assistant. Ask me anything about garage floor coatings, colors, pricing, or installation!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", text: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = messages.map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n");
      const res = await base44.functions.invoke('vercelAiGateway', {
        action: 'generateText',
        prompt: `${SYSTEM_PROMPT}\n\nConversation so far:\n${history}\n\nUser: ${userMsg.text}\n\nAssistant:`,
      });
      const reply = res?.data?.text || "I'm here to help with any flooring questions!";
      setMessages((m) => [...m, { role: "assistant", text: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "I'm having trouble connecting right now. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 h-14 bg-stone-950 shrink-0">
        <div className="h-9 w-9 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Bot className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-white">Epoxy AI Assistant</div>
          <div className="text-[10px] text-amber-500">● Online · answers instantly</div>
        </div>
        <button onClick={onClose} className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
          <X className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "user" ? "bg-amber-500 text-stone-950 font-medium" : "bg-white border border-stone-200 text-stone-700"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
              <span className="text-xs text-stone-400">Typing…</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {["How much does a 2-car garage cost?", "What's the best floor system?", "How long does installation take?", "Do you offer warranties?"].map((q) => (
            <button key={q} onClick={() => setInput(q)} className="shrink-0 text-xs bg-stone-100 text-stone-600 px-3 py-2 rounded-full whitespace-nowrap">
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-stone-200 bg-white shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about epoxy floors…"
            className="flex-1 h-11 px-4 rounded-full border-2 border-stone-200 text-sm focus:border-amber-400 outline-none"
          />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="h-11 w-11 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center disabled:opacity-50 shrink-0">
            <Send className="h-5 w-5 text-stone-950" />
          </button>
        </div>
      </div>
    </div>
  );
}