import { describe, it, expect } from "vitest";
import {
  getWorkspaceCurrentDate,
  isTaskOverdue,
  isTaskDueToday,
  isDateUpcoming,
} from "@/lib/timezone";

describe("Workspace Timezone Engine (D-15, OQ-20)", () => {
  const fixedNow = new Date("2026-09-15T15:00:00Z"); // UTC 3:00 PM -> EDT 11:00 AM on Sep 15, 2026

  it("calculates current date correctly in workspace timezone", () => {
    const todayNy = getWorkspaceCurrentDate("America/New_York", fixedNow);
    expect(todayNy).toBe("2026-09-15");
  });

  it("identifies overdue tasks strictly before workspace-local today", () => {
    // Yesterday (Sep 14) is overdue
    expect(isTaskOverdue("2026-09-14", "open", "America/New_York", fixedNow)).toBe(true);

    // Today (Sep 15) is NOT overdue
    expect(isTaskOverdue("2026-09-15", "open", "America/New_York", fixedNow)).toBe(false);

    // Tomorrow (Sep 16) is NOT overdue
    expect(isTaskOverdue("2026-09-16", "open", "America/New_York", fixedNow)).toBe(false);

    // Completed task is NEVER overdue even if due date is in the past
    expect(isTaskOverdue("2026-09-10", "completed", "America/New_York", fixedNow)).toBe(false);
  });

  it("identifies tasks due today", () => {
    expect(isTaskDueToday("2026-09-15", "America/New_York", fixedNow)).toBe(true);
    expect(isTaskDueToday("2026-09-14", "America/New_York", fixedNow)).toBe(false);
    expect(isTaskDueToday("2026-09-16", "America/New_York", fixedNow)).toBe(false);
    expect(isTaskDueToday(null, "America/New_York", fixedNow)).toBe(false);
  });

  it("identifies upcoming dates within the 7-day horizon", () => {
    // Today is excluded from upcoming (it is in 'Today')
    expect(isDateUpcoming("2026-09-15", "America/New_York", 7, fixedNow)).toBe(false);

    // Next day (Sep 16) through +7 days (Sep 22) are upcoming
    expect(isDateUpcoming("2026-09-16", "America/New_York", 7, fixedNow)).toBe(true);
    expect(isDateUpcoming("2026-09-22", "America/New_York", 7, fixedNow)).toBe(true);

    // Beyond 7 days (Sep 23+) is not in the immediate upcoming 7-day window
    expect(isDateUpcoming("2026-09-23", "America/New_York", 7, fixedNow)).toBe(false);
  });
});
