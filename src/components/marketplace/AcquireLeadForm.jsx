import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function AcquireLeadForm() {
  const [form, setForm] = useState({
    first_name: "",
    email: "",
    phone: "",
    budget: "",
    interest: "inventory",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.first_name || !form.email || !form.phone) {
      setError("Please fill in your name, email, and phone.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await base44.entities.Lead.create({
        first_name: form.first_name,
        email: form.email,
        phone: form.phone,
        lead_source: "acquire_marketplace",
        lead_type: "b2b",
        notes: `Budget: ${form.budget || "Not specified"} | Interest: ${form.interest === "inventory" ? "Buy from inventory" : "Done for me"} | ${form.notes || ""}`,
        status: "NEW ESTIMATE",
      });
      setSubmitted(true);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-stone-900 border border-amber-500/30 rounded-2xl p-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Request Received</h3>
        <p className="text-stone-400 text-sm">We'll reach out within 24 hours to discuss your acquisition goals.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1.5 block">Your Name</label>
          <input
            value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className="w-full px-4 py-3 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
            placeholder="John Smith"
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1.5 block">Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-3 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1.5 block">Email</label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
          placeholder="john@investments.com"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1.5 block">Budget Range</label>
          <select
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
            className="w-full px-4 py-3 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
          >
            <option value="">Select budget</option>
            <option value="$5K-$15K">$5K - $15K</option>
            <option value="$15K-$50K">$15K - $50K</option>
            <option value="$50K-$150K">$50K - $150K</option>
            <option value="$150K+">$150K+</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1.5 block">I'm interested in</label>
          <select
            value={form.interest}
            onChange={(e) => setForm({ ...form, interest: e.target.value })}
            className="w-full px-4 py-3 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:border-amber-500 outline-none"
          >
            <option value="inventory">Buy from existing inventory</option>
            <option value="done_for_you">Done-for-me (custom build)</option>
            <option value="both">Both options</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-bold uppercase tracking-wide text-stone-400 mb-1.5 block">Tell us what you're looking for (optional)</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 bg-stone-950 border border-stone-700 rounded-xl text-white text-sm focus:border-amber-500 outline-none resize-none"
          placeholder="Trade industry, city, timeline..."
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm hover:filter hover:brightness-110 transition disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Submit Inquiry"}
      </button>
    </form>
  );
}