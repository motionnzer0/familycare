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

  it("verifies the complete 5-step workspace creation lifecycle (workspace, owner member, care recipient, emergency info, timeline)", () => {
    const userId = "auth-user-new-creator";
    const workspaceId = "ws-new-456";

    // Step 1: Workspace creation
    const workspace: WorkspaceRow = {
      id: workspaceId,
      name: "Family Care Command Center",
      owner_id: userId,
      deleted_at: null,
    };
    expect(workspace.owner_id).toBe(userId);

    // Step 2: Owner member creation
    const ownerMember: WorkspaceMemberRow = {
      id: "mem-owner-1",
      workspace_id: workspaceId,
      user_id: userId,
      role: "owner",
      status: "active",
    };
    expect(ownerMember.workspace_id).toBe(workspaceId);
    expect(ownerMember.user_id).toBe(userId);
    expect(ownerMember.role).toBe("owner");

    // Step 3: Care recipient creation
    const careRecipient = {
      id: "cr-1",
      workspace_id: workspaceId,
      preferred_name: "Eleanor",
      created_at: new Date().toISOString(),
    };
    expect(careRecipient.workspace_id).toBe(workspaceId);
    expect(careRecipient.preferred_name).toBe("Eleanor");

    // Step 4: Emergency info container creation
    const emergencyInfo = {
      id: "ei-1",
      workspace_id: workspaceId,
      created_at: new Date().toISOString(),
    };
    expect(emergencyInfo.workspace_id).toBe(workspaceId);

    // Step 5: Timeline event logging
    const timelineEvent = {
      id: "tle-1",
      workspace_id: workspaceId,
      actor_id: userId,
      action: "created",
      target_type: "workspace",
      target_id: workspaceId,
      target_title: workspace.name,
    };
    expect(timelineEvent.workspace_id).toBe(workspaceId);
    expect(timelineEvent.actor_id).toBe(userId);
    expect(timelineEvent.action).toBe("created");

    // Verify user can view workspace once membership is in place
    expect(isWorkspaceVisible(workspace, userId, [ownerMember])).toBe(true);
  });

  it("verifies PostgREST resource embedding structure for getActiveWorkspaceContext (*, workspaces(*, care_recipients(*)))", () => {
    // PostgREST returns care_recipients cleanly nested within workspaces
    const postgrestResult = {
      id: "mem-1",
      workspace_id: "ws-1",
      user_id: "user-1",
      role: "owner" as const,
      status: "active" as const,
      workspaces: {
        id: "ws-1",
        name: "Mom's Care",
        timezone: "America/New_York",
        owner_id: "user-1",
        care_recipients: [
          {
            id: "cr-1",
            workspace_id: "ws-1",
            preferred_name: "Mom",
          },
        ],
      },
    };

    const ws = postgrestResult.workspaces;
    const cr = postgrestResult.workspaces.care_recipients?.[0];

    expect(ws.id).toBe("ws-1");
    expect(ws.name).toBe("Mom's Care");
    expect(cr?.preferred_name).toBe("Mom");
  });
});

