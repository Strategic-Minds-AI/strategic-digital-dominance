import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bot, Users, Plus, X, Loader2, ArrowLeft } from 'lucide-react';
import ConversationSidebar from '@/components/conversations/ConversationSidebar';
import ChatThread from '@/components/conversations/ChatThread';
import ChatInput from '@/components/conversations/ChatInput';

export default function Conversations() {
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [addingAgents, setAddingAgents] = useState(false);
  const queryClient = useQueryClient();

  // Load conversations
  const { data: convsData, isLoading: loadingConvs } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => base44.functions.invoke('conversationHub', { action: 'list_conversations' }),
  });
  const conversations = convsData?.data?.conversations || [];

  // Load messages when active conversation changes
  const loadMessages = useCallback(async (convId) => {
    setLoadingMsgs(true);
    try {
      const res = await base44.functions.invoke('conversationHub', {
        action: 'get_messages',
        conversation_id: convId,
      });
      setMessages(res.data?.messages || []);
    } catch (e) {
      setMessages([]);
    }
    setLoadingMsgs(false);
  }, []);

  useEffect(() => {
    if (activeConv) loadMessages(activeConv.id);
    else setMessages([]);
  }, [activeConv, loadMessages]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!activeConv) return;
    const unsubscribe = base44.entities.ConversationMessage.subscribe((event) => {
      if (event.data?.conversation_id === activeConv.id) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === event.data.id)) return prev;
          return [...prev, event.data];
        });
      }
    });
    return unsubscribe;
  }, [activeConv]);

  // Create conversation
  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await base44.functions.invoke('conversationHub', {
        action: 'create_conversation',
        name: newName.trim(),
      });
      const conv = res.data?.conversation;
      setShowNewModal(false);
      setNewName('');
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (conv) setActiveConv(conv);
    } catch (e) {
      console.error(e);
    }
    setCreating(false);
  };

  // Send message
  const handleSend = async (content, mentionedAgentId) => {
    const res = await base44.functions.invoke('conversationHub', {
      action: 'send_message',
      conversation_id: activeConv.id,
      content,
      mentioned_agent_id: mentionedAgentId,
    });
    // Add user message + agent responses to the list
    const data = res.data;
    if (data?.message) {
      setMessages((prev) => {
        if (prev.find((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
    }
    if (data?.agent_responses) {
      for (const ar of data.agent_responses) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === ar.id)) return prev;
          return [...prev, ar];
        });
      }
    }
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
  };

  // Add all agents to conversation
  const handleAddAgents = async () => {
    if (!activeConv) return;
    setAddingAgents(true);
    try {
      await base44.functions.invoke('conversationHub', {
        action: 'add_my_agents',
        conversation_id: activeConv.id,
      });
      // Refresh conversation to get updated members
      const res = await base44.functions.invoke('conversationHub', {
        action: 'get_conversation',
        conversation_id: activeConv.id,
      });
      setActiveConv(res.data?.conversation || activeConv);
    } catch (e) {
      console.error(e);
    }
    setAddingAgents(false);
  };

  const memberAgents = (activeConv?.members || []).filter((m) => m.member_type === 'agent');

  return (
    <div className="h-screen flex flex-col bg-stone-50">
      {/* Header */}
      <div className="border-b border-stone-200 bg-white px-6 py-3 flex items-center gap-3">
        <a href="/" className="text-stone-400 hover:text-stone-600">
          <ArrowLeft className="h-5 w-5" />
        </a>
        <h1 className="text-lg font-black text-stone-900">X1 AI Hub — Conversations</h1>
      </div>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <ConversationSidebar
          conversations={conversations}
          activeConv={activeConv}
          onSelect={setActiveConv}
          onNew={() => setShowNewModal(true)}
          loading={loadingConvs}
        />

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeConv ? (
            <>
              {/* Chat header */}
              <div className="border-b border-stone-200 bg-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-stone-400">#</span>
                  <h2 className="text-base font-bold text-stone-800 truncate">{activeConv.name}</h2>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Users className="h-3.5 w-3.5" />
                    {(activeConv.members || []).length} members
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <Bot className="h-3.5 w-3.5" />
                    {memberAgents.length} agents
                  </div>
                  <button
                    onClick={handleAddAgents}
                    disabled={addingAgents}
                    className="flex items-center gap-1.5 rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-200 transition disabled:opacity-50"
                  >
                    {addingAgents ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    Add Agents
                  </button>
                </div>
              </div>

              {/* Messages */}
              <ChatThread messages={messages} loading={loadingMsgs} />

              {/* Input */}
              <ChatInput
                onSend={handleSend}
                agents={activeConv.members}
                disabled={memberAgents.length === 0}
              />
              {memberAgents.length === 0 && (
                <div className="text-center text-xs text-stone-400 py-2 bg-stone-50 border-t border-stone-200">
                  Click "Add Agents" to bring AI agents into this conversation.
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-stone-400">
              <div className="text-center">
                <Bot className="h-12 w-12 mx-auto mb-3 text-stone-300" />
                <p className="text-sm font-medium">Select a conversation or create a new one</p>
                <p className="text-xs mt-1">Users and AI agents chat together in shared channels</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50" onClick={() => setShowNewModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-900">New Conversation</h3>
              <button onClick={() => setShowNewModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Channel name (e.g. Marketing Strategy)"
              className="w-full h-11 rounded-xl border border-stone-200 px-4 text-sm outline-none focus:border-amber-500 mb-4"
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={!newName.trim() || creating}
              className="w-full h-11 rounded-xl bg-amber-500 text-white font-bold text-sm hover:bg-amber-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              Create Conversation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}