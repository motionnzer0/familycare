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
} from "lucide-react";
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

  const handleDeleteWorkspace = () => {
    const confirmation = prompt(
      `WARNING: Deleting this workspace immediately revokes all family member access. To confirm, type the workspace name "${workspace.name}" below:`
    );

    if (confirmation === workspace.name) {
      startTransition(async () => {
        await deleteWorkspaceAction();
      });
    } else if (confirmation !== null) {
      alert("Workspace name did not match. Deletion cancelled.");
    }
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
          className="flex items-center space-x-1.5 self-start sm:self-auto text-content-muted hover:text-content"
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
            <CardTitle className="text-lg">Workspace &amp; Care Profile</CardTitle>
            <CardDescription>
              Basic identity and care context for this family workspace.
            </CardDescription>
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
              <Button type="submit" variant="primary" disabled={isPending}>
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
            <Button variant="secondary" className="flex items-center space-x-2">
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
              onClick={handleDeleteWorkspace}
              className="flex items-center space-x-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete Workspace</span>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
