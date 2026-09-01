import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TodayPage() {
  return (
    <div className="space-y-6 max-w-reading">
      {/* Page Heading */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
          Today
        </h1>
        <p className="text-base text-content-muted">
          Current priorities and schedule for your family care team.
        </p>
      </div>

      {/* Foundational Priority Section Containers (Empty state baseline) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Needs Attention</CardTitle>
            <Badge variant="unassigned">0 overdue</Badge>
          </div>
          <CardDescription>
            Tasks requiring immediate coordination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-content-muted py-2">
            Nothing needs attention right now. All tasks are up to date.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Today&apos;s Schedule &amp; Tasks</CardTitle>
            <Badge variant="dueToday">Today</Badge>
          </div>
          <CardDescription>
            Appointments and tasks scheduled for today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-content-muted py-2">
            No tasks or appointments scheduled for today.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
