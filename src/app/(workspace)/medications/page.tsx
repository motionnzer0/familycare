import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { getWorkspaceMedications } from "@/lib/actions/medications";
import { MedicationList } from "@/components/medications/MedicationList";

export default async function MedicationsPage() {
  const context = await getActiveWorkspaceContext();

  if (!context) {
    return null;
  }

  const medications = await getWorkspaceMedications(context.workspace.id);

  return (
    <MedicationList
      initialMedications={medications}
      userRole={context.userRole}
      careRecipientName={context.careRecipient?.preferred_name || "Mom"}
    />
  );
}
