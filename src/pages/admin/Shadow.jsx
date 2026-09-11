import React from "react";
import { EyeOff } from "lucide-react";
import ShadowChat from "@/components/shadow/ShadowChat";
import ShadowCloudBrowser from "@/components/shadow/ShadowCloudBrowser";
import ShadowCodex from "@/components/shadow/ShadowCodex";

export default function Shadow() {
  return (
    <div className="space-y-6">
      {/* Identity Header */}
      <div className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-stone-500 flex items-center gap-2">
          <EyeOff className="h-3.5 w-3.5" /> Covert Channel · Owner Only
        </p>
        <h1 className="mt-3 text-3xl font-bold text-stone-900 tracking-tight">Shadow.</h1>
        <p className="mt-2 text-sm text-stone-500">
          Unrestricted access to every entity and function. Invisible to all other users. No trace left on shared feeds.
          Chat routes through the Vercel AI Gateway — works even with Base44 credits exhausted.
        </p>
      </div>

      {/* Chat — powered by vercelAiGateway (bypasses Base44 credits) */}
      <ShadowChat />

      {/* Cloud Browser — traceless web access */}
      <ShadowCloudBrowser />

      {/* Codex — full capability transparency */}
      <ShadowCodex />
    </div>
  );
}