import React, { useState } from "react";
import ScraperPanel from "@/components/lead-scraper/ScraperPanel";
import AgentPanel from "@/components/lead-scraper/AgentPanel";
import LeadsTable from "@/components/lead-scraper/LeadsTable";
import { Radar } from "lucide-react";

export default function LeadScraper() {
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Radar className="h-7 w-7 text-amber-500" /> Lead Scraper & Outreach
        </h1>
        <p className="text-stone-500 mt-1">Autonomous lead engine — scrape homeowner, social, Craigslist, and B2B sources; enrich with AI; push to HubSpot CRM; trigger multi-channel outreach via Xtreme Comms.</p>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 xa-electric-hover">
        <ScraperPanel onScraped={() => setSelectedLeadIds([])} />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 xa-electric-hover">
        <AgentPanel selectedLeadIds={selectedLeadIds} />
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5 xa-electric-hover">
        <LeadsTable onSelectionChange={setSelectedLeadIds} />
      </div>
    </div>
  );
}