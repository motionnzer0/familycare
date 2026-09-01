"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-danger">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div className="space-y-1 max-w-md">
        <h2 className="text-xl font-bold text-content">Something went wrong</h2>
        <p className="text-sm text-content-muted">
          We encountered an unexpected issue. Your data has not been lost. Please try again.
        </p>
      </div>
      <Button variant="primary" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
