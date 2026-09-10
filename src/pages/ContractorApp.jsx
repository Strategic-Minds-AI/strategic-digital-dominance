import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Menu, X, LayoutDashboard, FilePlus, Filter, FolderOpen, Phone } from "lucide-react";
import { LOGO_URL } from "@/components/Logo";
import ContractorDashboard from "@/components/contractor/ContractorDashboard";
import BidGenerator from "@/components/contractor/BidGenerator";
import ContractorPipeline from "@/components/contractor/ContractorPipeline";
import ContractorProjects from "@/components/contractor/ContractorProjects";

const TABS = [
  { key: "dashboard", label: "Home", icon: LayoutDashboard },
  { key: "bid", label: "New Bid", icon: FilePlus },
  { key: "pipeline", label: "Pipeline", icon: Filter },
  { key: "projects", label: "Jobs", icon: FolderOpen },
];

export default function ContractorApp() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="xa-stage">
      <div className="xa-device">
        <div className="xa-screen">
          {/* Brandbar */}
          <div className="xa-brandbar">
            <button onClick={() => navigate(-1)} className="xa-back-btn" aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="xa-brandbar-left">
              <img src={LOGO_URL} alt="XPS" className="xa-brandbar-logo" />
              <span className="xa-brandbar-name">Contractor CRM</span>
            </div>
            <button onClick={() => setDrawerOpen(true)} className="xa-icon-btn" aria-label="Menu">
              <Menu className="h-4 w-4" />
            </button>
          </div>

          {/* Main content */}
          <div className="xa-main">
            {activeTab === "dashboard" && <ContractorDashboard onTabChange={setActiveTab} />}
            {activeTab === "bid" && <BidGenerator onTabChange={setActiveTab} />}
            {activeTab === "pipeline" && <ContractorPipeline />}
            {activeTab === "projects" && <ContractorProjects />}
          </div>

          {/* Bottom tab nav */}
          <div className="xa-nav">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={active ? "active" : ""}
                >
                  <Icon className="h-5 w-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* More drawer */}
          {drawerOpen && (
            <div className="xa-drawer-overlay" onClick={() => setDrawerOpen(false)}>
              <div className="xa-drawer" onClick={(e) => e.stopPropagation()}>
                <div className="xa-drawer-header">
                  <h3>Menu</h3>
                  <button onClick={() => setDrawerOpen(false)}>
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="xa-drawer-list">
                  <a href="tel:+18555555555">
                    <Phone className="h-4 w-4" /> Call Support
                  </a>
                  <button onClick={() => navigate("/")}>
                    <ArrowLeft className="h-4 w-4" /> Back to Site
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}