import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { FileText, Code2, Plus, Eye } from "lucide-react";
import PageBuilder from "./PageBuilder";
import CodeBlockManager from "./CodeBlockManager";
import DynamicPageRenderer from "./DynamicPageRenderer";

export default function BuilderEditor({ view = "code", uploadedFileUrl }) {
  const [tab, setTab] = useState("pages");
  const [previewPageId, setPreviewPageId] = useState(null);
  const qc = useQueryClient();

  const { data: pages } = useQuery({
    queryKey: ["dynamicPages"],
    queryFn: () => base44.entities.DynamicPage.list("-created_date", 50),
  });

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
    setPreviewPageId(page.id);
  };

  // Preview view — dropdown page selector + live render
  if (view === "preview") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-stone-200 bg-white shrink-0">
          <select
            value={previewPageId || ""}
            onChange={(e) => setPreviewPageId(e.target.value)}
            className="text-sm border border-stone-200 rounded-lg px-3 py-1.5 outline-none focus:border-amber-500"
          >
            <option value="">Select a page to preview...</option>
            {(pages || []).map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <button onClick={createPage} className="text-xs font-bold text-amber-600 hover:text-amber-700">+ New Page</button>
        </div>
        <div className="flex-1 overflow-y-auto bg-stone-100">
          {previewPage ? (
            <div className="max-w-4xl mx-auto bg-white min-h-full shadow-lg">
              <DynamicPageRenderer page={previewPage} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-stone-400">
              <Eye className="h-10 w-10 mb-2 opacity-40" />
              <p className="text-sm">Select a page to preview</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Code view — tab bar + editor (PageBuilder has its own page list sidebar)
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 px-4 pt-2 border-b border-stone-200 bg-white shrink-0">
        <button onClick={() => setTab("pages")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-b-2 transition ${tab === "pages" ? "border-amber-500 text-amber-600" : "border-transparent text-stone-500 hover:text-stone-700"}`}>
          <FileText className="h-3.5 w-3.5" /> Page Editor
        </button>
        <button onClick={() => setTab("code")} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border-b-2 transition ${tab === "code" ? "border-amber-500 text-amber-600" : "border-transparent text-stone-500 hover:text-stone-700"}`}>
          <Code2 className="h-3.5 w-3.5" /> Code Blocks
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === "pages" ? <PageBuilder /> : <CodeBlockManager />}
      </div>
    </div>
  );
}