"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createAppointmentAction,
  updateAppointmentAction,
} from "@/lib/actions/appointments";
import { Appointment, Task } from "@/lib/types";

interface AppointmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  tasks?: Task[];
}

export function AppointmentFormModal({
  open,
  onOpenChange,
  appointment,
  tasks = [],
}: AppointmentFormModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [providerContact, setProviderContact] = useState("");
  const [attendees, setAttendees] = useState("");
  const [details, setDetails] = useState("");
  const [relatedTaskId, setRelatedTaskId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!appointment;

  useEffect(() => {
    if (appointment) {
      setTitle(appointment.title || "");
      setDate(appointment.date || "");
      setStartTime(appointment.start_time ? appointment.start_time.substring(0, 5) : "");
      setEndTime(appointment.end_time ? appointment.end_time.substring(0, 5) : "");
      setLocation(appointment.location || "");
      setProviderContact(appointment.provider_contact || "");
      setAttendees(appointment.attendees || "");
      setDetails(appointment.details || "");
      setRelatedTaskId(appointment.related_task_id || "");
    } else {
      setTitle("");
      setDate(new Date().toISOString().split("T")[0]);
      setStartTime("");
      setEndTime("");
      setLocation("");
      setProviderContact("");
      setAttendees("");
      setDetails("");
      setRelatedTaskId("");
    }
    setError(null);
  }, [appointment, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      setError("Please provide an appointment title and date.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isEditing && appointment) {
        const res = await updateAppointmentAction(appointment.id, {
          title: title.trim(),
          date,
          startTime: startTime || null,
          endTime: endTime || null,
          location: location.trim() || null,
          providerContact: providerContact.trim() || null,
          attendees: attendees.trim() || null,
          details: details.trim() || null,
          relatedTaskId: relatedTaskId || null,
        });

        if (!res.success) {
          setError(res.error || "Failed to update appointment");
          setLoading(false);
          return;
        }
      } else {
        const res = await createAppointmentAction({
          title: title.trim(),
          date,
          startTime: startTime || null,
          endTime: endTime || null,
          location: location.trim() || null,
          providerContact: providerContact.trim() || null,
          attendees: attendees.trim() || null,
          details: details.trim() || null,
          relatedTaskId: relatedTaskId || null,
        });

        if (!res.success) {
          setError(res.error || "Failed to create appointment");
          setLoading(false);
          return;
        }
      }

      onOpenChange(false);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Appointment" : "Schedule Appointment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="appt-title">
              Appointment title <span className="text-danger">*</span>
            </Label>
            <Input
              id="appt-title"
              placeholder="e.g. Cardiology checkup with Dr. Watson"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="appt-date">
                Date <span className="text-danger">*</span>
              </Label>
              <Input
                id="appt-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="appt-start-time">Start time</Label>
              <Input
                id="appt-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="appt-end-time">End time</Label>
              <Input
                id="appt-end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="appt-location">Location or Address</Label>
            <Input
              id="appt-location"
              placeholder="e.g. Memorial Clinic, Suite 400"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="appt-provider">Provider contact / Phone</Label>
            <Input
              id="appt-provider"
              placeholder="e.g. (555) 234-5678"
              value={providerContact}
              onChange={(e) => setProviderContact(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="appt-details">Notes &amp; Prep</Label>
            <textarea
              id="appt-details"
              rows={2}
              placeholder="Instructions, parking info, questions to ask..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="flex w-full rounded border border-border bg-surface px-3 py-2 text-base text-content placeholder:text-content-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
            />
          </div>

          {tasks.length > 0 && (
            <div className="space-y-1.5">
              <Label htmlFor="appt-task">Link related preparation task</Label>
              <select
                id="appt-task"
                value={relatedTaskId}
                onChange={(e) => setRelatedTaskId(e.target.value)}
                className="flex h-11 w-full rounded border border-border bg-surface px-3 py-2 text-base text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
              >
                <option value="">None</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading
                ? isEditing
                  ? "Saving..."
                  : "Scheduling..."
                : isEditing
                ? "Save Changes"
                : "Schedule Appointment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
