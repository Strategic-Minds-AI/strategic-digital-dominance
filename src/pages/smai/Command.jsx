import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import { Bot, Loader2, Menu, MessageSquare, Plus, Send, Sparkles, Trash2, Workflow, X } from 'lucide-react';

const AGENT = 'system_operator';
const starters = [
  ['Inspect the system', 'Give me a current system status report. Separate verified facts, failures, pending work, and the highest-value safe next action.'],
  ['Run parallel work', 'Inspect the active swarm queue and delegate eligible independent work in parallel. Do not execute protected production actions.'],
  ['Audit Digital Dominance', 'Audit Digital Dominance for failed or stale work, recurring false positives, and blocked tasks. Return the smallest repair queue.'],
  ['Research with agents', 'Create a research mission, split it into specialist lanes, collect evidence, and summarize the combined result with sources and uncertainty.'],
];

function Bubble({ message }) {
  const user = message.role === 'user';
  return <div className="mx-auto max-w-3xl px-5 py-4">{user ? <div className="ml-auto max-w-[85%] rounded-3xl bg-[#303030] px-5 py-3.5 text-[15px] leading-7 whitespace-pre-wrap">{message.content}</div> : <div className="flex gap-4"><div className="mt-1 h-7 w-7 shrink-0 rounded-full bg-white grid place-items-center"><Sparkles className="h-4 w-4 text-black" /></div><div className="min-w-0 flex-1 prose prose-invert prose-sm max-w-none prose-p:my-2 prose-code:text-cyan-300"><ReactMarkdown>{message.content || ''}</ReactMarkdown>{message.tool_calls?.length > 0 && <div className="mt-4 rounded-xl border border-white/10 bg-[#191919] p-3 font-mono text-[11px] text-zinc-500">{message.tool_calls.length} tool call{message.tool_calls.length === 1 ? '' : 's'} · inspect full details in Admin</div>}</div></div>}</div>;
}

