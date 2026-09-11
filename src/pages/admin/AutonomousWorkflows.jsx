import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap, TrendingUp, DollarSign, Bot, Mail, PhoneCall, Star,
  Globe, Target, Rocket, Clock, ArrowRight, Network, Sparkles,
  Users, Search, Share2, FileText, MessageSquare, CheckCircle2,
  AlertCircle, Calendar, ChevronRight, Workflow, Crown, Radar,
  Brain, Activity, Wrench
} from "lucide-react";

// ============================================================
// AUTONOMOUS WORKFLOWS — Strategic sequences that orchestrate
// the system's agents, tools, and capabilities into self-running
// pipelines designed to maximize exposure, ranking, and revenue.
// ============================================================

const WORKFLOWS = [
  {
    id: "max-exposure",
    name: "Maximum Audience Exposure Workflow",
    icon: Rocket,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    gradient: "from-orange-500 to-amber-500",
    objective: "Maximize website exposure to the largest possible audience across organic, social, and AI search channels.",
    trigger: "Scheduled — runs daily at 6 AM ET",
    steps: [
      { agent: "Crystal Ball", tool: "Crystal Ball", action: "Identify the top 3 fastest-growing trade niches from BLS data to target for content expansion", link: "/admin/crystal-ball" },
      { agent: "SEO Manager", tool: "SEO Generator", action: "Generate 10 new city-specific landing pages for each high-growth niche with deterministic keyword targeting", link: "/admin/seo-generator" },
      { agent: "SEO Manager", tool: "SEO Simulator", action: "Run each new page through the simulator and auto-optimize all 8 ranking modules toward the Google-perfected baseline", link: "/admin/seo-simulator" },
      { agent: "Social Manager", tool: "Social Studio", action: "Generate and schedule 5 social posts per new page — before/after, educational, and FAQ content to Facebook Pages", link: "/admin/social-studio" },
      { agent: "SEO Manager", tool: "Google SEO", action: "Auto-submit new sitemap to Google Search Console and ping IndexNow for instant discovery", link: "/admin/google" },
      { agent: "Site Factory Manager", tool: "Site Health Monitor", action: "Verify all new pages pass Core Web Vitals and SEO compliance checks within 1 hour of deployment", link: "/admin/site-health" },
      { agent: "Comms Manager", tool: "Xtreme Comms", action: "Broadcast new content availability to the email list and trigger social amplification", link: "/admin/xtreme-comms" },
    ],
    kpis: ["New pages indexed per week", "Organic impressions growth", "Social reach per post", "AI search (AEO) mentions"],
  },
  {
    id: "first-page-google",
    name: "Fastest Path to First Page Google",
    icon: TrendingUp,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    gradient: "from-blue-500 to-cyan-500",
    objective: "Maximize speed to first page of Google for target keywords using the highest-impact ranking factors first.",
    trigger: "Entity-triggered — fires when a new site goes live",
    steps: [
      { agent: "SEO Manager", tool: "Domain Rush", action: "Verify the deployed domain is available and has high SEO value score before content generation begins", link: "/admin/domain-rush" },
      { agent: "SEO Manager", tool: "SEO Simulator", action: "Pre-fill the simulator with Google-recommended baseline values and run the DEEP scoring engine to identify gaps", link: "/admin/seo-simulator" },
      { agent: "SEO Manager", tool: "SEO Generator", action: "Generate the primary landing page with perfect on-page SEO — title, meta, H1, schema, and internal linking", link: "/admin/seo-generator" },
      { agent: "Reputation Manager", tool: "Reviews", action: "Auto-send review requests to all past customers to rapidly build Google review velocity (top 3 ranking factor)", link: "/admin/reviews" },
      { agent: "SEO Manager", tool: "Google SEO", action: "Auto-verify the property in Search Console, submit the sitemap, and ping IndexNow for instant crawling", link: "/admin/google" },
      { agent: "SEO Manager", tool: "Competitors", action: "Scan the top 3 ranking competitors for the target keyword and identify content gaps to outperform them", link: "/admin/competitors" },
      { agent: "SEO Manager", tool: "SEO Simulator", action: "Run the Generator Workflow to auto-optimize all modules — backlinks, citations, AEO, and technical — toward baseline", link: "/admin/seo-simulator" },
      { agent: "Site Factory Manager", tool: "Site Health Monitor", action: "Continuously monitor Core Web Vitals and auto-fix any degradation that would hurt rankings", link: "/admin/site-health" },
    ],
    kpis: ["Days to first page ranking", "Google review velocity", "Core Web Vitals pass rate", "Sitemap submission latency"],
  },
  {
    id: "fastest-monetization",
    name: "Fastest Path to Monetization",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    gradient: "from-emerald-500 to-green-500",
    objective: "Minimize time from site deployment to first dollar of revenue through aggressive lead capture and instant follow-up.",
    trigger: "Entity-triggered — fires when a new lead is created",
    steps: [
      { agent: "Lead Orchestrator", tool: "Leads", action: "New lead arrives from the estimator — auto-score it and assign to the best sales agent based on lead score", link: "/admin/leads" },
      { agent: "Lead Orchestrator", tool: "Property Lookup", action: "Auto-determine garage sqft via RentCast + OSM consensus to generate an accurate price estimate instantly", link: "/admin/leads" },
      { agent: "Comms Manager", tool: "Send Estimate Email", action: "Instantly email the branded PDF estimate to the lead within 60 seconds of submission", link: "/admin/emails" },
      { agent: "Comms Manager", tool: "AI Voice Assistant", action: "If the lead has a phone number, trigger an AI voice call within 5 minutes to qualify and book a consultation", link: "/admin/voice-assistant" },
      { agent: "Lead Orchestrator", tool: "Pipeline", action: "Move the lead to CONSULTATION BOOKED and notify the assigned salesperson via email", link: "/admin/pipeline" },
      { agent: "Comms Manager", tool: "Xtreme Comms", action: "Enroll the lead in a 5-touch follow-up sequence (email + SMS) over 14 days if no consultation is booked", link: "/admin/xtreme-comms" },
      { agent: "Lead Orchestrator", tool: "Sync to HubSpot", action: "Sync the lead to HubSpot CRM and Google Sheets for the sales team's external workflow", link: "/admin/leads" },
      { agent: "Lead Orchestrator", tool: "Pipeline", action: "Track the lead through PROPOSAL SENT → IN-HOME ESTIMATE → WON and calculate won value", link: "/admin/pipeline" },
    ],
    kpis: ["Time from lead to first contact", "Lead-to-consultation rate", "Consultation-to-proposal rate", "Proposal-to-won rate"],
  },
  {
    id: "sales-agent",
    name: "Autonomous Sales Agent Workflow",
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    gradient: "from-amber-500 to-yellow-500",
    objective: "AI sales agents that act as employees — handling inbound calls, qualifying leads, booking consultations, and following up autonomously.",
    trigger: "Multi-trigger — fires on new lead, inbound call, and scheduled follow-up",
    steps: [
      { agent: "Sales Agent Persona", tool: "Agent Builder", action: "Create a 'Sales Agent' persona with a warm, authoritative tone and deep product knowledge system prompt", link: "/admin/agent-builder" },
      { agent: "Sales Agent Persona", tool: "AI Voice Assistant", action: "Configure the AI voice assistant to answer inbound calls, qualify the caller, and book a consultation on the calendar", link: "/admin/voice-assistant" },
      { agent: "Sales Agent Persona", tool: "Leads", action: "When a new lead arrives, the sales agent auto-calls within 5 minutes to qualify and attempt to book a consultation", link: "/admin/leads" },
      { agent: "Sales Agent Persona", tool: "Xtreme Comms", action: "Send a personalized follow-up email referencing the call within 1 hour, including the estimate PDF", link: "/admin/xtreme-comms" },
      { agent: "Sales Agent Persona", tool: "Pipeline", action: "Update the pipeline stage based on call outcome — CONSULTATION BOOKED, NURTURE, or LOST", link: "/admin/pipeline" },
      { agent: "Sales Agent Persona", tool: "Calendar", action: "Auto-book the consultation on the salesperson's Google Calendar and send a calendar invite to the lead", link: "/admin/xtreme-comms" },
      { agent: "Sales Agent Persona", tool: "Follow-Up Sequence", action: "If the lead goes cold, trigger a 5-touch nurture sequence over 14 days with escalating urgency", link: "/admin/emails" },
      { agent: "Swarm Orchestrator", tool: "Swarm Command", action: "Log all sales agent activity to the swarm feed for visibility and hand off won deals to the closing agent", link: "/admin/swarm" },
    ],
    kpis: ["Inbound call answer rate", "Lead-to-consultation booking rate", "Average response time", "Autonomous booking success rate"],
  },
  {
    id: "marketing-agent",
    name: "Autonomous Marketing Agent Workflow",
    icon: Share2,
    color: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    gradient: "from-pink-500 to-rose-500",
    objective: "AI marketing agents that act as employees — generating content, publishing social posts, building citations, and amplifying brand reach autonomously.",
    trigger: "Scheduled — runs 3x per week",
    steps: [
      { agent: "Social Manager", tool: "Social Studio", action: "Pull completed project photos from the gallery and generate before/after social posts with AI-written captions", link: "/admin/social-studio" },
      { agent: "Social Manager", tool: "Social Studio", action: "Generate educational content (epoxy benefits, maintenance tips, FAQ) optimized for both SEO and AEO keywords", link: "/admin/social-studio" },
      { agent: "Social Manager", tool: "Social Studio", action: "Auto-generate hashtags and AEO keywords, then schedule posts across Facebook Pages at optimal times", link: "/admin/social-studio" },
      { agent: "SEO Manager", tool: "SEO Generator", action: "Generate blog content from social post themes and publish to the site for organic SEO compounding", link: "/admin/seo-generator" },
      { agent: "SEO Manager", tool: "Google SEO", action: "Build local citations across directories to boost local map pack rankings", link: "/admin/google" },
      { agent: "Reputation Manager", tool: "Reviews", action: "Monitor for new Google reviews and auto-respond to each one within 24 hours", link: "/admin/reviews" },
      { agent: "Comms Manager", tool: "Xtreme Comms", action: "Distribute top-performing content to the email list and cross-post to social channels", link: "/admin/xtreme-comms" },
      { agent: "Swarm Orchestrator", tool: "Swarm Command", action: "Report weekly marketing KPIs to the swarm feed and adjust content strategy based on engagement", link: "/admin/swarm" },
    ],
    kpis: ["Social posts published per week", "Social engagement rate", "Citations built per month", "Review response rate"],
  },
  {
    id: "closing-agent",
    name: "Autonomous Closing & Follow-Up Agent Workflow",
    icon: Target,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    gradient: "from-purple-500 to-indigo-500",
    objective: "AI closing agents that act as employees — following up on proposals, handling objections, scheduling in-home estimates, and driving leads to won.",
    trigger: "Entity-triggered — fires when a proposal is sent",
    steps: [
      { agent: "Closing Agent Persona", tool: "Agent Builder", action: "Create a 'Closing Agent' persona with an authoritative, consultative tone trained on objection handling", link: "/admin/agent-builder" },
      { agent: "Closing Agent Persona", tool: "Pipeline", action: "When a proposal is sent, the closing agent monitors the lead and triggers a follow-up sequence after 48 hours", link: "/admin/pipeline" },
      { agent: "Closing Agent Persona", tool: "AI Voice Assistant", action: "Place an AI voice call to follow up on the proposal, answer questions, and attempt to book the in-home estimate", link: "/admin/voice-assistant" },
      { agent: "Closing Agent Persona", tool: "Xtreme Comms", action: "Send a sequence of 3 follow-up emails over 7 days addressing common objections (price, timing, warranty)", link: "/admin/xtreme-comms" },
      { agent: "Closing Agent Persona", tool: "Calendar", action: "When the lead agrees, auto-book the in-home estimate on the installer's calendar and send confirmation", link: "/admin/xtreme-comms" },
      { agent: "Closing Agent Persona", tool: "Pipeline", action: "Update the pipeline to IN-HOME ESTIMATE BOOKED and notify the installation team", link: "/admin/pipeline" },
      { agent: "Closing Agent Persona", tool: "Leads", action: "After the in-home estimate, follow up within 24 hours to close the deal and move to WON", link: "/admin/leads" },
      { agent: "Swarm Orchestrator", tool: "Swarm Command", action: "Log the won deal, calculate commission, and trigger the onboarding workflow for the new customer", link: "/admin/swarm" },
    ],
    kpis: ["Proposal-to-in-home-estimate rate", "In-home-to-won conversion rate", "Average days to close", "Follow-up response rate"],
  },
  {
    id: "site-deployment",
    name: "Autonomous Site Deployment Agent Workflow",
    icon: Globe,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    gradient: "from-cyan-500 to-teal-500",
    objective: "AI site factory agents that act as employees — researching domains, generating sites, deploying, and monitoring autonomously from a queue.",
    trigger: "Scheduled — runs hourly checking the site queue",
    steps: [
      { agent: "Site Factory Manager", tool: "Site Queue", action: "Check the Website Queue for any items in 'queued' status and claim the highest-priority item", link: "/admin/queue" },
      { agent: "Site Factory Manager", tool: "Crystal Ball", action: "Research the target niche's growth velocity and competitor landscape before generating content", link: "/admin/crystal-ball" },
      { agent: "Site Factory Manager", tool: "Domain Rush", action: "Verify the target domain is available and has a high SEO value score", link: "/admin/domain-rush" },
      { agent: "Site Factory Manager", tool: "Website Factory", action: "Generate the site from the best-matching template, customizing content for the target city and niche", link: "/admin/website-factory" },
      { agent: "Site Factory Manager", tool: "SEO Generator", action: "Generate all city-specific landing pages, cost guides, and FAQ pages with deterministic keyword targeting", link: "/admin/seo-generator" },
      { agent: "Site Factory Manager", tool: "Google SEO", action: "Auto-verify the domain in Search Console, submit the sitemap, and ping IndexNow", link: "/admin/google" },
      { agent: "Site Factory Manager", tool: "Site Health Monitor", action: "Run a full health check and verify Core Web Vitals pass before marking the site as 'live'", link: "/admin/site-health" },
      { agent: "Swarm Orchestrator", tool: "Swarm Command", action: "Report the new live site to the swarm and trigger the Maximum Exposure Workflow for the new domain", link: "/admin/swarm" },
    ],
    kpis: ["Sites deployed per week", "Deployment success rate", "Time from queue to live", "Post-deployment health score"],
  },
  {
    id: "swarm-orchestration",
    name: "Full Autonomous Swarm Orchestration",
    icon: Network,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    gradient: "from-indigo-500 to-violet-500",
    objective: "The master orchestrator that coordinates all agents as autonomous employees — dispatching tasks, monitoring progress, and ensuring the entire system runs itself.",
    trigger: "Scheduled — runs every 15 minutes",
    steps: [
      { agent: "Swarm Orchestrator", tool: "Swarm Command", action: "Poll all agents for status and claim any pending tasks that match their role", link: "/admin/swarm" },
      { agent: "Swarm Orchestrator", tool: "System Health", action: "Run a quick health check and identify any subsystem scoring below 60", link: "/admin/system-health" },
      { agent: "Swarm Orchestrator", tool: "Swarm Command", action: "Dispatch tasks to the appropriate agent — SEO gaps to SEO Manager, new leads to Lead Orchestrator, etc.", link: "/admin/swarm" },
      { agent: "Swarm Orchestrator", tool: "Swarm Command", action: "Monitor inter-agent messaging and resolve any handoff failures or stuck tasks", link: "/admin/swarm" },
      { agent: "Swarm Orchestrator", tool: "SOP & Memory", action: "Log all autonomous actions to the SOP log for audit trail and continuous improvement", link: "/admin/sop" },
      { agent: "Swarm Orchestrator", tool: "Swarm Command", action: "Escalate any critical failures to the System Operator agent for human-in-the-loop resolution", link: "/admin/operator" },
      { agent: "Swarm Orchestrator", tool: "System Health", action: "Generate a daily summary report of all autonomous activity, wins, and bottlenecks", link: "/admin/system-health" },
    ],
    kpis: ["Autonomous tasks completed per day", "Agent utilization rate", "Task failure rate", "Mean time to autonomous resolution"],
  },
];

