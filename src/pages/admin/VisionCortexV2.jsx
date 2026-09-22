import React, { useState } from 'react';
import { Brain } from 'lucide-react';
import PipelineStage from '@/components/vision-cortex-v2/PipelineStage';
import PromptLibrary from '@/components/vision-cortex-v2/PromptLibrary';
import VisionInput from '@/components/vision-cortex-v2/VisionInput';
import FileIntelligenceLibrary from '@/components/vision-cortex-v2/FileIntelligenceLibrary';
import StrategyGenerator from '@/components/vision-cortex-v2/StrategyGenerator';
import ProvisioningSystem from '@/components/vision-cortex-v2/ProvisioningSystem';
import LogoGenerator from '@/components/vision-cortex-v2/LogoGenerator';
import BrandGenerator from '@/components/vision-cortex-v2/BrandGenerator';
import ContentGenerator from '@/components/vision-cortex-v2/ContentGenerator';
import VideoGenerator from '@/components/vision-cortex-v2/VideoGenerator';
import WebsiteGenerator from '@/components/vision-cortex-v2/WebsiteGenerator';
import WebsiteMultiplier from '@/components/vision-cortex-v2/WebsiteMultiplier';
import InternationalEnhancer from '@/components/vision-cortex-v2/InternationalEnhancer';
import TemplateLibrary from '@/components/vision-cortex-v2/TemplateLibrary';
import TopSitesScanner from '@/components/vision-cortex-v2/TopSitesScanner';
import GitHubScanner from '@/components/vision-cortex-v2/GitHubScanner';
import FreeOperationsFinder from '@/components/vision-cortex-v2/FreeOperationsFinder';
import FindTheMoneyGenerator from '@/components/vision-cortex-v2/FindTheMoneyGenerator';
import FinalValidator from '@/components/vision-cortex-v2/FinalValidator';
import AgentMonetizer from '@/components/vision-cortex-v2/AgentMonetizer';
import AutonomousAnalyzer from '@/components/vision-cortex-v2/AutonomousAnalyzer';
import AgentFleet from '@/components/vision-cortex/AgentFleet';
import SandboxGrid from '@/components/vision-cortex/SandboxGrid';
import {
  Target, Rocket, Palette, Sparkles, PenLine, Video, Globe, Layers,
  Languages, Layout, Radar, Github, Gift, DollarSign, ShieldCheck, Bot, Activity, Database,
} from 'lucide-react';

const STAGES = [
  { num: 1, title: 'Money-Making Prompt Library', subtitle: '50 prompts ranked by ease, speed & revenue potential', icon: DollarSign, accent: 'amber' },
  { num: 2, title: 'Vision Input + AI Prompt Engineer', subtitle: 'Enter or generate your vision statement', icon: Sparkles, accent: 'violet' },
  { num: 3, title: 'File Intelligence Library', subtitle: 'Dissected intelligence from uploaded documents', icon: Database, accent: 'blue' },
  { num: 4, title: 'Enhanced Strategy Generator', subtitle: 'Market analysis, revenue model, roadmap, KPIs', icon: Target, accent: 'amber' },
  { num: 5, title: 'Automated Provisioning System', subtitle: 'Drive, GitHub, Supabase, Vercel, domain purchase', icon: Rocket, accent: 'emerald' },
  { num: 6, title: 'Logo Generator — 10 Variations', subtitle: 'Transparent backgrounds, size optimizer, approval', icon: Palette, accent: 'amber' },
  { num: 7, title: 'Comprehensive Brand Generator', subtitle: 'Colors, typography, voice, guidelines, assets', icon: Sparkles, accent: 'violet' },
  { num: 8, title: 'Full Content Generator — All Channels', subtitle: 'Social, web, funnel, SMS, MMS, WhatsApp, voice, email, YouTube', icon: PenLine, accent: 'blue' },
  { num: 9, title: 'Mass Video Generator', subtitle: 'Trending benchmarks, strategy, 5 AI videos', icon: Video, accent: 'rose' },
  { num: 10, title: 'Website Generator — Top Quality', subtitle: 'Every category, category recommender, accent color changer', icon: Globe, accent: 'amber' },
  { num: 11, title: 'Website Multiplier + Content Implementer', subtitle: 'Mass sites, Google recommendations, platform adjustments', icon: Layers, accent: 'cyan' },
  { num: 12, title: 'International Language Enhancement', subtitle: 'Localize content for 20+ countries', icon: Languages, accent: 'blue' },
  { num: 13, title: 'Template Library + Rebrander', subtitle: '50 templates with automated rebranding system', icon: Layout, accent: 'violet' },
  { num: 14, title: 'Top Sites Scanner — Global Benchmark', subtitle: 'Find & benchmark the top sites in every industry', icon: Radar, accent: 'amber' },
  { num: 15, title: 'GitHub Scanner — Top 5 + Gap Filler', subtitle: 'Find top repos, integrate code, fill system gaps', icon: Github, accent: 'emerald' },
  { num: 16, title: 'Free Operations Finder', subtitle: '$0 stack for every category', icon: Gift, accent: 'emerald' },
  { num: 17, title: 'Find the Money Generator', subtitle: 'Identify top money-making systems, sites & funnels', icon: DollarSign, accent: 'amber' },
  { num: 18, title: 'Final Validator & Enhancer', subtitle: 'Score every category, fix issues, enhance quality', icon: ShieldCheck, accent: 'rose' },
  { num: 19, title: 'Agent Monetizer', subtitle: 'Autonomous agents that generate revenue', icon: Bot, accent: 'amber' },
  { num: 20, title: 'Autonomous Agent Analyzer & Replicator', subtitle: 'Watch analytics, adjust, replicate what works', icon: Activity, accent: 'violet' },
  { num: 21, title: 'Agent Fleet + Sandboxes', subtitle: '22 agents across 5 sandboxes with free LLMs', icon: Brain, accent: 'amber' },
];

