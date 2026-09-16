import React from "react";

export default function ArchitectureSection({ id, title, subtitle, children, accent = "#D4AF37" }) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-1.5 h-8 rounded-full shrink-0" style={{ background: accent }} />
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-stone-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}