import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import DynamicPageRenderer from "@/components/codestudio/DynamicPageRenderer";
import { Loader2, FileQuestion } from "lucide-react";
import Logo from "@/components/Logo";

export default function DynamicPageView() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const results = await base44.entities.DynamicPage.filter({ slug, status: "published" }, "-created_date", 1);
        setPage(results?.[0] || null);
      } catch (e) { console.error(e); }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-50"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>;
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-4">
        <FileQuestion className="h-12 w-12 text-stone-300" />
        <h1 className="text-xl font-bold text-stone-700">Page not found</h1>
        <p className="text-sm text-stone-500">This page may be a draft or doesn't exist.</p>
        <a href="/" className="text-sm font-bold text-amber-600 hover:underline">← Back to home</a>
      </div>
    );
  }

  return (
    <>
      {page.seo_title && document.title !== page.seo_title && (document.title = page.seo_title)}
      <DynamicPageRenderer page={page} />
    </>
  );
}