import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import {
  Scan, Loader2, AlertCircle, CheckCircle2, Shield, Zap,
  TrendingUp, Bot, Grid3x3, ListChecks, FileCode, Sparkles,
  ChevronRight, ArrowRight,
} from 'lucide-react';

// Known app structure — sent to backend for LLM analysis
const APP_STRUCTURE = {
  pages: [
    'Home', 'Estimator', 'Funnel', 'Results', 'Book', 'Booked', 'ColorCharts',
    'Locations', 'HowItWorks', 'Gallery', 'Reviews', 'About', 'Contact', 'Guides',
    'AppOnboarding', 'EpoxyProAssistant', 'Download', 'ThankYou', 'Questionnaire',
    'AppSettings', 'ToolHub', 'Connect', 'Acquire', 'ContractorApp', 'ContractorBid',
    'Conversations', 'CustomerPortal', 'DynamicPageView', 'Login', 'Register',
    // Admin pages
    'Dashboard', 'Leads', 'Pipeline', 'Emails', 'SettingsPage', 'Competitors',
    'GoogleSeo', 'SeoDominance', 'SeoFactory', 'SopSystem', 'Reviews', 'ToolManager',
    'WebsiteFactory', 'TemplateManager', 'AppFactory', 'NationalLaunch', 'SeoGenerator',
    'XtremeComms', 'TelnyxManager', 'LeadScraper', 'SkipTraceSystem', 'AutoComplete',
    'AgentBuilder', 'VisionStudio', 'CommandCenter', 'AgentMaster', 'VisionStrategy',
    'Intelligence', 'ClientPackages', 'ApiKeyManager', 'SystemVault', 'SocialStudio',
    'RebrandStudio', 'LocationPerformance', 'SwarmCommand', 'SystemBlueprint',
    'DeepArchitecture', 'SystemOperator', 'UniversalSiteBuilder', 'DominanceSandbox',
    'BuilderLibrary', 'MetaAgent', 'ConvergenceEngine', 'WebsiteEmpire', 'X1Company',
    'SiteHealthMonitor', 'UrlStrategy', 'VoiceAssistant', 'AnalyticsDashboard',
    'WebsiteQueue', 'RagConsole', 'SystemHealth', 'Platform', 'SeoSimulator',
    'DomainGoldRush', 'CrystalBall', 'SystemMap', 'ContractorWorkflow',
    'WorkflowFindings', 'ContractorSimulation', 'AutonomousWorkflows', 'PlaybookLibrary',
    'AlphaPrime', 'FleetDashboard', 'ShadowVisionCortex', 'Shadow', 'CodeStudio',
    'GraphConsole', 'MetaArchitecture', 'VisionCortexV2',
  ],
  entities: [
    'Lead', 'CodeSandboxSession', 'AgentDepartment', 'DeploymentRecord', 'AgentPersona',
    'AgentIntelligence', 'AgentMemory', 'AgentAction', 'BuildSession', 'BuildManifest',
    'Conversation', 'CryptoToken', 'AgentExecutionLog', 'PredictionResult',
    'PredictionModel', 'AgentVersion', 'ToolRegistry', 'SubscriptionPlan',
    'UserLLMConnection', 'WorkflowTemplate', 'ConversationMessage', 'UserWorkspace',
    'DominanceCampaign', 'ProgressLedger', 'SystemManifest', 'BrokenTwin',
    'ConvergenceCycle', 'WorkPacket', 'CommandRun', 'ApprovalRequest', 'MetaSession',
    'ValidationReceipt', 'DiscoveryJob', 'BuilderLibrary', 'TemplateLibrary',
    'VaultEntry', 'FleetSystem', 'SkipTrace', 'BenchmarkDefinition', 'RepairJob',
    'BenchmarkResult', 'EvidenceReceipt', 'RegressionTest', 'OptimizationGap',
    'AuditSystemIntegrityScore', 'ContractorArchetype', 'AdminProfile',
    'SimulatedVisitor', 'ControlLease', 'VisionMessage', 'VisionConversation',
    'FleetHeartbeat', 'OperatorIntent', 'SwarmAudit', 'SwarmTask', 'SystemMode',
    'BenchmarkCandidate', 'AlphaPrimeReflectionLedger', 'AlphaPrimeAuditLedger',
    'StrategicReflectionRecord', 'FailurePattern', 'VerifiedBusinessFacts',
    'CanonicalLocationRegistry', 'AlphaPrimeHeartbeat', 'CanonicalSiteRegistry',
    'SiteValidationReceipt', 'LeadSource', 'ContractorRecord', 'StrategyDocument',
    'MarketplaceListing', 'SeoSimulation', 'Investigation', 'SystemHealthAudit',
    'WebsiteQueue', 'VoiceAssistant', 'DomainStrategy', 'DynamicPage', 'CodeBlock',
    'PropertyLookup', 'AppSettings', 'SwarmMessage', 'SocialPost', 'ApiKey',
    'AiVoiceSession', 'TestRun', 'LaunchCampaign', 'AppBuild', 'WebsiteTemplate',
    'ClientPackage', 'IntelligenceReport', 'AgentTemplate', 'AnalyticsSnapshot',
    'MaintenancePlan', 'QuestionnaireResponse', 'Base44Purchase', 'Tool', 'Referral',
    'ClientProject', 'ProjectUpdate', 'ChatMessage', 'Rating', 'Comment',
    'PromoCode', 'SopLog', 'GeneratedPage', 'Sop', 'EmailLog', 'SeoContent',
    'CompetitorInsight', 'FunnelEvent', 'Appointment',
  ],
  functions: [
    'agentBuilderEngine', 'agentRouter', 'agentRunner', 'aiAssist', 'alphaPrimeAudit',
    'alphaPrimeBenchmarkGenerator', 'alphaPrimeHeartbeat', 'alphaPrimeOptimizationCycle',
    'alphaPrimeRepairFactory', 'apiKeyManager', 'autoComplete', 'autonomousCodingEngine',
    'autonomousSeoDominance', 'autonomousSprint', 'bookEstimate', 'builderLibrarySeeder',
    'calculateDistanceTo100', 'canonicalizeRepairBacklog', 'checkGoogleStatus',
    'checkQuestionnaireCompliance', 'closedLoopTester', 'companyIntel', 'companyOrchestrator',
    'convergenceEngine', 'conversationHub', 'create-checkout', 'cryptoCreator',
    'dailyLeadEngine', 'digitalDominanceCompiler', 'domainGoldRush', 'dominanceEngine',
    'enrichLead', 'fetchCoreWebVitals', 'fillContentGaps', 'fleetAlphaPrime',
    'generateRss', 'generateSeoPage', 'generateSitemap', 'generateSop', 'githubSync',
    'godaddyApi', 'googleAnalytics', 'googleVerifierConnectUrl', 'googleVerifierExchange',
    'googleWorkspaceSync', 'graphEngine', 'intelligenceSync', 'intentRouter', 'llmRouter',
    'memoryRouter', 'metaAgent', 'notifySeoUpdates', 'optimizeSeo', 'payments-webhook',
    'phase9Proof', 'pingIndexNow', 'postconditionValidator', 'predictionEngine',
    'propertyLookup', 'pullSearchConsoleData', 'pushLeadToHubspot', 'ragPipeline',
    'railwayScraper', 'rebrandStudio', 'recursiveHealingEngine', 'regressionTestSuite',
    'runContractorSimulation', 'runtimeAcceptanceMission', 'scanCompetitors',
    'sendEstimateEmail', 'sendFollowUpEmail', 'sendReviewRequest', 'seoAeoSimulator',
    'seoGenerator', 'seoSimSync', 'shadowBrowse', 'siteHealthChecker', 'skipTrace',
    'socialStudio', 'strategicMindsSetup', 'submitToIndexers', 'supabaseConcurrencyTest',
    'supabaseMigrationDeploy', 'supabaseUpload', 'swarmOrchestrator', 'syncContentCalendar',
    'syncContractorWorkflow', 'syncFleetSystemState', 'syncLeadToSheet', 'syncWorkflowToSwarm',
    'syntheticWorker', 'systemAuditor', 'systemOrchestrator', 'telnyxAutonomousSetup',
    'telnyxManager', 'tradeCrystalBall', 'vercelAiGateway', 'vercelDeploy', 'vercelManager',
    'verifySearchConsole', 'visionCortexRouter', 'visionEngine', 'voiceAssistant',
    'xtremeComms', 'xtremeUniversalGeneratorBridge', 'metaArchitecture',
  ],
  workflows: [
    'X1 Autonomous Company Cycle', 'Autonomous Auto Complete', 'Recursive Production Readiness Engine',
    'Fleet Alpha Prime Heartbeat', 'Alpha Prime Completion Sprint', 'Swarm Autopilot',
    'Alpha Prime Heartbeat', 'Autonomous SEO Dominance', 'Autonomous Skip Trace',
    'SEO Update Notifier', 'Sitemap Auto-Update', 'SEO Optimizer', 'Competitor Scanner',
    'Daily Lead Engine', 'Review Request', 'Social Media Autopilot', 'Lead Follow-Up',
    'Immediate Lead Follow-Up', 'Questionnaire Enforcement', 'XTREME Digital Dominance Compiler',
    'XTREME Universal Generator Sync Supervisor',
  ],
  connectors: [
    'googletasks', 'googledocs', 'googledrive', 'supabase', 'googlesheets',
    'facebook_pages', 'google_search_console', 'google_analytics', 'googlecalendar',
    'gmail', 'hubspot',
  ],
  agents: ['shadow', 'alpha_prime_orchestrator', 'swarm_orchestrator', 'system_operator', 'seo_manager', 'comms_manager', 'site_factory_manager', 'reputation_manager', 'social_manager', 'lead_orchestrator'],
};

