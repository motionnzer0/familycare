"use client";

import React, { useState } from "react";
import { Plus, Pill, AlertCircle, Info } from "lucide-react";
import { Medication, Role } from "@/lib/types";
import { MedicationItem } from "./MedicationItem";
import { MedicationFormModal } from "./MedicationFormModal";
import { Button } from "@/components/ui/button";

interface MedicationListProps {
  initialMedications: Medication[];
  userRole: Role;
  careRecipientName?: string;
}

export function MedicationList({
  initialMedications,
  userRole,
  careRecipientName = "Mom",
}: MedicationListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);
  const [filter, setFilter] = useState<"active" | "all">("active");

  const activeMeds = initialMedications.filter((m) => m.status === "active");
  const otherMeds = initialMedications.filter((m) => m.status !== "active");

  const displayedList = filter === "active" ? activeMeds : initialMedications;

  const handleCreate = () => {
    setSelectedMed(null);
    setModalOpen(true);
  };

  const handleEdit = (med: Medication) => {
    setSelectedMed(med);
    setModalOpen(true);
  };

  const canEdit = userRole === "owner" || userRole === "coordinator";

  return (
    <div className="space-y-6 max-w-reading">
      {/* Top Non-Clinical Notice */}
      <div className="rounded-lg border border-border bg-surface-subtle p-3.5 text-xs text-content-muted flex items-start space-x-2.5">
        <Info className="h-4 w-4 text-brand shrink-0 mt-0.5" />
        <p>
          This list is maintained as an organizational reference by your family. Confirm all dosages, schedules, and prescription instructions with a licensed healthcare professional.
        </p>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
            Medications
          </h1>
          <p className="text-base text-content-muted mt-0.5">
            Active prescriptions and daily supplements for {careRecipientName}.
          </p>
        </div>

        {canEdit && (
          <Button
            variant="primary"
            onClick={handleCreate}
            className="flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Add Medication</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-border pb-2 text-sm font-medium">
        <button
          onClick={() => setFilter("active")}
          className={`px-3 py-1.5 rounded transition-colors ${
            filter === "active"
              ? "bg-slate-900 text-white font-semibold"
              : "text-content-muted hover:text-content"
          }`}
        >
          Active ({activeMeds.length})
        </button>
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded transition-colors ${
            filter === "all"
              ? "bg-slate-900 text-white font-semibold"
              : "text-content-muted hover:text-content"
          }`}
        >
          All ({initialMedications.length})
        </button>
      </div>

      {/* Medication Cards */}
      <div className="space-y-3">
        {displayedList.map((med) => (
          <MedicationItem
            key={med.id}
            medication={med}
            userRole={userRole}
            onEdit={handleEdit}
          />
        ))}

        {displayedList.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center space-y-3 bg-surface-subtle">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-slate-200 text-content-muted">
              <Pill className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-content">No medications recorded</p>
              <p className="text-sm text-content-muted">
                Keep an up-to-date reference list of prescriptions and supplements for your family team.
              </p>
            </div>
            {canEdit && (
              <Button variant="secondary" size="sm" onClick={handleCreate}>
                Add first medication
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <MedicationFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        medication={selectedMed}
      />
    </div>
  );
}
