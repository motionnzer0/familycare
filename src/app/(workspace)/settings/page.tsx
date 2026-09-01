import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { getCurrentUser } from "@/lib/actions/auth";
import { SettingsView } from "@/components/settings/SettingsView";

export default async function SettingsPage() {
  const context = await getActiveWorkspaceContext();
  const user = await getCurrentUser();

  if (!context || !user) {
    return null;
  }

  return (
    <SettingsView
      workspace={context.workspace}
      careRecipient={context.careRecipient}
      userRole={context.userRole}
      userEmail={user.email || ""}
    />
  );
}
