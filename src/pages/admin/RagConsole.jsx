import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Database, Zap, Search, Sparkles, Trash2, Loader2, CheckCircle2, FileText, Users, Brain } from "lucide-react";

export default function RagConsole() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [ragQuestion, setRagQuestion] = useState("");
  const [ragAnswer, setRagAnswer] = useState(null);
  const [ingestProgress, setIngestProgress] = useState({ leads: 0, strategy: 0 });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["ragStats"],
    queryFn: async () => {
      const res = await base44.functions.invoke("ragPipeline", { action: "stats" });
      return res.data;
    },
    refetchInterval: 5000,
  });

  const initSchema = useMutation({
    mutationFn: () => base44.functions.invoke("ragPipeline", { action: "initSchema" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ragStats"] }),
  });

  const ingestLeads = useMutation({
    mutationFn: async () => {
      let offset = 0;
      let totalIngested = 0;
      let hasMore = true;
      while (hasMore) {
        const res = await base44.functions.invoke("ragPipeline", { action: "ingestLeads", batch_size: 50, offset });
        const data = res.data;
        totalIngested += data.ingested || 0;
        setIngestProgress((p) => ({ ...p, leads: totalIngested }));
        offset = data.next_offset;
        hasMore = data.has_more;
      }
      return totalIngested;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ragStats"] }),
  });

  const ingestStrategy = useMutation({
    mutationFn: async () => {
      let offset = 0;
      let totalIngested = 0;
      let hasMore = true;
      while (hasMore) {
        const res = await base44.functions.invoke("ragPipeline", { action: "ingestStrategy", batch_size: 20, offset });
        const data = res.data;
        totalIngested += data.ingested || 0;
        setIngestProgress((p) => ({ ...p, strategy: totalIngested }));
        offset = data.next_offset;
        hasMore = data.has_more;
      }
      return totalIngested;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ragStats"] }),
  });

  const search = useMutation({
    mutationFn: (query) => base44.functions.invoke("ragPipeline", { action: "search", query, limit: 10 }),
    onSuccess: (res) => setSearchResults(res.data?.results || []),
  });

  const ragQuery = useMutation({
    mutationFn: (question) => base44.functions.invoke("ragPipeline", { action: "query", query: question, limit: 5 }),
    onSuccess: (res) => setRagAnswer(res.data),
  });

  const clearAll = useMutation({
    mutationFn: () => base44.functions.invoke("ragPipeline", { action: "clear" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ragStats"] }),
  });

  const statsArray = stats?.stats || [];
  const totalDocs = statsArray.reduce((sum, s) => sum + Number(s.count || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Database className="h-6 w-6 text-amber-500" /> RAG Intelligence Engine
        </h1>
        <p className="text-stone-500 mt-1">
          Retrieval-Augmented Generation — embeds all leads, strategy docs, and intelligence into pgvector on Supabase.
          The swarm reasons over accumulated knowledge, not just per-request scraping.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard icon={Database} label="Total Documents" value={totalDocs} color="text-stone-700" loading={statsLoading} />
        <StatCard icon={Users} label="Leads" value={statsArray.find((s) => s.source_type === "lead")?.count || 0} color="text-blue-600" />
        <StatCard icon={Brain} label="Strategy" value={statsArray.find((s) => s.source_type === "strategy")?.count || 0} color="text-purple-600" />
        <StatCard icon={FileText} label="Competitors" value={statsArray.find((s) => s.source_type === "competitor")?.count || 0} color="text-orange-600" />
        <StatCard icon={Zap} label="Market" value={statsArray.find((s) => s.source_type === "market")?.count || 0} color="text-emerald-600" />
      </div>

      {/* Schema + Ingestion */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-4">
        <h2 className="font-semibold text-stone-900">Knowledge Base Setup</h2>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => initSchema.mutate()}
            disabled={initSchema.isPending}
            className="bg-stone-900 hover:bg-stone-800 text-white"
          >
            {initSchema.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Initialize Schema
          </Button>
          {initSchema.isSuccess && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> Schema ready</span>}

          <Button
            onClick={() => ingestLeads.mutate()}
            disabled={ingestLeads.isPending}
            className="bg-blue-600 hover:bg-blue-500 text-white"
          >
            {ingestLeads.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Users className="h-4 w-4 mr-2" />}
            Ingest All Leads
          </Button>
          {ingestLeads.isPending && <span className="text-sm text-stone-500 self-center">{ingestProgress.leads} processed...</span>}
          {ingestLeads.isSuccess && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> {ingestProgress.leads} leads ingested</span>}

          <Button
            onClick={() => ingestStrategy.mutate()}
            disabled={ingestStrategy.isPending}
            className="bg-purple-600 hover:bg-purple-500 text-white"
          >
            {ingestStrategy.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
            Ingest Strategy Docs
          </Button>
          {ingestStrategy.isPending && <span className="text-sm text-stone-500 self-center">{ingestProgress.strategy} processed...</span>}
          {ingestStrategy.isSuccess && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> {ingestProgress.strategy} docs ingested</span>}
        </div>

        <div className="pt-3 border-t border-stone-100">
          <Button
            onClick={() => { if (confirm("Delete ALL documents from the vector store?")) clearAll.mutate(); }}
            disabled={clearAll.isPending}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            {clearAll.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Clear All Documents
          </Button>
        </div>
      </div>

      {/* Semantic Search */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 space-y-3">
        <h2 className="font-semibold text-stone-900 flex items-center gap-2"><Search className="h-4 w-4 text-amber-500" /> Semantic Search</h2>
        <p className="text-sm text-stone-500">Search the knowledge base by meaning, not keywords. Finds related documents across all source types.</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. 'high-value epoxy leads in Florida' or 'competitor pricing strategy'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchQuery && search.mutate(searchQuery)}
            className="h-11"
          />
          <Button onClick={() => searchQuery && search.mutate(searchQuery)} disabled={search.isPending} className="bg-amber-500 hover:bg-amber-400 text-stone-950">
            {search.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>

        {searchResults && searchResults.length > 0 && (
          <div className="space-y-2 pt-2">
            {searchResults.map((r, i) => (
              <div key={i} className="rounded-lg border border-stone-200 p-3 bg-stone-50">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">{r.source_type}</span>
                  <span className="text-xs text-emerald-600 font-mono">{Number(r.similarity).toFixed(3)} match</span>
                </div>
                <p className="text-sm text-stone-700 line-clamp-3">{r.content}</p>
              </div>
            ))}
          </div>
        )}
        {searchResults && searchResults.length === 0 && (
          <p className="text-sm text-stone-400 py-2">No results found. Try ingesting data first.</p>
        )}
      </div>

      {/* RAG Query — Retrieve + Generate */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-xl p-5 space-y-3 text-white">
        <h2 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-400" /> RAG Query — Ask the Intelligence Architect</h2>
        <p className="text-sm text-stone-400">Retrieves relevant documents, then generates an answer with cited sources. This is the full retrieval-then-generation pipeline.</p>
        <div className="flex gap-2">
          <Input
            placeholder="e.g. 'What patterns do you see in our highest-value leads?' or 'Summarize our competitive position in Florida'"
            value={ragQuestion}
            onChange={(e) => setRagQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ragQuestion && ragQuery.mutate(ragQuestion)}
            className="h-11 bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
          />
          <Button onClick={() => ragQuestion && ragQuery.mutate(ragQuestion)} disabled={ragQuery.isPending} className="bg-amber-500 hover:bg-amber-400 text-stone-950">
            {ragQuery.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          </Button>
        </div>

        {ragAnswer?.answer && (
          <div className="pt-3 space-y-3">
            <div className="rounded-lg bg-stone-800 p-4">
              <div className="text-xs font-bold text-amber-400 mb-2 tracking-wide">INTELLIGENCE ARCHITECT ANSWER</div>
              <div className="text-sm text-stone-200 whitespace-pre-wrap leading-relaxed">{ragAnswer.answer}</div>
            </div>

            {ragAnswer.sources?.length > 0 && (
              <div>
                <div className="text-xs font-bold text-stone-400 mb-2 tracking-wide">SOURCES RETRIEVED</div>
                <div className="space-y-1">
                  {ragAnswer.sources.map((s, i) => (
                    <div key={i} className="text-xs text-stone-400 flex items-center gap-2">
                      <span className="font-mono text-amber-400">[{i + 1}]</span>
                      <span className="px-1.5 py-0.5 rounded bg-stone-700 text-stone-300">{s.type}</span>
                      <span className="text-emerald-400">{s.similarity}</span>
                      <span className="truncate">{s.preview}...</span>
                    </div>
                  ))}
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
      <Icon className={`h-4 w-4 ${color} mb-1`} />
      <div className="text-lg font-bold text-stone-900">{loading ? "—" : Number(value).toLocaleString()}</div>
      <div className="text-xs text-stone-500">{label}</div>
    </div>
  );
}