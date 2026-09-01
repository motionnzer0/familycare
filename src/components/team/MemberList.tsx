"use client";

import React, { useState, useTransition } from "react";
import { UserPlus, Shield, User, Trash2, Mail, CheckCircle2 } from "lucide-react";
import { WorkspaceMember, WorkspaceInvitation, Role } from "@/lib/types";
import { InviteMemberModal } from "./InviteMemberModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { removeMemberAction, updateMemberRoleAction } from "@/lib/actions/team";
import { formatInWorkspaceTz } from "@/lib/timezone";

interface MemberListProps {
  members: WorkspaceMember[];
  invitations: WorkspaceInvitation[];
  currentUserRole: Role;
  currentUserId: string;
  timezone?: string;
}

export function MemberList({
  members,
  invitations,
  currentUserRole,
  currentUserId,
  timezone = "America/New_York",
}: MemberListProps) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isOwner = currentUserRole === "owner";
  const canInvite = currentUserRole === "owner" || currentUserRole === "coordinator";

  const handleRoleChange = (memberId: string, newRole: "coordinator" | "contributor" | "viewer") => {
    startTransition(async () => {
      await updateMemberRoleAction({ memberId, role: newRole });
    });
  };

  const handleRemove = (memberId: string, memberName: string) => {
    if (confirm(`Are you sure you want to remove ${memberName} from this workspace? They will lose access immediately.`)) {
      startTransition(async () => {
        await removeMemberAction(memberId);
      });
    }
  };

  return (
    <div className="space-y-8 max-w-reading">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
            Care Team
          </h1>
          <p className="text-base text-content-muted mt-0.5">
            Family members and helpers who coordinate care in this workspace.
          </p>
        </div>

        {canInvite && (
          <Button
            variant="primary"
            onClick={() => setInviteModalOpen(true)}
            className="flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <UserPlus className="h-5 w-5" />
            <span>Invite Member</span>
          </Button>
        )}
      </div>

      {/* Active Members Section */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-content-muted">
          Active Members ({members.length})
        </h2>

        <div className="space-y-2.5">
          {members.map((member) => {
            const isSelf = member.user_id === currentUserId;
            const isMemberOwner = member.role === "owner";

            return (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border bg-surface p-4 gap-3"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold">
                    {member.display_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-content truncate">
                        {member.display_name || "Caregiver"}
                      </span>
                      {isSelf && (
                        <span className="text-xs bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-medium">
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-content-muted mt-0.5">
                      <span>Joined {formatInWorkspaceTz(member.joined_at, timezone, "MMM d, yyyy")}</span>
                    </div>
                  </div>
                </div>

                {/* Role and Actions */}
                <div className="flex items-center space-x-3 self-end sm:self-center shrink-0">
                  {isOwner && !isMemberOwner && !isSelf ? (
                    <select
                      value={member.role}
                      disabled={isPending}
                      onChange={(e) =>
                        handleRoleChange(
                          member.id,
                          e.target.value as "coordinator" | "contributor" | "viewer"
                        )
                      }
                      className="rounded border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-content"
                    >
                      <option value="coordinator">Coordinator</option>
                      <option value="contributor">Contributor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  ) : (
                    <Badge variant={member.role === "owner" ? "primary" : "secondary"}>
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </Badge>
                  )}

                  {isOwner && !isMemberOwner && !isSelf && (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isPending}
                      onClick={() => handleRemove(member.id, member.display_name || "Member")}
                      aria-label="Remove member"
                      className="h-8 w-8 text-content-subtle hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending Invitations Section */}
      {invitations.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <h2 className="text-sm font-bold uppercase tracking-wider text-content-muted">
            Pending Invitations ({invitations.length})
          </h2>

          <div className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border border-dashed border-border bg-surface-subtle p-3.5 text-sm"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Mail className="h-4 w-4 text-brand shrink-0" />
                  <span className="font-medium text-content truncate">{inv.email}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <Badge variant="unassigned">
                    Invited as {inv.role}
                  </Badge>
                  <span className="text-xs text-content-muted">
                    Expires in {Math.ceil((new Date(inv.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      <InviteMemberModal open={inviteModalOpen} onOpenChange={setInviteModalOpen} />
    </div>
  );
}
