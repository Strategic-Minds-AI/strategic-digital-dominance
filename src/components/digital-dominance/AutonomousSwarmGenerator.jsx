import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Zap, Loader2, CheckCircle2, AlertCircle, Bot, Rocket } from 'lucide-react';

const SWARM_BLUEPRINT = [
  { role: 'Data Discovery Agent', purpose: 'Scans web for epoxy/concrete contractors, investors, and market data', count: 3, tools: ['cloud_browser', 'web_search'] },
  { role: 'Ingestion & Normalization Agent', purpose: 'Cleans, deduplicates, and normalizes all scraped data', count: 2, tools: ['entity_crud', 'llm'] },
  { role: 'Pricing Intelligence Agent', purpose: 'Scrapes and tracks competitor pricing across all regions', count: 2, tools: ['cloud_browser', 'llm'] },
  { role: 'Smart Bid Generator', purpose: 'Generates competitive bids from pricing intelligence and project specs', count: 2, tools: ['llm', 'entity_crud'] },
  { role: 'SEO Dominance Agent', purpose: 'Generates and deploys SEO content for every city/service combination', count: 4, tools: ['seo_generator', 'llm'] },
  { role: 'Social Media Automation Agent', purpose: 'Creates and schedules posts, images, videos across all platforms', count: 3, tools: ['social_studio', 'image_gen', 'video_gen'] },
  { role: 'YouTube Content Agent', purpose: 'Generates video content, thumbnails, descriptions, and uploads', count: 2, tools: ['video_gen', 'llm'] },
  { role: 'Lead Capture & Enrichment Agent', purpose: 'Captures leads, enriches with property/skip-trace data, scores', count: 3, tools: ['lead_scraper', 'skip_trace', 'property_lookup'] },
  { role: 'SMS/MMS Outreach Agent', purpose: 'Sends templated SMS/MMS campaigns to leads and alumni', count: 2, tools: ['xtreme_comms', 'telnyx'] },
  { role: 'Email Outreach Agent', purpose: 'Sends professional email packages with company highlights', count: 2, tools: ['send_email', 'gmail'] },
  { role: 'Voice Outreach Agent', purpose: 'AI voice calls for follow-up and appointment setting', count: 2, tools: ['voice_assistant', 'telnyx'] },
  { role: 'HubSpot Sync Agent', purpose: 'Syncs all leads and interactions to HubSpot CRM', count: 1, tools: ['hubspot'] },
  { role: 'Website Generator Agent', purpose: 'Generates and deploys websites from templates for all industries', count: 3, tools: ['website_factory', 'vercel_deploy'] },
  { role: 'Platform Submission Agent', purpose: 'Submits company name and content to every platform nationwide', count: 2, tools: ['cloud_browser', 'web_search'] },
  { role: 'Campaign Orchestrator', purpose: 'Coordinates national campaigns across all 4 brands', count: 1, tools: ['llm', 'entity_crud'] },
  { role: 'Metric & Analytics Agent', purpose: 'Tracks KPIs for every launched system', count: 2, tools: ['google_analytics', 'entity_crud'] },
  { role: 'Validation & QA Agent', purpose: 'Validates all outputs, checks quality, flags issues', count: 2, tools: ['closed_loop_tester', 'llm'] },
];

export default function AutonomousSwarmGenerator() {
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const [error, setError] = useState(null);
  const [launched, setLaunched] = useState(false);

  const generate = async () => {
    setGenerating(true);
    setError(null);
    setGenerated(null);
    setLaunched(false);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an autonomous swarm architect. Based on this swarm blueprint, generate a detailed deployment plan for each agent including their system_prompt (2-3 sentences), assigned entities, and execution schedule.

Blueprint: ${JSON.stringify(SWARM_BLUEPRINT)}

For each agent, provide:
- agent_name
- system_prompt (2-3 sentences defining behavior)
- assigned_entities (which Base44 entities they read/write)
- schedule (cron or interval)
- autonomy_level (supervised/autonomous)

Return a JSON object with an "agents" array containing all agents.`,
        response_json_schema: {
          type: 'object',
          properties: {
            agents: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  agent_name: { type: 'string' },
                  system_prompt: { type: 'string' },
                  assigned_entities: { type: 'array', items: { type: 'string' } },
                  schedule: { type: 'string' },
                  autonomy_level: { type: 'string' },
                  role: { type: 'string' },
                },
              },
            },
            total_agents: { type: 'integer' },
            estimated_monthly_cost: { type: 'string' },
          },
        },
      });
      setGenerated(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const launch = async () => {
    setLaunched(true);
    // In production, this would create AgentPersona records and register workflows
    try {
      if (generated?.agents) {
        await base44.entities.AgentPersona.bulkCreate(
          generated.agents.slice(0, 20).map((a) => ({
            name: a.agent_name,
            persona_type: 'swarm',
            system_prompt: a.system_prompt,
            assigned_context: a.role,
            max_autonomy: a.autonomy_level === 'autonomous' ? 'autonomous' : 'supervised',
            active: true,
          }))
        );
      }
    } catch (e) {
      console.error('Launch error:', e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-stone-900">Generate Your Exact Swarm</h3>
          <p className="text-sm text-stone-500">One click generates {SWARM_BLUEPRINT.reduce((s, a) => s + a.count, 0)} specialized agents across {SWARM_BLUEPRINT.length} roles to operate the entire Digital Dominance System.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50 transition"
          >
            {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
            {generating ? 'Generating Swarm...' : 'Generate Swarm'}
          </button>
          {generated && !launched && (
            <button
              onClick={launch}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition"
            >
              <Rocket className="h-5 w-5" /> Launch Swarm
            </button>
          )}
          {launched && (
            <span className="flex items-center gap-2 rounded-xl bg-green-100 border border-green-300 px-4 py-3 text-sm font-bold text-green-700">
              <CheckCircle2 className="h-5 w-5" /> Swarm Launched
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* Blueprint Preview */}
      {!generated && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SWARM_BLUEPRINT.map((agent, i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-bold text-stone-900">{agent.role}</span>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">×{agent.count}</span>
              </div>
              <p className="text-xs text-stone-600 mb-2">{agent.purpose}</p>
              <div className="flex flex-wrap gap-1">
                {agent.tools.map((t) => (
                  <span key={t} className="text-[10px] bg-white border border-stone-200 rounded px-1.5 py-0.5 text-stone-500">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Generated Swarm */}
      {generated && (
        <div className="space-y-3">
          <div className="flex items-center gap-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
            <CheckCircle2 className="h-8 w-8 text-amber-600" />
            <div>
              <p className="text-sm font-bold text-stone-900">{generated.total_agents || generated.agents?.length} agents generated</p>
              <p className="text-xs text-stone-500">Estimated monthly cost: {generated.estimated_monthly_cost || 'TBD'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(generated.agents || []).map((agent, i) => (
              <div key={i} className="rounded-xl border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-stone-900">{agent.agent_name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${agent.autonomy_level === 'autonomous' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                    {agent.autonomy_level}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mb-2">{agent.system_prompt}</p>
                <div className="flex flex-wrap gap-1">
                  {(agent.assigned_entities || []).map((e) => (
                    <span key={e} className="text-[10px] bg-stone-100 rounded px-1.5 py-0.5 text-stone-500">{e}</span>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 mt-1">Schedule: {agent.schedule}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}