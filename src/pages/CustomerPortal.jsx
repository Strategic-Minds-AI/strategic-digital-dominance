import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image } from "@/components/ui/image";
import { ArrowRight, Phone, Mail, MapPin, Calendar, ShieldCheck, MessageSquare, Send, CheckCircle2, Clock, Wrench, Sparkles, Award, Loader2 } from "lucide-react";
import Logo, { XTREME_AI_ICON_URL } from "@/components/Logo";

const STAGES = [
  { key: "scheduled", label: "Scheduled", icon: Calendar, desc: "Your installation date is set" },
  { key: "prep", label: "Preparation", icon: Wrench, desc: "Surface prep and crack repair" },
  { key: "installation", label: "Installation", icon: Sparkles, desc: "Applying your floor system" },
  { key: "curing", label: "Curing", icon: Clock, desc: "Floor is curing — stay off it" },
  { key: "complete", label: "Complete", icon: CheckCircle2, desc: "Your new floor is ready!" }
];

export default function CustomerPortal() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [project, setProject] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("lookup"); // lookup | project
  const chatEndRef = useRef(null);

  const findProject = async () => {
    setLoading(true);
    setError("");
    try {
      const query = email ? { client_email: email } : { client_phone: phone };
      const results = await base44.entities.ClientProject.filter(query, "-created_date", 5);
      if (results && results.length > 0) {
        setProject(results[0]);
        setView("project");
        loadUpdates(results[0].id);
        loadMessages(results[0].id);
      } else {
        setError("No project found. Check your email or phone number, or contact us to get set up.");
      }
    } catch (e) {
      setError("Could not find your project. Please try again or contact us.");
    }
    setLoading(false);
  };

  const loadUpdates = async (projectId) => {
    try {
      const ups = await base44.entities.ProjectUpdate.filter({ project_id: projectId }, "-created_date", 20);
      setUpdates(ups || []);
    } catch {}
  };

  const loadMessages = async (projectId) => {
    try {
      const msgs = await base44.entities.ChatMessage.filter({ project_id: projectId }, "created_date", 100);
      setMessages(msgs || []);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {}
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !project) return;
    const text = newMessage.trim();
    setNewMessage("");
    try {
      const msg = await base44.entities.ChatMessage.create({
        project_id: project.id,
        sender_name: project.client_name || "Homeowner",
        sender_role: "client",
        text,
      });
      setMessages((m) => [...m, msg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {}
  };

  // Lookup view
  if (view === "lookup") {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <header className="bg-stone-950 text-white">
          <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
            <Logo />
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-6" style={{ width: 96, height: 96 }}>
                <Image src={XTREME_AI_ICON_URL} alt="Xtreme AI" className="w-full h-full" fittingType="fit" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Client Portal</h1>
              <p className="mt-3 text-stone-600">Track your garage floor project — timeline, photos, warranty, and direct chat with your installation team.</p>
            </div>

            <div className="rounded-2xl bg-white border border-stone-200 p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">Email address</label>
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="flex items-center gap-3 text-xs text-stone-400">
                <div className="flex-1 h-px bg-stone-200" /> OR <div className="flex-1 h-px bg-stone-200" />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 mb-1.5 block">Phone number</label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12"
                />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>}
              <Button
                onClick={findProject}
                disabled={(!email && !phone) || loading}
                className="h-14 w-full text-base font-bold bg-amber-500 hover:bg-amber-400 text-stone-950"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>FIND MY PROJECT <ArrowRight className="h-5 w-5" /></>}
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-stone-500">
              Don't have a project yet?{" "}
              <button onClick={() => navigate("/funnel")} className="font-semibold text-amber-600 hover:text-amber-700">
                Get your estimate →
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Project view
  const currentStageIdx = STAGES.findIndex((s) => s.key === project?.status);
  const beforePhotos = project?.before_photos || [];
  const afterPhotos = project?.after_photos || [];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-stone-950 text-white sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo />
          <button
            onClick={() => { setView("lookup"); setProject(null); setEmail(""); setPhone(""); }}
            className="text-sm text-stone-400 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Project header */}
        <div className="rounded-2xl bg-stone-950 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Welcome, {project?.client_name?.split(" ")[0]}</h1>
              <p className="mt-1 text-stone-400 flex items-center gap-1.5 text-sm">
                <MapPin className="h-4 w-4" /> {project?.address}, {project?.city}, {project?.state}
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold tracking-widest text-amber-500">PROJECT</div>
              <div className="text-sm text-stone-400">#{project?.id?.slice(-8).toUpperCase()}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-stone-800 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-stone-500 text-xs">Floor System</div>
              <div className="font-semibold capitalize">{project?.floor_system || "Epoxy Flake"}</div>
            </div>
            <div>
              <div className="text-stone-500 text-xs">Square Feet</div>
              <div className="font-semibold">{project?.square_footage || "—"} sq ft</div>
            </div>
            <div>
              <div className="text-stone-500 text-xs">Status</div>
              <div className="font-semibold capitalize">{project?.status || "scheduled"}</div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Project Timeline</h2>
          <div className="space-y-3">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              const isDone = idx < currentStageIdx;
              const isCurrent = idx === currentStageIdx;
              const isFuture = idx > currentStageIdx;
              return (
                <div
                  key={stage.key}
                  className={`flex items-start gap-4 rounded-xl border p-4 transition ${
                    isCurrent ? "border-amber-500 bg-amber-50" : isDone ? "border-green-200 bg-green-50/50" : "border-stone-200 bg-white"
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isDone ? "bg-green-500 text-white" : isCurrent ? "bg-amber-500 text-stone-950" : "bg-stone-100 text-stone-400"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-stone-900">{stage.label}</div>
                    <div className="text-sm text-stone-500">{stage.desc}</div>
                    {isCurrent && updates.find((u) => u.stage === stage.key) && (
                      <div className="mt-2 text-sm text-stone-700 bg-white rounded-lg p-3 border border-stone-200">
                        {updates.find((u) => u.stage === stage.key)?.description}
                      </div>
                    )}
                  </div>
                  {isFuture && <Clock className="h-4 w-4 text-stone-300" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Before/After Photos */}
        {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
          <div>
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Project Photos</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold tracking-widest text-stone-500 mb-2">BEFORE</div>
                {beforePhotos.length > 0 ? (
                  <div className="space-y-2">
                    {beforePhotos.map((url, i) => (
                      <Image key={i} src={url} alt={`Before ${i + 1}`} className="w-full aspect-[4/3] rounded-xl object-cover" fittingType="fill" />
                    ))}
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 text-sm">
                    No photos yet
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-amber-500 mb-2">AFTER</div>
                {afterPhotos.length > 0 ? (
                  <div className="space-y-2">
                    {afterPhotos.map((url, i) => (
                      <Image key={i} src={url} alt={`After ${i + 1}`} className="w-full aspect-[4/3] rounded-xl object-cover" fittingType="fill" />
                    ))}
                  </div>
                ) : (
                  <div className="w-full aspect-[4/3] rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 text-sm">
                    Coming soon
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Warranty */}
        {project?.warranty_expiration && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-stone-950" />
              </div>
              <div>
                <h3 className="font-semibold text-stone-900">Lifetime Warranty</h3>
                <p className="text-sm text-stone-600">Your floor is covered</p>
              </div>
            </div>
            <div className="text-sm text-stone-700">
              Warranty expires: <strong>{new Date(project.warranty_expiration).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</strong>
            </div>
          </div>
        )}

        {/* Chat */}
        <div>
          <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-500" /> Message Your Team
          </h2>
          <div className="rounded-2xl border border-stone-200 bg-white flex flex-col" style={{ maxHeight: 400 }}>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-stone-400 py-8 text-sm">
                  No messages yet. Send a message to your installation team below.
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender_role === "client" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                      msg.sender_role === "client"
                        ? "bg-amber-500 text-stone-950"
                        : "bg-stone-100 text-stone-900"
                    }`}
                  >
                    {msg.sender_role !== "client" && (
                      <div className="text-xs font-semibold mb-0.5 capitalize">{msg.sender_name || msg.sender_role}</div>
                    )}
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="border-t border-stone-200 p-3 flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="h-11"
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()} className="h-11 px-4 bg-stone-950 hover:bg-stone-800">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}