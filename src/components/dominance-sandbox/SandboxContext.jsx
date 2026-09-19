import React, { createContext, useContext, useState, useCallback } from "react";

const SandboxContext = createContext(null);

const TABS = ["discovery", "branding", "funnel", "content", "social", "simulation", "launch"];

const INITIAL_CAMPAIGN = {
  niche: null,
  nicheId: "",
  keyword: "",
  city: "",
  state: "",
  businessName: "",
  domain: "",
  domainPurchased: false,
  autoPurchase: false,
  persona: null,
  logo: null,
  brandColors: null,
  funnelConfig: null,
  contentConfig: { pageTypes: [], pageCount: 50 },
  socialConfig: null,
  simConfig: null,
  intelligence: null,
  campaignId: null,
  economicGate: null,
};

export function SandboxProvider({ children }) {
  const [activeTab, setActiveTab] = useState("discovery");
  const [campaign, setCampaign] = useState(INITIAL_CAMPAIGN);
  const [tabStatus, setTabStatus] = useState({
    discovery: "pending",
    branding: "pending",
    funnel: "pending",
    content: "pending",
    social: "pending",
    simulation: "pending",
    launch: "pending",
  });

  const updateCampaign = useCallback((patch) => {
    setCampaign((prev) => ({ ...prev, ...patch }));
  }, []);

  const markTabComplete = useCallback((tab) => {
    setTabStatus((prev) => ({ ...prev, [tab]: "complete" }));
  }, []);

  const setTabRunning = useCallback((tab) => {
    setTabStatus((prev) => ({ ...prev, [tab]: "running" }));
  }, []);

  const completedCount = Object.values(tabStatus).filter((s) => s === "complete").length;
  const progressPct = Math.round((completedCount / TABS.length) * 100);

  const goToTab = useCallback((tab) => {
    if (TABS.includes(tab)) setActiveTab(tab);
  }, []);

  const value = {
    activeTab,
    setActiveTab: goToTab,
    TABS,
    campaign,
    updateCampaign,
    tabStatus,
    markTabComplete,
    setTabRunning,
    completedCount,
    progressPct,
  };

  return <SandboxContext.Provider value={value}>{children}</SandboxContext.Provider>;
}

export function useSandbox() {
  const ctx = useContext(SandboxContext);
  if (!ctx) throw new Error("useSandbox must be used within SandboxProvider");
  return ctx;
}

export { TABS };