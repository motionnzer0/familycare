import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { CareProfileView } from "@/components/care/CareProfileView";

export default async function CareProfilePage() {
  const context = await getActiveWorkspaceContext();

  if (!context) {
    return null;
  }

  return (
    <CareProfileView
      workspace={context.workspace}
      careRecipient={context.careRecipient}
      userRole={context.userRole}
    />
  );
}
