import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Phone, MessageCircle, Smartphone, Megaphone, Play, RefreshCw, AlertCircle, CheckCircle2, Activity } from "lucide-react";

export default function XtremeComms() {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // SMS form
  const [smsTo, setSmsTo] = useState("");
  const [smsMessage, setSmsMessage] = useState("");

  // WhatsApp form
  const [waTo, setWaTo] = useState("");
  const [waMessage, setWaMessage] = useState("");

  // Voice call form
  const [callTo, setCallTo] = useState("");
  const [callPrompt, setCallPrompt] = useState("");

  // Campaign form
  const [campaignContacts, setCampaignContacts] = useState("");
  const [campaignMessage, setCampaignMessage] = useState("");

  // Buy number form
  const [areaCode, setAreaCode] = useState("");

  const { data: sopLogs } = useQuery({
    queryKey: ["comms-sop-logs"],
    queryFn: () => base44.entities.SopLog.filter({ category: "integration" }, "-created_date", 10),
  });

  const runAction = async (action, payload, label) => {
    setLoading(label);
    setError(null);
    setResults(null);
    try {
      const res = await base44.functions.invoke("xtremeComms", { action, ...payload });
      setResults(res.data);
      queryClient.invalidateQueries({ queryKey: ["comms-sop-logs"] });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-purple-500" /> Xtreme Communications
        </h1>
        <p className="text-stone-500 mt-1">Multi-channel messaging — SMS, WhatsApp, AI voice calls, and campaign blasts via xtreme-communications.com.</p>
      </div>

      {/* Connection status */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-stone-400" />
          <span className="text-sm font-semibold text-stone-700">API Connection</span>
        </div>
        <button
          onClick={() => runAction("getStatus", {}, "status")}
          disabled={loading !== null}
          className="h-9 px-4 rounded-lg border border-stone-200 text-sm font-semibold hover:border-stone-300 disabled:opacity-50 flex items-center gap-2"
        >
          {loading === "status" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Check Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Send SMS */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="h-5 w-5 text-blue-500" />
            <h3 className="font-bold text-stone-900">Send SMS</h3>
          </div>
          <input type="tel" placeholder="+1 (555) 123-4567" value={smsTo} onChange={(e) => setSmsTo(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm mb-2" />
          <textarea placeholder="Your message..." value={smsMessage} onChange={(e) => setSmsMessage(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm mb-2" />
          <button onClick={() => runAction("sendSms", { to: smsTo, message: smsMessage }, "sms")} disabled={!smsTo || !smsMessage || loading !== null} className="w-full h-10 rounded-lg bg-stone-900 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading === "sms" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Send SMS
          </button>
        </div>

        {/* Send WhatsApp */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-5 w-5 text-green-500" />
            <h3 className="font-bold text-stone-900">Send WhatsApp</h3>
          </div>
          <input type="tel" placeholder="+1 (555) 123-4567" value={waTo} onChange={(e) => setWaTo(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm mb-2" />
          <textarea placeholder="Your message..." value={waMessage} onChange={(e) => setWaMessage(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm mb-2" />
          <button onClick={() => runAction("sendWhatsApp", { to: waTo, message: waMessage }, "wa")} disabled={!waTo || !waMessage || loading !== null} className="w-full h-10 rounded-lg bg-stone-900 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading === "wa" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Send WhatsApp
          </button>
        </div>

        {/* AI Voice Call */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <Phone className="h-5 w-5 text-purple-500" />
            <h3 className="font-bold text-stone-900">AI Voice Call</h3>
          </div>
          <input type="tel" placeholder="+1 (555) 123-4567" value={callTo} onChange={(e) => setCallTo(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm mb-2" />
          <textarea placeholder="System prompt for the AI agent..." value={callPrompt} onChange={(e) => setCallPrompt(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm mb-2" />
          <button onClick={() => runAction("makeCall", { to: callTo, systemPrompt: callPrompt }, "call")} disabled={!callTo || loading !== null} className="w-full h-10 rounded-lg bg-stone-900 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading === "call" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Start Call
          </button>
        </div>

        {/* Buy Number */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <Smartphone className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-stone-900">Buy Phone Number</h3>
          </div>
          <input type="text" placeholder="Area code (e.g. 954)" value={areaCode} onChange={(e) => setAreaCode(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-stone-200 text-sm mb-2" />
          <button onClick={() => runAction("buyNumber", { areaCode }, "buy")} disabled={!areaCode || loading !== null} className="w-full h-10 rounded-lg bg-stone-900 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
            {loading === "buy" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Search & Buy
          </button>
          <button onClick={() => runAction("listNumbers", {}, "list")} disabled={loading !== null} className="w-full h-9 mt-2 rounded-lg border border-stone-200 text-sm font-semibold hover:border-stone-300 disabled:opacity-50 flex items-center justify-center gap-2">
            {loading === "list" ? <RefreshCw className="h-4 w-4 animate-spin" /> : null} List My Numbers
          </button>
        </div>
      </div>

      {/* Campaign blast */}
      <div className="rounded-2xl border-2 border-purple-500 bg-purple-50 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Megaphone className="h-5 w-5 text-purple-500" />
          <h3 className="font-bold text-stone-900">Campaign Blast</h3>
        </div>
        <p className="text-sm text-stone-600 mb-3">Send a message to multiple contacts across SMS, WhatsApp, and email.</p>
        <textarea placeholder="+1 (555) 123-4567&#10;+1 (555) 987-6543" value={campaignContacts} onChange={(e) => setCampaignContacts(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm mb-2" />
        <textarea placeholder="Campaign message..." value={campaignMessage} onChange={(e) => setCampaignMessage(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm mb-2" />
        <button onClick={() => runAction("sendCampaign", { contacts: campaignContacts.split("\n").filter(Boolean), message: campaignMessage, channels: ["sms"] }, "campaign")} disabled={!campaignContacts || !campaignMessage || loading !== null} className="h-10 px-6 rounded-lg bg-purple-600 text-white text-sm font-bold disabled:opacity-50 flex items-center gap-2">
          {loading === "campaign" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Launch Campaign
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h3 className="font-bold text-stone-900">Response</h3>
          </div>
          <pre className="text-xs bg-stone-50 rounded-lg p-4 overflow-x-auto max-h-96 overflow-y-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      {/* Activity log */}
      <div>
        <h3 className="font-bold text-stone-900 mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {(sopLogs || []).map((log) => (
            <div key={log.id} className="rounded-lg border border-stone-200 bg-white p-3 flex items-start gap-3">
              <div className="text-xs text-stone-400 mt-0.5">{new Date(log.created_date).toLocaleString()}</div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-stone-900">{log.action}</div>
                <div className="text-xs text-stone-500">{log.description}</div>
              </div>
            </div>
          ))}
          {(!sopLogs || sopLogs.length === 0) && <p className="text-sm text-stone-400">No activity yet.</p>}
        </div>
      </div>
    </div>
  );
}