import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Gauge, Cpu, Building2, Settings,
  Sparkles, Crown, Radar, Brain, Target, Globe,
  Factory, Smartphone, Rocket, ListOrdered, Wand2, Code2,
  TrendingUp, Heart, MapPin,
  Users, KanbanSquare, Package,
  Mail, MessageSquare, PhoneCall, Star,
  Bot, Network, ScrollText,
  Database, Layers, Wrench,
  Share2, Activity, BarChart3,
  KeyRound, UserCircle,
  Search, ChevronDown, ChevronRight, Boxes, Zap, DollarSign, Clock, ArrowRight
} from "lucide-react";

// ============================================================
// SYSTEM MAP — Forensic catalog of every admin capability
// organized by industry-standard operational categories in the
// order a contractor SaaS would actually run them.
// ============================================================

const CATEGORIES = [
  {
    id: "governance",
    name: "Command & Governance",
    icon: LayoutDashboard,
    color: "text-stone-700",
    bg: "bg-stone-100",
    border: "border-stone-300",
    order: 1,
    description: "Executive oversight, system health, and platform configuration. The control tower for the entire operation.",
    pages: [
      { to: "/admin", icon: LayoutDashboard, name: "Dashboard", desc: "Real-time lead pipeline, conversion rates, funnel drop-off, and Core Web Vitals at a glance.", examples: ["Monitor today's new estimates alongside weekly conversion trends", "Spot funnel drop-off between estimator start and lead submission", "Track won project value against pipeline velocity"] },
      { to: "/admin/system-health", icon: Gauge, name: "System Health Auditor", desc: "Self-inspecting platform that scores 9 subsystems 0-100, identifies the #1 bottleneck, and recommends the next best action.", examples: ["Detect when RAG quality drops below 60 and flag the sync gap", "Identify automation failure rate as the current bottleneck", "Get a ranked improvement list with impact and effort scores"] },
      { to: "/admin/platform", icon: Cpu, name: "Platform", desc: "Platform-level configuration, credit status, and integration health monitoring.", examples: ["Check integration credit balance before running AI-heavy workflows", "Verify connector authorization status for Gmail and HubSpot", "Monitor API rate limits across BLS, RentCast, and Google"] },
      { to: "/admin/blueprint", icon: Building2, name: "System Blueprint", desc: "Living architecture document — stack, data model, agents, functions, workflows, and integrations mapped in one place.", examples: ["Trace the full data flow from lead capture to HubSpot sync", "Audit which backend functions depend on the Supabase connector", "Review the agent hierarchy before adding a new autonomous worker"] },
      { to: "/admin/settings", icon: Settings, name: "Settings", desc: "Global business settings — company info, pricing multipliers, packages, lead scoring weights, and SEO defaults.", examples: ["Adjust the minimum project price and range percentages", "Configure lead scoring weights for timeline and garage size", "Update the salesperson profile shown on estimate emails"] },
    ]
  },
  {
    id: "intelligence",
    name: "Market Intelligence & Research",
    icon: Brain,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    order: 2,
    description: "Pre-build research — identify high-value niches, available domains, competitor gaps, and market growth trends before deploying a single site.",
    pages: [
      { to: "/admin/crystal-ball", icon: Sparkles, name: "Crystal Ball", desc: "Real BLS employment data with 10-year CAGR projections for epoxy, concrete, and trade industries. Ranks growth velocity scores deterministically.", examples: ["Identify Decorative Concrete as skyrocketing (88 score) before entering that niche", "Project 5-year employment growth for Flooring Contractors to justify expansion", "Compare wage CAGR across trades to target high-value labor markets"] },
      { to: "/admin/domain-rush", icon: Crown, name: "Domain Gold Rush", desc: "RDAP-based real-time domain availability checker with deterministic SEO value scoring for 'near me' and city-specific patterns.", examples: ["Find available epoxygaragefloorsnearme.com before a competitor does", "Score 50 domain candidates by search volume and lead value estimate", "Bulk-check domain availability across near-me and city-state patterns"] },
      { to: "/admin/competitors", icon: Radar, name: "Competitors", desc: "Competitive intelligence scanner that monitors rival contractors' SEO, pricing, and content strategies.", examples: ["Track competitor Google rankings for 'epoxy garage floor near me'", "Compare your pricing packages against the top 3 local competitors", "Identify content gaps where competitors rank but you don't"] },
      { to: "/admin/intelligence", icon: Brain, name: "Intelligence", desc: "Centralized intelligence hub aggregating market data, competitor insights, and internal performance into actionable reports.", examples: ["Cross-reference Crystal Ball growth data with competitor weakness", "Generate a market entry report for a new city before deploying a site", "Correlate lead conversion rates with competitor pricing gaps"] },
      { to: "/admin/vision-strategy", icon: Target, name: "Strategy", desc: "Persistent strategy documents — vision, mission, architecture, pricing, and growth plans stored as searchable entities for agentic retrieval.", examples: ["Store the DEEP methodology as the official operational protocol", "Document the pricing multiplier formula for AI agent retrieval", "Maintain the go-to-market strategy for national expansion"] },
      { to: "/admin/url-strategy", icon: Globe, name: "URL Strategy", desc: "Generates high-value domain strategies across niches and keyword patterns (near me, cost, city-state) with search volume and CPC estimates.", examples: ["Generate 200 domain ideas across epoxy, polished concrete, and decorative niches", "Filter to high-value 'near me' patterns with lead value > $450", "Track domains from idea → purchased → provisioned → live"] },
    ]
  },
  {
    id: "factory",
    name: "Website Factory & Deployment",
    icon: Factory,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    order: 3,
    description: "Build, clone, and deploy contractor websites at scale — from single template to national network of city-specific lead-gen sites.",
    pages: [
      { to: "/admin/website-factory", icon: Factory, name: "Website Factory", desc: "Create and manage website templates with configurable niches, cities, and deployment targets. Clone existing sites for rapid expansion.", examples: ["Clone the Orlando epoxy template for Tampa in one click", "Deploy a new template targeting 'polished concrete near me'", "Track template status from draft to live URL"] },
      { to: "/admin/app-factory", icon: Smartphone, name: "App Factory", desc: "Generate contractor-facing mobile apps from templates — the companion app for lead management, bidding, and project tracking.", examples: ["Build a contractor app branded for a specific franchisee", "Deploy the bid generator app to a new market", "Track app build status through provisioning"] },
      { to: "/admin/national-launch", icon: Rocket, name: "National Launch", desc: "Orchestrate multi-city deployment campaigns — queue hundreds of city-specific sites and monitor rollout progress.", examples: ["Launch 50 city-specific epoxy sites across Florida in one campaign", "Track deployment progress across a national rollout", "Prioritize high-search-volume cities in the launch queue"] },
      { to: "/admin/empire", icon: Crown, name: "Website Empire", desc: "Dashboard for the full network of deployed sites — geographic coverage, campaign performance, and strategic growth opportunities.", examples: ["Visualize geographic penetration across all deployed sites", "Identify underserved states for expansion targeting", "Track campaign performance across the entire site network"] },
      { to: "/admin/queue", icon: ListOrdered, name: "Site Queue", desc: "Website deployment queue — manage site build priority, assigned agents, and status from queued to monitoring.", examples: ["Prioritize a critical-priority site for immediate deployment", "Assign a swarm agent to monitor a newly live site", "Track a site from queued → researching → generating → deploying → live"] },
      { to: "/admin/rebrand-studio", icon: Wand2, name: "Rebrand Studio", desc: "Generate logos, scan sites for rebranding requirements, and mass-produce city-specific templates with custom branding.", examples: ["Generate a new logo for a franchisee and apply it across 20 city templates", "Scan an existing site to identify all rebranding touchpoints", "Bulk-publish rebranded templates to all target cities"] },
      { to: "/admin/code-studio", icon: Code2, name: "Code Studio", desc: "In-app development environment with AI chat, code editing, dynamic page builder, and code injection management.", examples: ["Build a custom landing page section with the AI builder chat", "Inject a custom analytics script into a specific page route", "Edit dynamic page sections with live preview"] },
    ]
  },
  {
    id: "seo",
    name: "SEO & Content Engine",
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    order: 4,
    description: "Organic growth machinery — simulate ranking factors, generate SEO-optimized pages, sync with Google Search Console, and monitor site health.",
    pages: [
      { to: "/admin/seo-simulator", icon: Sparkles, name: "SEO Simulator", desc: "Interactive simulator modeling 8 ranking-factor modules (Google Business, reviews, citations, social, AEO, technical, backlinks, ads) against a Google-perfected baseline.", examples: ["Simulate the impact of adding 50 Google reviews on your SEO score", "Model how improving Core Web Vitals moves the timeline to page 1", "Run the Generator Workflow to auto-optimize all modules toward baseline"] },
      { to: "/admin/seo-generator", icon: TrendingUp, name: "SEO Generator", desc: "Generate SEO-optimized content pages at scale — city-specific landing pages, cost guides, and FAQ pages with deterministic keyword targeting.", examples: ["Generate 100 city-specific 'epoxy garage floor cost' pages", "Create location pages for every major city in Florida", "Auto-generate FAQ sections optimized for AI search (AEO)"] },
      { to: "/admin/google", icon: Globe, name: "Google SEO", desc: "Google Search Console integration — verify properties, submit sitemaps, pull ranking data, and monitor indexing status.", examples: ["Auto-verify a new domain in Google Search Console", "Submit the dynamic sitemap for a newly deployed site", "Pull keyword ranking data to identify content gaps"] },
      { to: "/admin/site-health", icon: Heart, name: "Site Health Monitor", desc: "Continuous health checking across all deployed sites — Core Web Vitals, broken links, SSL, and SEO compliance.", examples: ["Get alerted when a site's LCP degrades past 2.5 seconds", "Detect broken links across the entire site network", "Monitor SSL certificate expiry for all deployed domains"] },
      { to: "/admin/location-performance", icon: MapPin, name: "Location Performance", desc: "Per-city performance tracking — leads, rankings, and revenue by geographic market.", examples: ["Compare Orlando vs Tampa lead volume and conversion rates", "Identify which cities generate the highest revenue per lead", "Track ranking improvements by location over time"] },
    ]
  },
  {
    id: "leads",
    name: "Lead Generation & Pipeline",
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    order: 5,
    description: "Capture, enrich, and manage leads through the full pipeline — from first estimate to won project.",
    pages: [
      { to: "/admin/leads", icon: Users, name: "Leads", desc: "Full lead management — list, filter, score, and assign leads with enrichment data and property lookups.", examples: ["Filter new estimates and assign high-score leads to sales agents", "View AI-enriched background data on a homeowner lead", "Track a lead from NEW ESTIMATE through CONSULTATION to WON"] },
      { to: "/admin/pipeline", icon: KanbanSquare, name: "Pipeline", desc: "Kanban-style pipeline board tracking leads through every stage from new estimate to won/lost.", examples: ["Drag a lead from CONSULTATION BOOKED to PROPOSAL SENT", "View pipeline value across all active leads", "Identify bottlenecks where leads stall between stages"] },
      { to: "/admin/lead-scraper", icon: Radar, name: "Lead Scraper", desc: "Automated lead sourcing — scrape property listings, identify homeowners, and enrich with contact data.", examples: ["Scrape Estately listings for homes with garages in target cities", "Enrich scraped leads with property sqft from RentCast", "Auto-score scraped leads based on property value and garage size"] },
      { to: "/admin/client-packages", icon: Package, name: "Client Packages", desc: "Define and manage service packages — tiers, pricing multipliers, and descriptions shown in the estimator.", examples: ["Create a premium 'Metallic Epoxy' package at 1.8x multiplier", "Adjust the standard package description for the estimator", "Configure package-specific pricing for different markets"] },
    ]
  },
  {
    id: "comms",
    name: "Communication & Outreach",
    icon: Mail,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    order: 6,
    description: "Multi-channel communication — email follow-up, AI voice calls, SMS, and review management to engage leads and close deals.",
    pages: [
      { to: "/admin/emails", icon: Mail, name: "Emails", desc: "Email log and follow-up management — track sent estimates, follow-up sequences, and email engagement.", examples: ["View all estimate emails sent in the last 7 days", "Trigger a follow-up email sequence for cold leads", "Track email open and response rates by salesperson"] },
      { to: "/admin/xtreme-comms", icon: MessageSquare, name: "Xtreme Comms", desc: "Unified communication hub — AI voice, email, SMS, and social messaging orchestrated through agent personas.", examples: ["Configure an AI voice persona for inbound call handling", "Set up an email follow-up sequence with a specific persona tone", "Manage multi-channel outreach from one dashboard"] },
      { to: "/admin/voice-assistant", icon: PhoneCall, name: "AI Voice Assistant", desc: "Telnyx-powered AI voice assistant — purchase numbers, create assistants, and configure call forwarding.", examples: ["Set up an AI voice assistant to answer after-hours calls", "Configure call forwarding to a salesperson's cell phone", "Track total calls and last call timestamp per assistant"] },
      { to: "/admin/reviews", icon: Star, name: "Reviews", desc: "Review management — request, monitor, and respond to Google reviews to build social proof and local SEO.", examples: ["Send a review request to a recently completed project customer", "Monitor new Google reviews across all business locations", "Track review velocity and average rating over time"] },
    ]
  },
  {
    id: "agents",
    name: "AI Agents & Autonomous Workers",
    icon: Bot,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    order: 7,
    description: "The autonomous workforce — AI agents that act as employees: sales, marketing, SEO, social, reputation, and orchestration agents with auto-triggers.",
    pages: [
      { to: "/admin/agent-builder", icon: Bot, name: "Agent Builder", desc: "Create and configure AI agent personas — system prompts, voice, personality, and assigned context for sales, support, and marketing roles.", examples: ["Build a 'Sales Agent' persona with a warm, authoritative tone", "Configure a 'Support Agent' for inbound customer questions", "Assign an agent to handle lead follow-up for a specific market"] },
      { to: "/admin/swarm", icon: Network, name: "Swarm Command", desc: "Multi-agent orchestration dashboard — monitor agent status, task queues, audit logs, and inter-agent messaging in real time.", examples: ["Dispatch a lead follow-up task to the lead_orchestrator agent", "View inter-agent messages as tasks are handed off", "Trigger an autonomous swarm cycle to process pending tasks"] },
      { to: "/admin/operator", icon: Bot, name: "AI Operator", desc: "Chat-based interface for the system_operator agent — manage platform-wide tasks, autonomous cycles, and system reporting through conversation.", examples: ["Ask the operator to run a full system audit", "Instruct the operator to deploy a new site for a target city", "Request a summary of all swarm activity in the last 24 hours"] },
      { to: "/admin/sop", icon: ScrollText, name: "SOP & Memory", desc: "Standard Operating Procedures stored as entities — the institutional memory that agents reference for consistent execution.", examples: ["Document the lead follow-up SOP for new agents to follow", "Store the pricing calculation SOP for deterministic execution", "Log every SOP execution for audit and improvement"] },
    ]
  },
  {
    id: "data",
    name: "Data Infrastructure & Knowledge",
    icon: Database,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    order: 8,
    description: "The intelligence backbone — RAG vector store, knowledge graph, tool registry, and app-level tool management.",
    pages: [
      { to: "/admin/rag", icon: Database, name: "RAG Engine", desc: "Vector ingestion pipeline — sync leads, content, and strategy docs into a Supabase vector store for semantic retrieval by agents.", examples: ["Sync 500 leads into the RAG store for agent retrieval", "Index all SEO content pages for semantic search", "Track RAG sync status and identify records not yet indexed"] },
      { to: "/admin/graph", icon: Network, name: "Knowledge Graph", desc: "Graph engine mapping relationships between leads, properties, competitors, and sites for traversal-based intelligence.", examples: ["Traverse the graph from a lead to their property and neighborhood", "Map competitor relationships across a target market", "Identify graph gaps where relationships haven't been established"] },
      { to: "/admin/tool-hub", icon: Layers, name: "Tool Hub", desc: "Central registry of all system tools and toggles — enable/disable capabilities and manage tool configurations.", examples: ["Enable the AI visualizer tool for a specific market", "Toggle the lead scraper on for a new campaign", "Manage which tools are available to which agents"] },
      { to: "/admin/tools", icon: Wrench, name: "App Tools", desc: "App-level tool management — configure individual tool settings, API connections, and feature flags.", examples: ["Configure the RentCast API key for property lookups", "Set up the Browserbase connection for web scraping", "Manage feature flags for the estimator and visualizer"] },
    ]
  },
  {
    id: "marketing",
    name: "Marketing & Social Amplification",
    icon: Share2,
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    order: 9,
    description: "Brand amplification — social media publishing, traffic analytics, and content distribution across channels.",
    pages: [
      { to: "/admin/social-studio", icon: Share2, name: "Social Studio", desc: "AI-powered social media content generation and publishing — create before/after posts, educational content, and schedule to Facebook Pages.", examples: ["Generate a before/after post from a completed project photo", "Schedule a week of educational epoxy content to Facebook", "Auto-generate hashtags and AEO keywords for each post"] },
      { to: "/admin/results", icon: BarChart3, name: "Analytics", desc: "Internal analytics dashboard — funnel events, conversion tracking, and engagement metrics across the platform.", examples: ["Track estimator_started events to measure funnel entry", "View conversion rates by traffic source", "Monitor engagement trends across all deployed sites"] },
      { to: "/admin/analytics", icon: Activity, name: "GA Traffic", desc: "Google Analytics integration — pull real traffic data, session recordings, and audience insights from connected GA properties.", examples: ["View real-time visitor count across all deployed sites", "Pull audience demographics for a specific city site", "Track traffic source breakdown (organic, paid, social)"] },
    ]
  },
  {
    id: "security",
    name: "Security & Access Management",
    icon: KeyRound,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    order: 10,
    description: "API key management, client portal access, and secure credential governance.",
    pages: [
      { to: "/admin/api-keys", icon: KeyRound, name: "API Keys", desc: "Generate and manage API keys for external access — admin, user, and SEO scopes with usage tracking and expiry.", examples: ["Create an SEO-scoped API key for an external reporting tool", "Revoke a compromised API key immediately", "Track API key usage count and last-used timestamp"] },
      { to: "/portal", icon: UserCircle, name: "Client Portal", desc: "Customer-facing project portal — clients track project progress, view timelines, communicate, and access company info.", examples: ["A client logs in to view their project timeline and updates", "A homeowner accesses their estimate and project photos", "A client messages the team through the portal AI chat"] },
    ]
  },
];

