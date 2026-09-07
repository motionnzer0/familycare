"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createWorkspaceAction } from "@/lib/actions/workspace";

type OnboardingScreen = "welcome" | "create" | "ready";

export default function OnboardingPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<OnboardingScreen>("welcome");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [workspaceName, setWorkspaceName] = useState("");
  const [careRecipientName, setCareRecipientName] = useState("");

  const handleStart = () => {
    setError(null);
    setScreen("create");
  };

  const handleBackToWelcome = () => {
    setError(null);
    setScreen("welcome");
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedWsName = workspaceName.trim();
    const trimmedCrName = careRecipientName.trim();

    if (!trimmedWsName) {
      setError("Please give your care workspace a name.");
      return;
    }
    if (!trimmedCrName) {
      setError("Please enter your care recipient's preferred name.");
      return;
    }

    setLoading(true);

    try {
      const timezone =
        typeof Intl !== "undefined" && Intl.DateTimeFormat
          ? Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"
          : "America/New_York";

      const res = await createWorkspaceAction({
        name: trimmedWsName,
        careRecipientPreferredName: trimmedCrName,
        timezone,
      });

      if (!res?.success) {
        setError(res?.error || "Failed to create workspace. Please try again.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setScreen("ready");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      );
      setLoading(false);
    }
  };

  const handleGoToToday = () => {
    router.push("/today");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* App Branding */}
        <div className="flex items-center justify-center space-x-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <span className="font-bold text-content text-lg">
            Family Care
          </span>
        </div>

        {/* Card Container */}
        <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* SCREEN 1: Welcome */}
          {screen === "welcome" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-content tracking-tight">
                  Let’s get your care space ready.
                </h1>
                <p className="text-base text-content-muted leading-relaxed">
                  Family Care keeps your family’s care responsibilities, schedule, information, and updates together in one private workspace.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleStart}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6"
                >
                  <span>Get started</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* SCREEN 2: Create Workspace */}
          {screen === "create" && (
            <form onSubmit={handleCreateWorkspace} className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-content tracking-tight">
                  Who are you caring for?
                </h1>
                <p className="text-sm text-content-muted">
                  You can change these details later.
                </p>
              </div>

              <div className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="workspace-name">Workspace name</Label>
                  <Input
                    id="workspace-name"
                    name="workspaceName"
                    placeholder="e.g. Care for Mom"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="care-recipient-name">Care recipient preferred name</Label>
                  <Input
                    id="care-recipient-name"
                    name="careRecipientPreferredName"
                    placeholder="e.g. Mom"
                    value={careRecipientName}
                    onChange={(e) => setCareRecipientName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleBackToWelcome}
                  disabled={loading}
                  className="flex items-center space-x-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex items-center space-x-1"
                >
                  <span>{loading ? "Creating workspace..." : "Create workspace"}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </form>
          )}

          {/* SCREEN 3: Ready */}
          {screen === "ready" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-content tracking-tight">
                  You’re ready to care together.
                </h1>
                <p className="text-base font-medium text-content">
                  Your family’s care workspace is ready for {careRecipientName || "your loved one"}.
                </p>
                <p className="text-sm text-content-muted leading-relaxed">
                  Add tasks, appointments, medications, documents, notes, or caregivers whenever you need them.
                </p>
              </div>

              <div className="pt-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleGoToToday}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6"
                >
                  <span>Go to Today</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
