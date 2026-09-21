import React, { useRef, useEffect } from 'react';
import { Bot, User } from 'lucide-react';

export default function ChatThread({ messages, loading }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-stone-400">
        Loading messages...
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-stone-400">
        No messages yet. Start the conversation!
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      {messages.map((msg) => {
        const isAgent = msg.sender_type === 'agent';
        return (
          <div key={msg.id} className={`flex gap-2.5 ${isAgent ? '' : 'flex-row-reverse'}`}>
            <div className={`h-8 w-8 rounded-full grid place-items-center shrink-0 ${
              isAgent ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {isAgent ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
              isAgent
                ? 'bg-white border border-stone-200'
                : 'bg-amber-500 text-white'
            }`}>
              <div className={`text-xs font-bold mb-0.5 ${isAgent ? 'text-amber-600' : 'text-amber-50'}`}>
                {msg.sender_name}
                {isAgent && <span className="ml-1.5 text-[10px] font-normal text-stone-400">AI Agent</span>}
              </div>
              <div className={`text-sm whitespace-pre-wrap ${isAgent ? 'text-stone-700' : 'text-white'}`}>
                {msg.content}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}