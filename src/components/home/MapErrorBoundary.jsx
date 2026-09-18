import React from "react";

// Wraps the Leaflet map so a NaN LatLng or initialization race degrades
// gracefully (shows the side panel + a fallback message) instead of
// crashing the entire page via the root ErrorBoundary.
export default class MapErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err) {
    console.warn("[MapErrorBoundary] Leaflet map crashed:", err?.message || err);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-[380px] md:h-[460px] relative bg-stone-100 flex items-center justify-center text-center px-6">
          <div>
            <p className="text-sm font-semibold text-stone-700">Map unavailable</p>
            <p className="text-xs text-stone-500 mt-1">Use the ZIP search below to find your nearest store.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}