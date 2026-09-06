"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 bg-muted">
      <div className="max-w-md w-full bg-white rounded-2xl border border-border p-8 text-center shadow-xs">
        <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4 text-2xl">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6">
          We encountered a temporary connection issue. Please try refreshing or return to the homepage.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="bg-brand text-white text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors cursor-pointer shadow-xs"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-border text-foreground text-xs font-semibold px-5 py-2.5 rounded-xl hover:bg-muted transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
