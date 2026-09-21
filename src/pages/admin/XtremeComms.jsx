import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare, Phone, MessageCircle, Smartphone, Megaphone, Play, RefreshCw,
  AlertCircle, CheckCircle2, Activity, Mail, Search, Users, Sparkles, Image,
  ShieldCheck, Zap, Send, TrendingUp, Palette, UserCheck, Copy, BookOpen,
  FlaskConical, Bot, PhoneCall
} from "lucide-react";
import TestLabTab from "@/components/xtreme-comms/TestLabTab";
import AgentsTab from "@/components/xtreme-comms/AgentsTab";
import VoiceSessionsTab from "@/components/xtreme-comms/VoiceSessionsTab";

const TABS = [
  { id: "sms", label: "SMS & MMS", icon: Smartphone },
  { id: "templates", label: "Templates", icon: Palette },
  { id: "escalation", label: "Escalation", icon: UserCheck },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { id: "voice", label: "Voice & AI", icon: Phone },
  { id: "numbers", label: "Phone Numbers", icon: Search },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "leads", label: "Lead Scraper", icon: Users },
  { id: "content", label: "AI Content", icon: Sparkles },
  { id: "email", label: "Email", icon: Mail },
  { id: "verify", label: "Verify", icon: ShieldCheck },
  { id: "testlab", label: "Test Lab", icon: FlaskConical },
  { id: "agents", label: "AI Agents", icon: Bot },
  { id: "voicesessions", label: "Voice Sessions", icon: PhoneCall },
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
    escalation: { leadName: "", leadPhone: "", reason: "", lastMessage: "", responseWindow: "2 hours" },
  });
  const [templates, setTemplates] = useState([]);
  const [tplCategories, setTplCategories] = useState([]);
  const [tplFilter, setTplFilter] = useState("all");
  const [companyFacts, setCompanyFacts] = useState(null);

  // Fetch the approved communication templates + company facts from the
  // shared companyIntel module (via aiAssist) so the manual console and the
  // AI agent always reference the same grounded scripts.
  useEffect(() => {
    base44.functions.invoke("aiAssist", { action: "getCompanyIntel" })
      .then((res) => {
        setTemplates(res.data?.templates || []);
        setTplCategories(res.data?.categories || []);
        setCompanyFacts(res.data?.company || null);
      })
      .catch(() => {});
  }, []);

  const filteredTemplates = tplFilter === "all" ? templates : templates.filter((t) => t.category === tplFilter);

  const fillTemplate = (tpl) => {
    // Insert the template body into the SMS composer and switch to the SMS tab.
    setForms({ ...forms, sms: { ...forms.sms, message: tpl.body } });
    setTab("sms");
    setResults({ inserted: tpl.id, label: tpl.label, channel: tpl.channel });
  };

  const copyTemplate = (tpl) => {
    navigator.clipboard?.writeText(tpl.body).catch(() => {});
    setResults({ copied: tpl.id, label: tpl.label });
  };

  const updateForm = (tabName, field, value) => {
    setForms({ ...forms, [tabName]: { ...forms[tabName], [field]: value } });
  };

  const { data: sopLogs } = useQuery({
    queryKey: ["comms-sop-logs"],
    queryFn: () => base44.entities.SopLog.filter({ category: "integration" }, "-created_date", 10),
  });

  // Fetch + validate all provisioned phone numbers for dropdowns
  const { data: phoneNumbersData, refetch: refetchNumbers, isLoading: numbersLoading } = useQuery({
    queryKey: ["comms-phone-numbers"],
    queryFn: () => base44.functions.invoke("xtremeComms", { action: "getMyNumbers" }),
    staleTime: 120000,
  });
  const phoneNumbers = phoneNumbersData?.data?.result?.numbers || [];

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
            <div>
              <label className="text-xs font-semibold text-stone-500 flex items-center gap-1.5 mb-1"><BookOpen className="h-3.5 w-3.5" /> Insert approved template</label>
              <select onChange={(e) => { const t = templates.find((x) => x.id === e.target.value); if (t) fillTemplate(t); }} value="" className={inputCls}>
                <option value="">— Pick a template to load —</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>[{t.category}] {t.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="tel" placeholder="To (+1 555-123-4567)" value={forms.sms.to} onChange={(e) => updateForm("sms", "to", e.target.value)} className={inputCls} />
              <select value={forms.sms.from || ""} onChange={(e) => updateForm("sms", "from", e.target.value)} className={inputCls}>
                <option value="">— Select sender number —</option>
                {phoneNumbers.map((n) => (
                  <option key={n.phone} value={n.phone}>{n.phone} {n.verified ? "✓ verified" : "⚠ unverified"}</option>
                ))}
              </select>
            </div>
            <textarea placeholder="Message..." value={forms.sms.message} onChange={(e) => updateForm("sms", "message", e.target.value)} rows={4} className={textareaCls} />
            <input type="text" placeholder="Media URLs (comma-separated, for MMS)" value={forms.sms.mediaUrls} onChange={(e) => updateForm("sms", "mediaUrls", e.target.value)} className={inputCls} />
            <div className="flex gap-2">
              <button onClick={() => runAction("sendSms", { to: forms.sms.to, message: forms.sms.message, from: forms.sms.from, mediaUrls: forms.sms.mediaUrls ? forms.sms.mediaUrls.split(",") : undefined }, "sms")} disabled={!forms.sms.to || !forms.sms.message || loading !== null} className={btnCls + " flex-1"}>
                {loading === "sms" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send SMS
              </button>
              <button onClick={() => runAction("sendMms", { to: forms.sms.to, message: forms.sms.message, from: forms.sms.from, mediaUrls: forms.sms.mediaUrls ? forms.sms.mediaUrls.split(",") : undefined }, "mms")} disabled={!forms.sms.to || !forms.sms.message || loading !== null} className={btnCls + " flex-1"}>
                {loading === "mms" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />} Send MMS
              </button>
            </div>
            <p className="text-xs text-stone-400">Tip: templates use {"{placeholders}"} — replace them with the lead's real details before sending.</p>
          </div>
        )}

        {/* Templates library */}
        {tab === "templates" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-stone-900 flex items-center gap-2"><Palette className="h-5 w-5 text-amber-500" /> Approved Communication Templates</h3>
              <span className="text-xs text-stone-500">{templates.length} templates · eliminates hallucination & ambiguity</span>
            </div>
            {companyFacts && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-stone-700">
                <strong>Automation line:</strong> {companyFacts.automation_phone_display} · <strong>Sales:</strong> {companyFacts.sales_phone} · <strong>HQ:</strong> {companyFacts.headquarters} · <strong>Since</strong> {companyFacts.founded_year} · {companyFacts.locations_count} locations
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setTplFilter("all")} className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${tplFilter === "all" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"}`}>All</button>
              {tplCategories.map((c) => (
                <button key={c.key} onClick={() => setTplFilter(c.key)} className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${tplFilter === c.key ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"}`}>{c.label}</button>
              ))}
            </div>
            <div className="grid gap-2.5">
              {filteredTemplates.map((t) => (
                <div key={t.id} className="rounded-xl border border-stone-200 p-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="text-sm font-semibold text-stone-900">{t.label}</div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-amber-600">{t.category} · {t.channel}</div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => copyTemplate(t)} className="h-8 px-2.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:border-amber-500 hover:text-amber-600 flex items-center gap-1"><Copy className="h-3.5 w-3.5" /> Copy</button>
                      <button onClick={() => fillTemplate(t)} className="h-8 px-2.5 rounded-lg bg-stone-900 text-white text-xs font-semibold flex items-center gap-1"><Send className="h-3.5 w-3.5" /> Use</button>
                    </div>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap">{t.body}</p>
                  {t.variables?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {t.variables.map((v) => (
                        <span key={v} className="text-[10px] font-mono bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">{`{${v}}`}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {filteredTemplates.length === 0 && <p className="text-sm text-stone-400">Loading templates…</p>}
            </div>
          </div>
        )}

        {/* Escalation */}
        {tab === "escalation" && (
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 flex items-center gap-2"><UserCheck className="h-5 w-5 text-amber-500" /> Escalate to a Human Specialist</h3>
            <p className="text-sm text-stone-500">When the AI agent can't resolve a question (complex pricing dispute, complaint, scheduling conflict), escalate to a human. This sends the lead an "escalating you" SMS and notifies the on-call specialist from the automation line.</p>
            {companyFacts && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-stone-700">
                <strong>Escalation SMS sent from:</strong> {companyFacts.automation_phone_display} · <strong>Notifies:</strong> {companyFacts.salesperson?.name || "senior specialist"} at {companyFacts.sales_phone}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Lead name" value={forms.escalation.leadName} onChange={(e) => updateForm("escalation", "leadName", e.target.value)} className={inputCls} />
              <input type="tel" placeholder="Lead phone (+1 555…)" value={forms.escalation.leadPhone} onChange={(e) => updateForm("escalation", "leadPhone", e.target.value)} className={inputCls} />
            </div>
            <input type="text" placeholder="Escalation reason (e.g. pricing dispute)" value={forms.escalation.reason} onChange={(e) => updateForm("escalation", "reason", e.target.value)} className={inputCls} />
            <textarea placeholder="Lead's last message (quoted)" value={forms.escalation.lastMessage} onChange={(e) => updateForm("escalation", "lastMessage", e.target.value)} rows={2} className={textareaCls} />
            <input type="text" placeholder="Response window (e.g. 2 hours)" value={forms.escalation.responseWindow} onChange={(e) => updateForm("escalation", "responseWindow", e.target.value)} className={inputCls} />
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  setLoading("escalate-lead");
                  setError(null);
                  try {
                    const leadMsg = `Hi ${forms.escalation.leadName || "there"}, I want to make sure you get the best answer on that. I'm bringing in a senior XPS flooring specialist — they'll text or call you from ${companyFacts?.automation_phone_display || "1-833-700-1239"} within the next ${forms.escalation.responseWindow}. Is that okay? — XPS AI Assistant`;
                    const res = await base44.functions.invoke("xtremeComms", { action: "sendSms", to: forms.escalation.leadPhone, message: leadMsg, from: companyFacts?.automation_phone });
                    setResults(res.data);
                    queryClient.invalidateQueries({ queryKey: ["comms-sop-logs"] });
                  } catch (e) { setError(e.response?.data?.error || e.message); }
                  finally { setLoading(null); }
                }}
                disabled={!forms.escalation.leadPhone || loading !== null}
                className={btnCls + " flex-1"}
              >
                {loading === "escalate-lead" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Text the lead
              </button>
              <button
                onClick={async () => {
                  setLoading("escalate-notify");
                  setError(null);
                  try {
                    const notifyMsg = `⚠️ ESCALATION: Lead ${forms.escalation.leadName || "Unknown"} (${forms.escalation.leadPhone}) needs a human. Reason: ${forms.escalation.reason || "not specified"}. Last message: "${forms.escalation.lastMessage || "—"}". Please reach out from ${companyFacts?.automation_phone_display || "1-833-700-1239"} within ${forms.escalation.responseWindow}. — XPS AI`;
                    const res = await base44.functions.invoke("xtremeComms", { action: "sendSms", to: companyFacts?.sales_phone, message: notifyMsg, from: companyFacts?.automation_phone });
                    setResults(res.data);
                    queryClient.invalidateQueries({ queryKey: ["comms-sop-logs"] });
                  } catch (e) { setError(e.response?.data?.error || e.message); }
                  finally { setLoading(null); }
                }}
                disabled={loading !== null}
                className={btnCls + " flex-1 bg-amber-600"}
              >
                {loading === "escalate-notify" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />} Notify specialist
              </button>
            </div>
            <p className="text-xs text-stone-400">Both messages send from the automation line {companyFacts?.automation_phone_display || "1-833-700-1239"} via Xtreme Communications.</p>
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
              <select value={forms.voice.from} onChange={(e) => updateForm("voice", "from", e.target.value)} className={inputCls}>
                <option value="">— Select from number —</option>
                {phoneNumbers.map((n) => (
                  <option key={n.phone} value={n.phone}>{n.phone} {n.verified ? "✓ verified" : "⚠ unverified"}</option>
                ))}
              </select>
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
            <div className="border-t border-stone-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-stone-900 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-amber-500" /> Provisioned & Validated Numbers</h3>
                <button onClick={() => refetchNumbers()} disabled={numbersLoading} className="h-8 px-3 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:border-amber-500 hover:text-amber-600 flex items-center gap-1.5 disabled:opacity-50">
                  {numbersLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Refresh & Validate
                </button>
              </div>
              {numbersLoading ? (
                <div className="flex items-center gap-2 text-sm text-stone-400 py-4">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Loading and validating numbers…
                </div>
              ) : phoneNumbers.length === 0 ? (
                <p className="text-sm text-stone-400 py-4">No numbers provisioned yet. Search and buy a number above.</p>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-stone-500 mb-2">
                    {phoneNumbers.filter(n => n.verified).length} of {phoneNumbers.length} numbers verified
                  </div>
                  {phoneNumbers.map((n) => (
                    <div key={n.phone} className={`rounded-lg border p-3 flex items-center gap-3 ${n.verified ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                      <div className={`h-8 w-8 rounded-lg grid place-items-center ${n.verified ? "bg-green-100" : "bg-red-100"}`}>
                        {n.verified ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-stone-900 font-mono">{n.phone}</div>
                        <div className="text-xs text-stone-500">
                          {n.verified ? (
                            <>{n.carrier} · {n.status} · {(n.features || []).join(", ")}</>
                          ) : (
                            <>Validation failed: {n.error}</>
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${n.verified ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                        {n.verified ? "VERIFIED" : "FAILED"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
          <div className="space-y-4">
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
            <div className="border-t border-stone-100 pt-4 space-y-3">
              <h3 className="font-bold text-stone-900 flex items-center gap-2"><BookOpen className="h-5 w-5 text-amber-500" /> Company Intelligence Scraper</h3>
              <p className="text-sm text-stone-500">Uses Browserbase to scrape <strong>xtremepolishingsystems.com</strong> + <strong>nationalconcretepolishing.net</strong> and synthesizes a full company & industry intelligence report (years in business, locations, ratings, philosophies, product lines, rebuttals, escalation triggers) for the AI agent. This grounds the agent and eliminates hallucination.</p>
              <button
                onClick={async () => {
                  setLoading("intel-scrape");
                  setError(null);
                  setResults(null);
                  try {
                    const res = await base44.functions.invoke("companyIntel", { action: "scrape" });
                    setResults({ companyIntel: res.data });
                    queryClient.invalidateQueries({ queryKey: ["comms-sop-logs"] });
                  } catch (e) { setError(e.response?.data?.error || e.message); }
                  finally { setLoading(null); }
                }}
                disabled={loading !== null}
                className={btnCls + " w-full bg-amber-600"}
              >
                {loading === "intel-scrape" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />} Run Full Company Intelligence Scrape
              </button>
              {companyFacts && (
                <div className="rounded-xl border border-stone-200 p-3 text-xs text-stone-600 space-y-1">
                  <div><strong>Company:</strong> {companyFacts.name} (since {companyFacts.founded_year}, {companyFacts.years_in_business}+ yrs)</div>
                  <div><strong>HQ:</strong> {companyFacts.headquarters}</div>
                  <div><strong>Locations:</strong> {companyFacts.locations_count} · <strong>Revenue:</strong> {companyFacts.estimated_revenue}</div>
                  <div><strong>Google rating:</strong> {companyFacts.ratings.google.score}/5 ({companyFacts.ratings.google.count} reviews) · <strong>BBB:</strong> {companyFacts.ratings.bbb.grade}</div>
                  <div><strong>Automation line:</strong> {companyFacts.automation_phone_display} · <strong>Sales:</strong> {companyFacts.sales_phone}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Test Lab — closed-loop testing chamber */}
        {tab === "testlab" && <TestLabTab companyFacts={companyFacts} />}

        {/* AI Agents — persona management */}
        {tab === "agents" && <AgentsTab />}

        {/* Voice Sessions — AI voice session log + launcher */}
        {tab === "voicesessions" && <VoiceSessionsTab companyFacts={companyFacts} />}
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