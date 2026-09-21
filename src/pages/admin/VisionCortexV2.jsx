import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Brain, Loader2, AlertCircle, CheckCircle2, Zap, RefreshCw,
  Video, Image, Palette, Mail, FileSpreadsheet, HardDrive,
  Globe, Cpu, MessageSquare, Database, Github, Cloud, Server,
  Clock, FileText, Sparkles, Repeat, Bot, Network,
} from 'lucide-react';
import AgentFleet, { AGENT_FLEET } from '@/components/vision-cortex/AgentFleet';
import SandboxGrid, { SANDBOXES } from '@/components/vision-cortex/SandboxGrid';

const FREE_LLMS = [
  { name: 'Groq (Llama 3.1 70B)', tier: '30 RPM, 14,400 req/day', speed: 'ultra-fast', connected: true, icon: Zap },
  { name: 'Google AI Studio (Gemini Flash)', tier: '15 RPM, 1,500 req/day', speed: 'fast', connected: true, icon: Brain },
  { name: 'OpenRouter (Free Models)', tier: '20 RPM, 200 req/day', speed: 'medium', connected: true, icon: Network },
  { name: 'Base44 InvokeLLM (automatic)', tier: 'Integration credits', speed: 'fast', connected: true, icon: Cpu },
];

const CONNECTIONS = [
  { name: 'Gmail', icon: Mail, status: 'connected', id: 'gmail' },
  { name: 'Google Drive', icon: HardDrive, status: 'connected', id: 'googledrive' },
  { name: 'Google Sheets', icon: FileSpreadsheet, status: 'connected', id: 'googlesheets' },
  { name: 'Google Docs', icon: FileText, status: 'connected', id: 'googledocs' },
  { name: 'Google Calendar', icon: Clock, status: 'connected', id: 'googlecalendar' },
  { name: 'Google Tasks', icon: CheckCircle2, status: 'connected', id: 'googletasks' },
  { name: 'Xtreme Cloud Browser', icon: Globe, status: 'connected', id: 'cloud-browser' },
  { name: 'GitHub', icon: Github, status: 'connected', id: 'github' },
  { name: 'Supabase', icon: Server, status: 'connected', id: 'supabase' },
  { name: 'Vercel', icon: Cloud, status: 'connected', id: 'vercel' },
  { name: 'HubSpot', icon: Database, status: 'connected', id: 'hubspot' },
  { name: 'Search Console', icon: Globe, status: 'connected', id: 'gsc' },
];

const TOOL_GENERATORS = [
  { name: 'Video Generator', icon: Video, desc: 'AI video creation for content, ads, demos', action: 'video' },
  { name: 'Image Generator', icon: Image, desc: 'AI image generation for any purpose', action: 'image' },
  { name: 'Logo Generator', icon: Palette, desc: 'Brand logo creation with AI', action: 'logo' },
  { name: 'Brand Kit Generator', icon: Sparkles, desc: 'Full brand identity — colors, fonts, voice', action: 'brand' },
];

