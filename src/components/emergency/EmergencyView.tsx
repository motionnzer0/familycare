"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
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
  CheckCircle2,
  Download,
  ExternalLink,
} from "lucide-react";
import { EmergencyInfo, EmergencyContact, Document, Role } from "@/lib/types";
import { EmergencyContactModal } from "./EmergencyContactModal";
import { EmergencyInfoEditModal } from "./EmergencyInfoEditModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  deleteEmergencyContactAction,
  markEmergencyReviewedAction,
} from "@/lib/actions/emergency";
import { getDocumentSignedUrlAction } from "@/lib/actions/documents";
import { formatInWorkspaceTz } from "@/lib/timezone";
import {
  EMERGENCY_SAFETY_BANNER_COPY,
  EMERGENCY_SAFETY_BANNER_SUBTEXT,
  EMERGENCY_FIELD_PREAMBLE_COPY,
} from "@/lib/validations/emergency";

interface EmergencyViewProps {
  info: EmergencyInfo | null;
  contacts: EmergencyContact[];
  documents?: Document[];
  reviewerName?: string | null;
  userRole: Role;
  careRecipientName?: string;
  timezone?: string;
}

export function EmergencyView({
  info,
  contacts,
  documents = [],
  reviewerName,
  userRole,
  careRecipientName = "Mom",
  timezone = "America/New_York",
}: EmergencyViewProps) {
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [editInfoOpen, setEditInfoOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [reviewedTimestamp, setReviewedTimestamp] = useState<string | null>(
    info?.last_reviewed_at || null
  );
  const [currentReviewer, setCurrentReviewer] = useState<string | null>(
    reviewerName || null
  );
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);

  const canEdit = userRole === "owner" || userRole === "coordinator";

  const handleOpenAddContact = () => {
    setEditingContact(null);
    setContactModalOpen(true);
  };

  const handleOpenEditContact = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setContactModalOpen(true);
  };

  const handleDeleteContact = (contactId: string, name: string) => {
    if (confirm(`Remove emergency contact "${name}"?`)) {
      startTransition(async () => {
        await deleteEmergencyContactAction(contactId);
      });
    }
  };

  const handleMarkReviewed = () => {
    startTransition(async () => {
      const res = await markEmergencyReviewedAction();
      if (res.success && res.data) {
        setReviewedTimestamp(res.data.lastReviewedAt);
        setCurrentReviewer("You");
      }
    });
  };

  const handleDownloadDoc = async (doc: Document) => {
    setDownloadingDocId(doc.id);
    try {
      const res = await getDocumentSignedUrlAction(doc.id);
      if (res.success && res.data?.signedUrl) {
        window.open(res.data.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        alert("Unable to open document: " + (res.error || "File unavailable"));
      }
    } finally {
      setDownloadingDocId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-reading pb-32 sm:pb-12">
      {/* 1. MANDATORY SAFETY BANNER */}
      <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 sm:p-5 text-red-950 shadow-sm flex items-start space-x-3.5">
        <ShieldAlert className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h2 className="text-base font-bold text-red-950 leading-snug">
            {EMERGENCY_SAFETY_BANNER_COPY}
          </h2>
          <p className="text-sm text-red-900 leading-relaxed">
            {EMERGENCY_SAFETY_BANNER_SUBTEXT}
          </p>
        </div>
      </div>

      {/* 2. Top Header & Page Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
            Emergency Information for {careRecipientName}
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
              className="flex items-center space-x-1.5 min-h-touch"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit Details</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenAddContact}
              className="flex items-center space-x-1.5 min-h-touch"
            >
              <Plus className="h-4 w-4" />
              <span>Add Contact</span>
            </Button>
          </div>
        )}
      </div>

      {/* 3. SECTION 1 — EMERGENCY CONTACTS (FIRST) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-content-muted flex items-center space-x-2">
            <Phone className="h-4 w-4 text-brand" />
            <span>Emergency Contacts ({contacts.length})</span>
          </h2>
          {canEdit && contacts.length > 0 && (
            <button
              onClick={handleOpenAddContact}
              className="text-xs font-bold text-brand hover:underline flex items-center space-x-1 min-h-[32px] px-1"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add another</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {contacts.map((c) => (
            <div
              key={c.id}
              className="relative flex flex-col justify-between rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-sm space-y-3"
            >
              <div className="space-y-1 pr-14">
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  <span className="text-base font-bold text-content">{c.name}</span>
                  {c.is_primary && (
                    <Badge variant="primary" className="text-xs font-bold bg-brand text-white">
                      Primary Contact
                    </Badge>
                  )}
                </div>
                {c.relationship && (
                  <p className="text-xs text-content-muted font-medium">
                    {c.relationship}
                  </p>
                )}
              </div>

              {/* Prominent Native Call Action */}
              <div className="pt-1">
                <a
                  href={`tel:${c.phone}`}
                  aria-label={`Call ${c.name} at ${c.phone}`}
                  className="inline-flex items-center justify-center space-x-2 w-full sm:w-auto rounded-lg bg-brand-light/60 hover:bg-brand-light text-brand px-3.5 py-2 text-sm font-bold transition-colors min-h-touch border border-brand/20"
                >
                  <Phone className="h-4 w-4 shrink-0 stroke-[2.2]" />
                  <span>Call {c.name.split(" ")[0]} ({c.phone})</span>
                </a>
              </div>

              {canEdit && (
                <div className="absolute top-3 right-3 flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEditContact(c)}
                    aria-label={`Edit ${c.name}`}
                    className="h-8 w-8 text-content-subtle hover:text-content"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isPending}
                    onClick={() => handleDeleteContact(c.id, c.name)}
                    aria-label={`Delete ${c.name}`}
                    className="h-8 w-8 text-content-subtle hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}

          {contacts.length === 0 && (
            <div className="sm:col-span-2 rounded-xl border border-dashed border-border p-6 text-center text-sm text-content-muted bg-surface-subtle space-y-2">
              <p>No emergency contacts listed yet.</p>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenAddContact}
                  className="mt-2 min-h-touch"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Primary Emergency Contact
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 4. SECTION 2 — PREFERRED MEDICAL FACILITY */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-content-muted flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-brand" />
          <span>Preferred Hospital &amp; Medical Facility</span>
        </h2>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center space-x-2 font-bold text-content">
              <Building2 className="h-4 w-4 text-brand" />
              <span>Hospital / Emergency Room</span>
            </CardTitle>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditInfoOpen(true)}
                className="h-7 text-xs text-brand"
              >
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-medium text-content whitespace-pre-wrap">
              {info?.preferred_hospital || "Not specified yet"}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* 5. SECTION 3 — FAMILY-ENTERED REFERENCE DETAILS */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-content-muted flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-brand" />
          <span>Family-Entered Reference Details</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Allergies & Conditions */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2 font-bold text-content">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span>Allergies &amp; Key Conditions</span>
              </CardTitle>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditInfoOpen(true)}
                  className="h-7 text-xs text-brand"
                >
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-content whitespace-pre-wrap">
                {info?.allergies_conditions || "None listed"}
              </p>
            </CardContent>
          </Card>

          {/* Insurance */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2 font-bold text-content">
                <FileText className="h-4 w-4 text-brand" />
                <span>Insurance Reference</span>
              </CardTitle>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditInfoOpen(true)}
                  className="h-7 text-xs text-brand"
                >
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-content whitespace-pre-wrap">
                {info?.insurance_info || "No insurance details entered"}
              </p>
            </CardContent>
          </Card>

          {/* Access Notes */}
          <Card className="sm:col-span-2">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2 font-bold text-content">
                <Key className="h-4 w-4 text-brand" />
                <span>Home Access, Keys &amp; Special Notes</span>
              </CardTitle>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditInfoOpen(true)}
                  className="h-7 text-xs text-brand"
                >
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-content whitespace-pre-wrap">
                {info?.additional_notes || "No access notes provided"}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 6. SECTION 4 — LINKED EMERGENCY DOCUMENTS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-content-muted flex items-center space-x-2">
            <FileText className="h-4 w-4 text-brand" />
            <span>Emergency Reference Documents</span>
          </h2>
          <Link
            href="/documents"
            className="text-xs font-bold text-brand hover:underline flex items-center space-x-1"
          >
            <span>All Documents</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface shadow-sm"
              >
                <div className="flex items-center space-x-3 min-w-0 pr-2">
                  <FileText className="h-5 w-5 text-brand shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-content truncate">{doc.title}</p>
                    <p className="text-xs text-content-muted capitalize">
                      {doc.category.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={downloadingDocId === doc.id}
                  onClick={() => handleDownloadDoc(doc)}
                  className="shrink-0 min-h-touch text-xs font-bold flex items-center space-x-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>{downloadingDocId === doc.id ? "Opening..." : "View"}</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-content-muted bg-surface-subtle space-y-1">
            <p>No emergency documents linked yet.</p>
            <p className="text-xs text-content-subtle">
              Upload Advance Directives, POLST, or insurance cards in the{" "}
              <Link href="/documents" className="text-brand font-semibold underline">
                Documents module
              </Link>
              .
            </p>
          </div>
        )}
      </section>

      {/* 7. SECTION 5 — LAST REVIEWED VERIFICATION */}
      <section className="rounded-xl border border-border bg-surface-subtle p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start space-x-3">
          <Clock className="h-5 w-5 text-content-muted shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold text-content">Emergency Details Freshness</h3>
            <p className="text-xs text-content-muted mt-0.5">
              {reviewedTimestamp ? (
                <>
                  Last reviewed on{" "}
                  <span className="font-semibold text-content">
                    {formatInWorkspaceTz(reviewedTimestamp, timezone, "MMMM d, yyyy 'at' h:mm a")}
                  </span>
                  {currentReviewer && <span> by {currentReviewer}</span>}
                </>
              ) : (
                "These emergency details have not yet been marked as reviewed."
              )}
            </p>
          </div>
        </div>

        {canEdit && (
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={handleMarkReviewed}
            className="flex items-center space-x-1.5 self-start sm:self-auto min-h-touch font-semibold text-xs border-border bg-surface hover:bg-surface-subtle"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{isPending ? "Updating..." : "Mark as Reviewed"}</span>
          </Button>
        )}
      </section>

      {/* Modals */}
      <EmergencyContactModal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
        initialContact={editingContact}
      />
      <EmergencyInfoEditModal
        open={editInfoOpen}
        onOpenChange={setEditInfoOpen}
        initialInfo={info}
      />
    </div>
  );
}