export default function Command() {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sidebar, setSidebar] = useState(true);
  const endRef = useRef(null);

  async function load() {
    const list = (await base44.agents.listConversations({ agent_name: AGENT })) || [];
    const visible = list.filter((item) => !item.metadata?.deleted);
    setConversations(visible);
    setActive((current) => current || visible[0] || null);
  }
  useEffect(() => { load().catch(console.error); }, []);
  useEffect(() => {
    if (!active) { setMessages([]); return undefined; }
    setMessages(active.messages || []);
    return base44.agents.subscribeToConversation(active.id, (data) => setMessages(data.messages || []));
  }, [active?.id]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, sending]);

  async function newChat(seed = '') {
    const conv = await base44.agents.createConversation({ agent_name: AGENT, metadata: { name: seed ? seed.slice(0, 48) : 'New command', description: 'Strategic Minds AI Command session' } });
    setConversations((rows) => [conv, ...rows]); setActive(conv); setMessages([]); return conv;
  }
  async function send(seed) {
    const content = (seed ?? input).trim(); if (!content || sending) return;
    setSending(true); setInput('');
    try { const target = active || await newChat(content); await base44.agents.addMessage(target, { role: 'user', content }); }
    finally { setSending(false); }
  }
  async function remove(event, conv) {
    event.stopPropagation(); await base44.agents.updateConversation(conv.id, { metadata: { ...conv.metadata, deleted: true } });
    const next = conversations.filter((item) => item.id !== conv.id); setConversations(next); if (active?.id === conv.id) setActive(next[0] || null);
  }

  return <div className="h-screen overflow-hidden bg-[#212121] text-zinc-100 flex">
    {sidebar && <aside className="w-[260px] shrink-0 bg-[#171717] border-r border-white/[.06] flex flex-col">
      <div className="h-14 px-3 flex items-center gap-2"><a href="/smai" className="flex items-center gap-2 font-semibold text-sm"><div className="h-8 w-8 rounded-lg border border-cyan-300/20 bg-cyan-300/10 grid place-items-center"><Sparkles className="h-4 w-4 text-cyan-300" /></div>Strategic Minds AI</a><button onClick={() => setSidebar(false)} className="ml-auto p-2"><X className="h-4 w-4 text-zinc-500" /></button></div>
      <div className="px-2"><button onClick={() => newChat()} className="w-full rounded-lg px-3 py-2.5 hover:bg-white/5 flex items-center gap-3 text-sm"><Plus className="h-4 w-4" /> New chat</button><a href="/smai/ops" className="w-full rounded-lg px-3 py-2.5 hover:bg-white/5 flex items-center gap-3 text-sm"><Workflow className="h-4 w-4" /> Agent operations</a></div>
      <div className="px-3 pt-5 pb-2 text-[11px] text-zinc-500">Chats</div><div className="flex-1 overflow-y-auto px-2">{conversations.map((conv) => <button key={conv.id} onClick={() => setActive(conv)} className={`group w-full rounded-lg px-3 py-2.5 flex items-center gap-2 text-left text-sm ${active?.id === conv.id ? 'bg-[#2f2f2f]' : 'hover:bg-white/[.045]'}`}><MessageSquare className="h-3.5 w-3.5 text-zinc-500" /><span className="truncate flex-1">{conv.metadata?.name || 'Untitled'}</span><Trash2 onClick={(e) => remove(e, conv)} className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-zinc-600" /></button>)}</div>
      <div className="border-t border-white/[.06] p-3 text-xs text-zinc-500">System Operator · governed control plane</div>
    </aside>}
    <main className="min-w-0 flex-1 flex flex-col"><header className="h-14 flex items-center px-4 border-b border-white/[.045]">{!sidebar && <button onClick={() => setSidebar(true)} className="p-2 mr-2"><Menu className="h-5 w-5 text-zinc-400" /></button>}<div className="font-semibold">Strategic Minds AI <span className="font-normal text-zinc-500">Operator</span></div><a href="/smai/ops" className="ml-auto text-xs text-zinc-500 hover:text-white">Agent Ops</a></header>
      <div className="flex-1 overflow-y-auto">{messages.length === 0 ? <div className="min-h-full grid place-items-center px-6"><div className="w-full max-w-3xl"><div className="mx-auto h-12 w-12 rounded-full bg-white grid place-items-center"><Sparkles className="h-6 w-6 text-black" /></div><h1 className="mt-6 text-center text-3xl font-semibold">What do you want the system to do?</h1><p className="mt-3 text-center text-sm text-zinc-500">Powered by the existing Digital Dominance system operator. Protected actions stay approval-gated.</p><div className="mt-9 grid sm:grid-cols-2 gap-3">{starters.map(([title, prompt]) => <button key={title} onClick={() => send(prompt)} className="rounded-2xl border border-white/10 bg-[#2a2a2a] p-4 text-left hover:bg-[#303030]"><div className="font-medium text-sm">{title}</div><div className="mt-1 text-xs leading-5 text-zinc-500">{prompt}</div></button>)}</div></div></div> : messages.map((message, i) => <Bubble key={`${message.id || 'm'}-${i}`} message={message} />)}{sending && <div className="mx-auto max-w-3xl px-5 py-4 flex items-center gap-2 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Working…</div>}<div ref={endRef} /></div>
      <div className="px-4 pb-5 pt-2"><div className="mx-auto max-w-3xl rounded-[26px] border border-white/10 bg-[#2f2f2f]"><textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder="Message Strategic Minds AI" className="block w-full min-h-[58px] resize-none bg-transparent px-5 py-4 outline-none placeholder:text-zinc-500" /><div className="flex px-3 pb-3"><div className="text-[11px] text-zinc-500 flex items-center gap-1"><Bot className="h-3.5 w-3.5" /> Governed agent mode</div><button onClick={() => send()} disabled={!input.trim() || sending} className="ml-auto h-9 w-9 rounded-full bg-white text-black grid place-items-center disabled:bg-zinc-700"><Send className="h-4 w-4" /></button></div></div><p className="mt-2 text-center text-[11px] text-zinc-600">AI can make mistakes. Review protected actions and external claims.</p></div>
    </main>
  </div>;
}
