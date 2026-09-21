import React from 'react';
import { Plus, Hash, MessageSquare } from 'lucide-react';

export default function ConversationSidebar({ conversations, activeConv, onSelect, onNew, loading }) {
  return (
    <div className="w-72 border-r border-stone-200 bg-stone-50 flex flex-col h-full shrink-0">
      <div className="p-4 border-b border-stone-200">
        <button
          onClick={onNew}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-600 transition shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Conversation
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <div className="text-center text-sm text-stone-400 py-8">Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-sm text-stone-400 py-8 px-4">
            No conversations yet. Create one to get started.
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={`w-full text-left rounded-lg px-3 py-2.5 mb-1 transition ${
                activeConv?.id === conv.id
                  ? 'bg-amber-100 border border-amber-300'
                  : 'hover:bg-stone-100 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 mb-0.5">
                {conv.type === 'group' ? (
                  <Hash className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                ) : (
                  <MessageSquare className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                )}
                <span className="text-sm font-bold text-stone-800 truncate">{conv.name}</span>
              </div>
              <div className="text-xs text-stone-500 truncate pl-5.5">
                {conv.last_message_preview || 'No messages yet'}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}