export default function SystemMap() {
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return CATEGORIES;
    const q = search.toLowerCase();
    return CATEGORIES.map((cat) => ({
      ...cat,
      pages: cat.pages.filter(
        (p) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q) || p.examples.some((e) => e.toLowerCase().includes(q))
      ),
    })).filter((cat) => cat.pages.length > 0);
  }, [search]);

  const totalPages = CATEGORIES.reduce((sum, c) => sum + c.pages.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="xa-electric-hover rounded-2xl bg-stone-950 p-6">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/20 rounded-xl p-3">
            <Boxes className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-amber-500 uppercase">Forensic System Map</div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Capability Catalog</h1>
            <p className="text-sm text-stone-400 mt-1">
              Every tool, template, and capability cataloged by operational category in order of execution — {CATEGORIES.length} categories, {totalPages} capabilities.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search capabilities, descriptions, or examples..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 h-11 border border-stone-200 rounded-xl text-sm bg-white focus:border-amber-500 outline-none"
        />
      </div>

      {/* Category Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition ${expanded === cat.id ? cat.border + " " + cat.bg : "border-stone-200 bg-white hover:border-stone-300"}`}
            >
              <Icon className={`h-5 w-5 ${cat.color}`} />
              <span className="text-[10px] font-bold text-stone-500 text-center leading-tight">{cat.name.split(" ")[0]}</span>
              <span className="text-[9px] text-stone-400">{cat.pages.length}</span>
            </button>
          );
        })}
      </div>

      {/* Categories */}
      {filtered.map((cat) => {
        const Icon = cat.icon;
        const isExpanded = expanded === cat.id || !!search;
        return (
          <div key={cat.id} className={`rounded-2xl border ${cat.border} bg-white overflow-hidden`}>
            {/* Category header */}
            <button
              onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
              className={`w-full flex items-center gap-4 p-5 ${cat.bg} hover:opacity-80 transition`}
            >
              <div className={`bg-white rounded-xl p-2.5 border ${cat.border}`}>
                <Icon className={`h-6 w-6 ${cat.color}`} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-stone-400">CATEGORY {cat.order}</span>
                  <span className="text-[10px] text-stone-400">·</span>
                  <span className="text-[10px] text-stone-400">{cat.pages.length} capabilities</span>
                </div>
                <h2 className="text-lg font-bold text-stone-900 mt-0.5">{cat.name}</h2>
                <p className="text-sm text-stone-600 mt-0.5">{cat.description}</p>
              </div>
              {isExpanded ? <ChevronDown className="h-5 w-5 text-stone-400" /> : <ChevronRight className="h-5 w-5 text-stone-400" />}
            </button>

            {/* Pages */}
            {isExpanded && (
              <div className="divide-y divide-stone-100">
                {cat.pages.map((page) => {
                  const PageIcon = page.icon;
                  return (
                    <div key={page.to} className="p-5 hover:bg-stone-50 transition">
                      <div className="flex items-start gap-4">
                        <div className={`rounded-lg p-2 ${cat.bg} border ${cat.border} shrink-0`}>
                          <PageIcon className={`h-5 w-5 ${cat.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link to={page.to} className="font-bold text-stone-900 hover:text-amber-600 transition">
                              {page.name}
                            </Link>
                            <Link to={page.to} className="text-xs text-stone-400 hover:text-amber-500 flex items-center gap-0.5">
                              {page.to} <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                          <p className="text-sm text-stone-600 mt-1 leading-relaxed">{page.desc}</p>
                          <div className="mt-3 space-y-1.5">
                            <div className="text-[10px] font-bold tracking-wide text-stone-400 uppercase">Example Use Cases</div>
                            {page.examples.map((ex, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm text-stone-700">
                                <span className={`text-xs font-mono font-bold ${cat.color} shrink-0 mt-0.5`}>→</span>
                                <span>{ex}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}