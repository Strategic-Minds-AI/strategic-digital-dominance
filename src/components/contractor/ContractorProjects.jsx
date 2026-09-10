import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Calendar, MapPin, Users, CheckCircle2, Clock } from "lucide-react";
import { Image } from "@/components/ui/image";

const STATUS_LABELS = {
  scheduled: { label: "Scheduled", color: "text-blue-400", icon: Calendar },
  prep: { label: "Prep", color: "text-amber-400", icon: Clock },
  installation: { label: "Installation", color: "text-purple-400", icon: Clock },
  curing: { label: "Curing", color: "text-orange-400", icon: Clock },
  complete: { label: "Complete", color: "text-green-400", icon: CheckCircle2 },
};

export default function ContractorProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const list = await base44.entities.ClientProject.list("-created_date", 50);
        setProjects(list || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  const active = projects.filter((p) => p.status !== "complete");
  const completed = projects.filter((p) => p.status === "complete");

  return (
    <div className="p-4 space-y-5 max-w-2xl mx-auto">
      <h1 className="text-lg font-extrabold text-stone-900">Jobs</h1>

      {/* Active jobs */}
      <div>
        <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Active ({active.length})</h2>
        <div className="space-y-3">
          {active.length === 0 && (
            <div className="rounded-xl bg-white border border-stone-200 text-center py-6">
              <p className="text-xs text-stone-500">No active jobs. Generate a bid to get started.</p>
            </div>
          )}
          {active.map((p) => {
            const status = STATUS_LABELS[p.status] || STATUS_LABELS.scheduled;
            const StatusIcon = status.icon;
            return (
              <div key={p.id} className="rounded-2xl bg-white border border-stone-200 p-4 hover:border-amber-400 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-sm font-bold text-stone-900">{p.client_name}</div>
                    <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3" /> {p.address}, {p.city}, {p.state}
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-bold ${status.color}`}>
                    <StatusIcon className="h-3.5 w-3.5" /> {status.label}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span>{p.floor_system || "Epoxy"}</span>
                  <span>·</span>
                  <span>{p.square_footage || "—"} sq ft</span>
                  {p.scheduled_date && (
                    <>
                      <span>·</span>
                      <span>{new Date(p.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                    </>
                  )}
                </div>
                {p.flake_color_hex && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="w-4 h-4 rounded-full border border-stone-300" style={{ background: p.flake_color_hex }} />
                    <span className="text-xs text-stone-500">{p.flake_color_name || "Custom"}</span>
                  </div>
                )}
                {p.after_photos?.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {p.after_photos.slice(0, 3).map((url, i) => (
                      <Image key={i} src={url} alt={`photo ${i}`} className="w-full aspect-square rounded-lg object-cover" fittingType="fill" />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Completed jobs */}
      {completed.length > 0 && (
        <div>
          <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Completed ({completed.length})</h2>
          <div className="space-y-2">
            {completed.map((p) => (
              <div key={p.id} className="rounded-xl bg-white border border-stone-200 p-3 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-stone-900 truncate">{p.client_name}</div>
                  <div className="text-xs text-stone-500 truncate">{p.address}, {p.city}</div>
                </div>
                {p.completion_date && (
                  <span className="text-xs text-stone-400 shrink-0">
                    {new Date(p.completion_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}