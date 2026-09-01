import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { getEmergencyData } from "@/lib/actions/emergency";
import { EmergencyView } from "@/components/emergency/EmergencyView";

export default async function EmergencyPage() {
  const context = await getActiveWorkspaceContext();

  if (!context) {
    return null;
  }

  const { info, contacts } = await getEmergencyData(context.workspace.id);

  return (
    <EmergencyView
      info={info}
      contacts={contacts}
      userRole={context.userRole}
      careRecipientName={context.careRecipient?.preferred_name || "Mom"}
      timezone={context.workspace.timezone}
    />
  );
}
