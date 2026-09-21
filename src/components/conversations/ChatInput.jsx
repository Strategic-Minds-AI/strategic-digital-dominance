import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export default function ChatInput({ onSend, agents, disabled }) {
  const [text, setText] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [sending, setSending] = useState(false);

  const agentMembers = (agents || []).filter((m) => m.member_type === 'agent');

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      await onSend(text.trim(), selectedAgent || null);
      setText('');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-stone-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2">
        {agentMembers.length > 0 && (
          <select
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            disabled={sending}
            className="h-10 rounded-xl border border-stone-200 px-3 text-sm text-stone-700 bg-white outline-none focus:border-amber-500 shrink-0"
          >
            <option value="">All Agents</option>
            {agentMembers.map((a) => (
              <option key={a.member_id} value={a.member_id}>
                @{a.member_name}
              </option>
            ))}
          </select>
        )}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || sending}
          placeholder={agentMembers.length === 0 ? 'Add agents to enable chat...' : 'Type a message...'}
          className="flex-1 h-10 rounded-xl border border-stone-200 px-4 text-sm text-stone-800 outline-none focus:border-amber-500 disabled:bg-stone-50"
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending || disabled}
          className="h-10 w-10 rounded-xl bg-amber-500 text-white grid place-items-center hover:bg-amber-600 transition disabled:opacity-40 shrink-0"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}