"use client";

import React, { useState, useEffect } from "react";
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
import { updateEmergencyInfoAction } from "@/lib/actions/emergency";
import { EmergencyInfo } from "@/lib/types";

interface EmergencyInfoEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialInfo?: EmergencyInfo | null;
}

export function EmergencyInfoEditModal({
  open,
  onOpenChange,
  initialInfo,
}: EmergencyInfoEditModalProps) {
  const [preferredHospital, setPreferredHospital] = useState("");
  const [allergiesConditions, setAllergiesConditions] = useState("");
  const [insuranceInfo, setInsuranceInfo] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialInfo) {
      setPreferredHospital(initialInfo.preferred_hospital || "");
      setAllergiesConditions(initialInfo.allergies_conditions || "");
      setInsuranceInfo(initialInfo.insurance_info || "");
      setAdditionalNotes(initialInfo.additional_notes || "");
    }
  }, [initialInfo, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await updateEmergencyInfoAction({
        preferredHospital: preferredHospital.trim() || null,
        allergiesConditions: allergiesConditions.trim() || null,
        insuranceInfo: insuranceInfo.trim() || null,
        additionalNotes: additionalNotes.trim() || null,
      });

      if (!res.success) {
        setError(res.error || "Failed to update emergency details");
        setLoading(false);
        return;
      }

      onOpenChange(false);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Emergency Reference</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="e-hospital">Preferred Hospital / Emergency Room</Label>
            <Input
              id="e-hospital"
              placeholder="e.g. St. Mary's Medical Center, Downtown Campus"
              value={preferredHospital}
              onChange={(e) => setPreferredHospital(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="e-allergies">
              Known Allergies &amp; Key Conditions (Reference Only)
            </Label>
            <textarea
              id="e-allergies"
              rows={3}
              placeholder="e.g. Penicillin allergy (severe), Type 2 Diabetes, Pacemaker installed 2022"
              value={allergiesConditions}
              onChange={(e) => setAllergiesConditions(e.target.value)}
              className="flex w-full rounded border border-border bg-surface px-3 py-2 text-base text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="e-insurance">Insurance Policy Reference</Label>
            <textarea
              id="e-insurance"
              rows={2}
              placeholder="e.g. Medicare Part A & B: #123-45-678A, Supplemental Blue Cross Plan F"
              value={insuranceInfo}
              onChange={(e) => setInsuranceInfo(e.target.value)}
              className="flex w-full rounded border border-border bg-surface px-3 py-2 text-base text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="e-notes">Access Notes &amp; Key Location</Label>
            <textarea
              id="e-notes"
              rows={2}
              placeholder="e.g. Lockbox code 4821 by front door. Medical power of attorney document in red folder."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="flex w-full rounded border border-border bg-surface px-3 py-2 text-base text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Save Details"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
