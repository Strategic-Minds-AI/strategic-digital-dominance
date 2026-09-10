import React, { useState } from "react";
import { Code2, FileText, Info } from "lucide-react";
import PageBuilder from "@/components/codestudio/PageBuilder";
import CodeBlockManager from "@/components/codestudio/CodeBlockManager";

export default function CodeStudio() {
  const [tab, setTab] = useState("pages");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 flex items-center gap-2">
          <Code2 className="h-6 w-6 text-amber-500" /> Code Studio
        </h1>
        <p className="text-sm text-stone-500 mt-1">Build pages and inject custom code — no builder required. Pages render at <code className="text-amber-600">/p/&#123;slug&#125;</code>, code blocks inject into the DOM automatically.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200">
        <button onClick={() => setTab("pages")} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition ${tab === "pages" ? "border-amber-500 text-amber-600" : "border-transparent text-stone-500 hover:text-stone-700"}`}>
          <FileText className="h-4 w-4" /> Page Builder
        </button>
        <button onClick={() => setTab("code")} className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition ${tab === "code" ? "border-amber-500 text-amber-600" : "border-transparent text-stone-500 hover:text-stone-700"}`}>
          <Code2 className="h-4 w-4" /> Code Blocks
        </button>
      </div>

      {/* Info banner */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          {tab === "pages"
            ? "Build full pages from sections (hero, text, gallery, CTA, FAQ, testimonials, custom HTML, forms). Published pages are live at /p/{slug}. The System Operator AI can also create and edit these pages for you."
            : "Inject custom CSS, JavaScript, HTML, or meta tags into any page. Global blocks run everywhere, page-scoped blocks only on the matching route. Great for analytics pixels, custom styling, or third-party widgets."}
        </p>
      </div>

      {tab === "pages" ? <PageBuilder /> : <CodeBlockManager />}
    </div>
  );
}