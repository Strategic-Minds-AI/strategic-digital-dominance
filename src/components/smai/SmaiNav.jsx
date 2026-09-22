import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Brain } from "lucide-react";

const LINKS = [
  { to: "/smai", label: "Home" },
  { to: "/smai/services", label: "Services" },
  { to: "/smai/about", label: "About" },
  { to: "/smai/case-studies", label: "Case Studies" },
  { to: "/smai/contact", label: "Contact" },
];

export default function SmaiNav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-stone-950/95 backdrop-blur border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/smai" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg electric-bg flex items-center justify-center shadow-lg shadow-cyan-500/30 electric-glow">
            <Brain className="w-5 h-5 text-stone-950" />
          </div>
          <div className="leading-none">
            <div className="text-[10px] font-bold tracking-[0.18em] text-cyan-400 uppercase">Strategic Minds</div>
            <div className="text-sm font-bold text-white tracking-tight">AI Advisory</div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                pathname === l.to
                  ? "text-cyan-400 bg-cyan-500/10"
                  : "text-stone-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/smai/contact"
            className="ml-2 px-5 py-2 rounded-lg text-sm font-bold electric-bg text-stone-950 hover:opacity-90 transition shadow-lg shadow-cyan-500/20 electric-glow"
          >
            Book a Call
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-stone-300 hover:text-white p-2">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-stone-800 px-6 py-4 space-y-1 bg-stone-950">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                pathname === l.to ? "text-cyan-400 bg-cyan-500/10" : "text-stone-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}