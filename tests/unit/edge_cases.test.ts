import { describe, it, expect } from "vitest";
import { isTaskOverdue, isTaskDueToday, isDateUpcoming } from "@/lib/timezone";

describe("Edge-Case Handling & Robustness (Phase 3D)", () => {
  const tz = "America/New_York";
  const fixedNow = new Date("2026-09-15T12:00:00Z");

  it("handles tasks with null or missing due dates without crashing", () => {
    expect(isTaskOverdue(null, "open", tz, fixedNow)).toBe(false);
    expect(isTaskOverdue(undefined, "open", tz, fixedNow)).toBe(false);
    expect(isTaskDueToday(null, tz, fixedNow)).toBe(false);
    expect(isDateUpcoming(null, tz, 7, fixedNow)).toBe(false);
  });

  it("handles reopened tasks properly", () => {
    // A past task that was completed was NOT overdue, but once reopened to 'open', becomes overdue
    const pastDate = "2026-09-10";
    expect(isTaskOverdue(pastDate, "completed", tz, fixedNow)).toBe(false);
    expect(isTaskOverdue(pastDate, "open", tz, fixedNow)).toBe(true);
  });

  it("handles leap years and timezone offsets accurately", () => {
    // Leap day test
    const leapDay = new Date("2028-02-29T12:00:00Z");
    expect(isTaskDueToday("2028-02-29", tz, leapDay)).toBe(true);
  });
});
