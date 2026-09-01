import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      <p className="text-sm font-medium text-content-muted">Loading workspace...</p>
    </div>
  );
}
