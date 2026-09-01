"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, ArrowRight, ArrowLeft, Check, Plus, AlertCircle, Shield, UserPlus, CheckSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { completeOnboardingAction } from "@/lib/actions/onboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [workspaceName, setWorkspaceName] = useState("");
  const [careRecipientName, setCareRecipientName] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRel, setEmergencyRel] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [apptTitle, setApptTitle] = useState("");
  const [apptDate, setApptDate] = useState("");

  const handleNext = () => {
    setError(null);
    if (step === 1 && !workspaceName.trim()) {
      setError("Please give your care workspace a name.");
      return;
    }
    if (step === 2 && !careRecipientName.trim()) {
      setError("Please enter the name your family uses for the care recipient.");
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const handleFinish = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await completeOnboardingAction({
        workspaceName: workspaceName.trim(),
        careRecipientPreferredName: careRecipientName.trim(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York",
        emergencyContact:
          emergencyName && emergencyPhone
            ? {
                name: emergencyName.trim(),
                phone: emergencyPhone.trim(),
                relationship: emergencyRel.trim() || null,
              }
            : null,
        initialTask: taskTitle ? { title: taskTitle.trim(), dueDate: taskDueDate || null } : null,
        initialAppointment:
          apptTitle && apptDate
            ? { title: apptTitle.trim(), date: apptDate, startTime: null }
            : null,
      });

      if (!res?.success) {
        setError(res?.error || "Failed to complete setup.");
        setLoading(false);
      }
    } catch {
      // In Server Action redirect throws error which Next.js handles
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas p-4 sm:p-6">
      <div className="w-full max-w-lg space-y-6">
        {/* Progress Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white shadow-sm">
              <Heart className="h-4 w-4 fill-current" />
            </div>
            <span className="font-bold text-content text-sm sm:text-base">
              Workspace Setup
            </span>
          </div>
          <span className="text-xs font-semibold text-content-subtle">
            Step {step} of 7
          </span>
        </div>

        {/* Card Container */}
        <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6">
          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* STEP 1: Workspace Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-content">
                  Name your care workspace
                </h2>
                <p className="text-sm text-content-muted">
                  Choose a clear name for this family coordination hub.
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="ws-name">Workspace name</Label>
                <Input
                  id="ws-name"
                  placeholder="e.g. Care for Mom, Miller Family Care"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* STEP 2: Care Recipient Preferred Name */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-content">
                  Who is receiving care?
                </h2>
                <p className="text-sm text-content-muted">
                  What preferred name does your family call them?
                </p>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="cr-name">Preferred name</Label>
                <Input
                  id="cr-name"
                  placeholder="e.g. Mom, Dad, Eleanor, Grandma"
                  value={careRecipientName}
                  onChange={(e) => setCareRecipientName(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* STEP 3: Emergency Contact (Decision) */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-content flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-red-700" />
                  <span>Primary Emergency Contact</span>
                </h2>
                <p className="text-sm text-content-muted">
                  Add one key contact now so it is immediately reachable in an emergency.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="em-name">Contact name</Label>
                  <Input
                    id="em-name"
                    placeholder="e.g. Dr. Roberts or Sarah Miller"
                    value={emergencyName}
                    onChange={(e) => setEmergencyName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="em-phone">Phone number</Label>
                  <Input
                    id="em-phone"
                    type="tel"
                    placeholder="e.g. (555) 012-3456"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="em-rel">Relationship (optional)</Label>
                  <Input
                    id="em-rel"
                    placeholder="e.g. Primary Physician, Daughter"
                    value={emergencyRel}
                    onChange={(e) => setEmergencyRel(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Care Team Invitation Decision */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-content flex items-center space-x-2">
                  <UserPlus className="h-5 w-5 text-brand" />
                  <span>Care Team Circle</span>
                </h2>
                <p className="text-sm text-content-muted">
                  You can invite siblings, helpers, or relatives at any time from the Care Team tab.
                </p>
              </div>

              <div className="rounded-lg bg-surface-subtle p-4 border border-border space-y-2">
                <p className="text-sm font-semibold text-content">
                  You are the Workspace Owner
                </p>
                <p className="text-xs text-content-muted">
                  You have full administrative authority. You can invite other family members once your workspace is ready.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: First Task */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-content flex items-center space-x-2">
                  <CheckSquare className="h-5 w-5 text-brand" />
                  <span>Add your first task</span>
                </h2>
                <p className="text-sm text-content-muted">
                  What is one care responsibility that needs attention?
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="init-task">Task title (optional)</Label>
                  <Input
                    id="init-task"
                    placeholder="e.g. Call Dr. Miller to request prescription refill"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="init-task-due">Due date</Label>
                  <Input
                    id="init-task-due"
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: First Appointment */}
          {step === 6 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-content flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-brand" />
                  <span>Add an upcoming appointment</span>
                </h2>
                <p className="text-sm text-content-muted">
                  Does {careRecipientName || "your loved one"} have an upcoming visit or appointment scheduled?
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="init-appt">Appointment title (optional)</Label>
                  <Input
                    id="init-appt"
                    placeholder="e.g. Physical Therapy session"
                    value={apptTitle}
                    onChange={(e) => setApptTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="init-appt-date">Date</Label>
                  <Input
                    id="init-appt-date"
                    type="date"
                    value={apptDate}
                    onChange={(e) => setApptDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Ready */}
          {step === 7 && (
            <div className="space-y-4 text-center py-2">
              <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <Check className="h-6 w-6 stroke-[3]" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-content">
                  You&apos;re all set!
                </h2>
                <p className="text-sm text-content-muted max-w-sm mx-auto">
                  Your workspace for <strong>{careRecipientName || "your parent"}</strong> is ready. Let&apos;s go to your Today dashboard.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            {step > 1 ? (
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={loading}
                className="flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            ) : (
              <div />
            )}

            {step < 7 ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
                className="flex items-center space-x-1"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                onClick={handleFinish}
                disabled={loading}
                className="flex items-center space-x-1"
              >
                <span>{loading ? "Preparing Workspace..." : "Go to Dashboard"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
