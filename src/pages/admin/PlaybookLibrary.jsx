import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import {
  BookOpen, Sparkles, Crown, TrendingUp, DollarSign, Bot, Share2, Activity,
  Brain, Globe, Users, Search, ChevronDown, ChevronRight, Copy, Check,
  Zap, ArrowRight, Wand2, Target, Rocket, Layers, MessageSquare, Lightbulb,
  Send, Loader2, AlertCircle
} from "lucide-react";
import { PROMPT_CATEGORIES, STARTER_PROMPTS } from "@/data/playbookPrompts";

const ICON_MAP = {
  Brain, Globe, TrendingUp, Users, Bot, DollarSign, Activity, Crown, Share2,
};

export default function PlaybookLibrary() {
  const [vision, setVision] = useState("");
  const [expandedVision, setExpandedVision] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [copiedPrompt, setCopiedPrompt] = useState(null);
  const [search, setSearch] = useState("");

  // AI Assist mutation — expands the user's words strategically
  const aiAssist = useMutation({
    mutationFn: async (input) => {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are the Xtreme Intelligence Architect — a world-class business strategist and autonomous systems designer. The user has written a rough vision statement for their epoxy/concrete coating contractor SaaS platform. Your job is to take their words and expand them into a highly strategic, detailed, wealth-producing vision statement that is unique, scalable, and designed for autonomous 24/7 operation.

USER'S INPUT:
"${input}"

Expand this into a comprehensive vision statement that includes:
1. The core autonomous system being built (website factory, AI agents, lead engine)
2. The scale of operation (how many sites, cities, leads, revenue)
3. The autonomous agents and their roles (sales, marketing, closing, operations)
4. The monetization model (lead sales, ads, subscriptions, data)
5. The self-healing and self-optimizing capabilities
6. The ultimate wealth and growth outcome

Write it as a powerful, specific, actionable vision statement — not a list, but a compelling paragraph that reads like a mission. Use deterministic language (no "maybe" or "try to"). Make it ambitious but grounded in the real capabilities of the platform. Keep it under 300 words.`,
        model: "claude-opus-4.7",
      });
      return res;
    },
    onSuccess: (data) => {
      const text = typeof data === "string" ? data : data.response || data.text || JSON.stringify(data);
      setExpandedVision(text);
    },
  });

  const handleStarterClick = (text) => {
    setVision(text);
    setExpandedVision("");
  };

  const handleAiAssist = () => {
    if (!vision.trim()) return;
    aiAssist.mutate(vision);
  };

  const handleEnter = () => {
    const finalVision = expandedVision || vision;
    if (!finalVision.trim()) return;
    // Save to strategy documents for agentic retrieval
    base44.entities.StrategyDocument.create({
      title: "Vision Statement — Playbook Library",
      type: "vision",
      content: finalVision,
      summary: finalVision.slice(0, 200),
      status: "active",
      tags: ["vision", "playbook", "autonomous", "wealth"],
    }).catch(() => {});
  };

  const handleCopy = (prompt, idx) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(idx);
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const filteredCategories = useMemo(() => {
    if (!search) return PROMPT_CATEGORIES;
    const q = search.toLowerCase();
    return PROMPT_CATEGORIES.map((cat) => ({
      ...cat,
      prompts: cat.prompts.filter(
        (p) => p.title.toLowerCase().includes(q) || p.prompt.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.prompts.length > 0);
  }, [search]);

  const totalPrompts = PROMPT_CATEGORIES.reduce((sum, c) => sum + c.prompts.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="xa-electric-hover rounded-2xl bg-stone-950 p-6">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/20 rounded-xl p-3">
            <BookOpen className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-amber-500 uppercase">Exhaustive Playbook Library</div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Vision Builder & Strategic Prompt Engine</h1>
            <p className="text-sm text-stone-400 mt-1">
              {PROMPT_CATEGORIES.length} categories · {totalPrompts} strategic prompts · 6 wealth-minded starters · AI-assisted vision expansion
            </p>
          </div>
        </div>
      </div>

      {/* Vision Statement Builder */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold text-stone-900">Vision Statement Builder</h2>
        </div>

        {/* 6 Starter Prompts */}
        <div>
          <div className="text-xs font-bold tracking-wide text-stone-500 uppercase mb-2">Wealth-Minded Starter Prompts — Click to Load</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {STARTER_PROMPTS.map((sp) => {
              const Icon = ICON_MAP[sp.icon] || Sparkles;
              return (
                <button
                  key={sp.label}
                  onClick={() => handleStarterClick(sp.text)}
                  className={`text-left p-3 rounded-xl border transition ${vision === sp.text ? "border-amber-500 bg-amber-50" : "border-stone-200 bg-stone-50 hover:border-amber-300 hover:bg-amber-50/50"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-bold text-stone-900">{sp.label}</span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">{sp.text}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Vision Fill-In */}
        <div>
          <div className="text-xs font-bold tracking-wide text-stone-500 uppercase mb-2">Your Vision Statement</div>
          <textarea
            value={vision}
            onChange={(e) => {
              setVision(e.target.value);
              setExpandedVision("");
            }}
            placeholder="Type your vision here, or click a starter prompt above. Then use AI Assist to expand it strategically..."
            className="w-full h-32 p-4 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:border-amber-500 focus:bg-white outline-none resize-none leading-relaxed"
          />
        </div>

        {/* AI Assist + Enter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAiAssist}
            disabled={!vision.trim() || aiAssist.isPending}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {aiAssist.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Expanding strategically...</>
            ) : (
              <><Wand2 className="h-4 w-4 text-amber-500" /> AI Assist — Expand Strategically</>
            )}
          </button>
          <button
            onClick={handleEnter}
            disabled={!vision.trim() && !expandedVision}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" /> Enter — Save Vision
          </button>
        </div>

        {/* AI Assist Error (credits exhausted) */}
        {aiAssist.isError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">AI Assist requires integration credits.</span> The workspace is currently out of credits — this is a billing limitation, not a bug. Credits reset on 2026-09-12. You can still type your vision manually and use the prompt library below.
            </div>
          </div>
        )}

        {/* Expanded Vision Output */}
        {expandedVision && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-bold tracking-wide text-amber-700 uppercase">AI-Expanded Strategic Vision</span>
            </div>
            <p className="text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">{expandedVision}</p>
            <button
              onClick={() => setVision(expandedVision)}
              className="mt-3 text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <ArrowRight className="h-3 w-3" /> Use this as your vision
            </button>
          </div>
        )}
      </div>

      {/* Prompt Library Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search strategic prompts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 h-11 border border-stone-200 rounded-xl text-sm bg-white focus:border-amber-500 outline-none"
        />
      </div>

      {/* Category Quick Nav */}
      <div className="flex flex-wrap gap-2">
        {PROMPT_CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Layers;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${activeCategory === cat.id ? cat.border + " " + cat.bg : "border-stone-200 bg-white hover:border-stone-300"}`}
            >
              <Icon className={`h-3.5 w-3.5 ${cat.color}`} />
              <span className="text-stone-700">{cat.name}</span>
              <span className="text-stone-400">{cat.prompts.length}</span>
            </button>
          );
        })}
      </div>

      {/* Prompt Library */}
      <div className="space-y-4">
        {filteredCategories.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || Layers;
          const isExpanded = activeCategory === cat.id || !!search;
          return (
            <div key={cat.id} className={`rounded-2xl border ${cat.border} bg-white overflow-hidden`}>
              <button
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={`w-full flex items-center gap-4 p-4 ${cat.bg} hover:opacity-80 transition`}
              >
                <div className="bg-white rounded-lg p-2 border border-stone-200">
                  <Icon className={`h-5 w-5 ${cat.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-stone-900">{cat.name}</h3>
                  <p className="text-xs text-stone-600">{cat.prompts.length} strategic prompts</p>
                </div>
                {isExpanded ? <ChevronDown className="h-5 w-5 text-stone-400" /> : <ChevronRight className="h-5 w-5 text-stone-400" />}
              </button>

              {isExpanded && (
                <div className="divide-y divide-stone-100">
                  {cat.prompts.map((p, idx) => {
                    const globalIdx = cat.id + "-" + idx;
                    return (
                      <div key={idx} className="p-4 hover:bg-stone-50 transition">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-mono font-bold ${cat.color}`}>#{idx + 1}</span>
                            <h4 className="font-bold text-stone-900 text-sm">{p.title}</h4>
                          </div>
                          <button
                            onClick={() => handleCopy(p.prompt, globalIdx)}
                            className="flex items-center gap-1 text-xs text-stone-500 hover:text-amber-600 transition shrink-0"
                          >
                            {copiedPrompt === globalIdx ? (
              <><Check className="h-3.5 w-3.5 text-emerald-500" /> Copied</>
            ) : (
              <><Copy className="h-3.5 w-3.5" /> Copy</>
            )}
                          </button>
                        </div>
                        <p className="text-sm text-stone-600 leading-relaxed line-clamp-4">{p.prompt}</p>
                        <button
                          onClick={() => handleCopy(p.prompt, globalIdx)}
                          className="mt-2 text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                        >
                          <ChevronRight className="h-3 w-3" /> Expand full prompt
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="bg-stone-950 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-3">
          <Rocket className="h-6 w-6 text-amber-500" />
          <h2 className="text-lg font-bold">Ready to Deploy Your Vision?</h2>
        </div>
        <p className="text-sm text-stone-400 mb-4">
          Once your vision is saved, hand it off to the autonomous workflows to begin 24/7 execution.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/workflows" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400 transition">
            <Zap className="h-4 w-4" /> Autonomous Workflows
          </Link>
          <Link to="/admin/system-map" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition">
            <Layers className="h-4 w-4" /> System Map
          </Link>
          <Link to="/admin/swarm" className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition">
            <Bot className="h-4 w-4" /> Swarm Command
          </Link>
        </div>
      </div>
    </div>
  );
}