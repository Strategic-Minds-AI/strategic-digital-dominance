import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Send, AlertTriangle, User, Headphones } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PortalMessages({ project }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [escalating, setEscalating] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!project?.id) return;
    (async () => {
      try {
        const msgs = await base44.entities.ChatMessage.filter(
          { project_id: project.id },
          "created_date",
          100
        );
        setMessages(msgs || []);
      } catch {}
    })();
  }, [project?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (escalate = false) => {
    if (!newMessage.trim() || !project) return;
    const text = newMessage.trim();
    setNewMessage("");
    try {
      const msg = await base44.entities.ChatMessage.create({
        project_id: project.id,
        sender_name: project.client_name || "Homeowner",
        sender_role: escalate ? "client_escalation" : "client",
        text,
      });
      setMessages((m) => [...m, msg]);
      if (escalate) setEscalating(false);
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="rounded-xl bg-stone-100 p-3 flex items-center gap-2 text-sm text-stone-600">
        <User className="h-4 w-4 text-amber-500 shrink-0" />
        Messages go directly to your sales representative. Need to escalate? Use the manager button below.
      </div>

      {/* Messages */}
      <div className="rounded-2xl border border-stone-200 bg-white flex flex-col" style={{ maxHeight: 450 }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-stone-400 py-8 text-sm">
              No messages yet. Send a message to your team below.
            </div>
          )}
          {messages.map((msg) => {
            const isClient = msg.sender_role === "client" || msg.sender_role === "client_escalation";
            const isEscalation = msg.sender_role === "client_escalation";
            return (
              <div key={msg.id} className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    isEscalation
                      ? "bg-red-500 text-white"
                      : isClient
                      ? "bg-amber-500 text-stone-950"
                      : "bg-stone-100 text-stone-900"
                  }`}
                >
                  {!isClient && (
                    <div className="text-xs font-semibold mb-0.5 capitalize">{msg.sender_name || msg.sender_role}</div>
                  )}
                  {isEscalation && (
                    <div className="text-xs font-bold mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> ESCALATED TO MANAGER
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>
        <div className="border-t border-stone-200 p-3 space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(false)}
              className="h-11"
            />
            <Button onClick={() => sendMessage(false)} disabled={!newMessage.trim()} className="h-11 px-4 bg-stone-950 hover:bg-stone-800">
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <button
            onClick={() => setEscalating(!escalating)}
            className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
          >
            <Headphones className="h-3.5 w-3.5" />
            {escalating ? "Cancel escalation" : "Escalate to manager"}
          </button>
          {escalating && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-center gap-2">
              <Input
                placeholder="Describe your concern for the manager..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(true)}
                className="h-10 border-red-200"
                autoFocus
              />
              <Button onClick={() => sendMessage(true)} disabled={!newMessage.trim()} className="h-10 px-4 bg-red-500 hover:bg-red-600 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}