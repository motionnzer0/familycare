import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { getWorkspaceTeam } from "@/lib/actions/team";
import { getCurrentUser } from "@/lib/actions/auth";
import { MemberList } from "@/components/team/MemberList";

export default async function TeamPage() {
  const context = await getActiveWorkspaceContext();
  const user = await getCurrentUser();

  if (!context || !user) {
    return null;
  }

  const { members, invitations } = await getWorkspaceTeam(context.workspace.id);

  return (
    <MemberList
      members={members}
      invitations={invitations}
      currentUserRole={context.userRole}
      currentUserId={user.id}
      timezone={context.workspace.timezone}
    />
  );
}
