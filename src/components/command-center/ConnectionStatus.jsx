import React from 'react';
import { CheckCircle2, XCircle, Link2, Calendar, Mail, Database, Folder, Sheet, FileText, ListTodo, BarChart3, Search, Facebook, HardDrive } from 'lucide-react';

const CONNECTIONS = [
  { name: 'Google Calendar', type: 'googlecalendar', icon: Calendar, scopes: 'calendar.events' },
  { name: 'Gmail', type: 'gmail', icon: Mail, scopes: 'gmail.send' },
  { name: 'Google Drive', type: 'googledrive', icon: Folder, scopes: 'drive' },
  { name: 'Google Sheets', type: 'googlesheets', icon: Sheet, scopes: 'spreadsheets' },
  { name: 'Google Docs', type: 'googledocs', icon: FileText, scopes: 'documents' },
  { name: 'Google Tasks', type: 'googletasks', icon: ListTodo, scopes: 'tasks' },
  { name: 'Google Search Console', type: 'google_search_console', icon: Search, scopes: 'webmasters' },
  { name: 'Google Analytics', type: 'google_analytics', icon: BarChart3, scopes: 'analytics.readonly' },
  { name: 'Facebook Pages', type: 'facebook_pages', icon: Facebook, scopes: 'pages_manage_posts' },
  { name: 'HubSpot', type: 'hubspot', icon: Database, scopes: 'crm.objects' },
  { name: 'Supabase', type: 'supabase', icon: HardDrive, scopes: 'database' },
];

export default function ConnectionStatus({ connected = [] }) {
  const connectedTypes = new Set(connected.map((c) => c.integration_type || c.type));

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="h-5 w-5 text-amber-500" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500">Connected Accounts</h3>
        <span className="ml-auto text-xs font-bold text-stone-400">
          {connectedTypes.size}/{CONNECTIONS.length}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {CONNECTIONS.map((conn) => {
          const isConnected = connectedTypes.has(conn.type);
          const Icon = conn.icon;
          return (
            <div
              key={conn.type}
              className={`flex items-center gap-2 rounded-lg border p-2 transition ${
                isConnected
                  ? 'border-green-200 bg-green-50'
                  : 'border-stone-200 bg-stone-50'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isConnected ? 'text-green-600' : 'text-stone-400'}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${isConnected ? 'text-stone-800' : 'text-stone-400'}`}>
                  {conn.name}
                </p>
              </div>
              {isConnected ? (
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-stone-300 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}