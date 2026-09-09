import React from "react";
import { Link } from "react-router-dom";

export const XTREME_AI_ICON_URL =
  "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/28db91966_LOGO.png";

export const LOGO_URL =
  "https://media.base44.com/images/public/6a77f4491f0bf92de9a3ed8b/20999222a_Logo_XPS_Color_12-20-24.webp";

// Brand logo — the Xtreme Polishing Systems crest emblem.
// The image has a black background, so it reads as a badge on light headers
// and blends seamlessly on dark headers.
export default function Logo({ colorClass = "text-white", className = "", size = "md" }) {
  const imgSize = size === "xl" ? "h-12 w-12" : "h-9 w-9";
  const textSize = size === "xl" ? "text-lg" : "text-sm";
  return (
    <Link
      to="/"
      aria-label="Epoxy Garage Floor Estimate — home"
      className={`inline-flex items-center gap-3 shrink-0 ${colorClass} ${className}`}
    >
      <img
        src={LOGO_URL}
        alt="Xtreme Polishing Systems"
        className={`${imgSize} object-contain`}
      />
      <span className={`hidden sm:inline font-display font-bold tracking-tight ${textSize}`}>
        Epoxy Garage Floors
      </span>
    </Link>
  );
}