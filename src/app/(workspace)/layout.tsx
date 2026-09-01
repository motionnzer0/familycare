import React from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { getCurrentUser } from "@/lib/actions/auth";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If user is not logged in, redirect to login
  if (!user) {
    redirect("/login");
  }

  // Get active workspace context
  const context = await getActiveWorkspaceContext();

  // If user has no workspace yet, send to onboarding
  if (!context) {
    redirect("/onboarding");
  }

  const careRecipientName = context.careRecipient?.preferred_name || "Mom";
  const workspaceName = context.workspace?.name || "Care Workspace";

  return (
    <AppShell
      careRecipientName={careRecipientName}
      workspaceName={workspaceName}
    >
      {children}
    </AppShell>
  );
}
