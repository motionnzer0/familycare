import { describe, it, expect } from "vitest";
import { careRecipientSchema } from "@/lib/validations/care";
import { checkPermission } from "@/lib/permissions";

describe("Care Profile Schema & Permissions (Slice 3)", () => {
  it("validates valid care recipient schema", () => {
    const valid = careRecipientSchema.safeParse({
      preferredName: "Eleanor",
      legalName: "Eleanor Vance",
      birthDate: "1948-06-15",
      phone: "(555) 012-3456",
      email: "eleanor@example.com",
      addressLine1: "742 Evergreen Terrace",
      addressLine2: "Apt 3B",
      city: "Springfield",
      state: "IL",
      postalCode: "62701",
      careContext: "Prefers morning walks. Hard of hearing on left side.",
    });
    expect(valid.success).toBe(true);
  });

  it("requires preferred name", () => {
    const invalid = careRecipientSchema.safeParse({
      preferredName: "",
    });
    expect(invalid.success).toBe(false);
  });

  it("enforces role-based permissions for care recipient profile (D-17)", () => {
    // All roles can READ care profile
    expect(checkPermission("owner", "care_recipient", "read")).toBe(true);
    expect(checkPermission("coordinator", "care_recipient", "read")).toBe(true);
    expect(checkPermission("contributor", "care_recipient", "read")).toBe(true);
    expect(checkPermission("viewer", "care_recipient", "read")).toBe(true);

    // Only Owner and Coordinator can EDIT care profile
    expect(checkPermission("owner", "care_recipient", "update")).toBe(true);
    expect(checkPermission("coordinator", "care_recipient", "update")).toBe(true);
    expect(checkPermission("contributor", "care_recipient", "update")).toBe(false);
    expect(checkPermission("viewer", "care_recipient", "update")).toBe(false);
  });
});
