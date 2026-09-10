import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, X, Send, Loader2, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { XTREME_AI_ICON_URL } from "@/components/Logo";

export default function PortalAIChat({ project }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your Xtreme AI assistant. Ask me anything about your floor project, warranty, maintenance, or scheduling.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const context = project
        ? `Customer portal chat. Project: ${project.floor_system || "Epoxy"}, ${project.square_footage || ""} sq ft, status: ${project.status || "scheduled"}, color: ${project.flake_color_name || "N/A"}. `
        : `Customer portal chat (no project found). `;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${context}Customer question: ${userMsg}\n\nProvide a helpful, concise answer about epoxy garage floors, decorative concrete, polished concrete, maintenance, warranties, or scheduling. Keep it under 150 words and friendly.`,
      });
      const reply = typeof res === "string" ? res : res?.response || res?.content || "I'm here to help! Could you rephrase that?";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't process that right now. Please call us at 1-833-484-3799." }]);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl shadow-amber-500/40 flex items-center justify-center hover:scale-110 transition-transform"
          aria-label="Open AI chat"
        >
          <MessageCircle className="h-7 w-7 text-stone-950" />
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white shadow-2xl border border-stone-200 flex flex-col" style={{ height: 480 }}>
          {/* Header */}
          <div className="bg-stone-950 rounded-t-2xl p-4 flex items-center gap-3">
            <img src={XTREME_AI_ICON_URL} alt="Xtreme AI" className="w-9 h-9 rounded-lg object-contain" />
            <div className="flex-1">
              <div className="text-white font-bold text-sm flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Xtreme AI Assistant
              </div>
              <div className="text-stone-400 text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" /> Online now
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    msg.role === "user"
                      ? "bg-amber-500 text-stone-950"
                      : "bg-white border border-stone-200 text-stone-800"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-200 rounded-2xl px-3.5 py-2.5 text-sm text-stone-400 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-stone-200 p-3 flex gap-2 bg-white rounded-b-2xl">
            <Input
              placeholder="Ask about your project..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              className="h-10"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-lg bg-stone-950 text-white flex items-center justify-center disabled:opacity-50 hover:bg-stone-800"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}