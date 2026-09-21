import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Phone, MessageSquare, RefreshCw, Search, Plus, Trash2,
  Send, CheckCircle2, AlertCircle, Loader2, ArrowRight, ArrowLeft,
  Activity, ShieldCheck, Layers, Edit3, X, Zap,
} from "lucide-react";
import AutonomousSetupTab from "@/components/telnyx/AutonomousSetupTab";

const TABS = [
  { id: "setup", label: "Autonomous Setup", icon: Zap },
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "numbers", label: "Phone Numbers", icon: Phone },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "profiles", label: "Messaging Profiles", icon: Layers },
];

export default function TelnyxManager() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [searchOpts, setSearchOpts] = useState({ areaCode: "", countryCode: "US", features: "sms,voice", limit: 20 });
  const [searchResults, setSearchResults] = useState(null);
  const [verifyInput, setVerifyInput] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);

  const [smsForm, setSmsForm] = useState({ to: "", from: "", text: "" });
  const [messages, setMessages] = useState(null);

  const [profileForm, setProfileForm] = useState({ name: "", webhookUrl: "", enabled: true });
  const [editingProfile, setEditingProfile] = useState(null);
  const [assignState, setAssignState] = useState({});

  const { data: numbersData, isLoading: numbersLoading, refetch: refetchNumbers } = useQuery({
    queryKey: ["telnyx-numbers"],
    queryFn: () => base44.functions.invoke("telnyxManager", { action: "listNumbers" }),
    staleTime: 30000,
  });
  const numbers = numbersData?.data?.result?.numbers || [];

  const { data: profilesData, refetch: refetchProfiles } = useQuery({
    queryKey: ["telnyx-profiles"],
    queryFn: () => base44.functions.invoke("telnyxManager", { action: "listProfiles" }),
    staleTime: 60000,
  });
  const profiles = profilesData?.data?.result?.profiles || [];

  const handleSearch = async () => {
    setLoading("search");
    setError(null);
    setSearchResults(null);
    try {
      const res = await base44.functions.invoke("telnyxManager", {
        action: "searchNumbers",
        areaCode: searchOpts.areaCode || undefined,
        countryCode: searchOpts.countryCode,
        features: searchOpts.features,
        limit: searchOpts.limit,
      });
      setSearchResults(res.data.result.numbers);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleBuy = async (phoneNumber) => {
    setLoading("buy-" + phoneNumber);
    setError(null);
    try {
      await base44.functions.invoke("telnyxManager", { action: "buyNumber", phoneNumber });
      setSuccess("Purchased " + phoneNumber);
      refetchNumbers();
      setSearchResults((prev) => prev ? prev.filter((n) => n.phone_number !== phoneNumber) : null);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleRelease = async (numberId, phoneNumber) => {
    if (!confirm("Release " + phoneNumber + "? This permanently removes it from your account.")) return;
    setLoading("release-" + numberId);
    setError(null);
    try {
      await base44.functions.invoke("telnyxManager", { action: "releaseNumber", numberId });
      setSuccess("Released " + phoneNumber);
      refetchNumbers();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleSendSms = async () => {
    setLoading("send");
    setError(null);
    try {
      const res = await base44.functions.invoke("telnyxManager", {
        action: "sendSms",
        to: smsForm.to,
        from: smsForm.from,
        text: smsForm.text,
      });
      setSuccess("Message " + res.data.result.status + " — ID: " + res.data.result.message_id);
      setSmsForm({ ...smsForm, text: "" });
      handleLoadMessages();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleLoadMessages = async () => {
    setLoading("loadMsgs");
    setError(null);
    try {
      const res = await base44.functions.invoke("telnyxManager", { action: "listMessages", limit: 25 });
      setMessages(res.data.result.messages);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleVerify = async () => {
    setLoading("verify");
    setError(null);
    setVerifyResult(null);
    try {
      const res = await base44.functions.invoke("telnyxManager", { action: "verifyNumber", phoneNumber: verifyInput });
      setVerifyResult(res.data.result);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleCreateProfile = async () => {
    setLoading("createProfile");
    setError(null);
    try {
      await base44.functions.invoke("telnyxManager", {
        action: "createProfile",
        name: profileForm.name,
        webhookUrl: profileForm.webhookUrl || undefined,
        enabled: profileForm.enabled,
      });
      setSuccess('Created profile "' + profileForm.name + '"');
      setProfileForm({ name: "", webhookUrl: "", enabled: true });
      refetchProfiles();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleAssignProfile = async (numberId, profileId) => {
    setLoading("assign-" + numberId);
    setError(null);
    try {
      await base44.functions.invoke("telnyxManager", { action: "assignNumberProfile", numberId, profileId });
      setSuccess("Number assigned to profile");
      refetchNumbers();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editingProfile) return;
    setLoading("updateProfile");
    setError(null);
    try {
      await base44.functions.invoke("telnyxManager", {
        action: "updateProfile",
        profileId: editingProfile.id,
        name: editingProfile.name,
        enabled: editingProfile.enabled,
        webhookUrl: editingProfile.webhook_url || "",
      });
      setSuccess("Profile updated");
      setEditingProfile(null);
      refetchProfiles();
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const inputCls = "w-full h-10 px-3 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none";
  const btnPrimary = "h-10 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-amber-400";
  const btnDark = "h-10 rounded-lg bg-stone-900 text-white text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-stone-800";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-br from-stone-950 to-stone-900 p-6 text-white border border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-amber-500 grid place-items-center">
            <Phone className="h-7 w-7 text-stone-950" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Telnyx Manager</h1>
            <p className="text-stone-400 text-sm">Direct phone number & messaging control — buy numbers, send SMS, set up messaging profiles</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-stone-200 pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); setError(null); setSuccess(null); }}
            className={"flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition " + (tab === t.id ? "bg-stone-900 text-white" : "bg-white border border-stone-200 text-stone-600 hover:border-stone-300")}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
          <div className="text-sm text-green-700">{success}</div>
        </div>
      )}

      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        {tab === "setup" && <AutonomousSetupTab />}

        {tab === "dashboard" && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard icon={Phone} label="Phone Numbers" value={numbers.length} tone="amber" />
              <StatCard icon={Layers} label="Profiles" value={profiles.length} tone="blue" />
              <StatCard icon={CheckCircle2} label="With Profile" value={numbers.filter((n) => n.messaging_profile_id).length} tone="green" />
              <StatCard icon={AlertCircle} label="No Profile" value={numbers.filter((n) => !n.messaging_profile_id).length} tone="red" />
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="font-bold text-stone-900 flex items-center gap-2 mb-2">
                <ShieldCheck className="h-5 w-5 text-amber-600" /> Setup Checklist
              </h3>
              <ol className="space-y-2 text-sm text-stone-700">
                <li className="flex items-start gap-2">
                  <span className={"mt-0.5 " + (numbers.length > 0 ? "text-green-600" : "text-stone-400")}>{numbers.length > 0 ? "✓" : "1."}</span>
                  <span><strong>Buy a phone number</strong> — Go to the Phone Numbers tab and search/buy one.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className={"mt-0.5 " + (profiles.length > 0 ? "text-green-600" : "text-stone-400")}>{profiles.length > 0 ? "✓" : "2."}</span>
                  <span><strong>Create a messaging profile</strong> — Go to the Messaging Profiles tab and create one. This is required for SMS to work.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-stone-400">3.</span>
                  <span><strong>Assign the number to the profile</strong> — In Phone Numbers, assign each number to a messaging profile.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-stone-400">4.</span>
                  <span><strong>Complete carrier verification</strong> — For toll-free: Telnyx dashboard → Messaging → Toll-Free Verification. For local: A2P 10DLC registration. US carriers block SMS until this is done.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 text-stone-400">5.</span>
                  <span><strong>Send a test SMS</strong> — Go to the Messages tab and send a test.</span>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="font-bold text-stone-900 mb-3">Your Phone Numbers</h3>
              {numbersLoading ? (
                <div className="flex items-center gap-2 text-stone-400 py-4"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
              ) : numbers.length === 0 ? (
                <p className="text-sm text-stone-400 py-4">No numbers yet. Go to Phone Numbers to buy one.</p>
              ) : (
                <div className="space-y-2">
                  {numbers.map((n) => (
                    <div key={n.id} className="flex items-center gap-3 p-3 rounded-lg border border-stone-200">
                      <div className={"h-2 w-2 rounded-full " + (n.messaging_profile_id ? "bg-green-500" : "bg-red-500")} />
                      <span className="font-mono text-sm font-bold text-stone-900">{n.phone_number}</span>
                      <span className="text-xs text-stone-500">{n.features.join(", ")}</span>
                      {n.messaging_profile_id ? (
                        <span className="text-xs text-green-600 font-semibold">✓ Profile assigned</span>
                      ) : (
                        <span className="text-xs text-red-600 font-semibold">⚠ No profile</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "numbers" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-stone-200 p-4">
              <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><Search className="h-4 w-4 text-amber-500" /> Search Available Numbers</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <input type="text" placeholder="Area code (e.g. 954)" value={searchOpts.areaCode} onChange={(e) => setSearchOpts({ ...searchOpts, areaCode: e.target.value })} className={inputCls} />
                <input type="text" placeholder="Country (US)" value={searchOpts.countryCode} onChange={(e) => setSearchOpts({ ...searchOpts, countryCode: e.target.value })} className={inputCls} />
                <select value={searchOpts.features} onChange={(e) => setSearchOpts({ ...searchOpts, features: e.target.value })} className={inputCls}>
                  <option value="sms,voice">SMS + Voice</option>
                  <option value="sms">SMS only</option>
                  <option value="voice">Voice only</option>
                </select>
                <button onClick={handleSearch} disabled={loading === "search"} className={btnPrimary}>
                  {loading === "search" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search
                </button>
              </div>

              {searchResults && (
                <div className="mt-4 space-y-2">
                  {searchResults.length === 0 ? (
                    <p className="text-sm text-stone-400">No numbers found. Try a different area code.</p>
                  ) : (
                    searchResults.map((n) => (
                      <div key={n.phone_number} className="flex items-center justify-between p-3 rounded-lg border border-stone-200">
                        <div>
                          <span className="font-mono text-sm font-bold text-stone-900">{n.phone_number}</span>
                          <span className="text-xs text-stone-500 ml-2">{n.features.join(", ")}</span>
                        </div>
                        <button onClick={() => handleBuy(n.phone_number)} disabled={loading === "buy-" + n.phone_number} className="h-8 px-3 rounded-lg bg-green-600 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1">
                          {loading === "buy-" + n.phone_number ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} Buy
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-stone-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-stone-900 flex items-center gap-2"><Phone className="h-4 w-4 text-amber-500" /> Your Numbers ({numbers.length})</h3>
                <button onClick={() => refetchNumbers()} disabled={numbersLoading} className="h-8 px-3 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:border-amber-400 flex items-center gap-1.5">
                  {numbersLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Refresh
                </button>
              </div>

              {numbersLoading ? (
                <div className="flex items-center gap-2 text-stone-400 py-4"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
              ) : numbers.length === 0 ? (
                <p className="text-sm text-stone-400 py-4">No numbers purchased yet. Search above and buy one.</p>
              ) : (
                <div className="space-y-2">
                  {numbers.map((n) => (
                    <div key={n.id} className="p-3 rounded-lg border border-stone-200">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={"h-2 w-2 rounded-full shrink-0 " + (n.messaging_profile_id ? "bg-green-500" : "bg-red-500")} />
                          <span className="font-mono text-sm font-bold text-stone-900">{n.phone_number}</span>
                          <span className="text-xs text-stone-500 hidden sm:inline">{n.features.join(", ")}</span>
                        </div>
                        <button onClick={() => handleRelease(n.id, n.phone_number)} disabled={loading === "release-" + n.id} className="h-8 px-2.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 flex items-center gap-1 disabled:opacity-50">
                          {loading === "release-" + n.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />} Release
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <select
                          value={assignState[n.id] || n.messaging_profile_id || ""}
                          onChange={(e) => setAssignState({ ...assignState, [n.id]: e.target.value })}
                          className="h-8 px-2 rounded-lg border border-stone-200 text-xs flex-1"
                        >
                          <option value="">— Assign to profile —</option>
                          {profiles.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => assignState[n.id] && handleAssignProfile(n.id, assignState[n.id])}
                          disabled={!assignState[n.id] || loading === "assign-" + n.id}
                          className="h-8 px-3 rounded-lg bg-stone-900 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1"
                        >
                          {loading === "assign-" + n.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3" />} Assign
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-stone-200 p-4">
              <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-amber-500" /> Verify a Phone Number</h3>
              <div className="flex gap-2">
                <input type="tel" placeholder="+1 555-123-4567" value={verifyInput} onChange={(e) => setVerifyInput(e.target.value)} className={inputCls} />
                <button onClick={handleVerify} disabled={!verifyInput || loading === "verify"} className={btnDark + " shrink-0"}>
                  {loading === "verify" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Verify
                </button>
              </div>
              {verifyResult && (
                <div className={"mt-3 p-3 rounded-lg border " + (verifyResult.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50")}>
                  <div className="text-sm font-bold text-stone-900">{verifyResult.valid ? "✓ Valid" : "✗ Invalid"}</div>
                  <div className="text-xs text-stone-600 mt-1">
                    Carrier: {verifyResult.carrier} · Type: {verifyResult.line_type} · Country: {verifyResult.country_code}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "messages" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-stone-200 p-4">
              <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><Send className="h-4 w-4 text-amber-500" /> Send SMS</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">From (your number)</label>
                  <select value={smsForm.from} onChange={(e) => setSmsForm({ ...smsForm, from: e.target.value })} className={inputCls}>
                    <option value="">— Select your number —</option>
                    {numbers.map((n) => (
                      <option key={n.id} value={n.phone_number}>{n.phone_number}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">To (recipient)</label>
                  <input type="tel" placeholder="+1 555-123-4567" value={smsForm.to} onChange={(e) => setSmsForm({ ...smsForm, to: e.target.value })} className={inputCls} />
                </div>
              </div>
              <textarea placeholder="Message…" value={smsForm.text} onChange={(e) => setSmsForm({ ...smsForm, text: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:border-amber-500 outline-none mb-3" />
              <button onClick={handleSendSms} disabled={!smsForm.from || !smsForm.to || !smsForm.text || loading === "send"} className={btnPrimary + " w-full"}>
                {loading === "send" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send Message
              </button>
              <p className="text-xs text-stone-400 mt-2">⚠ US carriers require toll-free verification or A2P 10DLC registration before SMS will deliver.</p>
            </div>

            <div className="rounded-xl border border-stone-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-stone-900 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-amber-500" /> Message History</h3>
                <button onClick={handleLoadMessages} disabled={loading === "loadMsgs"} className="h-8 px-3 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:border-amber-400 flex items-center gap-1.5">
                  {loading === "loadMsgs" ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />} Load
                </button>
              </div>
              {!messages ? (
                <p className="text-sm text-stone-400 py-4">Click "Load" to fetch recent messages.</p>
              ) : messages.length === 0 ? (
                <p className="text-sm text-stone-400 py-4">No messages yet.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {messages.map((m) => (
                    <div key={m.id} className={"p-3 rounded-lg border " + (m.direction === "outbound" ? "border-blue-200 bg-blue-50" : "border-green-200 bg-green-50")}>
                      <div className="flex items-center gap-2 mb-1">
                        {m.direction === "outbound" ? <ArrowRight className="h-3 w-3 text-blue-500" /> : <ArrowLeft className="h-3 w-3 text-green-500" />}
                        <span className="text-xs font-bold text-stone-700">{m.direction === "outbound" ? "To" : "From"}: {m.direction === "outbound" ? m.to : m.from}</span>
                        <span className={"text-[10px] font-bold px-1.5 py-0.5 rounded " + (m.status === "delivered" ? "bg-green-200 text-green-800" : m.status === "delivery_failed" || m.status === "failed" ? "bg-red-200 text-red-800" : "bg-stone-200 text-stone-600")}>
                          {m.status ? m.status.toUpperCase() : "UNKNOWN"}
                        </span>
                        <span className="text-[10px] text-stone-400 ml-auto">{new Date(m.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-stone-800">{m.text}</p>
                      {m.error && <p className="text-xs text-red-600 mt-1">⚠ {m.error}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "profiles" && (
          <div className="space-y-5">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-stone-700">
              <strong>What is a messaging profile?</strong> It's a Telnyx configuration that links your phone numbers to SMS capabilities and webhooks. Every number needs one to send/receive messages.
            </div>

            <div className="rounded-xl border border-stone-200 p-4">
              <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><Plus className="h-4 w-4 text-amber-500" /> Create Messaging Profile</h3>
              <div className="space-y-3">
                <input type="text" placeholder="Profile name (e.g. 'Main SMS')" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className={inputCls} />
                <input type="text" placeholder="Webhook URL (optional — for inbound messages)" value={profileForm.webhookUrl} onChange={(e) => setProfileForm({ ...profileForm, webhookUrl: e.target.value })} className={inputCls} />
                <label className="flex items-center gap-2 text-sm text-stone-700">
                  <input type="checkbox" checked={profileForm.enabled} onChange={(e) => setProfileForm({ ...profileForm, enabled: e.target.checked })} className="h-4 w-4" />
                  Enabled
                </label>
                <button onClick={handleCreateProfile} disabled={!profileForm.name || loading === "createProfile"} className={btnPrimary + " w-full"}>
                  {loading === "createProfile" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create Profile
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 p-4">
              <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><Layers className="h-4 w-4 text-amber-500" /> Your Profiles ({profiles.length})</h3>
              {profiles.length === 0 ? (
                <p className="text-sm text-stone-400 py-4">No profiles yet. Create one above.</p>
              ) : (
                <div className="space-y-2">
                  {profiles.map((p) => (
                    <div key={p.id} className="p-3 rounded-lg border border-stone-200 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-stone-900">{p.name}</div>
                        <div className="text-xs text-stone-500">
                          {p.enabled ? <span className="text-green-600">✓ Enabled</span> : <span className="text-stone-400">Disabled</span>}
                          <span className="ml-2 font-mono">{p.id.slice(0, 8)}…</span>
                        </div>
                      </div>
                      <button onClick={() => setEditingProfile({ ...p })} className="h-8 px-3 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:border-amber-400 flex items-center gap-1">
                        <Edit3 className="h-3 w-3" /> Edit
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {editingProfile && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditingProfile(null)}>
                <div className="bg-white rounded-2xl p-5 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-stone-900">Edit Profile</h3>
                    <button onClick={() => setEditingProfile(null)} className="text-stone-400 hover:text-stone-600"><X className="h-5 w-5" /></button>
                  </div>
                  <div className="space-y-3">
                    <input type="text" value={editingProfile.name} onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })} className={inputCls} />
                    <input type="text" placeholder="Webhook URL" value={editingProfile.webhook_url || ""} onChange={(e) => setEditingProfile({ ...editingProfile, webhook_url: e.target.value })} className={inputCls} />
                    <label className="flex items-center gap-2 text-sm text-stone-700">
                      <input type="checkbox" checked={editingProfile.enabled} onChange={(e) => setEditingProfile({ ...editingProfile, enabled: e.target.checked })} className="h-4 w-4" />
                      Enabled
                    </label>
                    <button onClick={handleUpdateProfile} disabled={loading === "updateProfile"} className={btnPrimary + " w-full"}>
                      {loading === "updateProfile" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const tones = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    green: "border-green-200 bg-green-50 text-green-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    red: "border-red-200 bg-red-50 text-red-700",
  };
  return (
    <div className={"rounded-xl border p-4 " + (tones[tone] || "border-stone-200 bg-stone-50 text-stone-700")}>
      <Icon className="h-5 w-5 mb-2 opacity-80" />
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-[11px] font-semibold uppercase tracking-wide opacity-80">{label}</div>
    </div>
  );
}