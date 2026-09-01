import React from "react";
import { Heart } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white shadow">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-content">
            Family Care Command Center
          </h1>
          <p className="text-sm text-content-muted">
            A calm, private place to coordinate care for your loved one.
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-lg border border-border bg-surface p-6 sm:p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
