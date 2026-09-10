import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CodeStudio ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="text-red-500 text-lg font-bold mb-2">Something went wrong</div>
          <div className="text-sm text-stone-500 mb-4">{this.state.error?.message || "Unknown error"}</div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg bg-stone-900 text-white text-sm font-bold hover:bg-amber-500 hover:text-stone-950 transition"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}