"use client";

import React, { useState, useTransition } from "react";
import { Pill, Clock, User, Trash2, Edit2, AlertCircle } from "lucide-react";
import { Medication, Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteMedicationAction } from "@/lib/actions/medications";
import { cn } from "@/lib/utils";

interface MedicationItemProps {
  medication: Medication;
  userRole: Role;
  onEdit?: (med: Medication) => void;
}

export function MedicationItem({
  medication,
  userRole,
  onEdit,
}: MedicationItemProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPaused = medication.status === "paused";
  const isDiscontinued = medication.status === "discontinued";
  const canEdit = userRole === "owner" || userRole === "coordinator";

  const handleDeleteConfirm = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteMedicationAction(medication.id);
      if (!res.success) {
        setError(res.error || "Failed to delete medication");
      } else {
        setConfirmOpen(false);
      }
    });
  };

  return (
    <>
      <div
        className={cn(
          "group flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border bg-surface p-4 transition-all hover:border-slate-300 hover:shadow-sm gap-3",
          isPaused && "bg-amber-50/30 opacity-80",
          isDiscontinued && "bg-slate-50 opacity-60 line-through"
        )}
      >
        {/* Left: Info */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => onEdit && canEdit && onEdit(medication)}
        >
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2">
              <Pill className="h-4 w-4 text-brand shrink-0" />
              <span className="text-base font-bold text-content leading-snug">
                {medication.name}
              </span>
            </div>

            {medication.dosage && (
              <span className="text-sm font-semibold text-content-muted bg-slate-100 px-2 py-0.5 rounded">
                {medication.dosage}
              </span>
            )}

            {/* Status Badge */}
            {isPaused && <Badge variant="warning">Paused</Badge>}
            {isDiscontinued && <Badge variant="cancelled">Discontinued</Badge>}
          </div>

          {/* Instructions & Schedule */}
          {(medication.instructions || medication.frequency || medication.schedule) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted mt-2">
              {medication.frequency && (
                <span className="inline-flex items-center space-x-1 font-semibold text-content">
                  <Clock className="h-3.5 w-3.5 text-brand" />
                  <span>{medication.frequency}</span>
                </span>
              )}
              {medication.schedule && (
                <span className="text-content-subtle">({medication.schedule})</span>
              )}
              {medication.instructions && (
                <span className="text-content">{medication.instructions}</span>
              )}
            </div>
          )}

          {/* Prescriber & Notes */}
          {(medication.prescribing_provider || medication.notes) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted mt-1.5">
              {medication.prescribing_provider && (
                <span className="inline-flex items-center space-x-1">
                  <User className="h-3.5 w-3.5 text-content-subtle" />
                  <span>Prescribed by: {medication.prescribing_provider}</span>
                </span>
              )}
              {medication.notes && (
                <span className="text-content-subtle italic truncate max-w-[280px]">
                  {medication.notes}
                </span>
              )}
            </div>
          )}

          {error && (
            <div className="flex items-center justify-between text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2.5 py-1.5 mt-2">
              <div className="flex items-center space-x-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setError(null);
                }}
                className="ml-2 font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Right: Controls */}
        {canEdit && (
          <div className="flex items-center space-x-1.5 self-end sm:self-center shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit && onEdit(medication)}
              className="min-h-[44px] sm:min-h-[32px] h-auto sm:h-8 px-2 text-xs text-content-muted hover:text-content"
            >
              <Edit2 className="h-3.5 w-3.5 mr-1" />
              <span>Edit</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmOpen(true);
              }}
              aria-label={`Delete medication: ${medication.name}`}
              className="min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] sm:h-8 sm:w-8 text-content-subtle hover:text-danger sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove Medication"
        description={`Are you sure you want to remove "${medication.name}" from your active medication list?`}
        confirmLabel="Remove Medication"
        variant="danger"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
