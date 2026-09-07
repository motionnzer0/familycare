"use client";

import React, { useState, useTransition } from "react";
import {
  Settings as SettingsIcon,
  Download,
  Trash2,
  Save,
  ShieldAlert,
  Clock,
  User,
  Heart,
  FileJson,
  LogOut,
  X,
  AlertCircle,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Workspace, CareRecipient, Role } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import {
  updateWorkspaceSettingsAction,
  deleteWorkspaceAction,
} from "@/lib/actions/settings";
import { signOutAction } from "@/lib/actions/auth";

interface SettingsViewProps {
  workspace: Workspace;
  careRecipient: CareRecipient | null;
  userRole: Role;
  userEmail: string;
}

export function SettingsView({
  workspace,
  careRecipient,
  userRole,
  userEmail,
}: SettingsViewProps) {
  const [workspaceName, setWorkspaceName] = useState(workspace.name);
  const [timezone, setTimezone] = useState(workspace.timezone || "America/New_York");
  const [preferredName, setPreferredName] = useState(careRecipient?.preferred_name || "Mom");
  const [birthDate, setBirthDate] = useState(careRecipient?.birth_date || "");
  const [phone, setPhone] = useState(careRecipient?.phone || "");
  const [careContext, setCareContext] = useState(careRecipient?.care_context || "");

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isOwner = userRole === "owner";
  const canEdit = userRole === "owner" || userRole === "coordinator";

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      const res = await updateWorkspaceSettingsAction({
        workspaceName,
        timezone,
        careRecipientPreferredName: preferredName,
        careRecipientBirthDate: birthDate || null,
        careRecipientPhone: phone || null,
        careContext: careContext || null,
      });

      if (res.success) {
        setMessage("Settings updated successfully.");
      } else {
        setError(res.error || "Failed to update settings.");
      }
    });
  };

  const handleDeleteWorkspaceConfirm = () => {
    if (deleteConfirmationInput !== workspace.name) return;
    setDeleteError(null);
    startTransition(async () => {
      const res = await deleteWorkspaceAction();
      if (!res.success) {
        setDeleteError(res.error || "Failed to delete workspace.");
      }
    });
  };

  const handleSignOut = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <div className="space-y-8 max-w-reading">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
            Settings
          </h1>
          <p className="text-base text-content-muted mt-0.5">
            Manage your workspace details, care profile, data export, and security.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="flex items-center space-x-1.5 self-start sm:self-auto text-content-muted hover:text-content min-h-[44px] sm:min-h-[32px] h-auto sm:h-8"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </Button>
      </div>

      {message && (
        <Alert variant="default" className="border-emerald-300 bg-emerald-50 text-emerald-950">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="danger">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 1. CARE PROFILE & WORKSPACE SETTINGS FORM */}
      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Workspace &amp; Care Profile</CardTitle>
                <CardDescription>
                  Basic identity and care context for this family workspace. View full details on the{" "}
                  <a href="/care" className="text-brand font-semibold underline">
                    Care Profile page
                  </a>
                  .
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="set-ws-name">Workspace Name</Label>
                <Input
                  id="set-ws-name"
                  disabled={!canEdit || isPending}
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="set-tz">Workspace Timezone</Label>
                <Input
                  id="set-tz"
                  disabled={!canEdit || isPending}
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <Label htmlFor="set-cr-name">Care Recipient Preferred Name</Label>
                <Input
                  id="set-cr-name"
                  disabled={!canEdit || isPending}
                  value={preferredName}
                  onChange={(e) => setPreferredName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="set-cr-bday">Birth Date</Label>
                <Input
                  id="set-cr-bday"
                  type="date"
                  disabled={!canEdit || isPending}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="set-cr-phone">Phone Number</Label>
                <Input
                  id="set-cr-phone"
                  type="tel"
                  disabled={!canEdit || isPending}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="set-care-context">Care Overview &amp; Context</Label>
              <textarea
                id="set-care-context"
                rows={3}
                disabled={!canEdit || isPending}
                placeholder="Key living arrangements, primary diagnoses, or helpful context for caregivers..."
                value={careContext}
                onChange={(e) => setCareContext(e.target.value)}
                className="flex w-full rounded border border-border bg-surface px-3 py-2 text-base text-content placeholder:text-content-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
              />
            </div>
          </CardContent>

          {canEdit && (
            <CardFooter className="pt-2">
              <Button type="submit" variant="primary" disabled={isPending} className="min-h-[44px] sm:min-h-[36px]">
                <Save className="h-4 w-4 mr-1.5" />
                <span>{isPending ? "Saving..." : "Save Changes"}</span>
              </Button>
            </CardFooter>
          )}
        </Card>
      </form>

      {/* 2. DATA EXPORT SECTION (D-21) */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileJson className="h-5 w-5 text-brand" />
            <CardTitle className="text-lg">Export Workspace Data</CardTitle>
          </div>
          <CardDescription>
            Download a complete structured JSON archive of all tasks, appointments, medications, notes, emergency information, and document manifests for this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-content-muted">
            Data export complies with our data portability policy. Exports are strictly isolated to your active workspace and exclude deleted records.
          </p>
        </CardContent>
        <CardFooter>
          <a href="/api/export" download>
            <Button variant="secondary" className="flex items-center space-x-2 min-h-[44px] sm:min-h-[36px]">
              <Download className="h-4 w-4" />
              <span>Download JSON Export</span>
            </Button>
          </a>
        </CardFooter>
      </Card>

      {/* 3. DANGER ZONE: WORKSPACE SOFT DELETION (D-21) */}
      {isOwner && (
        <Card className="border-red-300 bg-red-50/30">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <CardTitle className="text-lg text-red-950">Danger Zone</CardTitle>
            </div>
            <CardDescription className="text-red-900">
              Delete this workspace. Access is immediately revoked for all team members. Data is retained in a 30-day quarantine before permanent purge.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              type="button"
              variant="danger"
              disabled={isPending}
              onClick={() => {
                setDeleteConfirmationInput("");
                setDeleteError(null);
                setDeleteDialogOpen(true);
              }}
              className="flex items-center space-x-2 min-h-[44px] sm:min-h-[36px]"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Workspace</span>
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Accessible Workspace Deletion Modal */}
      <Dialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-red-300 bg-surface p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:rounded-lg">
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <Dialog.Title className="text-lg font-bold text-red-950 flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-red-600" />
                <span>Delete Workspace</span>
              </Dialog.Title>
              <Dialog.Description className="text-sm text-content-muted">
                WARNING: Deleting this workspace immediately revokes access for all team members. To confirm, please type the workspace name <strong className="text-content font-semibold select-all">{workspace.name}</strong> below:
              </Dialog.Description>
            </div>

            {deleteError && (
              <div className="flex items-center space-x-2 text-xs text-red-800 bg-red-50 border border-red-200 rounded p-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="space-y-2 py-2">
              <Label htmlFor="delete-ws-confirm-input" className="text-xs font-semibold text-content">
                Type workspace name to confirm
              </Label>
              <Input
                id="delete-ws-confirm-input"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder={workspace.name}
                autoFocus
                className="font-medium"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setDeleteDialogOpen(false)}
                className="min-h-[44px] sm:min-h-[36px]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={deleteConfirmationInput !== workspace.name || isPending}
                onClick={handleDeleteWorkspaceConfirm}
                className="min-h-[44px] sm:min-h-[36px]"
              >
                {isPending ? "Deleting..." : "Permanently Delete Workspace"}
              </Button>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-focus min-h-[32px] min-w-[32px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
