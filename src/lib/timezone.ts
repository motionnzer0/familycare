// Family Care Command Center — Workspace Timezone Engine
// Reference: /docs/ARCHITECTURE.md and /docs/DECISIONS.md (D-15, OQ-20)

import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { parseISO, isBefore, isEqual, startOfDay, addDays } from "date-fns";

export const DEFAULT_WORKSPACE_TIMEZONE = "America/New_York";

/**
 * Returns current date string (YYYY-MM-DD) in the specified workspace timezone.
 */
export function getWorkspaceCurrentDate(timezone: string = DEFAULT_WORKSPACE_TIMEZONE, now: Date = new Date()): string {
  return formatInTimeZone(now, timezone, "yyyy-MM-dd");
}

/**
 * Evaluates whether an open task is overdue.
 * Rule (D-15): Incomplete task whose due date is strictly before the workspace-local current day.
 */
export function isTaskOverdue(
  dueDate: string | null | undefined,
  status: string,
  timezone: string = DEFAULT_WORKSPACE_TIMEZONE,
  now: Date = new Date()
): boolean {
  if (!dueDate || status === "completed") {
    return false;
  }

  const todayStr = getWorkspaceCurrentDate(timezone, now);
  return dueDate < todayStr;
}

/**
 * Evaluates whether a task is due today in the workspace timezone.
 */
export function isTaskDueToday(
  dueDate: string | null | undefined,
  timezone: string = DEFAULT_WORKSPACE_TIMEZONE,
  now: Date = new Date()
): boolean {
  if (!dueDate) return false;
  const todayStr = getWorkspaceCurrentDate(timezone, now);
  return dueDate === todayStr;
}

/**
 * Evaluates whether a date falls within the next N days (default 7 days, excluding today)
 * in the workspace timezone.
 */
export function isDateUpcoming(
  dateStr: string | null | undefined,
  timezone: string = DEFAULT_WORKSPACE_TIMEZONE,
  daysAhead: number = 7,
  now: Date = new Date()
): boolean {
  if (!dateStr) return false;

  const todayStr = getWorkspaceCurrentDate(timezone, now);
  const targetDate = parseISO(dateStr);
  const todayZoned = toZonedTime(now, timezone);
  const todayStart = startOfDay(todayZoned);
  const maxUpcoming = addDays(todayStart, daysAhead);

  if (dateStr <= todayStr) return false;

  const targetZoned = toZonedTime(targetDate, timezone);
  return isBefore(targetZoned, maxUpcoming) || isEqual(targetZoned, maxUpcoming);
}

/**
 * Formats a date/timestamp for display in the workspace timezone.
 */
export function formatInWorkspaceTz(
  date: Date | string,
  timezone: string = DEFAULT_WORKSPACE_TIMEZONE,
  formatStr: string = "MMM d, yyyy"
): string {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  return formatInTimeZone(parsed, timezone, formatStr);
}

/**
 * Formats an activity timestamp with relative display for events within 24 hours,
 * falling back to formatted workspace date/time for older events.
 */
export function formatRelativeTimeInWorkspaceTz(
  date: Date | string,
  timezone: string = DEFAULT_WORKSPACE_TIMEZONE,
  now: Date = new Date()
): string {
  const parsed = typeof date === "string" ? parseISO(date) : date;
  const nowZoned = toZonedTime(now, timezone);
  const targetZoned = toZonedTime(parsed, timezone);
  const diffMs = nowZoned.getTime() - targetZoned.getTime();

  if (diffMs < 0) {
    return formatInTimeZone(parsed, timezone, "MMM d, h:mm a");
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return formatInTimeZone(parsed, timezone, "MMM d, h:mm a");
}