export default function MetaArchitecture() {
  const [scanResult, setScanResult] = useState(null);
  const [patternResult, setPatternResult] = useState(null);
  const [genResult, setGenResult] = useState(null);
  const [checklistResult, setChecklistResult] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('scan');

  const runScan = async () => {
    setLoading('scan');
    setError(null);
    setScanResult(null);
    try {
      const res = await base44.functions.invoke('metaArchitecture', {
        action: 'scan',
        appStructure: APP_STRUCTURE,
      });
      setScanResult(res.data?.result || res.data);
      setActiveSection('scan');
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const runPatterns = async () => {
    setLoading('patterns');
    setError(null);
    try {
      const res = await base44.functions.invoke('metaArchitecture', {
        action: 'patterns',
        appStructure: APP_STRUCTURE,
      });
      setPatternResult(res.data?.result || res.data);
      setActiveSection('patterns');
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const runGenerate = async () => {
    setLoading('generate');
    setError(null);
    try {
      const res = await base44.functions.invoke('metaArchitecture', {
        action: 'generate',
        appStructure: APP_STRUCTURE,
      });
      setGenResult(res.data?.result || res.data);
      setActiveSection('generate');
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const runChecklist = async () => {
    setLoading('checklist');
    setError(null);
    try {
      const res = await base44.functions.invoke('metaArchitecture', {
        action: 'checklist',
        appStructure: APP_STRUCTURE,
      });
      setChecklistResult(res.data?.result || res.data);
      setActiveSection('checklist');
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(null);
    }
  };

  const sections = [
    { id: 'scan', label: 'Full Scan', icon: Scan, hasResult: !!scanResult },
    { id: 'patterns', label: 'Patterns', icon: Grid3x3, hasResult: !!patternResult },
    { id: 'generate', label: 'Universal Generator', icon: FileCode, hasResult: !!genResult },
    { id: 'checklist', label: 'Checklist', icon: ListChecks, hasResult: !!checklistResult },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-stone-950 to-stone-800 p-6 text-white border border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-amber-500 grid place-items-center">
            <Scan className="h-7 w-7 text-stone-950" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Meta Architecture</h1>
            <p className="text-stone-400 text-sm">Autonomous scan → audit → analyze → capabilities → gaps → hardening → optimization → self-operating → patterns → generate</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={runScan} disabled={!!loading} className="h-11 px-5 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold disabled:opacity-50 flex items-center gap-2 hover:bg-amber-400">
          {loading === 'scan' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />} Full System Scan
        </button>
        <button onClick={runPatterns} disabled={!!loading} className="h-11 px-5 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm font-bold disabled:opacity-50 flex items-center gap-2 hover:border-amber-400">
          {loading === 'patterns' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Grid3x3 className="h-4 w-4" />} Pattern Identifier
        </button>
        <button onClick={runGenerate} disabled={!!loading} className="h-11 px-5 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm font-bold disabled:opacity-50 flex items-center gap-2 hover:border-amber-400">
          {loading === 'generate' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCode className="h-4 w-4" />} Universal Generator
        </button>
        <button onClick={runChecklist} disabled={!!loading} className="h-11 px-5 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm font-bold disabled:opacity-50 flex items-center gap-2 hover:border-amber-400">
          {loading === 'checklist' ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListChecks className="h-4 w-4" />} Checklist
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Loading state */}
      {loading && !error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
          <p className="text-sm text-stone-600 font-semibold">
            {loading === 'scan' && 'Scanning entire system — auditing pages, entities, functions, workflows, agents...'}
            {loading === 'patterns' && 'Identifying systematic, programmatic, operational, visual, monetizable, automatable, autonomous patterns...'}
            {loading === 'generate' && 'Generating every function, capability, feature, step, page, workflow, document, and setting that should exist...'}
            {loading === 'checklist' && 'Generating production-readiness checklist across all categories...'}
          </p>
        </div>
      )}

      {/* Section tabs */}
      {(scanResult || patternResult || genResult || checklistResult) && !loading && (
        <div className="flex gap-2 border-b border-stone-200 pb-2">
          {sections.filter((s) => s.hasResult).map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition ${activeSection === s.id ? 'bg-stone-900 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'}`}
              >
                <Icon className="h-4 w-4" /> {s.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Results */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        {activeSection === 'scan' && scanResult && <ScanResults result={scanResult} />}
        {activeSection === 'patterns' && patternResult && <PatternResults result={patternResult} />}
        {activeSection === 'generate' && genResult && <GenerateResults result={genResult} />}
        {activeSection === 'checklist' && checklistResult && <ChecklistResults result={checklistResult} />}
        {!scanResult && !patternResult && !genResult && !checklistResult && !loading && (
          <div className="text-center py-12 text-stone-400">
            <Scan className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Run a scan to see the full system analysis.</p>
            <p className="text-xs mt-1">The scanner will audit {APP_STRUCTURE.pages.length} pages, {APP_STRUCTURE.entities.length} entities, {APP_STRUCTURE.functions.length} functions, and {APP_STRUCTURE.workflows.length} workflows.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ScanResults({ result }) {
  const r = typeof result === 'string' ? JSON.parse(result) : result;
  return (
    <div className="space-y-6">
      {/* Score + summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4 text-center">
          <div className="text-4xl font-black text-amber-700">{r.overallScore || '—'}</div>
          <div className="text-xs font-bold text-amber-600 uppercase">System Score</div>
        </div>
        <div className="md:col-span-2 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <p className="text-xs font-bold text-stone-500 uppercase mb-1">Executive Summary</p>
          <p className="text-sm text-stone-700">{r.summary}</p>
        </div>
      </div>

      {/* Capabilities */}
      {r.capabilities?.length > 0 && (
        <Section title="Capabilities Identified" icon={CheckCircle2} count={r.capabilities.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {r.capabilities.map((c, i) => (
              <div key={i} className="rounded-lg border border-green-200 bg-green-50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-stone-900">{c.name}</span>
                  <span className="text-[10px] font-bold text-green-600 uppercase">{c.status}</span>
                </div>
                <p className="text-xs text-stone-600">{c.description}</p>
                <span className="text-[10px] text-stone-400">{c.category}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Gaps */}
      {r.gaps?.length > 0 && (
        <Section title="Gaps Found" icon={AlertCircle} count={r.gaps.length}>
          <div className="space-y-2">
            {r.gaps.map((g, i) => (
              <div key={i} className="rounded-lg border border-red-200 bg-red-50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-stone-900">{g.area}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${g.severity === 'critical' ? 'bg-red-200 text-red-800' : g.severity === 'high' ? 'bg-orange-200 text-orange-800' : 'bg-stone-200 text-stone-600'}`}>{g.severity}</span>
                </div>
                <p className="text-xs text-stone-600 mb-1">{g.description}</p>
                <p className="text-xs text-stone-500"><strong>Fix:</strong> {g.recommendation}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Hardening */}
      {r.hardeningSteps?.length > 0 && (
        <Section title="Hardening Steps" icon={Shield} count={r.hardeningSteps.length}>
          <div className="space-y-2">
            {r.hardeningSteps.map((s, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50">
                <Shield className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-sm font-bold text-stone-900">{s.step}</span>
                  <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded ${s.priority === 'critical' ? 'bg-red-200 text-red-800' : 'bg-stone-200 text-stone-600'}`}>{s.priority}</span>
                  <p className="text-xs text-stone-600">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Optimization */}
      {r.optimizationSteps?.length > 0 && (
        <Section title="Optimization Steps" icon={TrendingUp} count={r.optimizationSteps.length}>
          <div className="space-y-2">
            {r.optimizationSteps.map((s, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50">
                <TrendingUp className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-sm font-bold text-stone-900">{s.step}</span>
                  <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded ${s.priority === 'critical' ? 'bg-red-200 text-red-800' : 'bg-stone-200 text-stone-600'}`}>{s.priority}</span>
                  <p className="text-xs text-stone-600">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Self-operating */}
      {r.selfOperatingSteps?.length > 0 && (
        <Section title="Self-Operating Steps" icon={Bot} count={r.selfOperatingSteps.length}>
          <div className="space-y-2">
            {r.selfOperatingSteps.map((s, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-stone-50">
                <Bot className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                <div>
                  <span className="text-sm font-bold text-stone-900">{s.step}</span>
                  <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded ${s.automationLevel === 'full_autonomous' ? 'bg-purple-200 text-purple-800' : s.automationLevel === 'autonomous' ? 'bg-blue-200 text-blue-800' : 'bg-stone-200 text-stone-600'}`}>{s.automationLevel}</span>
                  <p className="text-xs text-stone-600">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Generated items */}
      {r.generatedItems?.length > 0 && (
        <Section title="Generated — Everything That Should Exist" icon={Sparkles} count={r.generatedItems.length}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {r.generatedItems.map((item, i) => (
              <div key={i} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-stone-900">{item.name}</span>
                  <span className="text-[10px] font-bold text-amber-600 uppercase">{item.type}</span>
                </div>
                <p className="text-xs text-stone-600">{item.description}</p>
                <span className={`text-[10px] font-bold ${item.priority === 'critical' ? 'text-red-600' : 'text-stone-500'}`}>{item.priority}</span>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function PatternResults({ result }) {
  const r = typeof result === 'string' ? JSON.parse(result) : result;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Grid3x3 className="h-5 w-5 text-amber-500" />
        <h3 className="font-bold text-stone-900">Pattern Identifier — {r.patternCount || 0} Patterns Found</h3>
      </div>
      {r.topOpportunities?.length > 0 && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-bold text-green-700 uppercase mb-2">Top Opportunities</p>
          <div className="space-y-2">
            {r.topOpportunities.map((o, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <ChevronRight className="h-3 w-3 text-green-500" />
                <span className="font-bold text-stone-900">{o.pattern}</span>
                <ArrowRight className="h-3 w-3 text-stone-400" />
                <span className="text-stone-600">{o.opportunity}</span>
                <span className="text-xs text-green-600 ml-auto">{o.estimatedValue}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {r.patterns?.map((p, i) => (
          <div key={i} className="rounded-lg border border-stone-200 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-stone-900">{p.patternName}</span>
              <span className="text-[10px] font-bold text-stone-500 uppercase">{p.dimension}</span>
            </div>
            <p className="text-xs text-stone-600 mb-2">{p.description}</p>
            <div className="flex flex-wrap gap-1">
              {p.monetizable && <span className="text-[9px] font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">💰 Monetizable</span>}
              {p.automatable && <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">⚙️ Automatable</span>}
              {p.autonomous && <span className="text-[9px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">🤖 Autonomous</span>}
            </div>
            {p.opportunity && <p className="text-xs text-amber-600 mt-1 font-semibold">{p.opportunity}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function GenerateResults({ result }) {
  const r = typeof result === 'string' ? JSON.parse(result) : result;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 text-center">
          <div className="text-3xl font-black text-stone-800">{r.totalItems || 0}</div>
          <div className="text-xs text-stone-400 uppercase">Total Items</div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <div className="text-3xl font-black text-red-700">{r.criticalCount || 0}</div>
          <div className="text-xs text-red-400 uppercase">Critical</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
          <div className="text-3xl font-black text-amber-700">{r.estimatedTotalHours || 0}h</div>
          <div className="text-xs text-amber-400 uppercase">Est. Hours</div>
        </div>
      </div>
      {r.recommendedBuildOrder?.length > 0 && (
        <div className="rounded-xl border border-stone-200 p-4">
          <p className="text-xs font-bold text-stone-500 uppercase mb-2">Recommended Build Order</p>
          <div className="flex flex-wrap gap-1">
            {r.recommendedBuildOrder.map((item, i) => (
              <span key={i} className="text-xs font-bold bg-stone-100 border border-stone-200 rounded px-2 py-1 text-stone-700">
                {i + 1}. {item}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {r.items?.map((item, i) => (
          <div key={i} className="rounded-lg border border-stone-200 p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-stone-900">{item.name}</span>
              <span className="text-[10px] font-bold text-amber-600 uppercase">{item.type}</span>
            </div>
            <p className="text-xs text-stone-600">{item.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] font-bold ${item.priority === 'critical' ? 'text-red-600' : 'text-stone-500'}`}>{item.priority}</span>
              <span className="text-[10px] text-stone-400">{item.estimatedEffort}</span>
              <span className="text-[10px] text-stone-400">{item.automationLevel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChecklistResults({ result }) {
  const r = typeof result === 'string' ? JSON.parse(result) : result;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-center">
          <div className="text-2xl font-black text-green-700">{r.passCount || 0}</div>
          <div className="text-xs text-green-400 uppercase">Pass</div>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center">
          <div className="text-2xl font-black text-red-700">{r.failCount || 0}</div>
          <div className="text-xs text-red-400 uppercase">Fail</div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-center">
          <div className="text-2xl font-black text-stone-700">{r.pendingCount || 0}</div>
          <div className="text-xs text-stone-400 uppercase">Pending</div>
        </div>
      </div>
      {r.categories?.map((cat, i) => (
        <div key={i} className="rounded-xl border border-stone-200 p-4">
          <h4 className="font-bold text-stone-900 mb-2">{cat.name}</h4>
          <div className="space-y-1">
            {cat.items?.map((item, j) => (
              <div key={j} className="flex items-center gap-2 text-sm py-1">
                {item.status === 'pass' ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" /> :
                 item.status === 'fail' ? <AlertCircle className="h-4 w-4 text-red-500 shrink-0" /> :
                 <div className="h-4 w-4 rounded-full border-2 border-stone-300 shrink-0" />}
                <span className="text-stone-700">{item.item}</span>
                {item.required && <span className="text-[10px] text-red-500 font-bold">REQUIRED</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Section({ title, icon: Icon, count, children }) {
  return (
    <div>
      <h3 className="font-bold text-stone-900 mb-3 flex items-center gap-2">
        <Icon className="h-5 w-5 text-amber-500" />
        {title} ({count})
      </h3>
      {children}
    </div>
  );
}