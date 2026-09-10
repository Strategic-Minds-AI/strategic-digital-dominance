import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Network, Zap, Search, Sparkles, Trash2, Loader2, CheckCircle2, Users, Globe, Building2, Brain, Target, MapPin, ArrowRight } from "lucide-react";

const NODE_COLORS = {
  contractor: "#3b82f6",
  homeowner_lead: "#10b981",
  competitor: "#ef4444",
  market: "#f59e0b",
  website: "#8b5cf6",
  strategy: "#6b7280",
};

const NODE_ICONS = {
  contractor: Users,
  homeowner_lead: Target,
  competitor: Zap,
  market: MapPin,
  website: Globe,
  strategy: Brain,
};

export default function GraphConsole() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("");
  const [foundNodes, setFoundNodes] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [traverseResults, setTraverseResults] = useState(null);
  const [hybridQuestion, setHybridQuestion] = useState("");
  const [hybridAnswer, setHybridAnswer] = useState(null);
  const [syncProgress, setSyncProgress] = useState({ leads: 0, competitors: 0, websites: 0, strategies: 0 });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["graphStats"],
    queryFn: async () => {
      const res = await base44.functions.invoke("graphEngine", { action: "stats" });
      return res.data;
    },
    refetchInterval: 5000,
  });

  const initSchema = useMutation({
    mutationFn: () => base44.functions.invoke("graphEngine", { action: "initSchema" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["graphStats"] }),
  });

  const syncLeads = useMutation({
    mutationFn: async () => {
      let offset = 0, total = 0, hasMore = true;
      while (hasMore) {
        const res = await base44.functions.invoke("graphEngine", { action: "sync", entity_type: "leads", batch_size: 50, offset });
        const data = res.data;
        total += data.nodes_created || 0;
        setSyncProgress((p) => ({ ...p, leads: total }));
        offset = data.next_offset;
        hasMore = data.has_more;
      }
      return total;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["graphStats"] }),
  });

  const syncCompetitors = useMutation({
    mutationFn: () => base44.functions.invoke("graphEngine", { action: "sync", entity_type: "competitors" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["graphStats"] }),
  });

  const syncWebsites = useMutation({
    mutationFn: () => base44.functions.invoke("graphEngine", { action: "sync", entity_type: "websites" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["graphStats"] }),
  });

  const syncStrategies = useMutation({
    mutationFn: () => base44.functions.invoke("graphEngine", { action: "sync", entity_type: "strategies" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["graphStats"] }),
  });

  const findNodes = useMutation({
    mutationFn: ({ query, node_type }) => base44.functions.invoke("graphEngine", { action: "findNodes", query: query || null, node_type: node_type || null, limit: 30 }),
    onSuccess: (res) => setFoundNodes(res.data?.nodes || []),
  });

  const traverse = useMutation({
    mutationFn: (node_id) => base44.functions.invoke("graphEngine", { action: "traverse", node_id, max_hops: 2 }),
    onSuccess: (res) => setTraverseResults(res.data?.nodes || []),
  });

  const hybridQuery = useMutation({
    mutationFn: (question) => base44.functions.invoke("graphEngine", { action: "hybridQuery", query: question, top_k: 5, max_hops: 2 }),
    onSuccess: (res) => setHybridAnswer(res.data),
  });

  const clearGraph = useMutation({
    mutationFn: () => base44.functions.invoke("graphEngine", { action: "clear" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["graphStats"] }); setFoundNodes(null); setTraverseResults(null); setSelectedNode(null); },
  });

  const nodeStats = stats?.nodes || [];
  const edgeStats = stats?.edges || [];
  const totalNodes = nodeStats.reduce((s, n) => s + Number(n.count || 0), 0);
  const totalEdges = edgeStats.reduce((s, e) => s + Number(e.count || 0), 0);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    traverse.mutate(node.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Network className="h-6 w-6 text-amber-500" /> Knowledge Graph
        </h1>
        <p className="text-stone-500 mt-1">
          Relational graph + vector embeddings — entities (contractors, leads, competitors, markets, websites) connected by relationships.
          Traverses the graph to answer questions vector search alone can't.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard icon={Network} label="Total Nodes" value={totalNodes} color="text-stone-700" loading={statsLoading} />
        <StatCard icon={ArrowRight} label="Total Edges" value={totalEdges} color="text-amber-600" />
        {nodeStats.map((n) => {
          const Icon = NODE_ICONS[n.node_type] || Network;
          return <StatCard key={n.node_type} icon={Icon} label={n.node_type.replace(/_/g, " ")} value={Number(n.count)} color="" />;
        })}
      </div>

      {/* Schema + Sync */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <h2 className="font-semibold text-stone-900">Graph Setup</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => initSchema.mutate()} disabled={initSchema.isPending} className="bg-stone-900 hover:bg-stone-800 text-white">
            {initSchema.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Network className="h-4 w-4 mr-2" />}
            Initialize Graph
          </Button>
          {initSchema.isSuccess && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Schema ready</span>}
        </div>

        <div className="flex flex-wrap gap-3 pt-2 border-t border-stone-100">
          <Button onClick={() => syncLeads.mutate()} disabled={syncLeads.isPending} className="bg-blue-600 hover:bg-blue-500 text-white">
            {syncLeads.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
            Sync Leads
          </Button>
          {syncLeads.isPending && <span className="text-sm text-stone-500 self-center">{syncProgress.leads} nodes...</span>}
          {syncLeads.isSuccess && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> {syncProgress.leads} synced</span>}

          <Button onClick={() => syncCompetitors.mutate()} disabled={syncCompetitors.isPending} className="bg-red-600 hover:bg-red-500 text-white">
            {syncCompetitors.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
            Sync Competitors
          </Button>
          {syncCompetitors.isSuccess && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /></span>}

          <Button onClick={() => syncWebsites.mutate()} disabled={syncWebsites.isPending} className="bg-purple-600 hover:bg-purple-500 text-white">
            {syncWebsites.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Globe className="h-4 w-4 mr-2" />}
            Sync Websites
          </Button>
          {syncWebsites.isSuccess && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /></span>}

          <Button onClick={() => syncStrategies.mutate()} disabled={syncStrategies.isPending} className="bg-gray-600 hover:bg-gray-500 text-white">
            {syncStrategies.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
            Sync Strategy
          </Button>
          {syncStrategies.isSuccess && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /></span>}
        </div>

        <div className="pt-3 border-t border-stone-100">
          <Button onClick={() => { if (confirm("Delete ALL graph data?")) clearGraph.mutate(); }} disabled={clearGraph.isPending} variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
            {clearGraph.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Clear Graph
          </Button>
        </div>
      </div>

      {/* Graph Explorer */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Node Search */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
          <h2 className="font-semibold text-stone-900 flex items-center gap-2"><Search className="h-4 w-4 text-amber-500" /> Find Nodes</h2>
          <div className="flex gap-2">
            <Input placeholder="Search by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && findNodes.mutate({ query: searchQuery, node_type: searchType })} className="h-11" />
            <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="h-11 px-3 border border-stone-200 rounded-lg text-sm bg-white">
              <option value="">All Types</option>
              <option value="contractor">Contractor</option>
              <option value="homeowner_lead">Homeowner Lead</option>
              <option value="competitor">Competitor</option>
              <option value="market">Market</option>
              <option value="website">Website</option>
              <option value="strategy">Strategy</option>
            </select>
            <Button onClick={() => findNodes.mutate({ query: searchQuery, node_type: searchType })} disabled={findNodes.isPending} className="bg-amber-500 hover:bg-amber-400 text-stone-950">
              {findNodes.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>

          {foundNodes && (
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {foundNodes.length === 0 && <p className="text-sm text-stone-400 py-2">No nodes found.</p>}
              {foundNodes.map((n) => {
                const Icon = NODE_ICONS[n.node_type] || Network;
                const color = NODE_COLORS[n.node_type] || "#6b7280";
                return (
                  <button key={n.id} onClick={() => handleNodeClick(n)} className={`w-full text-left rounded-lg border p-2.5 transition ${selectedNode?.id === n.id ? "border-amber-500 bg-amber-50" : "border-stone-200 hover:border-stone-300 bg-stone-50"}`}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" style={{ color }} />
                      <span className="text-sm font-medium text-stone-900 truncate">{n.label}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full ml-auto shrink-0" style={{ backgroundColor: `${color}20`, color }}>{n.node_type.replace(/_/g, " ")}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Graph Traversal Results */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
          <h2 className="font-semibold text-stone-900 flex items-center gap-2"><Network className="h-4 w-4 text-amber-500" /> Graph Neighborhood</h2>
          {!selectedNode && <p className="text-sm text-stone-400 py-2">Select a node to see its relationships.</p>}
          {selectedNode && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 mb-2">
              <div className="flex items-center gap-2">
                {(() => { const Icon = NODE_ICONS[selectedNode.node_type] || Network; return <Icon className="h-5 w-5" style={{ color: NODE_COLORS[selectedNode.node_type] }} />; })()}
                <span className="font-semibold text-stone-900">{selectedNode.label}</span>
              </div>
            </div>
          )}
          {traverse.isPending && <div className="flex items-center gap-2 text-sm text-stone-500"><Loader2 className="h-4 w-4 animate-spin" /> Traversing graph...</div>}
          {traverseResults && traverseResults.length > 1 && (
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {traverseResults.filter((n) => n.hop > 0).map((n, i) => {
                const Icon = NODE_ICONS[n.node_type] || Network;
                const color = NODE_COLORS[n.node_type] || "#6b7280";
                return (
                  <button key={i} onClick={() => handleNodeClick({ id: n.node_id, node_type: n.node_type, label: n.label })} className="w-full text-left rounded-lg border border-stone-200 p-2.5 hover:border-stone-300 bg-stone-50 transition">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-stone-400 shrink-0">hop {n.hop}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${color}20`, color }}>{n.edge_type}</span>
                      <Icon className="h-4 w-4 shrink-0" style={{ color }} />
                      <span className="text-sm text-stone-900 truncate">{n.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {traverseResults && traverseResults.length <= 1 && !traverse.isPending && (
            <p className="text-sm text-stone-400">No relationships found for this node.</p>
          )}
        </div>
      </div>

      {/* Hybrid Query — Vector + Graph + LLM */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-xl p-5 space-y-3 text-white">
        <h2 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-400" /> Hybrid Query — Vector + Graph Reasoning</h2>
        <p className="text-sm text-stone-400">Finds similar nodes via vector search, expands through graph relationships, then generates an answer with full relational context. This is what pure RAG can't do.</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. 'Who are our top competitors in Florida and what markets do they serve?' or 'What contractors serve the same areas as our highest-value leads?'"
            value={hybridQuestion}
            onChange={(e) => setHybridQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && hybridQuestion && hybridQuery.mutate(hybridQuestion)}
            className="h-11 bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
          />
          <Button onClick={() => hybridQuestion && hybridQuery.mutate(hybridQuestion)} disabled={hybridQuery.isPending} className="bg-amber-500 hover:bg-amber-400 text-stone-950">
            {hybridQuery.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          </Button>
        </div>

        {hybridAnswer?.answer && (
          <div className="pt-3 space-y-3">
            <div className="rounded-lg bg-stone-800 p-4">
              <div className="text-xs font-bold text-amber-400 mb-2 tracking-wide">INTELLIGENCE ARCHITECT ANSWER</div>
              <div className="text-sm text-stone-200 whitespace-pre-wrap leading-relaxed">{hybridAnswer.answer}</div>
            </div>

            {hybridAnswer.sources?.length > 0 && (
              <div>
                <div className="text-xs font-bold text-stone-400 mb-2 tracking-wide">GRAPH NODES RETRIEVED ({hybridAnswer.sources.length})</div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {hybridAnswer.sources.map((s, i) => {
                    const color = NODE_COLORS[s.type] || "#6b7280";
                    return (
                      <div key={i} className="text-xs text-stone-400 flex items-center gap-2">
                        <span className="font-mono text-amber-400">[{i + 1}]</span>
                        <span className="px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: `${color}30`, color }}>{s.type.replace(/_/g, " ")}</span>
                        {s.hop > 0 && <span className="text-stone-500 shrink-0">hop {s.hop} via {s.edge}</span>}
                        {s.similarity && <span className="text-emerald-400 shrink-0">{s.similarity}</span>}
                        <span className="truncate">{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, loading }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-3">
      <Icon className={`h-4 w-4 ${color || "text-stone-500"} mb-1`} />
      <div className="text-lg font-bold text-stone-900">{loading ? "—" : Number(value).toLocaleString()}</div>
      <div className="text-xs text-stone-500 capitalize">{label}</div>
    </div>
  );
}