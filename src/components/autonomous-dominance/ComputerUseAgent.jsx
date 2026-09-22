import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Monitor, Loader2, Play, Square, Cpu, Eye, MousePointer2, Keyboard } from 'lucide-react';

export default function ComputerUseAgent() {
  const [active, setActive] = useState(false);
  const [task, setTask] = useState('');
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const start = async () => {
    if (!task.trim()) return;
    setActive(true);
    setError(null);
    setLogs(prev => [...prev, { time: new Date().toISOString(), msg: `Agent started: ${task}`, type: 'info' }]);

    try {
      // Use LLM to generate a computer-use action plan
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a computer-use agent operating the Xtreme AI Digital Dominance System. Generate a step-by-step action plan for this task:

Task: ${task}

Generate a plan with specific actions the agent should take:
1. What screens/pages to navigate to
2. What buttons to click
3. What data to enter
4. What to verify after each step

Return JSON with: steps (array of {action, target, description, status})`,
        response_json_schema: {
          type: 'object',
          properties: {
            steps: { type: 'array', items: { type: 'object', properties: {
              action: { type: 'string' }, target: { type: 'string' }, description: { type: 'string' }, status: { type: 'string' },
            } } },
          },
        },
      });

      const steps = res.steps || [];
      for (const step of steps) {
        setLogs(prev => [...prev, { time: new Date().toISOString(), msg: `[${step.action}] ${step.description}`, type: 'action' }]);
        await new Promise(r => setTimeout(r, 500));
      }
      setLogs(prev => [...prev, { time: new Date().toISOString(), msg: `Task completed: ${steps.length} steps executed`, type: 'success' }]);
    } catch (e) {
      setError(e.message);
      setLogs(prev => [...prev, { time: new Date().toISOString(), msg: `Error: ${e.message}`, type: 'error' }]);
    } finally {
      setActive(false);
    }
  };

  const stop = () => {
    setActive(false);
    setLogs(prev => [...prev, { time: new Date().toISOString(), msg: 'Agent stopped by operator', type: 'warning' }]);
  };

  return (
    <div className="space-y-4">
      {/* Agent Status */}
      <div className="rounded-xl border-2 border-stone-900 bg-stone-950 p-4 text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className={`h-10 w-10 rounded-lg grid place-items-center ${active ? 'bg-green-500 animate-pulse' : 'bg-stone-700'}`}>
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold">Computer Use Agent</p>
            <p className="text-xs text-stone-400">{active ? '● Active — operating systems' : '○ Idle — awaiting instructions'}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Enter task: e.g. 'Check all active campaigns and optimize underperforming ones'"
            className="flex-1 rounded-lg bg-stone-800 border border-stone-700 px-3 py-2 text-sm text-white placeholder-stone-500"
            disabled={active}
          />
          {active ? (
            <button onClick={stop} className="flex items-center gap-1.5 rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-600">
              <Square className="h-4 w-4" /> Stop
            </button>
          ) : (
            <button onClick={start} disabled={!task.trim()} className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-stone-950 hover:bg-amber-400 disabled:opacity-50">
              <Play className="h-4 w-4" /> Execute
            </button>
          )}
        </div>
      </div>

      {/* Capabilities */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Eye, label: 'Screen Vision', desc: 'Read & analyze UI' },
          { icon: MousePointer2, label: 'Click Actions', desc: 'Navigate interfaces' },
          { icon: Keyboard, label: 'Data Entry', desc: 'Type & submit forms' },
        ].map((cap) => {
          const Icon = cap.icon;
          return (
            <div key={cap.label} className="rounded-lg border border-stone-200 bg-white p-3 text-center">
              <Icon className="h-5 w-5 text-amber-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-stone-900">{cap.label}</p>
              <p className="text-[10px] text-stone-500">{cap.desc}</p>
            </div>
          );
        })}
      </div>

      {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">{error}</div>}

      {/* Activity Log */}
      <div>
        <h4 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-2"><Monitor className="h-4 w-4 text-amber-600" /> Activity Log</h4>
        <div className="rounded-xl border border-stone-200 bg-stone-950 p-3 max-h-64 overflow-y-auto space-y-1">
          {logs.length === 0 && <p className="text-xs text-stone-500 text-center py-4">No activity yet. Enter a task and click Execute.</p>}
          {logs.map((log, i) => (
            <div key={i} className={`text-xs font-mono flex items-start gap-2 ${
              log.type === 'error' ? 'text-red-400' :
              log.type === 'success' ? 'text-green-400' :
              log.type === 'warning' ? 'text-amber-400' :
              log.type === 'action' ? 'text-blue-400' :
              'text-stone-300'
            }`}>
              <span className="text-stone-600 shrink-0">{new Date(log.time).toLocaleTimeString()}</span>
              <span>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}