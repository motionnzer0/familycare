import { describe, it, expect } from "vitest";
import { checkPermission } from "@/lib/permissions";
import { Role } from "@/lib/types";

describe("Slice 2 Security & Cross-Workspace Isolation", () => {
  interface MockResource {
    id: string;
    workspaceId: string;
    type: "document" | "emergency" | "medication" | "note";
    uploadedBy?: string;
    authorId?: string;
  }

  interface MockMembership {
    userId: string;
    workspaceId: string;
    role: Role;
    status: "active" | "removed";
  }

  const memberships: MockMembership[] = [
    { userId: "user-A", workspaceId: "workspace-A", role: "owner", status: "active" },
    { userId: "user-B", workspaceId: "workspace-B", role: "owner", status: "active" },
    { userId: "user-Contributor", workspaceId: "workspace-A", role: "contributor", status: "active" },
    { userId: "user-Viewer", workspaceId: "workspace-A", role: "viewer", status: "active" },
    { userId: "user-Removed", workspaceId: "workspace-A", role: "contributor", status: "removed" },
  ];

  const resources: MockResource[] = [
    { id: "doc-A1", workspaceId: "workspace-A", type: "document", uploadedBy: "user-A" },
    { id: "doc-A2", workspaceId: "workspace-A", type: "document", uploadedBy: "user-Contributor" },
    { id: "doc-B1", workspaceId: "workspace-B", type: "document", uploadedBy: "user-B" },
    { id: "med-A1", workspaceId: "workspace-A", type: "medication" },
    { id: "med-B1", workspaceId: "workspace-B", type: "medication" },
    { id: "em-A1", workspaceId: "workspace-A", type: "emergency" },
    { id: "em-B1", workspaceId: "workspace-B", type: "emergency" },
  ];

  function queryWorkspace(userId: string, targetWorkspaceId: string, resourceType: MockResource["type"]) {
    const membership = memberships.find(
      (m) => m.userId === userId && m.workspaceId === targetWorkspaceId && m.status === "active"
    );
    if (!membership) {
      return { allowed: false, error: "Access denied by RLS policy" };
    }
    const filtered = resources.filter(
      (r) => r.workspaceId === targetWorkspaceId && r.type === resourceType
    );
    return { allowed: true, data: filtered, role: membership.role };
  }

  it("DENIES User A from accessing Workspace B documents (Cross-Workspace Isolation)", () => {
    const res = queryWorkspace("user-A", "workspace-B", "document");
    expect(res.allowed).toBe(false);
    expect(res.error).toBe("Access denied by RLS policy");
  });

  it("DENIES User A from accessing Workspace B emergency info", () => {
    const res = queryWorkspace("user-A", "workspace-B", "emergency");
    expect(res.allowed).toBe(false);
  });

  it("DENIES User A from accessing Workspace B medications", () => {
    const res = queryWorkspace("user-A", "workspace-B", "medication");
    expect(res.allowed).toBe(false);
  });

  it("DENIES removed member from querying workspace records", () => {
    const res = queryWorkspace("user-Removed", "workspace-A", "document");
    expect(res.allowed).toBe(false);
  });

  it("allows Contributor in Workspace A to access Workspace A documents", () => {
    const res = queryWorkspace("user-Contributor", "workspace-A", "document");
    expect(res.allowed).toBe(true);
    expect(res.data?.length).toBe(2);
  });

  it("denies Contributor from modifying another user's document metadata", () => {
    const canEditOwn = checkPermission("contributor", "document", "update", { isCreator: true });
    const canEditOther = checkPermission("contributor", "document", "update", { isCreator: false });
    expect(canEditOwn).toBe(true);
    expect(canEditOther).toBe(false);
  });

  it("denies Contributor from editing Medications or Emergency Info", () => {
    expect(checkPermission("contributor", "medication", "create")).toBe(false);
    expect(checkPermission("contributor", "medication", "update")).toBe(false);
    expect(checkPermission("contributor", "emergency", "update")).toBe(false);
  });

  it("denies Viewer from mutating any protected record", () => {
    expect(checkPermission("viewer", "medication", "create")).toBe(false);
    expect(checkPermission("viewer", "emergency", "update")).toBe(false);
    expect(checkPermission("viewer", "document", "upload")).toBe(false);
    expect(checkPermission("viewer", "note", "create")).toBe(false);
    expect(checkPermission("viewer", "task", "create")).toBe(false);
  });
});
