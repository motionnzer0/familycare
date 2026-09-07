"use client";

import React, { useState, useTransition } from "react";
import { UserPlus, Shield, User, Trash2, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { WorkspaceMember, WorkspaceInvitation, Role } from "@/lib/types";
import { InviteMemberModal } from "./InviteMemberModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  const [confirmMember, setConfirmMember] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isOwner = currentUserRole === "owner";
  const canInvite = currentUserRole === "owner" || currentUserRole === "coordinator";

  const handleRoleChange = (memberId: string, newRole: "coordinator" | "contributor" | "viewer") => {
    setError(null);
    startTransition(async () => {
      const res = await updateMemberRoleAction({ memberId, role: newRole });
      if (!res.success) {
        setError(res.error || "Failed to update member role");
      }
    });
  };

  const handleRemoveConfirm = () => {
    if (!confirmMember) return;
    setError(null);
    startTransition(async () => {
      const res = await removeMemberAction(confirmMember.id);
      if (!res.success) {
        setError(res.error || "Failed to remove member");
      } else {
        setConfirmMember(null);
      }
    });
  };

  return (
    <>
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

        {error && (
          <div className="flex items-center justify-between text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-xs font-bold text-red-700 hover:underline ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

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
                        className="rounded border border-border bg-surface px-2.5 py-1.5 min-h-[44px] sm:min-h-[32px] text-xs font-semibold text-content"
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
                        onClick={() =>
                          setConfirmMember({
                            id: member.id,
                            name: member.display_name || "Member",
                          })
                        }
                        aria-label={`Remove member ${member.display_name || "Caregiver"}`}
                        className="min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] sm:h-8 sm:w-8 text-content-subtle hover:text-danger"
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

      <ConfirmDialog
        open={confirmMember !== null}
        onOpenChange={(open) => !open && setConfirmMember(null)}
        title="Remove Team Member"
        description={
          confirmMember
            ? `Are you sure you want to remove ${confirmMember.name} from this workspace? They will lose access immediately.`
            : ""
        }
        confirmLabel="Remove Member"
        variant="danger"
        isPending={isPending}
        onConfirm={handleRemoveConfirm}
      />
    </>
  );
}