const AGENT_ROSTER = [
  { name: "Swarm Orchestrator", role: "Chief of Staff", icon: Network, color: "text-indigo-600", bg: "bg-indigo-50", desc: "Coordinates all agents, dispatches tasks, and resolves conflicts. The meta-agent that manages the workforce.", triggers: ["Every 15 min", "On critical failure", "On task handoff"] },
  { name: "Lead Orchestrator", role: "Sales Manager", icon: Users, color: "text-amber-600", bg: "bg-amber-50", desc: "Owns the lead pipeline — scores, assigns, and routes every new lead to the right agent.", triggers: ["On new lead", "On lead status change", "Hourly"] },
  { name: "SEO Manager", role: "Growth Marketer", icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50", desc: "Drives organic traffic — generates content, optimizes rankings, and manages Google Search Console.", triggers: ["On new page", "Daily 6 AM", "On competitor change"] },
  { name: "Social Manager", role: "Content Marketer", icon: Share2, color: "text-pink-600", bg: "bg-pink-50", desc: "Generates and publishes social content, manages brand voice, and amplifies reach.", triggers: ["3x per week", "On project completion"] },
  { name: "Reputation Manager", role: "Customer Success", icon: Star, color: "text-yellow-600", bg: "bg-yellow-50", desc: "Manages reviews — requests, monitors, responds — to build social proof and local SEO.", triggers: ["On project completion", "On new review", "Daily"] },
  { name: "Site Factory Manager", role: "Deployment Engineer", icon: Globe, color: "text-cyan-600", bg: "bg-cyan-50", desc: "Builds and deploys websites from the queue, monitors health, and manages the site network.", triggers: ["Hourly", "On new queue item", "On health alert"] },
  { name: "Comms Manager", role: "Communications Director", icon: MessageSquare, color: "text-cyan-600", bg: "bg-cyan-50", desc: "Orchestrates all outbound communication — email, voice, SMS — across agent personas.", triggers: ["On lead event", "On scheduled sequence", "On broadcast"] },
  { name: "System Operator", role: "IT Operations", icon: Bot, color: "text-stone-600", bg: "bg-stone-100", desc: "Human-in-the-loop interface for platform management, critical escalations, and system reporting.", triggers: ["On critical alert", "On manual request"] },
];

export default function AutonomousWorkflows() {
  const [activeWorkflow, setActiveWorkflow] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="xa-electric-hover rounded-2xl bg-stone-950 p-6">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/20 rounded-xl p-3">
            <Workflow className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-[0.2em] text-amber-500 uppercase">Autonomous Operations</div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-0.5">Strategic Workflow Engine</h1>
            <p className="text-sm text-stone-400 mt-1">
              {WORKFLOWS.length} highly strategic workflows that orchestrate agents into autonomous employees — sales, marketing, closing, and operations.
            </p>
          </div>
        </div>
      </div>

      {/* Agent Roster */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5">
        <h2 className="font-bold text-stone-900 mb-4 flex items-center gap-2">
          <Network className="h-5 w-5 text-amber-500" /> Autonomous Agent Roster — Your AI Workforce
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {AGENT_ROSTER.map((agent) => {
            const Icon = agent.icon;
            return (
              <div key={agent.name} className={`rounded-xl border border-stone-200 p-4 ${agent.bg}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-white rounded-lg p-1.5 border border-stone-200">
                    <Icon className={`h-4 w-4 ${agent.color}`} />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-stone-900">{agent.name}</div>
                    <div className="text-[10px] text-stone-500 font-medium">{agent.role}</div>
                  </div>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed mb-2">{agent.desc}</p>
                <div className="flex flex-wrap gap-1">
                  {agent.triggers.map((t) => (
                    <span key={t} className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WORKFLOWS.map((wf) => {
          const Icon = wf.icon;
          const isActive = activeWorkflow === wf.id;
          return (
            <div key={wf.id} className={`rounded-2xl border ${wf.border} bg-white overflow-hidden`}>
              {/* Header */}
              <button
                onClick={() => setActiveWorkflow(isActive ? null : wf.id)}
                className={`w-full flex items-center gap-4 p-5 bg-gradient-to-r ${wf.gradient} text-white`}
              >
                <div className="bg-white/20 rounded-xl p-2.5 backdrop-blur">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h2 className="text-lg font-bold text-white">{wf.name}</h2>
                  <p className="text-sm text-white/80 mt-0.5">{wf.objective}</p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-white/70 uppercase tracking-wide">Trigger</div>
                  <div className="text-xs text-white/90 font-medium max-w-[160px]">{wf.trigger}</div>
                </div>
              </button>

              {/* Steps */}
              {isActive && (
                <div className="p-5 space-y-3">
                  {wf.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`shrink-0 w-8 h-8 rounded-full ${wf.bg} border ${wf.border} flex items-center justify-center text-sm font-bold ${wf.color}`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-stone-700">{step.agent}</span>
                          <span className="text-[10px] text-stone-400">→</span>
                          <Link to={step.link} className="text-xs font-medium text-amber-600 hover:text-amber-700 flex items-center gap-0.5">
                            {step.tool} <ArrowRight className="h-2.5 w-2.5" />
                          </Link>
                        </div>
                        <p className="text-sm text-stone-700 mt-0.5 leading-relaxed">{step.action}</p>
                      </div>
                    </div>
                  ))}

                  {/* KPIs */}
                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <div className="text-[10px] font-bold tracking-wide text-stone-400 uppercase mb-2 flex items-center gap-1">
                      <Activity className="h-3 w-3" /> Success KPIs
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {wf.kpis.map((kpi) => (
                        <div key={kpi} className="flex items-center gap-1.5 text-xs text-stone-600">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                          {kpi}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {!isActive && (
                <div className="p-4 flex items-center justify-between text-sm text-stone-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {wf.steps.length} steps
                  </span>
                  <span className="flex items-center gap-1 text-amber-600 font-medium">
                    Expand <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Orchestration Summary */}
      <div className="bg-stone-950 rounded-2xl p-6 text-white">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-amber-500" /> How the Workflows Connect
        </h2>
        <p className="text-sm text-stone-400 leading-relaxed mb-4">
          These workflows are not isolated — they chain together as a single autonomous business engine. The Swarm Orchestrator
          coordinates all agents, dispatching tasks based on triggers and handing off between workflows seamlessly.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {[
            { label: "Site Deploy", icon: Globe, color: "text-cyan-400" },
            { label: "Max Exposure", icon: Rocket, color: "text-orange-400" },
            { label: "First Page Google", icon: TrendingUp, color: "text-blue-400" },
            { label: "Lead Capture", icon: Users, color: "text-emerald-400" },
            { label: "Sales Agent", icon: Bot, color: "text-amber-400" },
            { label: "Closing Agent", icon: Target, color: "text-purple-400" },
            { label: "Marketing Agent", icon: Share2, color: "text-pink-400" },
            { label: "Swarm Orchestrator", icon: Network, color: "text-indigo-400" },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.label}>
                <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 ${item.color}`}>
                  <Icon className="h-3.5 w-3.5" /> {item.label}
                </span>
                {i < 7 && <ChevronRight className="h-3 w-3 text-stone-600" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}