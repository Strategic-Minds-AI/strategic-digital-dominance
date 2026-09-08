import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare, Phone, MessageCircle, Smartphone, Megaphone, Play, RefreshCw,
  AlertCircle, CheckCircle2, Activity, Mail, Search, Users, Sparkles, Image,
  ShieldCheck, Zap, Send, TrendingUp
} from "lucide-react";

const TABS = [
  { id: "sms", label: "SMS & MMS", icon: Smartphone },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "voice", label: "Voice & AI", icon: Phone },
  { id: "numbers", label: "Phone Numbers", icon: Search },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "leads", label: "Lead Scraper", icon: Users },
  { id: "content", label: "AI Content", icon: Sparkles },
  { id: "email", label: "Email", icon: Mail },
  { id: "verify", label: "Verify", icon: ShieldCheck },
  { id: "status", label: "Status", icon: Activity },
];

export default function XtremeComms() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("sms");
  const [loading, setLoading] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Forms state
  const [forms, setForms] = useState({
    sms: { to: "", message: "", mediaUrls: "" },
    mms: { to: "", message: "", mediaUrls: "", subject: "" },
    whatsapp: { to: "", message: "", template: "", mediaUrls: "" },
    voice: { to: "", from: "", systemPrompt: "", agentId: "" },
    numbers: { areaCode: "", country: "US", phoneNumber: "" },
    campaign: { contacts: "", message: "", channels: "sms", campaignName: "" },
    leads: { industry: "", keyword: "", location: "", radius: 25, limit: 50 },
    content: { prompt: "", contentType: "sms", tone: "" },
    media: { prompt: "", mediaType: "image" },
    email: { to: "", subject: "", body: "" },
    verify: { phoneNumber: "" },
  });

  const updateForm = (tabName, field, value) => {
    setForms({ ...forms, [tabName]: { ...forms[tabName], [field]: value } });
  };

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

  const inputCls = "w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none";
  const textareaCls = "w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none";
  const btnCls = "h-10 rounded-lg bg-stone-900 text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <MessageSquare className="h-7 w-7 text-purple-500" /> Xtreme Communications
        </h1>
        <p className="text-stone-500 mt-1">Full multi-channel CaaS platform — SMS, MMS, WhatsApp, AI voice, phone numbers, campaigns, lead scraping, and AI content generation.</p>
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setResults(null); setError(null); }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition ${tab === t.id ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300"}`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        {/* SMS */}
        {tab === "sms" && (
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900">Send SMS / MMS</h3>
            <div className="grid grid-cols-2 gap-3">
              <input type="tel" placeholder="To (+1 555-123-4567)" value={forms.sms.to} onChange={(e) => updateForm("sms", "to", e.target.value)} className={inputCls} />
              <input type="text" placeholder="From (optional)" value={forms.sms.from || ""} onChange={(e) => updateForm("sms", "from", e.target.value)} className={inputCls} />
            </div>
            <textarea placeholder="Message..." value={forms.sms.message} onChange={(e) => updateForm("sms", "message", e.target.value)} rows={3} className={textareaCls} />
            <input type="text" placeholder="Media URLs (comma-separated, for MMS)" value={forms.sms.mediaUrls} onChange={(e) => updateForm("sms", "mediaUrls", e.target.value)} className={inputCls} />
            <div className="flex gap-2">
              <button onClick={() => runAction("sendSms", { to: forms.sms.to, message: forms.sms.message, from: forms.sms.from, mediaUrls: forms.sms.mediaUrls ? forms.sms.mediaUrls.split(",") : undefined }, "sms")} disabled={!forms.sms.to || !forms.sms.message || loading !== null} className={btnCls + " flex-1"}>
                {loading === "sms" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send SMS
              </button>
              <button onClick={() => runAction("sendMms", { to: forms.sms.to, message: forms.sms.message, from: forms.sms.from, mediaUrls: forms.sms.mediaUrls ? forms.sms.mediaUrls.split(",") : undefined }, "mms")} disabled={!forms.sms.to || !forms.sms.message || loading !== null} className={btnCls + " flex-1"}>
                {loading === "mms" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />} Send MMS
              </button>
            </div>
          </div>
        )}

        {/* WhatsApp */}
        {tab === "whatsapp" && (
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900">Send WhatsApp Message</h3>
            <input type="tel" placeholder="To (+1 555-123-4567)" value={forms.whatsapp.to} onChange={(e) => updateForm("whatsapp", "to", e.target.value)} className={inputCls} />
            <textarea placeholder="Message..." value={forms.whatsapp.message} onChange={(e) => updateForm("whatsapp", "message", e.target.value)} rows={3} className={textareaCls} />
            <input type="text" placeholder="Template name (optional)" value={forms.whatsapp.template} onChange={(e) => updateForm("whatsapp", "template", e.target.value)} className={inputCls} />
            <input type="text" placeholder="Media URL (optional)" value={forms.whatsapp.mediaUrls} onChange={(e) => updateForm("whatsapp", "mediaUrls", e.target.value)} className={inputCls} />
            <button onClick={() => runAction("sendWhatsApp", { to: forms.whatsapp.to, message: forms.whatsapp.message, template: forms.whatsapp.template, mediaUrls: forms.whatsapp.mediaUrls || undefined }, "wa")} disabled={!forms.whatsapp.to || !forms.whatsapp.message || loading !== null} className={btnCls + " w-full"}>
              {loading === "wa" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />} Send WhatsApp
            </button>
          </div>
        )}

        {/* Voice */}
        {tab === "voice" && (
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900">AI Voice Call</h3>
            <div className="grid grid-cols-2 gap-3">
              <input type="tel" placeholder="To (+1 555-123-4567)" value={forms.voice.to} onChange={(e) => updateForm("voice", "to", e.target.value)} className={inputCls} />
              <input type="tel" placeholder="From (your number)" value={forms.voice.from} onChange={(e) => updateForm("voice", "from", e.target.value)} className={inputCls} />
            </div>
            <input type="text" placeholder="Agent ID (optional)" value={forms.voice.agentId} onChange={(e) => updateForm("voice", "agentId", e.target.value)} className={inputCls} />
            <textarea placeholder="System prompt for the AI agent..." value={forms.voice.systemPrompt} onChange={(e) => updateForm("voice", "systemPrompt", e.target.value)} rows={4} className={textareaCls} />
            <div className="flex gap-2">
              <button onClick={() => runAction("makeCall", { to: forms.voice.to, from: forms.voice.from, agentId: forms.voice.agentId, systemPrompt: forms.voice.systemPrompt }, "call")} disabled={!forms.voice.to || !forms.voice.from || loading !== null} className={btnCls + " flex-1"}>
                {loading === "call" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Phone className="h-4 w-4" />} Start Call
              </button>
              <button onClick={() => runAction("startVoiceSession", { to: forms.voice.to, from: forms.voice.from, agentId: forms.voice.agentId, systemPrompt: forms.voice.systemPrompt }, "session")} disabled={!forms.voice.to || !forms.voice.from || loading !== null} className={btnCls + " flex-1"}>
                {loading === "session" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} AI Session
              </button>
            </div>
          </div>
        )}

        {/* Phone Numbers */}
        {tab === "numbers" && (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-stone-900 mb-2">Search Available Numbers</h3>
              <div className="grid grid-cols-3 gap-3">
                <input type="text" placeholder="Area code" value={forms.numbers.areaCode} onChange={(e) => updateForm("numbers", "areaCode", e.target.value)} className={inputCls} />
                <input type="text" placeholder="Country" value={forms.numbers.country} onChange={(e) => updateForm("numbers", "country", e.target.value)} className={inputCls} />
                <button onClick={() => runAction("searchNumbers", { areaCode: forms.numbers.areaCode, country: forms.numbers.country }, "search")} disabled={loading !== null} className={btnCls}>
                  {loading === "search" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search
                </button>
              </div>
            </div>
            <div className="border-t border-stone-100 pt-4">
              <h3 className="font-bold text-stone-900 mb-2">Buy / Release Numbers</h3>
              <div className="flex gap-2">
                <input type="text" placeholder="Phone number to buy/release" value={forms.numbers.phoneNumber} onChange={(e) => updateForm("numbers", "phoneNumber", e.target.value)} className={inputCls + " flex-1"} />
                <button onClick={() => runAction("buyNumber", { phoneNumber: forms.numbers.phoneNumber }, "buy")} disabled={!forms.numbers.phoneNumber || loading !== null} className={btnCls + " bg-green-600"}>
                  {loading === "buy" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Buy
                </button>
                <button onClick={() => runAction("releaseNumber", { phoneNumber: forms.numbers.phoneNumber }, "release")} disabled={!forms.numbers.phoneNumber || loading !== null} className={btnCls + " bg-red-600"}>
                  {loading === "release" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />} Release
                </button>
              </div>
              <button onClick={() => runAction("listNumbers", {}, "list")} disabled={loading !== null} className={btnCls + " w-full mt-2"}>
                {loading === "list" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Smartphone className="h-4 w-4" />} List My Numbers
              </button>
            </div>
          </div>
        )}

        {/* Campaigns */}
        {tab === "campaigns" && (
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900">Campaign Blast</h3>
            <input type="text" placeholder="Campaign name" value={forms.campaign.campaignName} onChange={(e) => updateForm("campaign", "campaignName", e.target.value)} className={inputCls} />
            <textarea placeholder="Contacts (one per line: +1 555-123-4567)" value={forms.campaign.contacts} onChange={(e) => updateForm("campaign", "contacts", e.target.value)} rows={4} className={textareaCls} />
            <textarea placeholder="Campaign message..." value={forms.campaign.message} onChange={(e) => updateForm("campaign", "message", e.target.value)} rows={3} className={textareaCls} />
            <select value={forms.campaign.channels} onChange={(e) => updateForm("campaign", "channels", e.target.value)} className={inputCls}>
              <option value="sms">SMS only</option>
              <option value="sms,whatsapp">SMS + WhatsApp</option>
              <option value="sms,email">SMS + Email</option>
              <option value="sms,whatsapp,email">All channels</option>
            </select>
            <button onClick={() => runAction("sendCampaign", { contacts: forms.campaign.contacts.split("\n").filter(Boolean), message: forms.campaign.message, channels: forms.campaign.channels.split(","), campaignName: forms.campaign.campaignName }, "campaign")} disabled={!forms.campaign.contacts || !forms.campaign.message || loading !== null} className="h-10 rounded-lg bg-purple-600 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 w-full">
              {loading === "campaign" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Megaphone className="h-4 w-4" />} Launch Campaign
            </button>
          </div>
        )}

        {/* Lead Scraper */}
        {tab === "leads" && (
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900">Lead Scraper</h3>
            <p className="text-sm text-stone-500">Find businesses by industry, location, and keyword. Enrich with social profiles and revenue data.</p>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Industry (e.g. flooring)" value={forms.leads.industry} onChange={(e) => updateForm("leads", "industry", e.target.value)} className={inputCls} />
              <input type="text" placeholder="Keyword" value={forms.leads.keyword} onChange={(e) => updateForm("leads", "keyword", e.target.value)} className={inputCls} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input type="text" placeholder="Location (city, state)" value={forms.leads.location} onChange={(e) => updateForm("leads", "location", e.target.value)} className={inputCls} />
              <input type="number" placeholder="Radius (mi)" value={forms.leads.radius} onChange={(e) => updateForm("leads", "radius", Number(e.target.value))} className={inputCls} />
              <input type="number" placeholder="Limit" value={forms.leads.limit} onChange={(e) => updateForm("leads", "limit", Number(e.target.value))} className={inputCls} />
            </div>
            <button onClick={() => runAction("scrapeLeads", { industry: forms.leads.industry, keyword: forms.leads.keyword, location: forms.leads.location, radius: forms.leads.radius, limit: forms.leads.limit }, "leads")} disabled={(!forms.leads.industry && !forms.leads.keyword) || loading !== null} className={btnCls + " w-full"}>
              {loading === "leads" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />} Scrape Leads
            </button>
          </div>
        )}

        {/* AI Content */}
        {tab === "content" && (
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900">AI Content Generator</h3>
            <p className="text-sm text-stone-500">Generate SMS, email, social media, or voice script content with AI.</p>
            <textarea placeholder="Describe what you want to generate..." value={forms.content.prompt} onChange={(e) => updateForm("content", "prompt", e.target.value)} rows={3} className={textareaCls} />
            <div className="grid grid-cols-2 gap-3">
              <select value={forms.content.contentType} onChange={(e) => updateForm("content", "contentType", e.target.value)} className={inputCls}>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="social">Social Media</option>
                <option value="voice_script">Voice Script</option>
                <option value="ad_copy">Ad Copy</option>
              </select>
              <input type="text" placeholder="Tone (professional, casual, etc.)" value={forms.content.tone} onChange={(e) => updateForm("content", "tone", e.target.value)} className={inputCls} />
            </div>
            <button onClick={() => runAction("generateContent", { prompt: forms.content.prompt, contentType: forms.content.contentType, tone: forms.content.tone }, "content")} disabled={!forms.content.prompt || loading !== null} className={btnCls + " w-full"}>
              {loading === "content" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate Content
            </button>
            <div className="border-t border-stone-100 pt-3">
              <h4 className="font-semibold text-stone-700 text-sm mb-2">Creative Media</h4>
              <textarea placeholder="Describe the image/media to generate..." value={forms.media.prompt} onChange={(e) => updateForm("media", "prompt", e.target.value)} rows={2} className={textareaCls} />
              <button onClick={() => runAction("generateMedia", { prompt: forms.media.prompt, mediaType: forms.media.mediaType }, "media")} disabled={!forms.media.prompt || loading !== null} className={btnCls + " w-full mt-2"}>
                {loading === "media" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />} Generate Media
              </button>
            </div>
          </div>
        )}

        {/* Email */}
        {tab === "email" && (
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900">Send Email</h3>
            <input type="email" placeholder="To" value={forms.email.to} onChange={(e) => updateForm("email", "to", e.target.value)} className={inputCls} />
            <input type="text" placeholder="Subject" value={forms.email.subject} onChange={(e) => updateForm("email", "subject", e.target.value)} className={inputCls} />
            <textarea placeholder="Email body..." value={forms.email.body} onChange={(e) => updateForm("email", "body", e.target.value)} rows={5} className={textareaCls} />
            <button onClick={() => runAction("sendEmail", { to: forms.email.to, subject: forms.email.subject, body: forms.email.body }, "email")} disabled={!forms.email.to || !forms.email.subject || loading !== null} className={btnCls + " w-full"}>
              {loading === "email" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Send Email
            </button>
          </div>
        )}

        {/* Verify */}
        {tab === "verify" && (
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900">Phone Number Verification</h3>
            <p className="text-sm text-stone-500">Verify a phone number's validity and carrier info (HLR lookup).</p>
            <input type="tel" placeholder="+1 555-123-4567" value={forms.verify.phoneNumber} onChange={(e) => updateForm("verify", "phoneNumber", e.target.value)} className={inputCls} />
            <button onClick={() => runAction("verifyNumber", { phoneNumber: forms.verify.phoneNumber }, "verify")} disabled={!forms.verify.phoneNumber || loading !== null} className={btnCls + " w-full"}>
              {loading === "verify" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Verify Number
            </button>
          </div>
        )}

        {/* Status */}
        {tab === "status" && (
          <div className="space-y-3">
            <h3 className="font-bold text-stone-900">Connection Status</h3>
            <p className="text-sm text-stone-500">Check if the Xtreme Communications API key is valid and the provider is connected.</p>
            <div className="flex gap-2">
              <button onClick={() => runAction("getStatus", {}, "status")} disabled={loading !== null} className={btnCls + " flex-1"}>
                {loading === "status" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />} Check Status
              </button>
              <button onClick={() => runAction("testConnection", { channel: "sms" }, "test")} disabled={loading !== null} className={btnCls + " flex-1"}>
                {loading === "test" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} Test SMS Route
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
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
        <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-amber-500" /> Recent Activity
        </h3>
        <div className="space-y-2">
          {(sopLogs || []).map((log) => (
            <div key={log.id} className="rounded-lg border border-stone-200 bg-white p-3 flex items-start gap-3">
              <div className="text-xs text-stone-400 mt-0.5 whitespace-nowrap">{new Date(log.created_date).toLocaleString()}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-stone-900">{log.action}</div>
                <div className="text-xs text-stone-500 truncate">{log.description}</div>
              </div>
            </div>
          ))}
          {(!sopLogs || sopLogs.length === 0) && <p className="text-sm text-stone-400">No activity yet.</p>}
        </div>
      </div>
    </div>
  );
}