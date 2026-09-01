"use client";

import React, { useState } from "react";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { Appointment, Task, Role } from "@/lib/types";
import { AppointmentItem } from "./AppointmentItem";
import { AppointmentFormModal } from "./AppointmentFormModal";
import { Button } from "@/components/ui/button";

interface AppointmentListProps {
  initialAppointments: Appointment[];
  tasks?: Task[];
  userRole: Role;
  timezone?: string;
}

export function AppointmentList({
  initialAppointments,
  tasks = [],
  userRole,
  timezone = "America/New_York",
}: AppointmentListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");

  const todayStr = new Date().toISOString().split("T")[0];

  const upcoming = initialAppointments.filter((a) => a.date >= todayStr && a.status !== "cancelled");
  const past = initialAppointments.filter((a) => a.date < todayStr || a.status === "completed");

  const displayedList =
    filter === "upcoming"
      ? upcoming
      : filter === "past"
      ? past
      : initialAppointments;

  const handleCreate = () => {
    setSelectedAppt(null);
    setModalOpen(true);
  };

  const handleEdit = (appt: Appointment) => {
    setSelectedAppt(appt);
    setModalOpen(true);
  };

  const canManage = userRole === "owner" || userRole === "coordinator";

  return (
    <div className="space-y-6 max-w-reading">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
            Calendar
          </h1>
          <p className="text-base text-content-muted mt-0.5">
            Scheduled appointments, doctor visits, and care events.
          </p>
        </div>

        {canManage && (
          <Button
            variant="primary"
            onClick={handleCreate}
            className="flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Schedule Appointment</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-border pb-2 text-sm font-medium">
        <button
          onClick={() => setFilter("upcoming")}
          className={`px-3 py-1.5 rounded transition-colors ${
            filter === "upcoming"
              ? "bg-slate-900 text-white font-semibold"
              : "text-content-muted hover:text-content"
          }`}
        >
          Upcoming ({upcoming.length})
        </button>
        <button
          onClick={() => setFilter("past")}
          className={`px-3 py-1.5 rounded transition-colors ${
            filter === "past"
              ? "bg-slate-900 text-white font-semibold"
              : "text-content-muted hover:text-content"
          }`}
        >
          Past &amp; Completed ({past.length})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded transition-colors ${
            filter === "all"
              ? "bg-slate-900 text-white font-semibold"
              : "text-content-muted hover:text-content"
          }`}
        >
          All ({initialAppointments.length})
        </button>
      </div>

      {/* Appointment Cards */}
      <div className="space-y-3">
        {displayedList.map((appt) => (
          <AppointmentItem
            key={appt.id}
            appointment={appt}
            userRole={userRole}
            timezone={timezone}
            onEdit={handleEdit}
          />
        ))}

        {displayedList.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center space-y-3 bg-surface-subtle">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-slate-200 text-content-muted">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-content">No appointments found</p>
              <p className="text-sm text-content-muted">
                {filter === "upcoming"
                  ? "No upcoming appointments scheduled."
                  : "No past appointments recorded."}
              </p>
            </div>
            {canManage && (
              <Button variant="secondary" size="sm" onClick={handleCreate}>
                Schedule an appointment
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <AppointmentFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        appointment={selectedAppt}
        tasks={tasks}
      />
    </div>
  );
}
