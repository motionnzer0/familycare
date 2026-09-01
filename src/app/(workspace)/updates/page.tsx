import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { getWorkspaceUpdates } from "@/lib/actions/updates";
import { UpdatesFeed } from "@/components/updates/UpdatesFeed";

export default async function UpdatesPage() {
  const context = await getActiveWorkspaceContext();

  if (!context) {
    return null;
  }

  const updates = await getWorkspaceUpdates(context.workspace.id);

  return (
    <UpdatesFeed
      events={updates}
      careRecipientName={context.careRecipient?.preferred_name || "Mom"}
      timezone={context.workspace.timezone}
    />
  );
}