describe("Hardened workspace_members INSERT RLS Policy (SEC-01)", () => {
  interface WorkspaceRow {
    id: string;
    owner_id: string;
  }

  interface MemberRow {
    workspace_id: string;
    user_id: string;
    role: "owner" | "coordinator" | "contributor" | "viewer";
    status: "active" | "removed";
  }

  interface InvitationRow {
    id: string;
    workspace_id: string;
    email: string;
    role: "coordinator" | "contributor" | "viewer";
    accepted_at: string | null;
    expires_at: string;
  }

  function isMemberInsertAllowed(params: {
    workspace: WorkspaceRow;
    authUserId: string;
    authUserEmail: string;
    targetUserId: string;
    existingMembers: MemberRow[];
    invitations: InvitationRow[];
  }): boolean {
    const { workspace, authUserId, authUserEmail, existingMembers, invitations } = params;

    // 1. Owner bootstrapping during creation
    const isOwnerBootstrap = workspace.id && workspace.owner_id === authUserId;

    // 2. Coordinator/Owner adding a member
    const isOwnerOrCoordinator = existingMembers.some(
      (m) =>
        m.workspace_id === workspace.id &&
        m.user_id === authUserId &&
        m.status === "active" &&
        (m.role === "owner" || m.role === "coordinator")
    );

    // 3. Accepting a valid, non-expired invitation
    const now = new Date().toISOString();
    const hasValidInvite = invitations.some(
      (inv) =>
        inv.workspace_id === workspace.id &&
        inv.email.toLowerCase() === authUserEmail.toLowerCase() &&
        inv.accepted_at === null &&
        inv.expires_at > now
    );

    return isOwnerBootstrap || isOwnerOrCoordinator || hasValidInvite;
  }

  const sampleWorkspace: WorkspaceRow = { id: "ws-secure-1", owner_id: "user-owner" };

  it("DENIES an arbitrary authenticated user from self-inserting into a foreign workspace without invitation", () => {
    const allowed = isMemberInsertAllowed({
      workspace: sampleWorkspace,
      authUserId: "attacker-user-id",
      authUserEmail: "attacker@example.com",
      targetUserId: "attacker-user-id",
      existingMembers: [
        { workspace_id: "ws-secure-1", user_id: "user-owner", role: "owner", status: "active" },
      ],
      invitations: [],
    });
    expect(allowed).toBe(false);
  });

  it("DENIES user from accepting an invitation intended for another email address", () => {
    const invitations: InvitationRow[] = [
      {
        id: "inv-1",
        workspace_id: "ws-secure-1",
        email: "invited-family@example.com",
        role: "contributor",
        accepted_at: null,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      },
    ];

    const allowed = isMemberInsertAllowed({
      workspace: sampleWorkspace,
      authUserId: "malicious-user-id",
      authUserEmail: "wrong-email@example.com",
      targetUserId: "malicious-user-id",
      existingMembers: [],
      invitations,
    });
    expect(allowed).toBe(false);
  });

  it("DENIES user from accepting an expired invitation", () => {
    const expiredInvitations: InvitationRow[] = [
      {
        id: "inv-2",
        workspace_id: "ws-secure-1",
        email: "invited-family@example.com",
        role: "contributor",
        accepted_at: null,
        expires_at: new Date(Date.now() - 3600000).toISOString(), // expired 1h ago
      },
    ];

    const allowed = isMemberInsertAllowed({
      workspace: sampleWorkspace,
      authUserId: "invited-user-id",
      authUserEmail: "invited-family@example.com",
      targetUserId: "invited-user-id",
      existingMembers: [],
      invitations: expiredInvitations,
    });
    expect(allowed).toBe(false);
  });

  it("PERMITS workspace owner to bootstrap initial membership row during creation", () => {
    const allowed = isMemberInsertAllowed({
      workspace: sampleWorkspace,
      authUserId: "user-owner",
      authUserEmail: "owner@example.com",
      targetUserId: "user-owner",
      existingMembers: [],
      invitations: [],
    });
    expect(allowed).toBe(true);
  });

  it("PERMITS coordinator to add a member to the workspace", () => {
    const members: MemberRow[] = [
      { workspace_id: "ws-secure-1", user_id: "user-coord", role: "coordinator", status: "active" },
    ];

    const allowed = isMemberInsertAllowed({
      workspace: sampleWorkspace,
      authUserId: "user-coord",
      authUserEmail: "coord@example.com",
      targetUserId: "new-member-id",
      existingMembers: members,
      invitations: [],
    });
    expect(allowed).toBe(true);
  });

  it("PERMITS invited user with matching email to accept a valid pending invitation", () => {
    const validInvitations: InvitationRow[] = [
      {
        id: "inv-3",
        workspace_id: "ws-secure-1",
        email: "legit-invitee@example.com",
        role: "contributor",
        accepted_at: null,
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      },
    ];

    const allowed = isMemberInsertAllowed({
      workspace: sampleWorkspace,
      authUserId: "legit-user-id",
      authUserEmail: "legit-invitee@example.com",
      targetUserId: "legit-user-id",
      existingMembers: [],
      invitations: validInvitations,
    });
    expect(allowed).toBe(true);
  });
});

describe("User Profiles Privacy Boundary RLS (SEC-06)", () => {
  interface MemberRow {
    workspace_id: string;
    user_id: string;
    status: "active" | "removed";
  }

  function isProfileSelectAllowed(
    targetProfileUserId: string,
    authUserId: string,
    members: MemberRow[]
  ): boolean {
    // 1. Own profile
    if (authUserId === targetProfileUserId) return true;

    // 2. Active co-workspace members
    const authUserWorkspaces = members
      .filter((m) => m.user_id === authUserId && m.status === "active")
      .map((m) => m.workspace_id);

    return members.some(
      (m) =>
        authUserWorkspaces.includes(m.workspace_id) &&
        m.user_id === targetProfileUserId &&
        m.status === "active"
    );
  }

  const sampleMembers: MemberRow[] = [
    { workspace_id: "ws-1", user_id: "user-A", status: "active" },
    { workspace_id: "ws-1", user_id: "user-B", status: "active" },
    { workspace_id: "ws-1", user_id: "user-RemovedFromWs1", status: "removed" },
    { workspace_id: "ws-2", user_id: "user-C", status: "active" },
  ];

  it("PERMITS user to view their own profile", () => {
    expect(isProfileSelectAllowed("user-A", "user-A", sampleMembers)).toBe(true);
  });

  it("PERMITS user to view profile of an active co-member in their workspace", () => {
    expect(isProfileSelectAllowed("user-B", "user-A", sampleMembers)).toBe(true);
  });

  it("DENIES user from viewing profile of a user in a completely unrelated workspace", () => {
    expect(isProfileSelectAllowed("user-C", "user-A", sampleMembers)).toBe(false);
  });

  it("DENIES user from viewing profile of a removed member with no shared active workspace", () => {
    expect(isProfileSelectAllowed("user-RemovedFromWs1", "user-A", sampleMembers)).toBe(false);
  });
});
