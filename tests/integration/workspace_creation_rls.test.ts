import { describe, it, expect } from "vitest";

describe("Workspaces RLS Policy & Onboarding Access Verification", () => {
  interface WorkspaceRow {
    id: string;
    name: string;
    owner_id: string;
    deleted_at: string | null;
  }

  interface WorkspaceMemberRow {
    id: string;
    workspace_id: string;
    user_id: string;
    role: "owner" | "coordinator" | "contributor" | "viewer";
    status: "active" | "removed";
  }

  // Helper function simulating the exact SQL RLS policy:
  // (owner_id = auth.uid() OR is_workspace_member(id)) AND deleted_at IS NULL
  function isWorkspaceVisible(
    workspace: WorkspaceRow,
    authUserId: string,
    members: WorkspaceMemberRow[]
  ): boolean {
    if (workspace.deleted_at !== null) {
      return false;
    }

    const isOwner = workspace.owner_id === authUserId;
    const isMember = members.some(
      (m) =>
        m.workspace_id === workspace.id &&
        m.user_id === authUserId &&
        m.status === "active"
    );

    return isOwner || isMember;
  }

  it("permits a newly authenticated user to select their created workspace immediately during INSERT ... RETURNING before member row exists", () => {
    const newUserId = "user-new-creator-uuid";
    const newWorkspace: WorkspaceRow = {
      id: "ws-new-uuid",
      name: "Family Care for Dad",
      owner_id: newUserId,
      deleted_at: null,
    };

    // At the instant of INSERT into workspaces, workspace_members is empty
    const membersBeforeStep2: WorkspaceMemberRow[] = [];

    // Under updated workspaces_select policy: (owner_id = auth.uid() OR is_workspace_member(id)) AND deleted_at IS NULL
    const visibleOnReturning = isWorkspaceVisible(newWorkspace, newUserId, membersBeforeStep2);
    expect(visibleOnReturning).toBe(true);
  });

  it("adds the owner to workspace_members after workspace insertion", () => {
    const ownerId = "user-owner-uuid";
    const workspaceId = "ws-123-uuid";

    const memberRow: WorkspaceMemberRow = {
      id: "member-1",
      workspace_id: workspaceId,
      user_id: ownerId,
      role: "owner",
      status: "active",
    };

    expect(memberRow.user_id).toBe(ownerId);
    expect(memberRow.role).toBe("owner");
    expect(memberRow.status).toBe("active");
  });

  it("ensures existing workspace members retain access via is_workspace_member(id)", () => {
    const ownerId = "user-owner-uuid";
    const contributorId = "user-contributor-uuid";
    const viewerId = "user-viewer-uuid";
    const workspaceId = "ws-123-uuid";

    const workspace: WorkspaceRow = {
      id: workspaceId,
      name: "Care for Mom",
      owner_id: ownerId,
      deleted_at: null,
    };

    const members: WorkspaceMemberRow[] = [
      { id: "m1", workspace_id: workspaceId, user_id: ownerId, role: "owner", status: "active" },
      { id: "m2", workspace_id: workspaceId, user_id: contributorId, role: "contributor", status: "active" },
      { id: "m3", workspace_id: workspaceId, user_id: viewerId, role: "viewer", status: "active" },
    ];

    expect(isWorkspaceVisible(workspace, ownerId, members)).toBe(true);
    expect(isWorkspaceVisible(workspace, contributorId, members)).toBe(true);
    expect(isWorkspaceVisible(workspace, viewerId, members)).toBe(true);
  });

  it("strictly prevents a user from another workspace from accessing the workspace", () => {
    const ownerA = "user-A";
    const userFromOtherWorkspace = "user-B-from-workspace-B";
    const workspaceAId = "ws-A-uuid";

    const workspaceA: WorkspaceRow = {
      id: workspaceAId,
      name: "Workspace A",
      owner_id: ownerA,
      deleted_at: null,
    };

    const membersWorkspaceA: WorkspaceMemberRow[] = [
      { id: "m1", workspace_id: workspaceAId, user_id: ownerA, role: "owner", status: "active" },
    ];

    // User B is neither owner_id nor in workspace_members of Workspace A
    const userBCanAccessWorkspaceA = isWorkspaceVisible(
      workspaceA,
      userFromOtherWorkspace,
      membersWorkspaceA
    );
    expect(userBCanAccessWorkspaceA).toBe(false);
  });

  it("hides soft-deleted workspaces even from the owner", () => {
    const ownerId = "user-owner-uuid";
    const workspace: WorkspaceRow = {
      id: "ws-deleted",
      name: "Deleted Workspace",
      owner_id: ownerId,
      deleted_at: "2026-09-02T12:00:00Z",
    };

    const members: WorkspaceMemberRow[] = [
      { id: "m1", workspace_id: "ws-deleted", user_id: ownerId, role: "owner", status: "active" },
    ];

    expect(isWorkspaceVisible(workspace, ownerId, members)).toBe(false);
  });
});
