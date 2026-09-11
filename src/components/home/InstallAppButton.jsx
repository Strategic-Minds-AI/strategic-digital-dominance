import React, { useState, useEffect } from "react";
import { Download, Smartphone, X, Share } from "lucide-react";
import { usePwaInstall } from "@/lib/usePwaInstall";

export default function InstallAppButton({ variant = "light", compact = false, label = "Download the App and Save" }) {
  const { canInstall, isInstalled, promptInstall } = usePwaInstall();
  const [showInstructions, setShowInstructions] = useState(false);
  const [platform, setPlatform] = useState("other");

  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/.test(ua);
    const isMac = /Macintosh|MacIntel/.test(ua);
    const isWin = /Windows/.test(ua);
    const isChrome = /Chrome/.test(ua) && !/Edg|OPR/.test(ua);
    const isEdge = /Edg/.test(ua);
    const isFirefox = /Firefox/.test(ua);
    const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);

    if (isIOS) setPlatform("ios");
    else if (isAndroid) setPlatform("android");
    else if (isMac && isSafari) setPlatform("mac-safari");
    else if (isMac && isChrome) setPlatform("mac-chrome");
    else if (isWin && (isChrome || isEdge)) setPlatform("win-chrome");
    else if (isFirefox) setPlatform("firefox");
    else setPlatform("other");
  }, []);

  if (isInstalled) return null;

  const handleInstall = async () => {
    if (canInstall) {
      await promptInstall();
    } else {
      setShowInstructions(true);
    }
  };

  const buttonClass = compact
    ? "w-full h-9 rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-extrabold"
    : `inline-flex h-12 px-6 w-full items-center justify-center gap-2 rounded-xl font-bold transition animate-pop-bounce ${
        variant === "dark"
          ? "bg-amber-500 hover:bg-amber-400 text-stone-950"
          : "bg-amber-500 hover:bg-amber-400 text-stone-950"
      }`;

  const compactStyle = compact
    ? { background: "linear-gradient(180deg, #FFF6D5 0%, #D4AF37 45%, #8B6914 100%)", border: "2px solid #000", color: "#1a1a1a", boxShadow: "0 4px 12px rgba(212,175,55,.4), inset 0 1px rgba(255,255,255,.4)" }
    : {};

  const renderInstructions = () => {
    const steps = {
      ios: [
        { icon: Share, text: "Tap the Share button at the bottom of Safari" },
        { icon: Smartphone, text: 'Select "Add to Home Screen"' },
        { icon: Download, text: 'Tap "Add" — the app icon appears on your home screen' },
      ],
      android: [
        { icon: Smartphone, text: 'Tap the 3-dot menu in Chrome (top right)' },
        { icon: Download, text: 'Select "Add to Home screen" or "Install app"' },
        { icon: Smartphone, text: 'Tap "Add" — the app installs to your phone' },
      ],
      "mac-safari": [
        { icon: Share, text: "Click the Share button in the toolbar" },
        { icon: Download, text: 'Choose "Add to Dock"' },
        { icon: Smartphone, text: "The app opens in its own window from the Dock" },
      ],
      "mac-chrome": [
        { icon: Download, text: 'Click the install icon in the address bar (right side)' },
        { icon: Smartphone, text: 'Click "Install" in the dialog' },
        { icon: Smartphone, text: "The app opens in its own window" },
      ],
      "win-chrome": [
        { icon: Download, text: 'Click the install icon in the address bar (right side)' },
        { icon: Smartphone, text: 'Click "Install" in the dialog' },
        { icon: Smartphone, text: "The app opens in its own window" },
      ],
      firefox: [
        { icon: Download, text: "Firefox doesn't support one-click install yet" },
        { icon: Smartphone, text: 'Use Chrome or Edge for the best app experience' },
      ],
      other: [
        { icon: Download, text: 'Look for an install icon in your browser\'s address bar or menu' },
        { icon: Smartphone, text: 'Or open this site in Chrome on your phone' },
      ],
    };

    const stepList = steps[platform] || steps.other;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setShowInstructions(false)}>
        <div
          className="bg-stone-950 border-2 border-amber-500 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-amber-500" />
              <h3 className="text-lg font-bold text-white">Install the App</h3>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="text-stone-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-stone-400 mb-5">
            Get the full app experience — it works offline, opens instantly, and looks just like a native app.
          </p>
          <div className="space-y-3">
            {stepList.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <step.icon className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1 pt-1">
                  <span className="text-sm text-stone-200 leading-relaxed">
                    <span className="font-bold text-amber-400 mr-1.5">{i + 1}.</span>
                    {step.text}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowInstructions(false)}
            className="mt-5 w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-sm transition"
          >
            Got it
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <button onClick={handleInstall} className={buttonClass} style={compactStyle}>
        <Download className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} />
        {label}
      </button>
      {showInstructions && renderInstructions()}
    </>
  );
}