import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { getWorkspaceDocuments } from "@/lib/actions/documents";
import { getCurrentUser } from "@/lib/actions/auth";
import { DocumentList } from "@/components/documents/DocumentList";

export default async function DocumentsPage() {
  const context = await getActiveWorkspaceContext();
  const user = await getCurrentUser();

  if (!context || !user) {
    return null;
  }

  const documents = await getWorkspaceDocuments(context.workspace.id);

  return (
    <DocumentList
      initialDocuments={documents}
      userRole={context.userRole}
      currentUserId={user.id}
      careRecipientName={context.careRecipient?.preferred_name || "Mom"}
      timezone={context.workspace.timezone}
    />
  );
}
