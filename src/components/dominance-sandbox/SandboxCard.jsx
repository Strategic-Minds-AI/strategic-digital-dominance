import React from "react";

export default function SandboxCard({ title, subtitle, icon: Icon, action, children, noPadding = false, className = "" }) {
  return (
    <div className={`ds-card ${className}`}>
      {(title || Icon || action) && (
        <div className="ds-card-header">
          {Icon && <Icon className="h-4 w-4 text-amber-600 shrink-0" />}
          <div className="flex-1 min-w-0">
            {title && <h3 className="ds-section-title text-stone-900 truncate">{title}</h3>}
            {subtitle && <p className="text-xs text-stone-500 mt-0.5 truncate">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-4"}>{children}</div>
    </div>
  );
}

export function StatusBadge({ status, label }) {
  const styles = {
    passed: { bg: "#F0FDF4", color: "#16A34A", dot: "#16A34A" },
    failed: { bg: "#FEF2F2", color: "#DC2626", dot: "#DC2626" },
    running: { bg: "#FFFBEB", color: "#D97706", dot: "#F59E0B" },
    pending: { bg: "#F4F4F5", color: "#71717A", dot: "#A1A1AA" },
    skipped: { bg: "#FEF2F2", color: "#DC2626", dot: "#DC2626" },
  };
  const s = styles[status] || styles.pending;
  return (
    <span className="ds-badge" style={{ background: s.bg, color: s.color }}>
      <span className="ds-pulse-dot" style={{ background: s.dot }} />
      {label}
    </span>
  );
}

export function MetricLine({ label, value, accent }) {
  return (
    <div className="flex items-baseline justify-between py-1.5 border-b border-stone-100 last:border-0">
      <span className="ds-label text-stone-500">{label}</span>
      <span className="ds-font-mono text-sm font-semibold" style={{ color: accent || "#09090B" }}>{value}</span>
    </div>
  );
}