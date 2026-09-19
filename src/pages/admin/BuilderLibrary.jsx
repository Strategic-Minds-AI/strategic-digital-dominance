import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Compass, Database, Layout, Bot, Workflow, Shield, Rocket, Sparkles, RefreshCw, CheckCircle2, AlertCircle, Clock, Zap, Cpu, Users, FileCode, GitBranch, Package, Eye, Activity, ArrowRight } from "lucide-react";

const PHASE_META = {
  foundation: { label: "Foundation", icon: Compass, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  backend_data: { label: "Backend & Data", icon: Database, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  frontend_ui: { label: "Frontend & UI", icon: Layout, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  ai_agents: { label: "AI & Agents", icon: Bot, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
  integrations: { label: "Integrations", icon: Workflow, color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200" },
  security_testing: { label: "Security & Testing", icon: Shield, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  delivery_provisioning: { label: "Delivery & Provisioning", icon: Rocket, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
};

const STATUS_META = {
  pending: { label: "Pending", icon: Clock, color: "text-stone-500", bg: "bg-stone-100" },
  generating: { label: "Generating", icon: Sparkles, color: "text-amber-600", bg: "bg-amber-100" },
  validating: { label: "Validating", icon: Eye, color: "text-blue-600", bg: "bg-blue-100" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  failed: { label: "Failed", icon: AlertCircle, color: "text-red-600", bg: "bg-red-100" },
  active: { label: "Active", icon: Zap, color: "text-green-600", bg: "bg-green-100" },
};

const CATEGORY_META = {
  orchestrator: { icon: Cpu, color: "text-violet-600", bg: "bg-violet-50" },
  executor: { icon: GitBranch, color: "text-blue-600", bg: "bg-blue-50" },
  validator: { icon: Shield, color: "text-red-600", bg: "bg-red-50" },
  provisioner: { icon: Package, color: "text-orange-600", bg: "bg-orange-50" },
  generator: { icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50" },
  intelligence: { icon: Eye, color: "text-cyan-600", bg: "bg-cyan-50" },
  delivery: { icon: Rocket, color: "text-green-600", bg: "bg-green-50" },
};

export default function BuilderLibrary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState("capabilities");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => { loadLibrary(); }, []);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.BuilderLibrary.list('-order', 200);
      setItems(res || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const seedLibrary = async () => {
    setSeeding(true);
    try {
      await base44.functions.invoke('builderLibrarySeeder', {});
      await loadLibrary();
    } catch (e) {
      console.error(e);
    }
    setSeeding(false);
  };

  const capabilities = useMemo(() => items.filter(i => i.item_type === 'capability'), [items]);
  const agents = useMemo(() => items.filter(i => i.item_type === 'agent'), [items]);
  const functions = useMemo(() => items.filter(i => i.item_type === 'function'), [items]);
  const workflows = useMemo(() => items.filter(i => i.item_type === 'workflow'), [items]);

  const stats = useMemo(() => {
    const byStatus = {};
    items.forEach(i => { byStatus[i.status] = (byStatus[i.status] || 0) + 1; });
    const completed = capabilities.filter(c => c.status === 'completed').length;
    return {
      total: items.length,
      capabilities: capabilities.length,
      agents: agents.length,
      functions: functions.length,
      workflows: workflows.length,
      completed,
      completionRate: capabilities.length > 0 ? Math.round((completed / capabilities.length) * 100) : 0,
      byStatus,
    };
  }, [items, capabilities, agents, functions, workflows]);

  const capabilitiesByPhase = useMemo(() => {
    const grouped = {};
    capabilities.forEach(c => {
      if (!grouped[c.phase]) grouped[c.phase] = [];
      grouped[c.phase].push(c);
    });
    return grouped;
  }, [capabilities]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            Builder Library
          </h1>
          <p className="text-sm text-stone-500 mt-1">
            Deterministic catalog of {stats.total} system components — capabilities, agents, functions, and workflows
          </p>
        </div>
        <Button onClick={seedLibrary} disabled={seeding} className="bg-amber-500 hover:bg-amber-600 text-white">
          {seeding ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
          {seeding ? "Seeding..." : "Seed Library"}
        </Button>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <StatCard icon={Sparkles} label="Total Items" value={stats.total} color="text-amber-600" bg="bg-amber-50" />
        <StatCard icon={Compass} label="Capabilities" value={stats.capabilities} color="text-blue-600" bg="bg-blue-50" />
        <StatCard icon={Users} label="Agents" value={stats.agents} color="text-green-600" bg="bg-green-50" />
        <StatCard icon={FileCode} label="Functions" value={stats.functions} color="text-purple-600" bg="bg-purple-50" />
        <StatCard icon={Workflow} label="Workflows" value={stats.workflows} color="text-cyan-600" bg="bg-cyan-50" />
        <StatCard icon={CheckCircle2} label="Completion" value={`${stats.completionRate}%`} color="text-green-600" bg="bg-green-50" />
      </div>

      {/* ── Completion Progress ── */}
      {stats.capabilities > 0 && (
        <Card className="border-stone-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-stone-700">Build Progress</span>
              <span className="text-sm text-stone-500">{stats.completed} / {stats.capabilities} capabilities completed</span>
            </div>
            <Progress value={stats.completionRate} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* ── Tabs ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="capabilities" className="text-xs lg:text-sm">
            <Compass className="h-3.5 w-3.5 mr-1.5" /> Capabilities
            <Badge variant="secondary" className="ml-1.5 text-xs">{stats.capabilities}</Badge>
          </TabsTrigger>
          <TabsTrigger value="agents" className="text-xs lg:text-sm">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Agents
            <Badge variant="secondary" className="ml-1.5 text-xs">{stats.agents}</Badge>
          </TabsTrigger>
          <TabsTrigger value="functions" className="text-xs lg:text-sm">
            <FileCode className="h-3.5 w-3.5 mr-1.5" /> Functions
            <Badge variant="secondary" className="ml-1.5 text-xs">{stats.functions}</Badge>
          </TabsTrigger>
          <TabsTrigger value="workflows" className="text-xs lg:text-sm">
            <Workflow className="h-3.5 w-3.5 mr-1.5" /> Workflows
            <Badge variant="secondary" className="ml-1.5 text-xs">{stats.workflows}</Badge>
          </TabsTrigger>
        </TabsList>

        {/* ── Capabilities Tab ── */}
        <TabsContent value="capabilities" className="space-y-6">
          {Object.entries(PHASE_META).map(([phaseKey, meta]) => {
            const phaseItems = capabilitiesByPhase[phaseKey] || [];
            if (phaseItems.length === 0) return null;
            const Icon = meta.icon;
            const phaseCompleted = phaseItems.filter(c => c.status === 'completed').length;
            return (
              <div key={phaseKey}>
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${meta.bg} ${meta.border} border`}>
                    <Icon className={`h-4 w-4 ${meta.color}`} />
                  </div>
                  <h3 className="text-sm font-bold text-stone-800">{meta.label}</h3>
                  <Badge variant="outline" className="text-xs">{phaseCompleted}/{phaseItems.length}</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {phaseItems.map(cap => (
                    <CapabilityCard key={cap.id} item={cap} onClick={() => setSelectedItem(cap)} />
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* ── Agents Tab ── */}
        <TabsContent value="agents">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.map(agent => (
              <AgentCard key={agent.id} item={agent} />
            ))}
          </div>
        </TabsContent>

        {/* ── Functions Tab ── */}
        <TabsContent value="functions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {functions.map(fn => (
              <FunctionCard key={fn.id} item={fn} />
            ))}
          </div>
        </TabsContent>

        {/* ── Workflows Tab ── */}
        <TabsContent value="workflows" className="space-y-4">
          {workflows.map(wf => (
            <WorkflowCard key={wf.id} item={wf} />
          ))}
        </TabsContent>
      </Tabs>

      {/* ── Detail Drawer ── */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center bg-black/40" onClick={() => setSelectedItem(null)}>
          <div className="bg-white w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-t-2xl lg:rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="font-mono text-xs">{selectedItem.item_id}</Badge>
                <h3 className="text-lg font-bold text-stone-900">{selectedItem.name}</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedItem(null)}>✕</Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Description</h4>
                <p className="text-sm text-stone-700">{selectedItem.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailField label="Status" value={selectedItem.status} />
                <DetailField label="Phase" value={selectedItem.phase} />
                <DetailField label="Generator" value={selectedItem.generator_function || '—'} />
                <DetailField label="Validator" value={selectedItem.validator_function || '—'} />
                <DetailField label="Output Artifact" value={selectedItem.output_artifact || '—'} />
                <DetailField label="Acceptance Test" value={selectedItem.acceptance_test_id || '—'} />
              </div>
              {selectedItem.dependencies && selectedItem.dependencies.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Dependencies</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.dependencies.map(dep => (
                      <Badge key={dep} variant="secondary" className="font-mono text-xs">{dep}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selectedItem.tools && selectedItem.tools.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.tools.map(t => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <Card className="border-stone-200">
      <CardContent className="p-3 flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div>
          <div className="text-xl font-bold text-stone-900">{value}</div>
          <div className="text-xs text-stone-500">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function CapabilityCard({ item, onClick }) {
  const statusMeta = STATUS_META[item.status] || STATUS_META.pending;
  const StatusIcon = statusMeta.icon;
  const phaseMeta = PHASE_META[item.phase] || PHASE_META.foundation;
  const PhaseIcon = phaseMeta.icon;
  return (
    <Card
      className="border-stone-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs text-stone-400 shrink-0">{item.item_id}</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusMeta.bg} ${statusMeta.color}`}>
            <StatusIcon className="h-3 w-3" />
            {statusMeta.label}
          </div>
        </div>
        <h4 className="text-sm font-bold text-stone-800 group-hover:text-amber-600 transition-colors">{item.name}</h4>
        <p className="text-xs text-stone-500 line-clamp-2">{item.description}</p>
        <div className="flex items-center gap-2 pt-1">
          <div className={`flex items-center gap-1 text-xs ${phaseMeta.color}`}>
            <PhaseIcon className="h-3 w-3" />
            {phaseMeta.label}
          </div>
          {item.output_artifact && (
            <Badge variant="outline" className="text-xs font-mono">{item.output_artifact}</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AgentCard({ item }) {
  const role = item.name;
  return (
    <Card className="border-stone-200 hover:border-green-300 hover:shadow-md transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50 border border-green-200">
              <Bot className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-800 capitalize">{role}</h4>
              <span className="font-mono text-xs text-stone-400">{item.item_id}</span>
            </div>
          </div>
          <Badge variant="outline" className={`text-xs ${item.model_policy === 'reasoning' ? 'text-violet-600' : 'text-blue-600'}`}>
            {item.model_policy}
          </Badge>
        </div>
        <p className="text-xs text-stone-500 line-clamp-2">{item.description}</p>
        {item.tools && item.tools.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tools.map(t => (
              <span key={t} className="px-1.5 py-0.5 rounded text-xs bg-stone-100 text-stone-600 font-mono">{t}</span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FunctionCard({ item }) {
  const catMeta = CATEGORY_META[item.phase] || CATEGORY_META.orchestrator;
  const Icon = catMeta.icon;
  return (
    <Card className="border-stone-200 hover:border-purple-300 hover:shadow-md transition-all">
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1.5 rounded ${catMeta.bg}`}>
              <Icon className={`h-3.5 w-3.5 ${catMeta.color}`} />
            </div>
            <h4 className="text-sm font-bold text-stone-800 font-mono truncate">{item.name}</h4>
          </div>
          <span className="font-mono text-xs text-stone-400 shrink-0">{item.item_id}</span>
        </div>
        <p className="text-xs text-stone-500 line-clamp-2">{item.description}</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize">{item.phase}</Badge>
          <Badge variant="secondary" className="text-xs">{item.trigger}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function WorkflowCard({ item }) {
  const steps = useMemo(() => {
    try {
      const m = item.description?.match(/Steps: (.+?)\. Cadence:/s);
      if (m) return m[1].split(' → ');
    } catch {}
    return [];
  }, [item.description]);

  return (
    <Card className="border-stone-200 hover:border-cyan-300 hover:shadow-md transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-50 border border-cyan-200">
              <Workflow className="h-5 w-5 text-cyan-600" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-800">{item.name}</h4>
              <span className="font-mono text-xs text-stone-400">{item.item_id}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">{item.trigger}</Badge>
        </div>
        {steps.length > 0 && (
          <div className="space-y-1.5">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-stone-600">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-stone-100 text-stone-500 font-mono text-xs shrink-0">{i + 1}</span>
                <span>{step}</span>
                {i < steps.length - 1 && <ArrowRight className="h-3 w-3 text-stone-300 ml-auto" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">{label}</h4>
      <p className="text-sm text-stone-700 font-mono">{value}</p>
    </div>
  );
}