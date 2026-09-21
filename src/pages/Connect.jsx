import React, { useState, useMemo } from 'react';
import { Zap, Copy, Check, ExternalLink, Bot, MessageSquare, Code2, Settings } from 'lucide-react';

const CLIENTS = [
  {
    id: 'claude',
    name: 'Claude',
    icon: Bot,
    steps: [
      'Open Claude and go to your profile menu (top right).',
      'Navigate to Settings → Connectors.',
      'Click "Add custom connector".',
      'Name your connector (e.g., "Xtreme AI System").',
      'Paste the MCP server URL below.',
      'Click "Add" to save the connector.',
      'In a new chat, you can now reference the connector to operate your system.',
    ],
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    icon: MessageSquare,
    steps: [
      'Open ChatGPT and go to Apps.',
      'Enable Developer mode (confirm the risk prompt ChatGPT shows).',
      'Click "Create app".',
      'Name your app (e.g., "Xtreme AI System").',
      'Paste the MCP server URL below.',
      'Click "Create" to save.',
      'Enable the app from the chat composer before prompting it.',
    ],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    icon: Code2,
    steps: [
      'Open Cursor and go to Settings.',
      'Navigate to Tools & Integrations.',
      'Click "New MCP Server" — this opens your mcp.json file.',
      'Add an entry with the URL below:',
      '  { "mcpServers": { "xtreme-ai": { "url": "<MCP_URL>" } } }',
      'Save the file and toggle the server on.',
    ],
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: Settings,
    steps: [
      'Copy the MCP server URL below.',
      'Add it as a streamable HTTP MCP server in your AI client.',
      'Name + URL is all most clients need.',
      'Reload the client after adding.',
      'For OAuth mode: the client will open the consent page where you sign in with your app account.',
    ],
  },
];

export default function Connect() {
  const [activeClient, setActiveClient] = useState('claude');
  const [copied, setCopied] = useState(false);

  const mcpUrl = useMemo(() => {
    return new URL('/api/mcp', window.location.origin).toString();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(mcpUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const client = CLIENTS.find((c) => c.id === activeClient);

  return (
    <div className="min-h-screen bg-stone-100 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 mb-3">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-stone-900">Connect Your AI</h1>
          <p className="text-sm text-stone-500 mt-2 max-w-lg mx-auto">
            Connect GPT, Claude, Gemini, or any AI client to operate your Xtreme AI system.
            Your AI assistant can then generate visions, build agents, run campaigns, and manage everything — autonomously.
          </p>
        </div>

        {/* MCP URL */}
        <div className="rounded-2xl border border-stone-300 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">MCP Server URL</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={mcpUrl}
              readOnly
              className="flex-1 rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm font-mono text-stone-700 outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white hover:bg-amber-600 transition shrink-0"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-stone-400 mt-2">
            This URL is your system's MCP endpoint. Any AI client that supports MCP can connect using this URL.
          </p>
        </div>

        {/* Client Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {CLIENTS.map((c) => {
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => setActiveClient(c.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition ${
                  activeClient === c.id
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-400 hover:text-amber-600'
                }`}
              >
                <Icon className="h-4 w-4" />
                {c.name}
              </button>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <client.icon className="h-5 w-5 text-amber-500" />
            Connect to {client.name}
          </h2>
          <ol className="space-y-3">
            {client.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-stone-700">{step}</span>
              </li>
            ))}
          </ol>

          {/* OAuth Note */}
          <div className="mt-5 rounded-xl bg-blue-50 border border-blue-200 p-3">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> This system uses OAuth. After adding the URL, your AI client will open a consent page
              where you sign in with your Xtreme AI account and approve access. The assistant only ever acts as you —
              with your permissions.
            </p>
          </div>

          {/* Refresh Note */}
          <div className="mt-3 rounded-xl bg-stone-50 border border-stone-200 p-3">
            <p className="text-xs text-stone-500">
              <strong>Tip:</strong> After we ship updates to the system, refresh the connector in your AI client —
              assistants cache the tool list and need a refresh to see new capabilities.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center">
          <a href="/admin" className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-600">
            <ExternalLink className="h-3.5 w-3.5" />
            Back to Command Center
          </a>
        </div>
      </div>
    </div>
  );
}