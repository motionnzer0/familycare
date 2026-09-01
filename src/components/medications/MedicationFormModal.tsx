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
import {
  createMedicationAction,
  updateMedicationAction,
} from "@/lib/actions/medications";
import { Medication, MedicationStatus } from "@/lib/types";

interface MedicationFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication?: Medication | null;
}

export function MedicationFormModal({
  open,
  onOpenChange,
  medication,
}: MedicationFormModalProps) {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [frequency, setFrequency] = useState("");
  const [schedule, setSchedule] = useState("");
  const [prescribingProvider, setPrescribingProvider] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<MedicationStatus>("active");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!medication;

  useEffect(() => {
    if (medication) {
      setName(medication.name || "");
      setDosage(medication.dosage || "");
      setInstructions(medication.instructions || "");
      setFrequency(medication.frequency || "");
      setSchedule(medication.schedule || "");
      setPrescribingProvider(medication.prescribing_provider || "");
      setNotes(medication.notes || "");
      setStatus(medication.status || "active");
    } else {
      setName("");
      setDosage("");
      setInstructions("");
      setFrequency("");
      setSchedule("");
      setPrescribingProvider("");
      setNotes("");
      setStatus("active");
    }
    setError(null);
  }, [medication, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a medication name.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isEditing && medication) {
        const res = await updateMedicationAction(medication.id, {
          name: name.trim(),
          dosage: dosage.trim() || null,
          instructions: instructions.trim() || null,
          frequency: frequency.trim() || null,
          schedule: schedule.trim() || null,
          prescribingProvider: prescribingProvider.trim() || null,
          notes: notes.trim() || null,
          status,
        });

        if (!res.success) {
          setError(res.error || "Failed to update medication");
          setLoading(false);
          return;
        }
      } else {
        const res = await createMedicationAction({
          name: name.trim(),
          dosage: dosage.trim() || null,
          instructions: instructions.trim() || null,
          frequency: frequency.trim() || null,
          schedule: schedule.trim() || null,
          prescribingProvider: prescribingProvider.trim() || null,
          notes: notes.trim() || null,
          status,
        });

        if (!res.success) {
          setError(res.error || "Failed to create medication");
          setLoading(false);
          return;
        }
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Medication" : "Add Medication Reference"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="m-name">
              Medication name <span className="text-danger">*</span>
            </Label>
            <Input
              id="m-name"
              placeholder="e.g. Lisinopril, Metformin, Vitamin D3"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="m-dosage">Dosage</Label>
              <Input
                id="m-dosage"
                placeholder="e.g. 10 mg, 500 mcg"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="m-status">Status</Label>
              <select
                id="m-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as MedicationStatus)}
                className="flex h-11 w-full rounded border border-border bg-surface px-3 py-2 text-base text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="m-frequency">Frequency</Label>
              <Input
                id="m-frequency"
                placeholder="e.g. Once daily, Twice daily"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="m-schedule">Schedule / Time</Label>
              <Input
                id="m-schedule"
                placeholder="e.g. Morning with breakfast"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-instructions">Instructions</Label>
            <Input
              id="m-instructions"
              placeholder="e.g. Take with a full glass of water. Do not crush."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-provider">Prescribing Doctor</Label>
            <Input
              id="m-provider"
              placeholder="e.g. Dr. Roberts, Cardiology"
              value={prescribingProvider}
              onChange={(e) => setPrescribingProvider(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="m-notes">Family Notes</Label>
            <textarea
              id="m-notes"
              rows={2}
              placeholder="e.g. Refill at Walgreens Pharmacy. Keep extra supply in cabinet."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex w-full rounded border border-border bg-surface px-3 py-2 text-base text-content placeholder:text-content-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
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
              {loading
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                ? "Save Changes"
                : "Add Medication"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
