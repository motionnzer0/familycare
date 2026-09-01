import { describe, it, expect } from "vitest";
import { checkPermission } from "@/lib/permissions";

describe("Workspace Settings & Deletion Permissions (Phase 3B, 3C / D-21)", () => {
  it("allows only workspace owner to delete workspace", () => {
    expect(checkPermission("owner", "workspace", "delete")).toBe(true);
    expect(checkPermission("coordinator", "workspace", "delete")).toBe(false);
    expect(checkPermission("contributor", "workspace", "delete")).toBe(false);
    expect(checkPermission("viewer", "workspace", "delete")).toBe(false);
  });

  it("allows coordinator and owner to update workspace settings", () => {
    expect(checkPermission("owner", "workspace", "update")).toBe(true);
    expect(checkPermission("coordinator", "workspace", "update")).toBe(true);
    expect(checkPermission("contributor", "workspace", "update")).toBe(false);
    expect(checkPermission("viewer", "workspace", "update")).toBe(false);
  });
});
