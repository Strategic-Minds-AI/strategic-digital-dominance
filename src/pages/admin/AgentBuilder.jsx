import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Brain, Plus, Sparkles, Crown, Shield, FileSignature, Megaphone, Wrench,
  Calendar, Network, Share2, PhoneCall, CreditCard, Mail, Palette,
  FileText, TrendingUp, HelpCircle, Award, Compass, Wrench as Maintenance,
  Eye, UserCog, Search, Zap, Cpu, GraduationCap, LogIn, Users, DollarSign,
  Code, BarChart3, Loader2, Save, X
} from 'lucide-react';

const ICON_MAP = {
  Brain, Sparkles, Crown, Shield, FileSignature, Megaphone, Wrench,
  Calendar, Network, Share2, PhoneCall, CreditCard, Mail, Palette,
  FileText, TrendingUp, HelpCircle, Award, Compass, Maintenance,
  Eye, UserCog, Search, Zap, Cpu, GraduationCap, LogIn, Users, DollarSign,
  Code, BarChart3,
};

const PREDEFINED_AGENTS = [
  { name: 'CEO', category: 'leadership', icon: 'Crown', description: 'Strategic decision-making, company vision, executive oversight' },
  { name: 'Compliance Officer', category: 'compliance', icon: 'Shield', description: 'Regulatory compliance, safety standards, legal requirements' },
  { name: 'Contracts Manager', category: 'compliance', icon: 'FileSignature', description: 'Contract review, negotiation, legal document management' },
  { name: 'E-Sign Agent', category: 'compliance', icon: 'FileText', description: 'Electronic signature collection, document execution tracking' },
  { name: 'Sales Agent', category: 'sales', icon: 'Megaphone', description: 'Lead conversion, proposal generation, deal closing' },
  { name: 'Marketing Agent', category: 'marketing', icon: 'Share2', description: 'Campaign creation, brand messaging, lead generation' },
  { name: 'Builder Agent', category: 'technical', icon: 'Wrench', description: 'Website and app construction, deployment, configuration' },
  { name: 'Scheduler', category: 'operations', icon: 'Calendar', description: 'Appointment booking, crew scheduling, timeline management' },
  { name: 'Orchestrator', category: 'operations', icon: 'Network', description: 'Multi-agent coordination, workflow orchestration' },
  { name: 'Social Media', category: 'marketing', icon: 'Share2', description: 'Social content creation, engagement, brand monitoring' },
  { name: 'Outbound Sales', category: 'sales', icon: 'PhoneCall', description: 'Cold outreach, prospecting, follow-up campaigns' },
  { name: 'Inbound Handler', category: 'sales', icon: 'PhoneCall', description: 'Inquiry response, lead qualification, appointment setting' },
  { name: 'Billing Agent', category: 'finance', icon: 'CreditCard', description: 'Invoice generation, payment processing, revenue tracking' },
  { name: 'Follow-Up Agent', category: 'sales', icon: 'Mail', description: 'Automated follow-up sequences, nurture campaigns' },
  { name: 'Branding Agent', category: 'creative', icon: 'Palette', description: 'Brand identity, visual consistency, style guide enforcement' },
  { name: 'Communication', category: 'support', icon: 'Mail', description: 'Multi-channel messaging, customer communication' },
  { name: 'Documentor', category: 'operations', icon: 'FileText', description: 'SOP creation, process documentation, knowledge base' },
  { name: 'Scale Agent', category: 'leadership', icon: 'TrendingUp', description: 'Growth planning, capacity scaling, market expansion' },
  { name: 'Q&A Agent', category: 'support', icon: 'HelpCircle', description: 'Customer support, FAQ management, knowledge retrieval' },
  { name: 'Epoxy Expert', category: 'technical', icon: 'Award', description: 'Product knowledge, installation guidance, technical support' },
  { name: 'Mentor', category: 'leadership', icon: 'GraduationCap', description: 'Team training, skill development, coaching' },
  { name: 'Strategist', category: 'leadership', icon: 'Compass', description: 'Strategic planning, market analysis, competitive intelligence' },
  { name: 'Maintenance', category: 'operations', icon: 'Maintenance', description: 'System monitoring, upkeep scheduling, preventive maintenance' },
  { name: 'Visionary', category: 'leadership', icon: 'Eye', description: 'Future planning, innovation, trend forecasting' },
  { name: 'HR Agent', category: 'operations', icon: 'UserCog', description: 'Recruitment, onboarding, employee management' },
  { name: 'SEO & AEO', category: 'marketing', icon: 'Search', description: 'Search engine optimization, AI engine optimization' },
  { name: 'Multiplier', category: 'leadership', icon: 'Zap', description: 'Growth multiplication, viral mechanics, network effects' },
  { name: 'AI Architect', category: 'technical', icon: 'Cpu', description: 'AI system design, model selection, architecture planning' },
  { name: 'AI Engineer', category: 'technical', icon: 'Code', description: 'AI implementation, prompt engineering, model fine-tuning' },
  { name: 'Trainer', category: 'operations', icon: 'GraduationCap', description: 'Training program creation, skill assessment' },
  { name: 'Onboarding', category: 'operations', icon: 'LogIn', description: 'New client onboarding, setup, orientation' },
  { name: 'Networker', category: 'sales', icon: 'Users', description: 'Relationship building, partnership development, networking' },
  { name: 'Finance Agent', category: 'finance', icon: 'DollarSign', description: 'Financial planning, budget management, P&L analysis' },
  { name: 'Backend Analytics', category: 'technical', icon: 'BarChart3', description: 'Backend metrics, performance monitoring, data analysis' },
  { name: 'Frontend Analytics', category: 'technical', icon: 'BarChart3', description: 'Frontend metrics, user behavior, conversion tracking' },
  { name: 'Predictor', category: 'technical', icon: 'TrendingUp', description: 'Predictive modeling, forecasting, trend analysis' },
];

