import React from "react";
import { MapPin, Phone, Mail, ShieldCheck, Palette, Ruler, Calendar, User } from "lucide-react";
import { Image } from "@/components/ui/image";

export default function PortalDashboard({ project, settings, onTabChange }) {
  const salesperson = settings?.salesperson || {};
  const flakeColor = project?.flake_color_hex || "#cccccc";

  return (
    <div className="space-y-6">
      {/* Project header */}
      <div className="rounded-2xl bg-stone-950 p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome, {project?.client_name?.split(" ")[0]}
            </h1>
            <p className="mt-1 text-stone-400 flex items-center gap-1.5 text-sm">
              <MapPin className="h-4 w-4" /> {project?.address}, {project?.city}, {project?.state}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold tracking-widest text-amber-500">PROJECT</div>
            <div className="text-sm text-stone-400">#{project?.id?.slice(-8).toUpperCase()}</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-stone-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-stone-500 text-xs flex items-center gap-1"><Palette className="h-3 w-3" /> Floor System</div>
            <div className="font-semibold">{project?.floor_system || "Epoxy Flake"}</div>
          </div>
          <div>
            <div className="text-stone-500 text-xs flex items-center gap-1"><Ruler className="h-3 w-3" /> Square Feet</div>
            <div className="font-semibold">{project?.square_footage || "—"} sq ft</div>
          </div>
          <div>
            <div className="text-stone-500 text-xs flex items-center gap-1"><Calendar className="h-3 w-3" /> Install Date</div>
            <div className="font-semibold">
              {project?.installation_date
                ? new Date(project.installation_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : project?.scheduled_date
                ? new Date(project.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                : "TBD"}
            </div>
          </div>
          <div>
            <div className="text-stone-500 text-xs flex items-center gap-1"><User className="h-3 w-3" /> Installer</div>
            <div className="font-semibold">{project?.assigned_team?.[0] || "TBD"}</div>
          </div>
        </div>
      </div>

      {/* Floor finish & color */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
          <Palette className="h-5 w-5 text-amber-500" /> Your Floor Finish
        </h3>
        <div className="flex items-center gap-4">
          <div
            className="w-20 h-20 rounded-xl border-2 border-stone-200 shrink-0"
            style={{ backgroundColor: flakeColor }}
          />
          <div>
            <div className="text-lg font-bold text-stone-900">
              {project?.flake_color_name || project?.floor_system || "Epoxy Flake"}
            </div>
            <div className="text-sm text-stone-500">
              {project?.flake_color ? `Color Code: ${project.flake_color}` : "Custom color"}
            </div>
            <div className="text-xs text-stone-400 mt-1 font-mono">{flakeColor}</div>
          </div>
        </div>
      </div>

      {/* Salesperson contact */}
      {salesperson.name && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h3 className="font-semibold text-stone-900 mb-4">Your Sales Representative</h3>
          <div className="flex items-start gap-4">
            {salesperson.photo_url && (
              <img
                src={salesperson.photo_url}
                alt={salesperson.name}
                className="w-16 h-16 rounded-full object-cover shrink-0"
              />
            )}
            <div className="flex-1">
              <div className="font-bold text-stone-900">{salesperson.name}</div>
              <div className="text-sm text-stone-500">{salesperson.title || "Sales Representative"}</div>
              {salesperson.bio && <p className="text-sm text-stone-600 mt-2">{salesperson.bio}</p>}
              <div className="flex gap-3 mt-3">
                {salesperson.phone && (
                  <a
                    href={`tel:${salesperson.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call
                  </a>
                )}
                <button
                  onClick={() => onTabChange("messages")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 text-sm font-semibold hover:bg-stone-50"
                >
                  <Mail className="h-3.5 w-3.5" /> Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warranty */}
      {project?.warranty_expiration && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-stone-950" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">Warranty Coverage</h3>
              <p className="text-sm text-stone-600">Your floor is protected</p>
            </div>
          </div>
          <div className="text-sm text-stone-700">
            Warranty expires:{" "}
            <strong>
              {new Date(project.warranty_expiration).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </strong>
          </div>
        </div>
      )}

      {/* Before/After Photos */}
      {(project?.before_photos?.length > 0 || project?.after_photos?.length > 0) && (
        <div>
          <h3 className="font-semibold text-stone-900 mb-4">Project Photos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold tracking-widest text-stone-500 mb-2">BEFORE</div>
              {(project?.before_photos || []).length > 0 ? (
                <div className="space-y-2">
                  {(project?.before_photos || []).map((url, i) => (
                    <Image key={i} src={url} alt={`Before ${i + 1}`} className="w-full aspect-[4/3] rounded-xl object-cover" fittingType="fill" />
                  ))}
                </div>
              ) : (
                <div className="w-full aspect-[4/3] rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 text-sm">
                  No photos yet
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest text-amber-500 mb-2">AFTER</div>
              {(project?.after_photos || []).length > 0 ? (
                <div className="space-y-2">
                  {(project?.after_photos || []).map((url, i) => (
                    <Image key={i} src={url} alt={`After ${i + 1}`} className="w-full aspect-[4/3] rounded-xl object-cover" fittingType="fill" />
                  ))}
                </div>
              ) : (
                <div className="w-full aspect-[4/3] rounded-xl bg-stone-100 flex items-center justify-center text-stone-400 text-sm">
                  Coming soon
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}