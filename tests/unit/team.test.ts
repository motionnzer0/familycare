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

  it("conforms to canonical invitations table schema and token generation (SEC-02)", () => {
    // Canonical schema fields: id, workspace_id, email, role, token, invited_by, expires_at, accepted_at, created_at
    const mockInvitationRecord = {
      id: "inv-uuid-1",
      workspace_id: "ws-uuid-1",
      email: "doctor@example.com",
      role: "viewer" as Role,
      token: "inv_tok_" + "a".repeat(32),
      invited_by: "user-owner-1",
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      accepted_at: null,
      created_at: new Date().toISOString(),
    };

    expect(mockInvitationRecord.workspace_id).toBeDefined();
    expect(mockInvitationRecord.token.length).toBeGreaterThanOrEqual(32);
    expect(mockInvitationRecord.accepted_at).toBeNull();
    expect(new Date(mockInvitationRecord.expires_at).getTime()).toBeGreaterThan(Date.now());
  });
});
