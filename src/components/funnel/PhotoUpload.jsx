import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { uploadFile } from "@/lib/gateway";
import { Camera, Loader2, X } from "lucide-react";

// Photo uploader used inside the funnel questionnaire. `photos` is an array of
// uploaded file URLs; `onChange` receives the new array.
export default function PhotoUpload({ photos = [], onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - photos.length);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const { file_url } = await uploadFile(file);
        urls.push(file_url);
      }
      onChange([...photos, ...urls]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {photos.map((url, i) => (
        <div key={i} className="relative rounded-xl overflow-hidden aspect-square bg-stone-100">
          <img src={url} alt="Garage floor" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(photos.filter((_, k) => k !== i))}
            className="absolute top-1 right-1 bg-stone-900/80 text-white rounded-full p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      {photos.length < 5 && (
        <label className="aspect-square rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-2 text-stone-500 cursor-pointer hover:border-amber-500">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
          <span className="text-xs">{uploading ? "Uploading…" : "Add photo"}</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} disabled={uploading} />
        </label>
      )}
    </div>
  );
}