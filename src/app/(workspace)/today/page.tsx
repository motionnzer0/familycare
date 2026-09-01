import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { getDashboardData } from "@/lib/actions/dashboard";
import { TodayDashboard } from "@/components/dashboard/TodayDashboard";

export default async function TodayPage() {
  const context = await getActiveWorkspaceContext();

  if (!context) {
    return null;
  }

  const dashboardData = await getDashboardData(
    context.workspace.id,
    context.workspace.timezone,
    context.careRecipient?.preferred_name || "Mom",
    context.workspace.name,
    context.userRole
  );

  return (
    <TodayDashboard
      data={dashboardData}
      timezone={context.workspace.timezone}
    />
  );
}
