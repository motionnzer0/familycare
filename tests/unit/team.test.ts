import { describe, it, expect } from "vitest";
import { inviteMemberSchema, updateMemberRoleSchema } from "@/lib/validations/team";
import { checkPermission } from "@/lib/permissions";
import { Role } from "@/lib/types";

describe("Care Team & Invitations (Phase 2A)", () => {
  it("validates invitation email and role", () => {
    const valid = inviteMemberSchema.safeParse({
      email: "sister@example.com",
      role: "contributor",
    });
    expect(valid.success).toBe(true);

    const invalidEmail = inviteMemberSchema.safeParse({
      email: "invalid-email",
      role: "contributor",
    });
    expect(invalidEmail.success).toBe(false);

    const invalidRole = inviteMemberSchema.safeParse({
      email: "sister@example.com",
      role: "superadmin",
    });
    expect(invalidRole.success).toBe(false);
  });

  it("validates member role update schema", () => {
    const valid = updateMemberRoleSchema.safeParse({
      memberId: "123e4567-e89b-12d3-a456-426614174000",
      role: "coordinator",
    });
    expect(valid.success).toBe(true);
  });

  it("enforces role permissions for member management", () => {
    expect(checkPermission("owner", "member", "invite")).toBe(true);
    expect(checkPermission("coordinator", "member", "invite")).toBe(true);
    expect(checkPermission("contributor", "member", "invite")).toBe(false);
    expect(checkPermission("viewer", "member", "invite")).toBe(false);

    expect(checkPermission("owner", "member", "delete")).toBe(true);
    expect(checkPermission("coordinator", "member", "delete")).toBe(false);
    expect(checkPermission("contributor", "member", "delete")).toBe(false);
  });
});
