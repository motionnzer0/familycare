"use client";

import React, { useTransition } from "react";
import { Clock, MapPin, Phone, Calendar as CalendarIcon, Check, X, Trash2 } from "lucide-react";
import { Appointment, Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  updateAppointmentStatusAction,
  deleteAppointmentAction,
} from "@/lib/actions/appointments";
import { formatInWorkspaceTz } from "@/lib/timezone";
import { cn } from "@/lib/utils";

interface AppointmentItemProps {
  appointment: Appointment;
  userRole: Role;
  timezone?: string;
  onEdit?: (appt: Appointment) => void;
}

export function AppointmentItem({
  appointment,
  userRole,
  timezone = "America/New_York",
  onEdit,
}: AppointmentItemProps) {
  const [isPending, startTransition] = useTransition();

  const isCompleted = appointment.status === "completed";
  const isCancelled = appointment.status === "cancelled";

  const handleStatus = (e: React.MouseEvent, status: "completed" | "cancelled" | "scheduled") => {
    e.stopPropagation();
    startTransition(async () => {
      await updateAppointmentStatusAction(appointment.id, status);
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this appointment?")) {
      startTransition(async () => {
        await deleteAppointmentAction(appointment.id);
      });
    }
  };

  const canManage = userRole === "owner" || userRole === "coordinator";

  return (
    <div
      className={cn(
        "group flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border bg-surface p-4 transition-all hover:border-slate-300 hover:shadow-sm gap-3",
        isCompleted && "bg-surface-subtle opacity-80",
        isCancelled && "bg-slate-50 opacity-60 line-through"
      )}
    >
      {/* Left: Time & Main Info */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onEdit && onEdit(appointment)}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base font-bold text-content leading-snug">
            {appointment.title}
          </span>

          {/* Status Badges */}
          {isCompleted && <Badge variant="completed">Completed</Badge>}
          {isCancelled && <Badge variant="cancelled">Cancelled</Badge>}
        </div>

        {/* Date and Time Line */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted mt-2">
          <span className="inline-flex items-center space-x-1 font-semibold text-content">
            <CalendarIcon className="h-3.5 w-3.5 text-brand" />
            <span>{formatInWorkspaceTz(appointment.date, timezone, "EEE, MMM d, yyyy")}</span>
          </span>

          {appointment.start_time ? (
            <span className="inline-flex items-center space-x-1">
              <Clock className="h-3.5 w-3.5 text-content-subtle" />
              <span>
                {appointment.start_time.substring(0, 5)}
                {appointment.end_time && ` - ${appointment.end_time.substring(0, 5)}`}
              </span>
            </span>
          ) : (
            <span className="text-content-subtle italic">Time not set</span>
          )}
        </div>

        {/* Location & Provider Info */}
        {(appointment.location || appointment.provider_contact) && (
          <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted mt-1.5">
            {appointment.location && (
              <span className="inline-flex items-center space-x-1">
                <MapPin className="h-3.5 w-3.5 text-content-subtle shrink-0" />
                <span className="truncate max-w-[200px]">{appointment.location}</span>
              </span>
            )}
            {appointment.provider_contact && (
              <span className="inline-flex items-center space-x-1">
                <Phone className="h-3.5 w-3.5 text-content-subtle shrink-0" />
                <span>{appointment.provider_contact}</span>
              </span>
            )}
          </div>
        )}

        {appointment.details && (
          <p className="text-xs text-content-muted mt-2 line-clamp-2">
            {appointment.details}
          </p>
        )}
      </div>

      {/* Right: Quick Action Controls */}
      {canManage && (
        <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
          {!isCompleted && !isCancelled && (
            <>
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={(e) => handleStatus(e, "completed")}
                className="h-8 px-2.5 text-xs font-semibold text-emerald-800 border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                <span>Complete</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending}
                onClick={(e) => handleStatus(e, "cancelled")}
                className="h-8 px-2 text-xs text-content-subtle hover:text-danger"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                <span>Cancel</span>
              </Button>
            </>
          )}

          {isCompleted && (
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={(e) => handleStatus(e, "scheduled")}
              className="h-8 px-2 text-xs text-content-muted hover:text-content"
            >
              Reopen
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            aria-label="Delete appointment"
            className="h-8 w-8 text-content-subtle hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