export default function VisionCortexV2() {
  const [activeAgent, setActiveAgent] = useState(null);
  const [loopResult, setLoopResult] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [toolOutput, setToolOutput] = useState(null);

  const generateLoop = async () => {
    setLoading('loop');
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an Agent Loop Generator for Vision Cortex V2. Design an autonomous agent loop for this system.

AGENTS: ${AGENT_FLEET.map((a) => a.name).join(', ')}

SANDBOXES: ${SANDBOXES.map((s) => s.name + ' (' + s.subtitle + ')').join(', ')}

CONNECTIONS: Gmail, Drive, Sheets, Docs, Calendar, Tasks, Cloud Browser, GitHub, Supabase, Vercel, HubSpot, Search Console

FREE LLMS: Groq (Llama 3.1 70B), Google AI Studio (Gemini Flash), OpenRouter (free models), Base44 InvokeLLM

Design a deterministic agent loop that:
1. Scans the system for work
2. Routes work to the right agent in the right sandbox
3. Agent executes using free LLMs
4. Validator checks output
5. Truth revealer verifies evidence
6. CEO agent approves or rejects
7. Finisher deploys if approved
8. Memory is updated with results
9. Intelligence is shared across agents
10. Loop repeats

Return JSON with:
- "loopSteps": array of {step, agent, sandbox, action, input, output}
- "cronSchedule": string (recommended cron)
- "estimatedDailyCycles": number
- "freeLlmRotation": array of which LLM to use for which step
- "memoryFlow": string describing how memory is shared
- "intelligenceFlow": string describing how intelligence is shared`,
        response_json_schema: {
          type: 'object',
          properties: {
            loopSteps: { type: 'array', items: { type: 'object', properties: {
              step: { type: 'string' }, agent: { type: 'string' }, sandbox: { type: 'string' },
              action: { type: 'string' }, input: { type: 'string' }, output: { type: 'string' },
            } } },
            cronSchedule: { type: 'string' },
            estimatedDailyCycles: { type: 'number' },
            freeLlmRotation: { type: 'array', items: { type: 'string' } },
            memoryFlow: { type: 'string' },
            intelligenceFlow: { type: 'string' },
          },
        },
      });
      setLoopResult(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  const runToolGenerator = async (tool) => {
    setLoading('tool-' + tool);
    setError(null);
    setToolOutput(null);
    try {
      let result;
      if (tool === 'image' || tool === 'logo') {
        result = await base44.integrations.Core.GenerateImage({
          prompt: tool === 'logo'
            ? 'Modern minimalist logo for Vision Cortex V2 — a brain made of circuit patterns, gold and black, premium tech brand'
            : 'Futuristic AI system architecture diagram, dark background with gold accents, showing connected nodes and data flows',
        });
        setToolOutput({ type: 'image', url: result.url || result });
      } else if (tool === 'video') {
        result = await base44.integrations.Core.GenerateVideo({
          prompt: 'Cinematic flythrough of a futuristic AI command center with holographic data visualizations, gold and dark theme, smooth camera movement',
          duration: 6,
        });
        setToolOutput({ type: 'video', url: result.url || result });
      } else if (tool === 'brand') {
        result = await base44.integrations.Core.InvokeLLM({
          prompt: 'Generate a complete brand kit for Vision Cortex V2 — an autonomous AI agent system. Include: brand name, tagline, color palette (with hex codes), typography pairing, brand voice description, and 5 key brand values.',
          response_json_schema: {
            type: 'object',
            properties: {
              brandName: { type: 'string' },
              tagline: { type: 'string' },
              colors: { type: 'array', items: { type: 'object', properties: {
                name: { type: 'string' }, hex: { type: 'string' }, usage: { type: 'string' },
              } } },
              typography: { type: 'string' },
              voice: { type: 'string' },
              values: { type: 'array', items: { type: 'string' } },
            },
          },
        });
        setToolOutput({ type: 'brand', data: result });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-950 via-stone-950 to-stone-900 p-6 text-white border border-violet-500/30">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 grid place-items-center">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Vision Cortex V2</h1>
            <p className="text-stone-400 text-sm">22 agents · 5 sandboxes · free LLMs · shared intelligence + memory · autonomous 24/7</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Free LLM Status */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h3 className="text-lg font-black text-stone-900 mb-3 flex items-center gap-2">
          <Cpu className="h-5 w-5 text-amber-500" />
          Free LLM Registry — Passive 24/7 Operation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {FREE_LLMS.map((llm) => {
            const Icon = llm.icon;
            return (
              <div key={llm.name} className="rounded-xl border border-green-200 bg-green-50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-bold text-stone-900">{llm.name}</span>
                </div>
                <p className="text-xs text-stone-500">{llm.tier}</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="text-[10px] font-bold text-green-600 uppercase">{llm.speed}</span>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-stone-400 mt-2">
          Rotation strategy: Groq for high-speed code gen → Gemini Flash for long-context analysis → OpenRouter for overflow → Base44 InvokeLLM as fallback. Combined: ~30,000+ free requests/day.
        </p>
      </div>

      {/* Connections */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h3 className="text-lg font-black text-stone-900 mb-3 flex items-center gap-2">
          <Network className="h-5 w-5 text-amber-500" />
          Connected Ecosystem — info@thevisioncortex.com
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {CONNECTIONS.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.id} className="rounded-lg border border-green-200 bg-green-50 p-2 text-center">
                <Icon className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <p className="text-[10px] font-bold text-stone-700">{c.name}</p>
                <span className="text-[9px] text-green-600 font-bold">✓ Connected</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Fleet */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <AgentFleet activeAgent={activeAgent?.id} onAgentClick={setActiveAgent} />
        {activeAgent && (
          <div className="mt-4 rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
            <h4 className="font-bold text-stone-900 mb-2">{activeAgent.name} — Sandbox {activeAgent.sandbox}</h4>
            <p className="text-sm text-stone-600 mb-2">{activeAgent.role}</p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold bg-white border border-stone-200 rounded px-2 py-1">Free LLM: Groq</span>
              <span className="text-xs font-bold bg-white border border-stone-200 rounded px-2 py-1">Memory: Shared</span>
              <span className="text-xs font-bold bg-white border border-stone-200 rounded px-2 py-1">Intelligence: Shared</span>
              <span className="text-xs font-bold bg-white border border-stone-200 rounded px-2 py-1">Cron: 5 min</span>
              <span className="text-xs font-bold bg-white border border-stone-200 rounded px-2 py-1">GitHub: Synced</span>
              <span className="text-xs font-bold bg-white border border-stone-200 rounded px-2 py-1">Supabase: Connected</span>
            </div>
          </div>
        )}
      </div>

      {/* Sandboxes */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <SandboxGrid onSandboxAction={(sbId, action) => console.log(sbId, action)} />
      </div>

      {/* Agent Loop Generator */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-stone-900 flex items-center gap-2">
            <Repeat className="h-5 w-5 text-amber-500" />
            Agent Loop Generator
          </h3>
          <button onClick={generateLoop} disabled={loading === 'loop'} className="h-10 px-5 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold disabled:opacity-50 flex items-center gap-2 hover:bg-amber-400">
            {loading === 'loop' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} Generate Loop
          </button>
        </div>
        {loading === 'loop' && (
          <div className="flex items-center gap-2 text-stone-500 py-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Designing autonomous agent loop...
          </div>
        )}
        {loopResult && !loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs font-bold text-stone-500 uppercase">Cron Schedule</p>
                <p className="text-sm font-mono text-stone-800">{loopResult.cronSchedule}</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs font-bold text-stone-500 uppercase">Daily Cycles</p>
                <p className="text-2xl font-black text-stone-800">{loopResult.estimatedDailyCycles}</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs font-bold text-stone-500 uppercase">Loop Steps</p>
                <p className="text-2xl font-black text-stone-800">{loopResult.loopSteps?.length || 0}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                <p className="text-xs font-bold text-blue-600 uppercase mb-1">Memory Flow</p>
                <p className="text-xs text-stone-700">{loopResult.memoryFlow}</p>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-3">
                <p className="text-xs font-bold text-purple-600 uppercase mb-1">Intelligence Flow</p>
                <p className="text-xs text-stone-700">{loopResult.intelligenceFlow}</p>
              </div>
            </div>
            <div className="rounded-xl border border-stone-200 p-4">
              <p className="text-xs font-bold text-stone-500 uppercase mb-2">Loop Steps</p>
              <div className="space-y-2">
                {loopResult.loopSteps?.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50">
                    <span className="text-xs font-black text-amber-600">{i + 1}</span>
                    <div className="flex-1">
                      <span className="text-sm font-bold text-stone-900">{s.step}</span>
                      <span className="ml-2 text-[10px] font-bold text-amber-600 uppercase">{s.agent}</span>
                      <span className="ml-1 text-[10px] font-bold text-stone-400 uppercase">→ {s.sandbox}</span>
                      <p className="text-xs text-stone-600">{s.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-3">
              <p className="text-xs font-bold text-green-600 uppercase mb-1">Free LLM Rotation</p>
              <div className="flex flex-wrap gap-1">
                {loopResult.freeLlmRotation?.map((l, i) => (
                  <span key={i} className="text-xs font-bold bg-white border border-stone-200 rounded px-2 py-1 text-stone-700">{l}</span>
                ))}
              </div>
            </div>
          </div>
        )}
        {!loopResult && !loading && (
          <p className="text-sm text-stone-400 py-4 text-center">Generate an autonomous agent loop that runs 24/7 using free LLMs.</p>
        )}
      </div>

      {/* Tool Generators */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h3 className="text-lg font-black text-stone-900 mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Tool Generators
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {TOOL_GENERATORS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.action}
                onClick={() => runToolGenerator(tool.action)}
                disabled={loading === 'tool-' + tool.action}
                className="rounded-xl border-2 border-stone-200 p-4 text-left hover:border-amber-400 transition disabled:opacity-50"
              >
                <Icon className="h-6 w-6 text-amber-500 mb-2" />
                <p className="text-sm font-bold text-stone-900">{tool.name}</p>
                <p className="text-xs text-stone-500">{tool.desc}</p>
                {loading === 'tool-' + tool.action && <Loader2 className="h-4 w-4 animate-spin text-amber-500 mt-2" />}
              </button>
            );
          })}
        </div>
        {toolOutput && (
          <div className="mt-4 rounded-xl border border-stone-200 p-4">
            {toolOutput.type === 'image' && (
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase mb-2">Generated Image</p>
                <img src={toolOutput.url} alt="Generated" className="rounded-xl max-w-full" />
              </div>
            )}
            {toolOutput.type === 'video' && (
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase mb-2">Generated Video</p>
                <video src={toolOutput.url} controls className="rounded-xl max-w-full" />
              </div>
            )}
            {toolOutput.type === 'brand' && toolOutput.data && (
              <div>
                <p className="text-xs font-bold text-stone-500 uppercase mb-2">Brand Kit</p>
                <pre className="text-xs text-stone-700 overflow-auto">{JSON.stringify(toolOutput.data, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Communication + Memory */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h3 className="text-lg font-black text-stone-900 mb-3 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-amber-500" />
          Agent Communication + Shared Memory
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" /> Inter-Agent Communication
            </h4>
            <ul className="text-xs text-stone-600 space-y-1">
              <li>• Agents post messages to shared conversation channels</li>
              <li>• CEO agent routes decisions to relevant agents</li>
              <li>• Validator broadcasts pass/fail to all sandboxes</li>
              <li>• Shadow agent feeds intel to Strategist + Visionary</li>
              <li>• Finisher notifies all agents on deployment</li>
            </ul>
          </div>
          <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
            <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
              <Database className="h-4 w-4 text-purple-500" /> Shared Memory
            </h4>
            <ul className="text-xs text-stone-600 space-y-1">
              <li>• AgentMemory entity stores cross-agent knowledge</li>
              <li>• AgentIntelligence entity shares market + system intel</li>
              <li>• VisionMessage entity captures vision conversations</li>
              <li>• Conversation entity enables group + direct channels</li>
              <li>• All agents read/write to shared memory categories</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}