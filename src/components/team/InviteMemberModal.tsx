"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { inviteMemberAction } from "@/lib/actions/team";
import { Role } from "@/lib/types";
import { Copy, Check } from "lucide-react";

interface InviteMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMemberModal({
  open,
  onOpenChange,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"coordinator" | "contributor" | "viewer">("contributor");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await inviteMemberAction({
        email: email.trim(),
        role,
      });

      if (!res.success || !res.data) {
        setError(res.error || "Failed to create invitation");
        setLoading(false);
        return;
      }

      setInviteUrl(res.data.invitationUrl);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (inviteUrl) {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setEmail("");
    setRole("contributor");
    setInviteUrl(null);
    setError(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Invite Caregiver</DialogTitle>
        </DialogHeader>

        {inviteUrl ? (
          <div className="space-y-4 pt-2">
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-emerald-950 space-y-2">
              <p className="font-semibold text-sm">Invitation Created!</p>
              <p className="text-xs text-emerald-800">
                Share this secure invitation link with <strong>{email}</strong>. The link expires in 7 days.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-link">Invitation Link</Label>
              <div className="flex items-center space-x-2">
                <Input id="invite-link" readOnly value={inviteUrl} className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCopy}
                  className="shrink-0 flex items-center space-x-1"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="primary" onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <Alert variant="danger">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="invite-email">
                Email address <span className="text-danger">*</span>
              </Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="family.member@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="invite-role">Select Role</Label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value as "coordinator" | "contributor" | "viewer")}
                className="flex h-11 w-full rounded border border-border bg-surface px-3 py-2 text-base text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
              >
                <option value="contributor">
                  Contributor (Can create notes, tasks, upload documents)
                </option>
                <option value="coordinator">
                  Coordinator (Full editing of tasks, calendar, emergency, medications)
                </option>
                <option value="viewer">Viewer (Read-only access)</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? "Generating Invite..." : "Create Invitation"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
