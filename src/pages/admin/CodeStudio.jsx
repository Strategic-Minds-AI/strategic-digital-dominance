import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import BuilderToolbar from "@/components/codestudio/BuilderToolbar";
import BuilderChat from "@/components/codestudio/BuilderChat";
import BuilderEditor from "@/components/codestudio/BuilderEditor";
import { Loader2, Paperclip } from "lucide-react";

export default function CodeStudio() {
  const [view, setView] = useState("code"); // code | preview | split
  const [chatWidth, setChatWidth] = useState(40); // percentage
  const [resizing, setResizing] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedFileUrl(file_url);
    } catch (e) { console.error(e); }
    setUploading(false);
  };

  const startResize = (e) => {
    e.preventDefault();
    setResizing(true);
    const startX = e.clientX;
    const startWidth = chatWidth;
    const container = e.currentTarget.parentElement;
    const containerWidth = container.offsetWidth;

    const onMouseMove = (e) => {
      const delta = ((e.clientX - startX) / containerWidth) * 100;
      const newWidth = Math.min(Math.max(startWidth + delta, 25), 60);
      setChatWidth(newWidth);
    };
    const onMouseUp = () => {
      setResizing(false);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      <BuilderToolbar view={view} onViewChange={setView} onUpload={handleUpload} />

      {uploading && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-700">
          <Loader2 className="h-3 w-3 animate-spin" /> Uploading file...
        </div>
      )}
      {uploadedFileUrl && (
        <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-700">
          <Paperclip className="h-3 w-3" /> Uploaded: <a href={uploadedFileUrl} target="_blank" className="underline font-semibold truncate">{uploadedFileUrl}</a>
          <button onClick={() => setUploadedFileUrl(null)} className="ml-auto text-emerald-600 hover:text-emerald-800">×</button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Chat panel — left */}
        <div style={{ width: `${chatWidth}%` }} className="border-r border-stone-200 min-w-0 shrink-0">
          <BuilderChat onFileAttached={setUploadedFileUrl} />
        </div>

        {/* Resize handle */}
        <div onMouseDown={startResize} className={`w-1 bg-stone-200 hover:bg-amber-400 cursor-col-resize shrink-0 transition-colors ${resizing ? "bg-amber-400" : ""}`} />

        {/* Editor panel — right */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <BuilderEditor view={view} uploadedFileUrl={uploadedFileUrl} />
        </div>
      </div>
    </div>
  );
}