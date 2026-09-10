import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LOGO_URL } from "@/components/Logo";
import BidGenerator from "@/components/contractor/BidGenerator";

export default function ContractorBid() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pipeline");

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate("/contractor")} className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-100" aria-label="Back">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5">
          <img src={LOGO_URL} alt="XPS" className="h-8 w-8 object-contain rounded-md" />
          <span className="text-sm font-extrabold text-stone-900">Visualizer</span>
        </div>
        <div className="w-7" />
      </header>
      <main className="flex-1 overflow-y-auto pb-6" style={{ scrollbarWidth: "none" }}>
        <BidGenerator onTabChange={(t) => navigate("/contractor")} />
      </main>
    </div>
  );
}