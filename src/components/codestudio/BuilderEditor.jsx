import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { FileText, Code2, Plus, Trash2, Save, Loader2, Eye, Layers } from "lucide-react";
import PageBuilder from "./PageBuilder";
import CodeBlockManager from "./CodeBlockManager";
import DynamicPageRenderer from "./DynamicPageRenderer";

export default function BuilderEditor({ view = "code", uploadedFile }) {
  const [tab, setTab] = useState("pages"); // pages | code | preview
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [previewPageId, setPreviewPageId] = useState(null);
  const qc = useQueryClient();

  const { data: pages, isLoading } = useQuery({
    queryKey: ["dynamicPages"],
    queryFn: () => base44.entities.DynamicPage.list("-created_date", 50),
  });

  const { data: codeBlocks } = useQuery({
    queryKey: ["codeBlocks"],
    queryFn: () => base44.entities.CodeBlock.list("-created_date", 50),
  });

  const selectedPage = pages?.find((p) => p.id === (view === "preview" ? previewPageId : selectedPageId));
  const previewPage = pages?.find((p) => p.id === previewPageId);

  const createPage = async () => {
    const page = await base44.entities.DynamicPage.create({
      title: "New Page",
      slug: `new-page-${Date.now()}`,
      sections: [],
      status: "draft",
      is_public: true,
    });
    qc.invalidateQueries({ queryKey: ["dynamicPages"] });
    setSelectedPageId(page.id);
  };

  const deletePage = async (page) => {
    await base44.entities.DynamicPage.delete(page.id);
    qc.invalidateQueries({ queryKey: ["dynamicPages"] });
    if (selectedPageId === page.id) setSelectedPageId(null);
    if (previewPageId === page.id) setPreviewPageId(null);
  };

  // If in preview view, show the preview panel
  if (view === "preview") {
    return (
      <div className="flex h-full">
        {/* Page selector sidebar */}
        <div className="w-48 border-r border-stone-200 bg-stone-50 flex flex-col shrink-0">
          <div className="p-2 border-b border-stone-200">
            <button onClick={createPage} className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-stone-900 text-white text-xs font-bold py-2 hover:bg-amber-500 hover:text-stone-950 transition"><Plus className="h-3 w-3" /> New Page</button>
          </div>
          <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
            {(pages || []).map((p) => (
              <button key={p.id} onClick={() => setPreviewPageId(p.id)} className={`w-full flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition ${previewPageId === p.id ? "bg-amber-100 border border-amber-300" : "hover:bg-stone-100"}`}>
                <FileText className="h-3 w-3 text-stone-400 shrink-0" />
                <span className="text-xs font-medium text-stone-700 truncate">{p.title}</span>
              </button>
            ))}
            {(!pages || pages.length === 0) && <p className="text-[10px] text-stone-400 text-center py-4">No pages</p>}
          </div>
        </div>
        {/* Preview area */}
        <div className="flex-1 overflow-y-auto bg-stone-100">
          {previewPage ? (
            <div className="max-w-4xl mx-auto bg-white min-h-full shadow-lg">
              <DynamicPageRenderer page={previewPage} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-stone-400"><Eye className="h-10 w-10 mb-2 opacity-40" /><p className="text-sm">Select a page to preview</p></div>
          )}
        </div>
      </div>
    );
  }

  // Code view — file tree + editor
  return (
    <div className="flex h-full">
      {/* File tree sidebar */}
      <div className="w-48 border-r border-stone-200 bg-stone-50 flex flex-col shrink-0">
        {/* Pages section */}
        <div className="border-b border-stone-200">
          <div className="flex items-center justify-between px-2.5 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-stone-400 flex items-center gap-1"><FileText className="h-3 w-3" /> Pages</span>
            <button onClick={createPage} className="text-stone-400 hover:text-amber-600"><Plus className="h-3.5 w-3.5" /></button>
          </div>
          <div className="px-1.5 pb-2 space-y-0.5 max-h-48 overflow-y-auto">
            {(pages || []).map((p) => (
              <div key={p.id} className={`group flex items-center gap-1.5 rounded-md px-2 py-1.5 cursor-pointer transition ${selectedPageId === p.id && tab === "pages" ? "bg-amber-100 border border-amber-300" : "hover:bg-stone-100"}`} onClick={() => { setSelectedPageId(p.id); setTab("pages"); }}>
                <FileText className="h-3 w-3 text-stone-400 shrink-0" />
                <span className="text-xs font-medium text-stone-700 truncate flex-1">{p.title}</span>
                <span className={`text-[8px] font-bold px-1 rounded ${p.status === "published" ? "bg-green-100 text-green-600" : "bg-stone-200 text-stone-500"}`}>{(p.status || "").slice(0, 3).toUpperCase()}</span>
                <button onClick={(e) => { e.stopPropagation(); deletePage(p); }} className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
              </div>
            ))}
            {isLoading && <div className="flex justify-center py-2"><Loader2 className="h-3 w-3 animate-spin text-stone-400" /></div>}
          </div>
        </div>
        {/* Code blocks section */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-2.5 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-stone-400 flex items-center gap-1"><Code2 className="h-3 w-3" /> Code Blocks</span>
            <span className="text-[10px] text-stone-400">{(codeBlocks || []).length}</span>
          </div>
          <div className="px-1.5 space-y-0.5">
            {(codeBlocks || []).map((b) => (
              <div key={b.id} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 cursor-pointer hover:bg-stone-100 transition" onClick={() => setTab("code")}>
                <Code2 className="h-3 w-3 text-stone-400 shrink-0" />
                <span className="text-xs font-medium text-stone-700 truncate flex-1">{b.name}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${b.active ? "bg-green-500" : "bg-stone-300"}`} />
              </div>
            ))}
            {(!codeBlocks || codeBlocks.length === 0) && <p className="text-[10px] text-stone-400 px-2 py-1">No code blocks</p>}
          </div>
        </div>
        {/* Footer stats */}
        <div className="border-t border-stone-200 px-2.5 py-2 text-[10px] text-stone-400">
          <div className="flex items-center justify-between"><span>Pages</span><span className="font-bold text-stone-600">{(pages || []).length}</span></div>
          <div className="flex items-center justify-between"><span>Code Blocks</span><span className="font-bold text-stone-600">{(codeBlocks || []).length}</span></div>
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto">
        {/* Tab bar */}
        <div className="flex gap-1 px-3 pt-2 border-b border-stone-200 bg-white sticky top-0 z-10">
          <button onClick={() => setTab("pages")} disabled={!selectedPageId} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-b-2 transition ${tab === "pages" ? "border-amber-500 text-amber-600" : "border-transparent text-stone-500 hover:text-stone-700"} disabled:opacity-40`}>
            <FileText className="h-3.5 w-3.5" /> Page Editor
          </button>
          <button onClick={() => setTab("code")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-b-2 transition ${tab === "code" ? "border-amber-500 text-amber-600" : "border-transparent text-stone-500 hover:text-stone-700"}`}>
            <Code2 className="h-3.5 w-3.5" /> Code Blocks
          </button>
          {selectedPageId && (
            <button onClick={() => { setPreviewPageId(selectedPageId); setTab("preview"); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-b-2 border-transparent text-stone-500 hover:text-stone-700 ml-auto">
              <Eye className="h-3.5 w-3.5" /> Preview Page
            </button>
          )}
        </div>

        {/* Tab content */}
        <div className="p-4">
          {tab === "pages" && selectedPageId ? <PageBuilder key={selectedPageId} /> : tab === "code" ? <CodeBlockManager /> : tab === "preview" && previewPageId ? (
            <div className="max-w-4xl mx-auto bg-white border border-stone-200 rounded-lg overflow-hidden shadow-sm">
              <DynamicPageRenderer page={pages?.find((p) => p.id === previewPageId)} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-stone-400">
              <Layers className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">Select a page from the file tree to edit</p>
              <button onClick={createPage} className="mt-3 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-bold hover:bg-amber-500 hover:text-stone-950 transition"><Plus className="h-4 w-4" /> Create New Page</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}