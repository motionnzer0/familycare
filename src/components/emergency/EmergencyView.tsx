"use client";

import React, { useState, useTransition } from "react";
import {
  ShieldAlert,
  Phone,
  Building2,
  AlertCircle,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Key,
} from "lucide-react";
import { EmergencyInfo, EmergencyContact, Role } from "@/lib/types";
import { EmergencyContactModal } from "./EmergencyContactModal";
import { EmergencyInfoEditModal } from "./EmergencyInfoEditModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { deleteEmergencyContactAction } from "@/lib/actions/emergency";
import { formatInWorkspaceTz } from "@/lib/timezone";
import { EMERGENCY_SAFETY_BANNER_COPY, EMERGENCY_FIELD_PREAMBLE_COPY } from "@/lib/validations/emergency";

interface EmergencyViewProps {
  info: EmergencyInfo | null;
  contacts: EmergencyContact[];
  userRole: Role;
  careRecipientName?: string;
  timezone?: string;
}

export function EmergencyView({
  info,
  contacts,
  userRole,
  careRecipientName = "Mom",
  timezone = "America/New_York",
}: EmergencyViewProps) {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const canEdit = userRole === "owner" || userRole === "coordinator";

  const handleDeleteContact = (contactId: string, name: string) => {
    if (confirm(`Remove emergency contact "${name}"?`)) {
      startTransition(async () => {
        await deleteEmergencyContactAction(contactId);
      });
    }
  };

  return (
    <div className="space-y-6 max-w-reading">
      {/* 1. MANDATORY 911 SAFETY BANNER (D-23) */}
      <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4 sm:p-5 text-red-950 shadow-sm flex items-start space-x-3.5">
        <ShieldAlert className="h-7 w-7 text-red-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-red-950 leading-snug">
            Immediate Emergency Warning
          </h2>
          <p className="text-sm text-red-900 font-medium leading-relaxed">
            {EMERGENCY_SAFETY_BANNER_COPY}
          </p>
        </div>
      </div>

      {/* 2. Top Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
            Emergency Information
          </h1>
          <p className="text-sm text-content-muted mt-0.5">
            {EMERGENCY_FIELD_PREAMBLE_COPY}
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditInfoOpen(true)}
              className="flex items-center space-x-1.5"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit Details</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setContactModalOpen(true)}
              className="flex items-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Contact</span>
            </Button>
          </div>
        )}
      </div>

      {/* 3. EMERGENCY CONTACTS SECTION */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-content-muted flex items-center space-x-2">
          <Phone className="h-4 w-4 text-brand" />
          <span>Emergency Contacts ({contacts.length})</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="relative flex flex-col justify-between rounded-lg border border-border bg-surface p-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-content">{c.name}</span>
                  {c.is_primary && (
                    <Badge variant="primary" className="text-xs">
                      Primary Contact
                    </Badge>
                  )}
                </div>
                {c.relationship && (
                  <p className="text-xs text-content-muted font-medium">
                    {c.relationship}
                  </p>
                )}
                <a
                  href={`tel:${c.phone}`}
                  className="inline-flex items-center space-x-1.5 text-base font-bold text-brand hover:underline pt-2"
                >
                  <Phone className="h-4 w-4" />
                  <span>{c.phone}</span>
                </a>
              </div>

              {canEdit && (
                <div className="absolute top-3 right-3 flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => handleDeleteContact(c.id, c.name)}
                    aria-label="Delete contact"
                    className="h-7 w-7 text-content-subtle hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          {contacts.length === 0 && (
            <div className="sm:col-span-2 rounded-lg border border-dashed border-border p-6 text-center text-sm text-content-muted bg-surface-subtle">
              No emergency contacts listed. Add primary physician and family contacts.
            </div>
          )}
        </div>
      </section>

      {/* 4. HOSPITAL & ALLERGIES / CONDITIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Preferred Hospital */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-brand" />
              <span>Preferred Hospital / ER</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-content whitespace-pre-wrap">
              {info?.preferred_hospital || "Not specified"}
            </p>
          </CardContent>
        </Card>

        {/* Known Allergies & Conditions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span>Allergies &amp; Key Conditions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-content whitespace-pre-wrap">
              {info?.allergies_conditions || "None listed"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 5. INSURANCE & ACCESS NOTES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Insurance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <FileText className="h-4 w-4 text-brand" />
              <span>Insurance Reference</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-content whitespace-pre-wrap">
              {info?.insurance_info || "No insurance details entered"}
            </p>
          </CardContent>
        </Card>

        {/* Access Notes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center space-x-2">
              <Key className="h-4 w-4 text-brand" />
              <span>Home Access &amp; Keys</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-content whitespace-pre-wrap">
              {info?.additional_notes || "No access notes provided"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 6. Review Timestamp Footer */}
      {info?.last_reviewed_at && (
        <div className="flex items-center space-x-2 text-xs text-content-subtle pt-2 border-t border-border">
          <Clock className="h-3.5 w-3.5" />
          <span>
            Last reviewed on {formatInWorkspaceTz(info.last_reviewed_at, timezone, "MMMM d, yyyy 'at' h:mm a")}
          </span>
        </div>
      )}

      {/* Modals */}
      <EmergencyContactModal open={contactModalOpen} onOpenChange={setContactModalOpen} />
      <EmergencyInfoEditModal
        open={editInfoOpen}
        onOpenChange={setEditInfoOpen}
        initialInfo={info}
      />
    </div>
  );
}