export default function VisionCortexV2() {
  const [vision, setVision] = useState('');
  const [approvedLogo, setApprovedLogo] = useState(null);
  const [brand, setBrand] = useState(null);
  const [collapsed, setCollapsed] = useState({});

  const toggle = (num) => setCollapsed((prev) => ({ ...prev, [num]: !prev[num] }));

  const handlePromptSelect = (p) => {
    setVision(`Build a ${p.topic} for the ${p.niche} market. ${p.desc}. Revenue path: ${p.path}. This should be a fully autonomous, AI-powered system that can be deployed and scaled with minimal human intervention.`);
  };

  const renderStage = (stage) => {
    switch (stage.num) {
      case 1: return <PromptLibrary onPromptSelect={handlePromptSelect} />;
      case 2: return <VisionInput vision={vision} setVision={setVision} onShip={() => toggle(3)} />;
      case 3: return <FileIntelligenceLibrary />;
      case 4: return <StrategyGenerator vision={vision} />;
      case 5: return <ProvisioningSystem vision={vision} />;
      case 6: return <LogoGenerator vision={vision} approvedLogo={approvedLogo} setApprovedLogo={setApprovedLogo} />;
      case 7: return <BrandGenerator vision={vision} approvedLogo={approvedLogo} setBrand={setBrand} />;
      case 8: return <ContentGenerator vision={vision} brand={brand} />;
      case 9: return <VideoGenerator vision={vision} />;
      case 10: return <WebsiteGenerator vision={vision} brand={brand} />;
      case 11: return <WebsiteMultiplier vision={vision} />;
      case 12: return <InternationalEnhancer vision={vision} />;
      case 13: return <TemplateLibrary vision={vision} />;
      case 14: return <TopSitesScanner vision={vision} />;
      case 15: return <GitHubScanner vision={vision} />;
      case 16: return <FreeOperationsFinder vision={vision} />;
      case 17: return <FindTheMoneyGenerator vision={vision} />;
      case 18: return <FinalValidator vision={vision} />;
      case 19: return <AgentMonetizer vision={vision} />;
      case 20: return <AutonomousAnalyzer vision={vision} />;
      case 21: return (
        <div className="space-y-4">
          <AgentFleet />
          <SandboxGrid onSandboxAction={(id, action) => console.log(id, action)} />
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-violet-950 via-stone-950 to-stone-900 p-6 text-white border border-violet-500/30">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 grid place-items-center">
            <Brain className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Vision Cortex V2 — Full Pipeline</h1>
            <p className="text-stone-400 text-sm">21-stage autonomous system: vision → strategy → brand → content → website → video → scan → validate → monetize → ship</p>
          </div>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="space-y-2">
        {STAGES.map((stage) => (
          <PipelineStage
            key={stage.num}
            number={stage.num}
            title={stage.title}
            subtitle={stage.subtitle}
            icon={stage.icon}
            accent={stage.accent}
            collapsed={collapsed[stage.num] ?? false}
            onToggle={() => toggle(stage.num)}
          >
            {renderStage(stage)}
          </PipelineStage>
        ))}
      </div>
    </div>
  );
}