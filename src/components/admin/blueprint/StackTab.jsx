import React from "react";

const STACK = [
  {
    category: "Frontend",
    color: "blue",
    items: [
      { name: "React 18", version: "^18.2.0", purpose: "UI framework", status: "active" },
      { name: "Vite", version: "latest", purpose: "Build tool + dev server", status: "active" },
      { name: "Tailwind CSS", version: "^3.4", purpose: "Styling system", status: "active" },
      { name: "shadcn/ui", version: "latest", purpose: "Component library", status: "active" },
      { name: "lucide-react", version: "^0.475", purpose: "Icon system", status: "active" },
      { name: "react-router-dom", version: "^6.26", purpose: "Routing", status: "active" },
      { name: "@tanstack/react-query", version: "^5.84", purpose: "Data fetching / cache", status: "active" },
      { name: "framer-motion", version: "^11.16", purpose: "Animations", status: "active" },
      { name: "recharts", version: "^2.15", purpose: "Charts / analytics", status: "active" },
      { name: "react-leaflet", version: "^4.2", purpose: "Maps", status: "active" },
      { name: "react-hook-form", version: "^7.54", purpose: "Form management", status: "active" },
      { name: "date-fns", version: "^3.6", purpose: "Date utilities", status: "active" },
      { name: "react-markdown", version: "^9.0", purpose: "Markdown rendering", status: "active" },
      { name: "three.js", version: "^0.171", purpose: "3D models / games", status: "available" },
      { name: "@hello-pangea/dnd", version: "^17.0", purpose: "Drag and drop", status: "available" },
    ],
  },
  {
    category: "Backend / Platform",
    color: "amber",
    items: [
      { name: "Base44 SDK", version: "^0.8.48", purpose: "Entities, auth, integrations, functions", status: "active" },
      { name: "Base44 Entities", version: "—", purpose: "24 data models (MongoDB-backed)", status: "active" },
      { name: "Base44 Functions", version: "—", purpose: "39 serverless HTTP handlers", status: "active" },
      { name: "Base44 Workflows", version: "—", purpose: "11 trigger-driven automations", status: "active" },
      { name: "Base44 Auth", version: "—", purpose: "JWT auth + Google OAuth + OTP", status: "active" },
      { name: "Base44 Integrations", version: "—", purpose: "InvokeLLM, SendEmail, UploadFile, GenerateImage, GenerateVideo", status: "active" },
      { name: "Base44 Payments", version: "—", purpose: "Wix Checkout integration", status: "active" },
    ],
  },
  {
    category: "External APIs",
    color: "emerald",
    items: [
      { name: "Railway Engine", version: "v3.1.0", purpose: "Cloud browser automation", status: "active" },
      { name: "Browserbase", version: "—", purpose: "Headless browser scraping", status: "active" },
      { name: "RentCast API", version: "—", purpose: "US property record lookups", status: "active" },
      { name: "Telnyx", version: "—", purpose: "Voice AI + SMS + MMS", status: "active" },
      { name: "Xtreme Comms", version: "—", purpose: "Multi-channel communication", status: "active" },
      { name: "SEO Generator API", version: "—", purpose: "AI SEO content generation", status: "active" },
    ],
  },
  {
    category: "OAuth Connectors",
    color: "purple",
    items: [
      { name: "Google Sheets", version: "—", purpose: "Lead sync spreadsheet", status: "active" },
      { name: "Google Calendar", version: "—", purpose: "Consultation booking engine", status: "active" },
      { name: "Gmail", version: "—", purpose: "Email sending + mailbox webhooks", status: "active" },
      { name: "Google Drive", version: "—", purpose: "Document storage", status: "active" },
      { name: "Google Docs", version: "—", purpose: "Document generation", status: "active" },
      { name: "Google Tasks", version: "—", purpose: "Task management", status: "active" },
      { name: "Google Search Console", version: "—", purpose: "SEO indexing + verification", status: "active" },
      { name: "Google Analytics", version: "—", purpose: "Traffic analytics", status: "active" },
      { name: "Facebook Pages", version: "—", purpose: "Social media auto-publishing", status: "active" },
      { name: "HubSpot", version: "—", purpose: "CRM contact/deal sync", status: "active" },
      { name: "Supabase", version: "—", purpose: "Postgres (migration target)", status: "registered" },
    ],
  },
  {
    category: "Migration Targets",
    color: "cyan",
    items: [
      { name: "Vercel", version: "—", purpose: "Frontend hosting + API routes + AI Gateway", status: "planned" },
      { name: "Supabase", version: "—", purpose: "Postgres + Auth + RLS + Storage", status: "planned" },
      { name: "Railway (workers)", version: "—", purpose: "Long-running swarm + cron workers", status: "planned" },
      { name: "Vercel AI Gateway", version: "—", purpose: "LLM routing (replace InvokeLLM)", status: "planned" },
      { name: "Google Workspace (direct)", version: "—", purpose: "Direct OAuth bypassing connectors", status: "planned" },
      { name: "Stripe", version: "—", purpose: "Replace Base44 Payments", status: "planned" },
    ],
  },
];

const STATUS_STYLES = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  available: "bg-blue-100 text-blue-700 border-blue-200",
  registered: "bg-amber-100 text-amber-700 border-amber-200",
  planned: "bg-stone-100 text-stone-500 border-stone-200",
};

export default function StackTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-stone-900">Technology Stack Registry</h2>
        <span className="text-xs text-stone-500">{STACK.reduce((n, c) => n + c.items.length, 0)} technologies</span>
      </div>
      {STACK.map((cat) => (
        <div key={cat.category}>
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-1 h-5 rounded-full bg-${cat.color}-500`} />
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wide">{cat.category}</h3>
            <span className="text-[10px] text-stone-400">({cat.items.length})</span>
          </div>
          <div className="space-y-1.5">
            {cat.items.map((item) => (
              <div key={item.name} className="flex items-center gap-3 rounded-lg border border-stone-200 px-3 py-2 hover:border-amber-400 transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-stone-900">{item.name}</span>
                    {item.version !== "—" && <span className="text-[10px] text-stone-400 font-mono">{item.version}</span>}
                  </div>
                  <div className="text-xs text-stone-500 truncate">{item.purpose}</div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[item.status] || STATUS_STYLES.planned}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}