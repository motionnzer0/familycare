import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { getWorkspaceAppointments } from "@/lib/actions/appointments";
import { getWorkspaceTasks } from "@/lib/actions/tasks";
import { AppointmentList } from "@/components/calendar/AppointmentList";

export default async function CalendarPage() {
  const context = await getActiveWorkspaceContext();

  if (!context) {
    return null;
  }

  const [appointments, { tasks }] = await Promise.all([
    getWorkspaceAppointments(context.workspace.id),
    getWorkspaceTasks(context.workspace.id),
  ]);

  return (
    <AppointmentList
      initialAppointments={appointments}
      tasks={tasks}
      userRole={context.userRole}
      timezone={context.workspace.timezone}
    />
  );
}
