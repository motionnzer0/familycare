import React from "react";
import { AppHeader } from "./AppHeader";
import { NavigationRail } from "./NavigationRail";
import { MobileNav } from "./MobileNav";

interface AppShellProps {
  children: React.ReactNode;
  careRecipientName?: string;
  workspaceName?: string;
}

export function AppShell({
  children,
  careRecipientName = "Mom",
  workspaceName = "Family Workspace",
}: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      {/* Top Header Shell */}
      <AppHeader
        careRecipientName={careRecipientName}
        workspaceName={workspaceName}
      />

      {/* Main Area: Navigation + Content */}
      <div className="flex flex-1 w-full max-w-app mx-auto">
        {/* Desktop Navigation Rail */}
        <NavigationRail />

        {/* Primary Page Canvas */}
        <main className="flex-1 px-4 py-6 md:px-8 pb-24 md:pb-12 max-w-app overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav />
    </div>
  );
}
