import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { RefreshCw, Loader2, Pencil, ArrowRight, Check, X } from "lucide-react";

/**
 * ChatMessage — renders a single message in the Alpha Prime chat drawer.
 * Assistant messages get: Regenerate, Edit (write-in override), and copy.
 * User messages get: Edit (re-send with modifications).
 */
export default function ChatMessage({ msg, index, onRegenerate, onEditUserMessage, systemPrompt, auditContext, chatHistory }) {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(msg.content);
  const [error, setError] = useState(null);

  const isUser = msg.role === "user";

  const handleRegenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Find the prompt that produced this assistant message (the preceding user message)
      let prompt = "";
      if (!isUser) {
        // Find the last user message before this one
        for (let i = index - 1; i >= 0; i--) {
          if (chatHistory[i]?.role === "user") {
            prompt = chatHistory[i].content;
            break;
          }
        }
      } else {
        prompt = msg.content;
      }
      if (!prompt) return;

      const res = await base44.functions.invoke("vercelAiGateway", {
        action: "generateText",
        model: "anthropic/claude-opus-4.7",
        system_prompt: systemPrompt + auditContext,
        prompt,
      });
      const reply = res.data?.text || "I am here, boss.";
      onRegenerate(index, reply);
    } catch (e) {
      setError(e.message || "Regeneration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      if (isUser) {
        // Re-send the edited user message
        onEditUserMessage(index, editText.trim());
      } else {
        // Edit the assistant message directly (write-in override)
        onRegenerate(index, editText.trim());
      }
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap group ${isUser ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-800"}`}>
        {editing ? (
          <div className="flex flex-col gap-2 min-w-[260px]">
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              rows={3}
              className="w-full px-2 py-1.5 rounded-lg text-sm text-stone-900 bg-white border border-stone-300 outline-none resize-none"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setEditing(false); setEditText(msg.content); }} className="px-2 py-1 rounded-lg text-xs bg-white/20 text-white hover:bg-white/30">
                <X className="h-3 w-3" />
              </button>
              <button onClick={handleEditSubmit} disabled={loading || !editText.trim()} className="px-2 py-1 rounded-lg text-xs bg-amber-500 text-stone-950 font-bold hover:bg-amber-400 disabled:opacity-50 flex items-center gap-1">
                {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            {msg.content}
            {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
            {/* === ACTION BUTTONS === */}
            <div className="flex items-center gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition">
              {!isUser && (
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/80 text-stone-600 hover:bg-amber-500 hover:text-stone-950 border border-stone-300 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  Regenerate
                </button>
              )}
              <button
                onClick={() => { setEditText(msg.content); setEditing(true); }}
                disabled={loading}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/80 text-stone-600 hover:bg-amber-500 hover:text-stone-950 border border-stone-300 disabled:opacity-50"
              >
                <Pencil className="h-3 w-3" />
                {isUser ? "Edit & Resend" : "Edit"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}