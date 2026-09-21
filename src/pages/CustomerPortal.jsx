import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Loader2, LayoutDashboard, Calendar, Wrench, MessageSquare,
  Sparkles, Palette, Gift, Phone, ChevronRight, Tag
} from "lucide-react";
import Logo, { XTREME_AI_ICON_URL } from "@/components/Logo";
import BackButton from "@/components/BackButton";
import PortalDashboard from "@/components/portal/PortalDashboard";
import PortalTimeline from "@/components/portal/PortalTimeline";
import PortalMaintenance from "@/components/portal/PortalMaintenance";
import PortalMessages from "@/components/portal/PortalMessages";
import PortalSchedule from "@/components/portal/PortalSchedule";
import PortalAIChat from "@/components/portal/PortalAIChat";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "timeline", label: "Timeline", icon: Calendar },
  { key: "maintenance", label: "Maintenance", icon: Wrench },
  { key: "messages", label: "Messages", icon: MessageSquare },
  { key: "schedule", label: "Schedule", icon: Sparkles },
];

export default function CustomerPortal() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [project, setProject] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("lookup"); // lookup | project | guest
  const [activeTab, setActiveTab] = useState("dashboard");

  // Load app settings for salesperson info
  useEffect(() => {
    (async () => {
      try {
        const settingsList = await base44.entities.AppSettings.list("-created_date", 1);
        setSettings(settingsList?.[0] || null);
      } catch {}
    })();
  }, []);

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
      } else {
        setError("No project found with those details.");
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

  // ── Lookup view ──
  if (view === "lookup") {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <header className="bg-stone-950 text-white">
          <div className="max-w-2xl mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BackButton className="text-stone-300 hover:text-white" showLabel={false} />
              <Logo />
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-6" style={{ width: 96, height: 96 }}>
                <img src={XTREME_AI_ICON_URL} alt="Xtreme AI" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Client Portal</h1>
              <p className="mt-3 text-stone-600">
                Track your garage floor project — timeline, photos, warranty, maintenance, and direct chat with your team.
              </p>
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

            <div className="mt-6 text-center space-y-3">
              <p className="text-sm text-stone-500">
                Don't have a project yet?{" "}
                <button onClick={() => navigate("/funnel")} className="font-semibold text-amber-600 hover:text-amber-700">
                  Get your estimate →
                </button>
              </p>
              <button
                onClick={() => setView("guest")}
                className="text-sm text-stone-400 hover:text-amber-600 font-semibold"
              >
                Browse as guest — see colors, promos & company info
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Guest view (no project found) ──
  if (view === "guest") {
    return (
      <div className="min-h-screen bg-stone-50">
        <header className="bg-stone-950 text-white sticky top-0 z-30">
          <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
            <Logo />
            <button onClick={() => setView("lookup")} className="text-sm text-stone-400 hover:text-white">
              Sign in
            </button>
          </div>
        </header>
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
          {/* Welcome */}
          <div className="rounded-2xl bg-stone-950 p-6 text-white text-center">
            <h1 className="text-2xl font-semibold">Welcome to Xtreme Polishing Systems</h1>
            <p className="mt-2 text-stone-400">Explore our color charts, special offers, and company highlights.</p>
            <button
              onClick={() => navigate("/funnel")}
              className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 text-stone-950 font-bold hover:bg-amber-400"
            >
              Get Your Free Estimate <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Color charts */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5 text-amber-500" /> Floor Color Charts
            </h2>
            <p className="text-sm text-stone-500 mb-4">Browse our full selection of epoxy flake colors, metallic finishes, and polished concrete options.</p>
            <button
              onClick={() => navigate("/color-charts")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 text-white text-sm font-bold hover:bg-stone-800"
            >
              View Color Charts <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Promo codes */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-500" /> Special Offers
            </h2>
            <div className="space-y-3">
              <div className="rounded-xl bg-white border border-amber-200 p-4 flex items-center gap-3">
                <Tag className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-stone-900">SPRING25 — 10% Off Installation</div>
                  <div className="text-sm text-stone-500">Mention this code when booking your estimate</div>
                </div>
              </div>
              <div className="rounded-xl bg-white border border-amber-200 p-4 flex items-center gap-3">
                <Tag className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-stone-900">MILITARY — 15% Off for Veterans</div>
                  <div className="text-sm text-stone-500">Thank you for your service</div>
                </div>
              </div>
              <div className="rounded-xl bg-white border border-amber-200 p-4 flex items-center gap-3">
                <Tag className="h-5 w-5 text-amber-500 shrink-0" />
                <div className="flex-1">
                  <div className="font-bold text-stone-900">REFER50 — $50 Gift Card for Referrals</div>
                  <div className="text-sm text-stone-500">Refer a friend who books and you both get $50</div>
                </div>
              </div>
            </div>
          </div>

          {/* Company highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-white p-5 text-center">
              <div className="text-3xl font-bold text-amber-500">25+</div>
              <div className="text-sm text-stone-500 mt-1">Years in Business</div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 text-center">
              <div className="text-3xl font-bold text-amber-500">10K+</div>
              <div className="text-sm text-stone-500 mt-1">Floors Coated</div>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 text-center">
              <div className="text-3xl font-bold text-amber-500">4.9★</div>
              <div className="text-sm text-stone-500 mt-1">Google Rating</div>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 text-center">
            <h3 className="font-semibold text-stone-900 mb-2">Ready to Transform Your Garage?</h3>
            <p className="text-sm text-stone-500 mb-4">Get a free AI-powered estimate with before/after visualization in minutes.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate("/funnel")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-500 text-stone-950 font-bold hover:bg-amber-400"
              >
                Start Estimate <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href="tel:18334843799"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-stone-200 text-stone-700 font-bold hover:bg-stone-50"
              >
                <Phone className="h-4 w-4" /> Call Us
              </a>
            </div>
          </div>
        </div>
        <PortalAIChat project={null} />
      </div>
    );
  }

  // ── Project view ──
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

      {/* Tab navigation */}
      <div className="max-w-3xl mx-auto px-6 pt-6">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-white border border-stone-200 p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-[80px] flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? "bg-amber-500 text-stone-950"
                    : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-3xl mx-auto px-6 py-6 pb-24">
        {activeTab === "dashboard" && (
          <PortalDashboard project={project} settings={settings} onTabChange={setActiveTab} />
        )}
        {activeTab === "timeline" && (
          <div>
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Project Timeline</h2>
            <PortalTimeline project={project} updates={updates} />
          </div>
        )}
        {activeTab === "maintenance" && <PortalMaintenance project={project} />}
        {activeTab === "messages" && <PortalMessages project={project} />}
        {activeTab === "schedule" && <PortalSchedule project={project} />}
      </div>

      {/* AI chat floating bubble */}
      <PortalAIChat project={project} />
    </div>
  );
}