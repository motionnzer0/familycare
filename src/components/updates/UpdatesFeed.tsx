"use client";

import React from "react";
import {
  Activity,
  CheckCircle2,
  Calendar,
  Pill,
  FileText,
  StickyNote,
  UserPlus,
  Shield,
  Layers,
} from "lucide-react";
import { TimelineEvent } from "@/lib/types";
import { formatInWorkspaceTz } from "@/lib/timezone";

interface UpdatesFeedProps {
  events: TimelineEvent[];
  careRecipientName?: string;
  timezone?: string;
}

export function UpdatesFeed({
  events,
  careRecipientName = "Mom",
  timezone = "America/New_York",
}: UpdatesFeedProps) {
  const getEventIcon = (targetType: string, action: string) => {
    if (action === "completed") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    switch (targetType) {
      case "task":
        return <Layers className="h-4 w-4 text-brand" />;
      case "appointment":
        return <Calendar className="h-4 w-4 text-brand" />;
      case "medication":
        return <Pill className="h-4 w-4 text-teal-600" />;
      case "document":
        return <FileText className="h-4 w-4 text-indigo-600" />;
      case "note":
        return <StickyNote className="h-4 w-4 text-amber-600" />;
      case "workspace_member":
        return <UserPlus className="h-4 w-4 text-purple-600" />;
      case "emergency_info":
        return <Shield className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-content-muted" />;
    }
  };

  return (
    <div className="space-y-6 max-w-reading">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
          Activity &amp; Updates
        </h1>
        <p className="text-base text-content-muted mt-0.5">
          A clear chronological record of care coordination for {careRecipientName}.
        </p>
      </div>

      {/* Events Stream */}
      <div className="space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-start space-x-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-slate-300"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-subtle mt-0.5">
              {getEventIcon(event.target_type, event.action)}
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <p className="text-sm font-semibold text-content">
                  <span className="capitalize">{event.action}</span>{" "}
                  <span className="font-normal text-content-muted">
                    {event.target_type.replace("_", " ")}:
                  </span>{" "}
                  <span className="font-bold text-content">
                    {event.target_title || event.target_id}
                  </span>
                </p>
                <span className="text-xs text-content-subtle shrink-0">
                  {formatInWorkspaceTz(event.created_at, timezone, "MMM d, h:mm a")}
                </span>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-content-muted bg-surface-subtle">
            No recent activity recorded yet. As your family team creates tasks, appointments, and notes, they will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
