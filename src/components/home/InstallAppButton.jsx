import React, { useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { usePwaInstall } from "@/lib/usePwaInstall";

export default function InstallAppButton({ variant = "light" }) {
  const { canInstall, isInstalled, promptInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  // If the browser doesn't support beforeinstallprompt (iOS Safari), show a
  // hint button that tells the user how to add it manually
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  if (!canInstall && !isIOS) return null;

  const handleInstall = async () => {
    if (canInstall) {
      await promptInstall();
    }
  };

  const dark = variant === "dark";

  if (isIOS && !canInstall) {
    return (
      <button
        onClick={() => setDismissed(true)}
        className={`inline-flex h-12 px-6 items-center justify-center gap-2 rounded-xl font-bold transition ${
          dark
            ? "bg-white/10 text-white hover:bg-white/20 border border-white/20"
            : "bg-stone-900 text-white hover:bg-stone-800"
        }`}
      >
        <Smartphone className="h-5 w-5" />
        Tap Share → Add to Home Screen
      </button>
    );
  }

  return (
    <button
      onClick={handleInstall}
      className={`inline-flex h-12 px-6 items-center justify-center gap-2 rounded-xl font-bold transition animate-pop-bounce ${
        dark
          ? "bg-amber-500 hover:bg-amber-400 text-stone-950"
          : "bg-amber-500 hover:bg-amber-400 text-stone-950"
      }`}
    >
      <Download className="h-5 w-5" />
      Download the App and Save
    </button>
  );
}