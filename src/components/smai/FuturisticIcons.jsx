import React from "react";

// Shared gradient definition
const Grad = ({ id }) => (
  <defs>
    <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#00E5FF" />
      <stop offset="50%" stopColor="#2196F3" />
      <stop offset="100%" stopColor="#0040CC" />
    </linearGradient>
    <filter id={`glow-${id}`}>
      <feGaussianBlur stdDeviation="1.5" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  </defs>
);

const W = ({ children, id }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full">
    <Grad id={id} />
    <g filter={`url(#glow-${id})`}>{children}</g>
  </svg>
);

export const ICONS = [
  { name: "Brain Circuit", render: (id) => (
    <W id={id}>
      <path d="M30 40 Q30 25 45 25 Q55 25 55 35 Q65 35 65 45 Q65 55 55 55 L55 65 Q55 75 45 75 Q35 75 35 65 L35 55 Q25 55 25 45 Q25 40 30 40" fill="none" stroke={`url(#${id})`} strokeWidth="2" />
      <circle cx="40" cy="35" r="2" fill={`url(#${id})`} /><circle cx="50" cy="40" r="2" fill={`url(#${id})`} /><circle cx="45" cy="50" r="2" fill={`url(#${id})`} /><circle cx="40" cy="60" r="2" fill={`url(#${id})`} />
      <line x1="40" y1="35" x2="50" y2="40" stroke={`url(#${id})`} strokeWidth="1" /><line x1="50" y1="40" x2="45" y2="50" stroke={`url(#${id})`} strokeWidth="1" /><line x1="45" y1="50" x2="40" y2="60" stroke={`url(#${id})`} strokeWidth="1" />
    </W>
  )},
  { name: "Neural Mesh", render: (id) => (
    <W id={id}>
      {[[25,25],[75,25],[50,50],[25,75],[75,75],[50,15],[15,50],[85,50]].map((p,i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={`url(#${id})`} />)}
      <g stroke={`url(#${id})`} strokeWidth="1" opacity="0.6">
        <line x1="25" y1="25" x2="50" y2="50" /><line x1="75" y1="25" x2="50" y2="50" /><line x1="25" y1="75" x2="50" y2="50" /><line x1="75" y1="75" x2="50" y2="50" /><line x1="50" y1="15" x2="50" y2="50" /><line x1="15" y1="50" x2="50" y2="50" /><line x1="85" y1="50" x2="50" y2="50" /><line x1="25" y1="25" x2="75" y2="25" /><line x1="25" y1="75" x2="75" y2="75" />
      </g>
    </W>
  )},
  { name: "Hex Chip", render: (id) => (
    <W id={id}>
      <polygon points="50,15 80,32 80,68 50,85 20,68 20,32" fill="none" stroke={`url(#${id})`} strokeWidth="2" />
      <polygon points="50,30 65,40 65,60 50,70 35,60 35,40" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" />
      <circle cx="50" cy="50" r="4" fill={`url(#${id})`} />
      <g stroke={`url(#${id})`} strokeWidth="1"><line x1="50" y1="15" x2="50" y2="30" /><line x1="80" y1="32" x2="65" y2="40" /><line x1="80" y1="68" x2="65" y2="60" /><line x1="50" y1="85" x2="50" y2="70" /><line x1="20" y1="68" x2="35" y2="60" /><line x1="20" y1="32" x2="35" y2="40" /></g>
    </W>
  )},
  { name: "Quantum Orbit", render: (id) => (
    <W id={id}>
      <circle cx="50" cy="50" r="6" fill={`url(#${id})`} />
      <ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" /><ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" transform="rotate(60 50 50)" /><ellipse cx="50" cy="50" rx="35" ry="15" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" transform="rotate(120 50 50)" />
      <circle cx="85" cy="50" r="2.5" fill={`url(#${id})`} /><circle cx="35" cy="22" r="2.5" fill={`url(#${id})`} /><circle cx="35" cy="78" r="2.5" fill={`url(#${id})`} />
    </W>
  )},
  { name: "Data Prism", render: (id) => (
    <W id={id}>
      <polygon points="50,15 85,80 15,80" fill="none" stroke={`url(#${id})`} strokeWidth="2" />
      <line x1="50" y1="15" x2="50" y2="80" stroke={`url(#${id})`} strokeWidth="1" /><line x1="15" y1="80" x2="85" y2="80" stroke={`url(#${id})`} strokeWidth="1" /><line x1="32" y1="47" x2="68" y2="47" stroke={`url(#${id})`} strokeWidth="1" />
      <circle cx="50" cy="15" r="3" fill={`url(#${id})`} /><circle cx="32" cy="47" r="2" fill={`url(#${id})`} /><circle cx="68" cy="47" r="2" fill={`url(#${id})`} /><circle cx="50" cy="80" r="3" fill={`url(#${id})`} />
    </W>
  )},
  { name: "AI Eye", render: (id) => (
    <W id={id}>
      <path d="M15 50 Q50 20 85 50 Q50 80 15 50" fill="none" stroke={`url(#${id})`} strokeWidth="2" />
      <circle cx="50" cy="50" r="15" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" /><circle cx="50" cy="50" r="6" fill={`url(#${id})`} />
      <g stroke={`url(#${id})`} strokeWidth="1"><line x1="50" y1="35" x2="50" y2="28" /><line x1="65" y1="50" x2="72" y2="50" /><line x1="50" y1="65" x2="50" y2="72" /><line x1="35" y1="50" x2="28" y2="50" /></g>
    </W>
  )},
  { name: "Circuit Tree", render: (id) => (
    <W id={id}>
      <line x1="50" y1="85" x2="50" y2="50" stroke={`url(#${id})`} strokeWidth="2" /><line x1="50" y1="50" x2="30" y2="30" stroke={`url(#${id})`} strokeWidth="1.5" /><line x1="50" y1="50" x2="70" y2="30" stroke={`url(#${id})`} strokeWidth="1.5" /><line x1="30" y1="30" x2="20" y2="20" stroke={`url(#${id})`} strokeWidth="1" /><line x1="30" y1="30" x2="40" y2="18" stroke={`url(#${id})`} strokeWidth="1" /><line x1="70" y1="30" x2="60" y2="18" stroke={`url(#${id})`} strokeWidth="1" /><line x1="70" y1="30" x2="80" y2="20" stroke={`url(#${id})`} strokeWidth="1" />
      <circle cx="50" cy="85" r="3" fill={`url(#${id})`} /><circle cx="50" cy="50" r="3" fill={`url(#${id})`} /><circle cx="30" cy="30" r="2.5" fill={`url(#${id})`} /><circle cx="70" cy="30" r="2.5" fill={`url(#${id})`} /><circle cx="20" cy="20" r="2" fill={`url(#${id})`} /><circle cx="40" cy="18" r="2" fill={`url(#${id})`} /><circle cx="60" cy="18" r="2" fill={`url(#${id})`} /><circle cx="80" cy="20" r="2" fill={`url(#${id})`} />
    </W>
  )},
  { name: "Neural Spiral", render: (id) => (
    <W id={id}>
      <path d="M50 50 Q50 45 55 45 Q60 45 60 50 Q60 58 52 58 Q42 58 42 48 Q42 35 55 35 Q70 35 70 50 Q70 68 50 68 Q28 68 28 48 Q28 22 55 22" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" />
      <circle cx="50" cy="50" r="2" fill={`url(#${id})`} /><circle cx="55" cy="45" r="2" fill={`url(#${id})`} /><circle cx="52" cy="58" r="2" fill={`url(#${id})`} /><circle cx="55" cy="35" r="2" fill={`url(#${id})`} /><circle cx="50" cy="68" r="2" fill={`url(#${id})`} /><circle cx="55" cy="22" r="2" fill={`url(#${id})`} />
    </W>
  )},
  { name: "Pulse Wave", render: (id) => (
    <W id={id}>
      <path d="M10 50 L25 50 L30 30 L40 70 L50 20 L60 80 L70 40 L75 50 L90 50" fill="none" stroke={`url(#${id})`} strokeWidth="2" />
      <circle cx="30" cy="30" r="2.5" fill={`url(#${id})`} /><circle cx="50" cy="20" r="2.5" fill={`url(#${id})`} /><circle cx="70" cy="40" r="2.5" fill={`url(#${id})`} /><circle cx="10" cy="50" r="2" fill={`url(#${id})`} /><circle cx="90" cy="50" r="2" fill={`url(#${id})`} />
    </W>
  )},
  { name: "Data Stream", render: (id) => (
    <W id={id}>
      <g stroke={`url(#${id})`} strokeWidth="1.5" fill="none">
        <path d="M10 25 Q30 20 50 25 T90 25" /><path d="M10 50 Q30 45 50 50 T90 50" /><path d="M10 75 Q30 70 50 75 T90 75" />
      </g>
      <rect x="20" y="22" width="6" height="6" fill={`url(#${id})`} /><rect x="55" y="47" width="6" height="6" fill={`url(#${id})`} /><rect x="75" y="72" width="6" height="6" fill={`url(#${id})`} />
    </W>
  )},
  { name: "AI Atom", render: (id) => (
    <W id={id}>
      <circle cx="50" cy="50" r="5" fill={`url(#${id})`} />
      <ellipse cx="50" cy="50" rx="30" ry="12" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" /><ellipse cx="50" cy="50" rx="30" ry="12" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" transform="rotate(60 50 50)" /><ellipse cx="50" cy="50" rx="30" ry="12" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" transform="rotate(-60 50 50)" />
      <circle cx="80" cy="50" r="2.5" fill={`url(#${id})`} /><circle cx="35" cy="24" r="2.5" fill={`url(#${id})`} /><circle cx="35" cy="76" r="2.5" fill={`url(#${id})`} />
    </W>
  )},
  { name: "Hex Grid", render: (id) => (
    <W id={id}>
      <g fill="none" stroke={`url(#${id})`} strokeWidth="1.5">
        <polygon points="50,15 65,24 65,41 50,50 35,41 35,24" /><polygon points="20,32 35,41 35,58 20,67 5,58 5,41" /><polygon points="80,32 95,41 95,58 80,67 65,58 65,41" /><polygon points="50,50 65,58 65,75 50,85 35,75 35,58" />
      </g>
      <circle cx="50" cy="32" r="2" fill={`url(#${id})`} /><circle cx="50" cy="67" r="2" fill={`url(#${id})`} />
    </W>
  )},
  { name: "Neural Web", render: (id) => (
    <W id={id}>
      <g stroke={`url(#${id})`} strokeWidth="1" opacity="0.5" fill="none">
        <path d="M50 15 L85 35 L85 65 L50 85 L15 65 L15 35 Z" /><path d="M50 15 L50 85" /><path d="M15 35 L85 65" /><path d="M85 35 L15 65" />
      </g>
      <circle cx="50" cy="15" r="3" fill={`url(#${id})`} /><circle cx="85" cy="35" r="3" fill={`url(#${id})`} /><circle cx="85" cy="65" r="3" fill={`url(#${id})`} /><circle cx="50" cy="85" r="3" fill={`url(#${id})`} /><circle cx="15" cy="65" r="3" fill={`url(#${id})`} /><circle cx="15" cy="35" r="3" fill={`url(#${id})`} /><circle cx="50" cy="50" r="4" fill={`url(#${id})`} />
    </W>
  )},
  { name: "Electric Diamond", render: (id) => (
    <W id={id}>
      <polygon points="50,12 75,40 50,88 25,40" fill="none" stroke={`url(#${id})`} strokeWidth="2" />
      <polygon points="50,25 65,40 50,65 35,40" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" />
      <line x1="25" y1="40" x2="75" y2="40" stroke={`url(#${id})`} strokeWidth="1" />
      <circle cx="50" cy="12" r="2.5" fill={`url(#${id})`} /><circle cx="50" cy="88" r="2.5" fill={`url(#${id})`} /><circle cx="50" cy="40" r="3" fill={`url(#${id})`} />
    </W>
  )},
  { name: "Orbit Rings", render: (id) => (
    <W id={id}>
      <circle cx="50" cy="50" r="8" fill={`url(#${id})`} />
      <circle cx="50" cy="50" r="20" fill="none" stroke={`url(#${id})`} strokeWidth="1.5" /><circle cx="50" cy="50" r="32" fill="none" stroke={`url(#${id})`} strokeWidth="1" opacity="0.6" /><circle cx="50" cy="50" r="42" fill="none" stroke={`url(#${id})`} strokeWidth="1" opacity="0.3" />
      <circle cx="70" cy="50" r="2.5" fill={`url(#${id})`} /><circle cx="50" cy="18" r="2.5" fill={`url(#${id})`} /><circle cx="18" cy="50" r="2" fill={`url(#${id})`} />
    </W>
  )},
  { name: "Data Crystal", render: (id) => (
    <W id={id}>
      <g fill="none" stroke={`url(#${id})`} strokeWidth="1.5">
        <polygon points="50,12 72,30 72,60 50,78 28,60 28,30" /><line x1="50" y1="12" x2="50" y2="78" /><line x1="28" y1="30" x2="72" y2="60" /><line x1="72" y1="30" x2="28" y2="60" /><line x1="28" y1="30" x2="50" y2="78" /><line x1="72" y1="30" x2="50" y2="78" /><line x1="50" y1="12" x2="28" y2="60" /><line x1="50" y1="12" x2="72" y2="60" />
      </g>
      <circle cx="50" cy="45" r="2" fill={`url(#${id})`} />
    </W>
  )},
  { name: "Circuit Mandala", render: (id) => (
    <W id={id}>
      <g fill="none" stroke={`url(#${id})`} strokeWidth="1.2">
        {[0,45,90,135,180,225,270,315].map(a => <g key={a} transform={`rotate(${a} 50 50)`}><line x1="50" y1="50" x2="50" y2="15" /><circle cx="50" cy="15" r="2" /><line x1="50" y1="25" x2="42" y2="20" /><line x1="50" y1="25" x2="58" y2="20" /></g>)}
      </g>
      <circle cx="50" cy="50" r="6" fill={`url(#${id})`} /><circle cx="50" cy="50" r="12" fill="none" stroke={`url(#${id})`} strokeWidth="1" />
    </W>
  )},
  { name: "Neural Star", render: (id) => (
    <W id={id}>
      <polygon points="50,12 58,38 85,38 63,55 72,82 50,66 28,82 37,55 15,38 42,38" fill="none" stroke={`url(#${id})`} strokeWidth="2" />
      <circle cx="50" cy="50" r="5" fill={`url(#${id})`} />
      <g stroke={`url(#${id})`} strokeWidth="1" opacity="0.5"><line x1="50" y1="50" x2="50" y2="12" /><line x1="50" y1="50" x2="85" y2="38" /><line x1="50" y1="50" x2="72" y2="82" /><line x1="50" y1="50" x2="28" y2="82" /><line x1="50" y1="50" x2="15" y2="38" /></g>
    </W>
  )},
  { name: "Vortex", render: (id) => (
    <W id={id}>
      <g fill="none" stroke={`url(#${id})`} strokeWidth="1.5">
        <path d="M50 50 Q50 40 60 40 Q72 40 72 52 Q72 68 55 68 Q35 68 35 48 Q35 22 60 22 Q88 22 88 50" />
        <path d="M50 50 Q50 55 45 55 Q38 55 38 48 Q38 42 46 42 Q54 42 54 50" />
      </g>
      <circle cx="50" cy="50" r="2.5" fill={`url(#${id})`} /><circle cx="72" cy="52" r="2" fill={`url(#${id})`} /><circle cx="60" cy="22" r="2" fill={`url(#${id})`} /><circle cx="88" cy="50" r="2" fill={`url(#${id})`} />
    </W>
  )},
  { name: "Genesis Seed", render: (id) => (
    <W id={id}>
      <path d="M50 20 Q35 35 35 55 Q35 75 50 80 Q65 75 65 55 Q65 35 50 20" fill="none" stroke={`url(#${id})`} strokeWidth="2" />
      <line x1="50" y1="80" x2="50" y2="95" stroke={`url(#${id})`} strokeWidth="1.5" /><line x1="50" y1="85" x2="35" y2="92" stroke={`url(#${id})`} strokeWidth="1" /><line x1="50" y1="85" x2="65" y2="92" stroke={`url(#${id})`} strokeWidth="1" />
      <circle cx="50" cy="50" r="4" fill={`url(#${id})`} /><circle cx="42" cy="40" r="1.5" fill={`url(#${id})`} /><circle cx="58" cy="60" r="1.5" fill={`url(#${id})`} /><circle cx="50" cy="30" r="1.5" fill={`url(#${id})`} />
    </W>
  )},
];

export default ICONS;