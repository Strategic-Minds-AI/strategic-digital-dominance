import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, PhoneCall, Search, Loader2, CheckCircle2, AlertCircle, PhoneForwarded, MessageSquare, Clock, User, Copy } from "lucide-react";

const CARRIERS = [
  { name: "AT&T", forward: "*61*", suffix: "#", note: "Dial *61*<number># to forward unanswered calls" },
  { name: "Verizon", forward: "*71", suffix: "", note: "Dial *71<number> to forward unanswered calls" },
  { name: "T-Mobile", forward: "**61*+1", suffix: "**11#", note: "Dial **61*+1<number>**11# to forward unanswered calls" },
  { name: "Sprint/T-Mobile", forward: "*73", suffix: "", note: "Dial *73<number> to forward unanswered calls" },
  { name: "Google Fi", forward: "*71", suffix: "", note: "Dial *71<number> to forward unanswered calls" },
];

const DEFAULT_PROMPT = `You are the AI receptionist for Xtreme Polishing Systems, a premium garage floor epoxy coating company. You are answering the phone because the owner is currently unavailable.

Your role:
- Greet callers professionally and warmly
- Answer basic questions about epoxy garage floor coatings, pricing, and services
- Take detailed messages including the caller's name, phone number, and reason for calling
- Offer to schedule a free estimate or consultation
- For urgent matters, let the caller know the owner will call them back as soon as possible
- Be concise and natural — this is a phone conversation, not a text chat
- If the caller asks something you don't know, offer to have someone call them back with the answer

Key information:
- Company: Xtreme Polishing Systems
- Service: Garage floor epoxy coatings
- Typical project range: $1,800 - $6,000 depending on garage size and system
- Free estimates available
- Service hours: Monday-Friday 8am-6pm, Saturday 9am-3pm

Keep your responses short and conversational. Ask one question at a time.`;

const DEFAULT_GREETING = "Hello, thank you for calling Xtreme Polishing Systems. The person you're trying to reach is currently unavailable, but I'm here to help. How can I assist you today?";

