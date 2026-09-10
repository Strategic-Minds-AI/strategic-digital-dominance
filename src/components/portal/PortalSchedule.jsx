import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Calendar, Clock, Phone, MapPin, Loader2, CheckCircle2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function PortalSchedule({ project }) {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [requestDate, setRequestDate] = useState("");
  const [requestTime, setRequestTime] = useState("");
  const [requestNotes, setRequestNotes] = useState("");

  useEffect(() => {
    if (!project?.id) return;
    (async () => {
      try {
        // Try to find appointment linked to this project's lead
        const appts = await base44.entities.Appointment.filter(
          { status: "booked" },
          "-created_date",
          10
        );
        // Find the one closest to the project's scheduled date
        const matching = appts.find((a) => a.date === project.scheduled_date || a.date === project.installation_date) || appts[0];
        setAppointment(matching || null);
      } catch {}
      setLoading(false);
    })();
  }, [project?.id]);

  const submitRequest = async () => {
    if (!requestDate || !project) return;
    setRequesting(true);
    try {
      await base44.entities.ChatMessage.create({
        project_id: project.id,
        sender_name: project.client_name || "Homeowner",
        sender_role: "client",
        text: `SCHEDULE CHANGE REQUEST: Customer requested ${requestDate} at ${requestTime || "TBD"}. ${requestNotes ? `Notes: ${requestNotes}` : ""}`,
      });
      setRequestSent(true);
      setRequestDate("");
      setRequestTime("");
      setRequestNotes("");
    } catch {}
    setRequesting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current appointment */}
      <div className="rounded-2xl bg-stone-950 p-6 text-white">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-amber-500" /> Your Appointment
        </h2>
        {appointment ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-amber-500 text-stone-950 flex flex-col items-center justify-center font-bold">
                <span className="text-xs uppercase">{new Date(appointment.date).toLocaleDateString("en-US", { month: "short" })}</span>
                <span className="text-xl">{new Date(appointment.date).getDate()}</span>
              </div>
              <div>
                <div className="font-semibold text-lg">
                  {new Date(appointment.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </div>
                <div className="text-stone-400 text-sm flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {appointment.time || "Time TBD"}
                </div>
                <div className="text-stone-400 text-sm flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> {appointment.type || "In-Home Estimate"}
                </div>
              </div>
            </div>
            {appointment.salesperson && (
              <div className="pt-3 border-t border-stone-800 text-sm text-stone-400">
                Salesperson: <span className="text-white font-semibold">{appointment.salesperson}</span>
              </div>
            )}
          </div>
        ) : project?.scheduled_date || project?.installation_date ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-amber-500 text-stone-950 flex flex-col items-center justify-center font-bold">
                <span className="text-xs uppercase">
                  {new Date(project.scheduled_date || project.installation_date).toLocaleDateString("en-US", { month: "short" })}
                </span>
                <span className="text-xl">{new Date(project.scheduled_date || project.installation_date).getDate()}</span>
              </div>
              <div>
                <div className="font-semibold text-lg">
                  {new Date(project.scheduled_date || project.installation_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </div>
                <div className="text-stone-400 text-sm">Installation scheduled</div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-stone-400 text-sm">No appointment scheduled yet. Use the form below to request one.</p>
        )}
      </div>

      {/* Schedule change request */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6">
        <h3 className="font-semibold text-stone-900 mb-4">Request a Schedule Change</h3>
        {requestSent ? (
          <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <div>
              <div className="font-semibold text-green-800 text-sm">Request sent!</div>
              <div className="text-sm text-green-700">Your team will review and confirm your new date within 24 hours.</div>
            </div>
            <button onClick={() => setRequestSent(false)} className="ml-auto text-xs text-green-600 hover:text-green-700 font-semibold">
              New request
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-500 mb-1 block">Preferred Date</label>
                <Input type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} className="h-11" />
              </div>
              <div>
                <label className="text-xs font-semibold text-stone-500 mb-1 block">Preferred Time</label>
                <Input type="time" value={requestTime} onChange={(e) => setRequestTime(e.target.value)} className="h-11" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-stone-500 mb-1 block">Notes (optional)</label>
              <Input placeholder="Any special requests or constraints..." value={requestNotes} onChange={(e) => setRequestNotes(e.target.value)} className="h-11" />
            </div>
            <Button
              onClick={submitRequest}
              disabled={!requestDate || requesting}
              className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold"
            >
              {requesting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4" /> Submit Request</>}
            </Button>
            <p className="text-xs text-stone-400 text-center">Your request syncs with our team's calendar. We'll confirm within 24 hours.</p>
          </div>
        )}
      </div>

      {/* Call button */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-center gap-3">
        <Phone className="h-5 w-5 text-amber-600" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-stone-900">Need to talk to us?</div>
          <div className="text-xs text-stone-600">Call our team for immediate scheduling help</div>
        </div>
        <a href="tel:18334843799" className="px-4 py-2 rounded-lg bg-amber-500 text-stone-950 text-sm font-bold hover:bg-amber-400">
          1-833-484-3799
        </a>
      </div>
    </div>
  );
}