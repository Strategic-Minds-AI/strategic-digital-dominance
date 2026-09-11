import React, { useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { uploadFile } from "@/lib/gateway";

const MAX = 10;

export default function PhotoUploader({ photos, setPhotos }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const toUpload = files.slice(0, MAX - photos.length);
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        toUpload.map(async (file) => {
          const { file_url } = await uploadFile(file);
          return { url: file_url };
        })
      );
      setPhotos([...photos, ...uploaded]);
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
    e.target.value = "";
  };

  const removePhoto = (i) => setPhotos(photos.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-bold text-black">Upload Photos</h3>
        <span className="text-[11px] text-stone-500 font-semibold">{photos.length}/{MAX}</span>
      </div>
      <p className="text-[10px] text-stone-500">Upload up to {MAX} photos of your floor. Each photo will be transformed with your chosen color.</p>
      <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-6 cursor-pointer transition ${photos.length >= MAX ? "opacity-50 pointer-events-none" : "border-stone-300 hover:border-amber-500 hover:bg-amber-50/40"}`}>
        {uploading ? <Loader2 className="h-6 w-6 text-amber-500 animate-spin" /> : <Upload className="h-6 w-6 text-stone-400" />}
        <span className="text-[12px] font-medium text-stone-600">{uploading ? "Uploading…" : "Tap to upload floor photos"}</span>
        <span className="text-[10px] text-stone-400">JPG or PNG · {MAX - photos.length} remaining</span>
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={photos.length >= MAX} />
      </label>
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden border border-stone-200 aspect-square">
              <img src={p.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}