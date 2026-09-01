import React from "react";
import { AppShell } from "@/components/layout/AppShell";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell careRecipientName="Mom" workspaceName="Family Workspace">
      {children}
    </AppShell>
  );
}
