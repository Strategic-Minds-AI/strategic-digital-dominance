import React, { useState } from 'react';
import { FolderTree, Folder, FolderOpen, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';

const FOLDER_STRUCTURE = [
  {
    name: 'Clients',
    icon: '👥',
    subfolders: ['Active', 'Prospects', 'Archived', 'Onboarding Questionnaires'],
  },
  {
    name: 'Projects',
    icon: '📁',
    subfolders: ['Active', 'In Development', 'Completed', 'Research & Skip Tracing'],
  },
  {
    name: 'Proposals',
    icon: '📄',
    subfolders: ['Drafts', 'Sent', 'Won', 'Lost'],
  },
  {
    name: 'Invoices',
    icon: '💳',
    subfolders: ['Draft', 'Sent', 'Paid', 'Overdue'],
  },
  {
    name: 'Research',
    icon: '🔍',
    subfolders: ['Opportunity Scanner', 'Competitor Intel', 'Google Trends', 'Skip Trace Results'],
  },
  {
    name: 'Agents',
    icon: '🤖',
    subfolders: ['Agent Personas', 'Task Logs', 'Execution Logs', 'Memory'],
  },
  {
    name: 'Templates',
    icon: '📋',
    subfolders: ['Proposals', 'Invoices', 'Onboarding', 'SOW', 'Project Briefs', 'Email Templates'],
  },
  {
    name: 'Credentials & Vault',
    icon: '🔐',
    subfolders: ['API Keys', 'OAuth Configs', 'Secrets', 'Access Logs'],
  },
  {
    name: 'Meeting Notes',
    icon: '📝',
    subfolders: ['Weekly Reviews', 'Daily Standups', 'Strategy Sessions'],
  },
  {
    name: 'Keep Notes',
    icon: '💡',
    subfolders: ['Personal', 'Ideas', 'Quick Capture'],
  },
];

export default function DriveTree() {
  const [expanded, setExpanded] = useState(new Set(['Clients', 'Projects', 'Templates']));

  const toggle = (name) => {
    const next = new Set(expanded);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setExpanded(next);
  };

  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-200">
        <div className="h-9 w-9 rounded-lg bg-stone-900 grid place-items-center">
          <FolderTree className="h-4 w-4 text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-black text-stone-900">Drive Folder System</h2>
          <p className="text-xs text-stone-500">Strategic Minds AI — Company OS backbone</p>
        </div>
      </div>

      <div className="p-4">
        {/* Root */}
        <div className="flex items-center gap-2 mb-2 px-2">
          <FolderOpen className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-bold text-stone-900">Strategic Minds AI — Company OS</span>
        </div>

        {/* Folders */}
        <div className="ml-3 space-y-0.5">
          {FOLDER_STRUCTURE.map((folder) => (
            <div key={folder.name}>
              <button
                onClick={() => toggle(folder.name)}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-50 transition text-left"
              >
                {expanded.has(folder.name) ? (
                  <ChevronDown className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                )}
                <span className="text-sm">{folder.icon}</span>
                <span className="text-sm font-medium text-stone-700">{folder.name}</span>
                <span className="ml-auto text-[10px] text-stone-400">{folder.subfolders.length}</span>
              </button>

              {expanded.has(folder.name) && (
                <div className="ml-6 space-y-0.5">
                  {folder.subfolders.map((sub) => (
                    <div key={sub} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-stone-50 transition">
                      <Folder className="h-3.5 w-3.5 text-stone-400" />
                      <span className="text-xs text-stone-600">{sub}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100">
          <a
            href="https://drive.google.com/drive/folders/1ILha58M5IEIHa5t1uOLVyGebPlRZfhc6"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 text-xs text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Open your Drive folder →
          </a>
        </div>
      </div>
    </div>
  );
}