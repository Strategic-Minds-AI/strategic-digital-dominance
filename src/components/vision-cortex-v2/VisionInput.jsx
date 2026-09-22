import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Rocket, Loader2, Wand2, RefreshCw, RotateCcw, Eye } from 'lucide-react';

export default function VisionInput({ vision, setVision, onShip }) {
  const [assisting, setAssisting] = useState(false);
  const [error, setError] = useState(null);

  const aiAssist = async () => {
    setAssisting(true);
    setError(null);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a visionary prompt engineer. Generate ONE powerful, specific vision statement (2-4 sentences) for an autonomous full-stack AI system that a builder could ship. The system can create: SaaS apps, lead generation funnels, content factories, SEO dominators, agent swarms, prediction engines, and autonomous workflows — all powered by AI agents that analyze, plan, generate code, and deploy automatically.

The vision should be ambitious, specific, and actionable — describing a real system that solves a real problem and creates value. Think about underserved markets, emerging trends, or wealth multiplication.

Output ONLY the vision statement text, no preamble or explanation.`,
        response_json_schema: {
          type: 'object',
          properties: { vision: { type: 'string' } },
        },
      });
      const generated = res.vision || res.text || '';
      if (generated) setVision(generated);
    } catch (e) {
      setError(e.message);
    } finally {
      setAssisting(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-violet-400 bg-gradient-to-br from-violet-50 via-white to-amber-50 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-5 w-5 text-violet-500" />
        <h3 className="text-lg font-black text-stone-900">Vision Input</h3>
        <span className="text-xs text-stone-400">Enter your vision or use AI to generate one</span>
      </div>

      <textarea
        value={vision}
        onChange={(e) => setVision(e.target.value)}
        placeholder="Describe your vision for an autonomous AI system..."
        maxLength={3000}
        className="w-full rounded-xl border-2 border-stone-200 p-3 text-sm focus:border-violet-500 outline-none min-h-24 resize-y"
      />

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-stone-400">{vision.length}/3000</span>
        <div className="flex gap-2">
          <button onClick={aiAssist} disabled={assisting} title="AI Prompt Engineer — generate a vision" className="flex items-center gap-1.5 rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:border-violet-500 disabled:opacity-50">
            {assisting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
            {assisting ? 'Engineering...' : 'AI Assist'}
          </button>
          <button onClick={aiAssist} disabled={assisting} title="Regenerate a new vision" className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-600 hover:border-amber-500 disabled:opacity-50">
            {assisting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Regenerate
          </button>
          <button onClick={() => setVision('')} disabled={!vision} className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-600 hover:border-amber-500 disabled:opacity-50">
            <RotateCcw className="h-3.5 w-3.5" /> Clear
          </button>
          <button onClick={onShip} disabled={!vision.trim()} className="flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50">
            <Rocket className="h-4 w-4" /> Ship It
          </button>
        </div>
      </div>
    </div>
  );
}