"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Heart, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { acceptInvitationAction } from "@/lib/actions/team";

export default function AcceptInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await acceptInvitationAction(token);
      if (!res.success) {
        setError(res.error || "Failed to accept invitation.");
        setLoading(false);
        return;
      }

      router.push("/today");
    } catch {
      setError("An unexpected error occurred. Please ensure you are logged in.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-canvas p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white shadow">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-content">
            Join Family Care Team
          </h1>
          <p className="text-sm text-content-muted">
            You have been invited to collaborate on a family care workspace.
          </p>
        </div>

        {/* Action Container */}
        <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-4">
          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-content leading-relaxed">
            Accepting this invitation will grant you access to coordinate tasks, review calendar appointments, and view shared care reference information.
          </p>

          <Button
            type="button"
            variant="primary"
            className="w-full mt-2 flex items-center justify-center space-x-2"
            disabled={loading}
            onClick={handleAccept}
          >
            <span>{loading ? "Joining Workspace..." : "Accept Invitation & Join"}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
