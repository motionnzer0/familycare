"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  careRecipientName?: string;
  workspaceName?: string;
}

export function AppHeader({
  careRecipientName = "Mom",
  workspaceName = "Family Workspace",
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-surface px-4 md:px-6">
      {/* Left: Active Care Recipient and Workspace Context */}
      <div className="flex items-center space-x-3">
        <Link href="/today" className="flex items-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <div>
            <span className="block text-base font-bold text-content leading-tight">
              Care for {careRecipientName}
            </span>
            <span className="block text-xs text-content-subtle leading-tight">
              {workspaceName}
            </span>
          </div>
        </Link>
      </div>

      {/* Right: Emergency Utility & User Menu */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        {/* Persistent Emergency Access (SC 6.7: reachable <= 2 interactions) */}
        <Link href="/emergency">
          <Button
            variant="outline"
            size="sm"
            className="border-red-300 bg-red-50 text-red-800 hover:bg-red-100 hover:text-red-900 font-semibold flex items-center space-x-1.5 min-h-touch px-3"
          >
            <AlertCircle className="h-4 w-4 text-red-700" />
            <span>Emergency</span>
          </Button>
        </Link>

        {/* Settings / Account Link */}
        <Link href="/settings">
          <Button variant="ghost" size="sm" className="text-content-muted hover:text-content">
            Settings
          </Button>
        </Link>
      </div>
    </header>
  );
}