const CATEGORY_COLORS = {
  leadership: 'border-purple-500 bg-purple-50 text-purple-700',
  sales: 'border-blue-500 bg-blue-50 text-blue-700',
  marketing: 'border-green-500 bg-green-50 text-green-700',
  operations: 'border-amber-500 bg-amber-50 text-amber-700',
  technical: 'border-stone-700 bg-stone-100 text-stone-700',
  compliance: 'border-red-500 bg-red-50 text-red-700',
  finance: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  creative: 'border-pink-500 bg-pink-50 text-pink-700',
  support: 'border-indigo-500 bg-indigo-50 text-indigo-700',
};

export default function AgentBuilder() {
  const [showGen, setShowGen] = useState(false);
  const [genRole, setGenRole] = useState('');
  const [genDesc, setGenDesc] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState(null);
  const queryClient = useQueryClient();

  const { data: agents } = useQuery({
    queryKey: ['agent-templates'],
    queryFn: () => base44.entities.AgentTemplate.list(),
  });

  const generateAgent = async (predef) => {
    setGenRole(predef?.name || genRole);
    setGenDesc(predef?.description || genDesc);
    setShowGen(true);
    setGenerating(true);
    setGenResult(null);

    try {
      const res = await base44.functions.invoke('aiAssist', {
        action: 'generateAgent',
        role: predef?.name || genRole,
        description: predef?.description || genDesc,
      });
      const data = res.data || res;
      setGenResult(data.agent);
    } catch (e) {
      console.error(e);
      setGenResult({ error: e.message });
    } finally {
      setGenerating(false);
    }
  };

  const saveAgent = async () => {
    if (!genResult || genResult.error) return;
    await base44.entities.AgentTemplate.create({
      name: genResult.name || genRole,
      category: genResult.category || 'operations',
      description: genResult.description || genDesc,
      system_prompt: genResult.system_prompt,
      capabilities: genResult.capabilities || ['entity_read', 'function_call'],
      model: genResult.model || 'claude-sonnet-5',
      icon: genResult.icon || 'Brain',
      color: CATEGORY_COLORS[genResult.category] || CATEGORY_COLORS.operations,
      is_active: true,
      priority: 0,
    });
    queryClient.invalidateQueries({ queryKey: ['agent-templates'] });
    setShowGen(false);
    setGenResult(null);
    setGenRole('');
    setGenDesc('');
  };

  const toggleAgent = async (agent) => {
    await base44.entities.AgentTemplate.update(agent.id, { is_active: !agent.is_active });
    queryClient.invalidateQueries({ queryKey: ['agent-templates'] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">AI Agent Builder</h1>
        <p className="text-sm text-stone-500 mt-1">No-code agent template builder with {PREDEFINED_AGENTS.length} predefined roles</p>
      </div>

      {/* Active Agents */}
      <div>
        <h2 className="text-lg font-bold text-stone-800 mb-3">Saved Agent Templates ({agents?.length || 0})</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(agents || []).map((a) => {
            const Icon = ICON_MAP[a.icon] || Brain;
            return (
              <div key={a.id} className={`rounded-xl border-2 p-4 ${a.is_active ? CATEGORY_COLORS[a.category] || CATEGORY_COLORS.operations : 'border-stone-200 bg-white opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <Icon className="h-6 w-6" />
                  <button onClick={() => toggleAgent(a)} className={`text-xs font-bold ${a.is_active ? 'text-stone-700' : 'text-stone-400'}`}>
                    {a.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </div>
                <p className="font-bold text-stone-900">{a.name}</p>
                <p className="text-xs text-stone-600 mt-1 line-clamp-2">{a.description}</p>
                <p className="text-[10px] text-stone-500 mt-2 font-mono">{a.model}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Predefined Agent Templates */}
      <div>
        <h2 className="text-lg font-bold text-stone-800 mb-3">Predefined Agent Templates ({PREDEFINED_AGENTS.length})</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {PREDEFINED_AGENTS.map((agent) => {
            const Icon = ICON_MAP[agent.icon] || Brain;
            return (
              <button
                key={agent.name}
                onClick={() => generateAgent(agent)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition hover:scale-105 ${CATEGORY_COLORS[agent.category]}`}
              >
                <Icon className="h-8 w-8" />
                <span className="text-xs font-bold">{agent.name}</span>
                <span className="text-[10px] opacity-70">{agent.category}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Agent Generator */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-bold text-stone-800 mb-4">Generate Custom Agent</h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Agent role (e.g. Customer Success Manager)"
            value={genRole}
            onChange={(e) => setGenRole(e.target.value)}
            className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={genDesc}
            onChange={(e) => setGenDesc(e.target.value)}
            className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-500 outline-none"
          />
          <button
            onClick={() => generateAgent()}
            disabled={!genRole || generating}
            className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-900 disabled:opacity-50"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate
          </button>
        </div>
      </div>

      {/* Generation Result Modal */}
      {showGen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowGen(false)}>
          <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-stone-900">Generated Agent: {genRole}</h3>
              <button onClick={() => setShowGen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {generating && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
              </div>
            )}

            {genResult && !genResult.error && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-500">NAME</label>
                  <p className="text-sm font-semibold text-stone-900">{genResult.name}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500">CATEGORY</label>
                  <p className="text-sm text-stone-700">{genResult.category}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500">DESCRIPTION</label>
                  <p className="text-sm text-stone-700">{genResult.description}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500">MODEL</label>
                  <p className="text-sm text-stone-700 font-mono">{genResult.model}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500">CAPABILITIES</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(genResult.capabilities || []).map((c) => (
                      <span key={c} className="rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-600">{c}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500">SYSTEM PROMPT</label>
                  <pre className="mt-1 max-h-64 overflow-y-auto rounded-lg bg-stone-50 p-3 text-xs text-stone-700 whitespace-pre-wrap">{genResult.system_prompt}</pre>
                </div>
                <button
                  onClick={saveAgent}
                  className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-stone-900 hover:brightness-110"
                >
                  <Save className="h-4 w-4" /> Save Agent Template
                </button>
              </div>
            )}

            {genResult?.error && (
              <p className="text-sm text-red-500">Error: {genResult.error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}