export default function VoiceAssistant() {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [greeting, setGreeting] = useState(DEFAULT_GREETING);
  const [voice, setVoice] = useState("female");
  const [model, setModel] = useState("anthropic/claude-opus-4.7");
  const [searchArea, setSearchArea] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [forwardingNumber, setForwardingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["voice-assistant-status"],
    queryFn: async () => {
      const res = await base44.functions.invoke("voiceAssistant", { action: "getStatus" });
      return res.data?.result;
    },
    refetchInterval: 15000,
  });

  const { data: recentCalls } = useQuery({
    queryKey: ["voice-recent-calls"],
    queryFn: async () => {
      const res = await base44.functions.invoke("voiceAssistant", { action: "getRecentCalls" });
      return res.data?.result?.calls || [];
    },
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (status?.assistant_name) setName(status.assistant_name);
    if (status?.forwarding_number) setForwardingNumber(status.forwarding_number);
    if (status?.carrier) setCarrier(status.carrier);
  }, [status]);

  const createAssistant = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke("voiceAssistant", {
        action: "createAssistant",
        assistant_name: name || "AI Receptionist",
        system_prompt: prompt,
        greeting,
        voice,
        model,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voice-assistant-status"] });
    },
  });

  const updateAssistant = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke("voiceAssistant", {
        action: "updateAssistant",
        system_prompt: prompt,
        greeting,
        voice,
        model,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voice-assistant-status"] });
    },
  });

  const searchNumbers = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke("voiceAssistant", {
        action: "searchNumbers",
        area_code: searchArea || undefined,
        limit: 20,
      });
      return res.data?.result;
    },
    onSuccess: (data) => setSearchResults(data?.numbers || []),
  });

  const buyNumber = useMutation({
    mutationFn: async (phone_number) => {
      const res = await base44.functions.invoke("voiceAssistant", {
        action: "buyNumber",
        phone_number,
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voice-assistant-status"] });
    },
  });

  const saveForwarding = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke("voiceAssistant", {
        action: "updateForwarding",
        forwarding_number: forwardingNumber,
        carrier,
      });
      return res.data;
    },
  });

  const copyForwardingCode = (telnyxNumber) => {
    const c = CARRIERS.find((x) => x.name === carrier);
    if (!c) return;
    const code = `${c.forward}${telnyxNumber.replace(/\s/g, "")}${c.suffix}`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getError = (err, fallback) => err?.response?.data?.error || err?.message || fallback;

  const isConfigured = status?.configured;
  const hasNumber = !!status?.phone_number;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <PhoneCall className="h-7 w-7 text-amber-500" /> AI Voice Assistant
          </h1>
          <p className="text-sm text-stone-500 mt-1">Answers your phone when you're unavailable — powered by Telnyx AI</p>
        </div>
        {isConfigured && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${status?.enabled ? "bg-green-50 text-green-700 border border-green-200" : "bg-stone-100 text-stone-600"}`}>
            {status?.enabled ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {status?.enabled ? "Active" : "Disabled"}
          </div>
        )}
      </div>

      {/* Status Overview */}
      {isConfigured && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={Phone} label="Telnyx Number" value={status?.phone_number || "—"} />
          <StatCard icon={PhoneCall} label="Total Calls" value={String(status?.total_calls || 0)} />
          <StatCard icon={Clock} label="Last Call" value={status?.last_call_at ? new Date(status.last_call_at).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" }) : "—"} />
          <StatCard icon={User} label="Assistant" value={status?.assistant_name || "—"} />
        </div>
      )}

      {/* Step 1: Configure Assistant */}
      <div className="bg-white rounded-xl border border-stone-200 p-6">
        <h2 className="text-lg font-bold text-stone-900 mb-1">{isConfigured ? "Assistant Configuration" : "Step 1: Configure Your AI Assistant"}</h2>
        <p className="text-sm text-stone-500 mb-4">This defines what your AI says and how it behaves when answering calls.</p>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold">Assistant Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="AI Receptionist" className="mt-1" disabled={isConfigured} />
          </div>

          <div>
            <Label className="text-sm font-semibold">Greeting (spoken when call is answered)</Label>
            <Textarea value={greeting} onChange={(e) => setGreeting(e.target.value)} rows={2} className="mt-1" />
          </div>

          <div>
            <Label className="text-sm font-semibold">System Prompt (instructions for the AI)</Label>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={10} className="mt-1 font-mono text-sm" />
            <p className="text-xs text-stone-400 mt-1">Defines the assistant's personality, knowledge, and behavior.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Voice</Label>
              <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full h-10 rounded-md border border-stone-200 bg-white px-3 mt-1 text-sm">
                <option value="female">Female (default)</option>
                <option value="male">Male</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-semibold">AI Model (brain)</Label>
              <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full h-10 rounded-md border border-stone-200 bg-white px-3 mt-1 text-sm">
                <option value="anthropic/claude-opus-4.7">Claude Opus 4.7 (best — most capable)</option>
                <option value="openai/gpt-5.4">GPT-5.4 (fast + smart)</option>
                <option value="openai/gpt-5.4-mini">GPT-5.4 Mini (cheapest)</option>
              </select>
            </div>
          </div>

          <Button
            onClick={() => (isConfigured ? updateAssistant.mutate() : createAssistant.mutate())}
            disabled={createAssistant.isPending || updateAssistant.isPending}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
          >
            {(createAssistant.isPending || updateAssistant.isPending) ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {isConfigured ? "Updating..." : "Creating..."}</>
            ) : (
              <>{isConfigured ? "Update Assistant" : "Create Assistant"}</>
            )}
          </Button>

          {createAssistant.isError && (
            <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {getError(createAssistant.error, "Failed to create assistant")}</p>
          )}
          {updateAssistant.isError && (
            <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {getError(updateAssistant.error, "Failed to update assistant")}</p>
          )}
        </div>
      </div>

      {/* Step 2: Get a Phone Number */}
      {isConfigured && !hasNumber && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-bold text-stone-900 mb-1">Step 2: Get a Phone Number</h2>
          <p className="text-sm text-stone-500 mb-4">Search for and buy a Telnyx number. Calls to this number will be answered by your AI assistant.</p>

          <div className="flex gap-2 mb-4">
            <Input
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              placeholder="Area code (e.g. 954) — leave blank for any"
              className="max-w-xs"
            />
            <Button onClick={() => searchNumbers.mutate()} disabled={searchNumbers.isPending} variant="outline">
              {searchNumbers.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-1" />}
              Search
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((n) => (
                <div key={n.phone_number} className="flex items-center justify-between p-3 rounded-lg border border-stone-200 hover:border-amber-300">
                  <div>
                    <div className="font-semibold text-stone-900">{n.phone_number}</div>
                    <div className="text-xs text-stone-500">{n.region?.name || n.locality || "US"} • {n.cost_monthly || "$1.00"}/mo</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => buyNumber.mutate(n.phone_number)}
                    disabled={buyNumber.isPending}
                    className="bg-amber-500 hover:bg-amber-400 text-stone-950"
                  >
                    {buyNumber.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buy"}
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchNumbers.isError && (
            <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {getError(searchNumbers.error, "Search failed")}</p>
          )}
          {buyNumber.isError && (
            <p className="text-sm text-red-600 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> {getError(buyNumber.error, "Purchase failed")}</p>
          )}
        </div>
      )}

      {/* Step 3: Call Forwarding */}
      {isConfigured && hasNumber && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-bold text-stone-900 mb-1 flex items-center gap-2"><PhoneForwarded className="h-5 w-5 text-amber-500" /> Step 3: Set Up Call Forwarding</h2>
          <p className="text-sm text-stone-500 mb-4">Forward unanswered calls from your personal phone to your AI assistant number.</p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
            <div className="text-xs font-bold tracking-wider text-amber-700 uppercase mb-1">Your AI Assistant Number</div>
            <div className="text-2xl font-bold text-stone-900">{status?.phone_number}</div>
          </div>

          <div className="space-y-3 mb-4">
            <div>
              <Label className="text-sm font-semibold">Your Personal Number (for our records)</Label>
              <Input value={forwardingNumber} onChange={(e) => setForwardingNumber(e.target.value)} placeholder="+1 555 123 4567" className="mt-1 max-w-xs" />
            </div>
            <div>
              <Label className="text-sm font-semibold">Your Carrier</Label>
              <select value={carrier} onChange={(e) => setCarrier(e.target.value)} className="w-full max-w-xs h-10 rounded-md border border-stone-200 bg-white px-3 mt-1 text-sm">
                <option value="">Select your carrier...</option>
                {CARRIERS.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <Button onClick={() => saveForwarding.mutate()} disabled={saveForwarding.isPending || !carrier} variant="outline" size="sm">
              {saveForwarding.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>

          {carrier && (
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
              <div className="text-sm font-semibold text-stone-900 mb-2">📱 Forwarding Instructions for {carrier}</div>
              <div className="flex items-center gap-2 mb-2">
                <code className="flex-1 bg-white border border-stone-300 rounded px-3 py-2 text-sm font-mono">
                  {CARRIERS.find((c) => c.name === carrier)?.forward}{status?.phone_number?.replace(/\s/g, "")}{CARRIERS.find((c) => c.name === carrier)?.suffix}
                </code>
                <Button size="sm" variant="outline" onClick={() => copyForwardingCode(status?.phone_number || "")}>
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-stone-500">{CARRIERS.find((c) => c.name === carrier)?.note}</p>
              <p className="text-xs text-stone-400 mt-2">Open your phone's dialer and enter this code, then press call. This sets up conditional forwarding — calls will ring your phone first, then forward to the AI if you don't answer.</p>
            </div>
          )}
        </div>
      )}

      {/* Recent Calls */}
      {isConfigured && (
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-amber-500" /> Recent Calls</h2>
          {recentCalls && recentCalls.length > 0 ? (
            <div className="space-y-2">
              {recentCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-3 rounded-lg border border-stone-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${call.status === 'ended' ? 'bg-stone-300' : 'bg-green-500'}`} />
                    <div>
                      <div className="font-semibold text-stone-900 text-sm">{call.from_number || "Unknown"}</div>
                      <div className="text-xs text-stone-500">{call.persona_name || "AI Assistant"}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-stone-500">{call.started_at ? new Date(call.started_at).toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" }) : "—"}</div>
                    <div className="text-xs font-semibold text-stone-700">{call.status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-stone-400 text-center py-8">No calls yet. Once your assistant is active, incoming calls will appear here.</p>
          )}
        </div>
      )}

      {/* Not configured hint */}
      {!isConfigured && !statusLoading && (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 text-center">
          <PhoneCall className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500">Create your AI assistant above to get started. Once created, you'll be able to search for a phone number and set up call forwarding.</p>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="flex items-center gap-2 text-stone-400 mb-1">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-bold text-stone-900 truncate">{value}</div>
    </div>
  );
}