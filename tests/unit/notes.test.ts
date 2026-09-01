import { describe, it, expect } from "vitest";
import {
  createNoteSchema,
  updateNoteSchema,
  NOTE_CATEGORIES,
} from "@/lib/validations/note";
import { checkPermission } from "@/lib/permissions";

describe("Notes Reference & Observations (Phase 2E)", () => {
  it("validates note creation", () => {
    const valid = createNoteSchema.safeParse({
      title: "Doctor visit questions",
      body: "Ask Dr. Roberts about physical therapy frequency.",
      category: "Appointment",
    });
    expect(valid.success).toBe(true);

    const invalid = createNoteSchema.safeParse({
      title: "",
      body: "",
    });
    expect(invalid.success).toBe(false);
  });

  it("enforces note author permissions (D-17)", () => {
    // Contributor CAN create notes
    expect(checkPermission("contributor", "note", "create")).toBe(true);

    // Contributor CAN edit own notes
    expect(checkPermission("contributor", "note", "update", { isCreator: true })).toBe(true);

    // Contributor CANNOT edit another user's notes
    expect(checkPermission("contributor", "note", "update", { isCreator: false })).toBe(false);

    // Viewer is read-only
    expect(checkPermission("viewer", "note", "create")).toBe(false);
    expect(checkPermission("viewer", "note", "update")).toBe(false);
  });
});
