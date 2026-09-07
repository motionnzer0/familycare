"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Heart,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit2,
  FileText,
  Shield,
  Pill,
  ArrowRight,
  Info,
} from "lucide-react";
import { CareRecipient, Workspace, Role } from "@/lib/types";
import { CareProfileEditModal } from "./CareProfileEditModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CareProfileViewProps {
  workspace: Workspace;
  careRecipient: CareRecipient | null;
  userRole: Role;
}

export function CareProfileView({
  workspace,
  careRecipient,
  userRole,
}: CareProfileViewProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);

  const canEdit = userRole === "owner" || userRole === "coordinator";
  const preferredName = careRecipient?.preferred_name || "Mom";

  // Calculate age if birth date is present
  const calculateAge = (birthDateStr: string | null | undefined): number | null => {
    if (!birthDateStr) return null;
    const birth = new Date(birthDateStr);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const age = calculateAge(careRecipient?.birth_date);

  const formatAddress = () => {
    if (!careRecipient) return "No address entered";
    const parts = [
      careRecipient.address_line1,
      careRecipient.address_line2,
      [careRecipient.city, careRecipient.state].filter(Boolean).join(", "),
      careRecipient.postal_code,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join("\n") : "No address specified yet";
  };

  return (
    <div className="space-y-6 max-w-reading pb-32 sm:pb-12">
      {/* 1. Header & Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
              About {preferredName}
            </h1>
            <Badge variant="secondary" className="text-xs font-semibold bg-brand-light/30 text-brand border-brand/20">
              Care Profile
            </Badge>
          </div>
          <p className="text-sm text-content-muted mt-0.5">
            Basic identity, contact details, and care context for {preferredName}.
          </p>
        </div>

        {canEdit && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setEditModalOpen(true)}
            className="flex items-center space-x-1.5 self-start sm:self-auto min-h-touch"
          >
            <Edit2 className="h-4 w-4" />
            <span>Edit Profile</span>
          </Button>
        )}
      </div>

      {/* 2. Identity & Contact Information Card */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center space-x-2 font-bold text-content">
            <User className="h-4 w-4 text-brand" />
            <span>Identity &amp; Contact Basics</span>
          </CardTitle>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="h-7 text-xs text-brand"
            >
              Edit
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preferred Name */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
                Preferred Name
              </span>
              <p className="text-base font-bold text-content">{preferredName}</p>
            </div>

            {/* Legal Name */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
                Legal Name
              </span>
              <p className="text-sm font-medium text-content">
                {careRecipient?.legal_name || "Not specified"}
              </p>
            </div>

            {/* Date of Birth & Age */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
                Date of Birth
              </span>
              <p className="text-sm font-medium text-content flex items-center space-x-1.5">
                <Calendar className="h-3.5 w-3.5 text-content-subtle" />
                <span>
                  {careRecipient?.birth_date ? (
                    <>
                      {careRecipient.birth_date}
                      {age !== null && <span className="text-content-muted"> ({age} years old)</span>}
                    </>
                  ) : (
                    "Not specified"
                  )}
                </span>
              </p>
            </div>

            {/* Primary Phone */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
                Primary Phone
              </span>
              <div>
                {careRecipient?.phone ? (
                  <a
                    href={`tel:${careRecipient.phone}`}
                    aria-label={`Call ${preferredName} at ${careRecipient.phone}`}
                    className="inline-flex items-center space-x-1.5 text-sm font-bold text-brand hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>{careRecipient.phone}</span>
                  </a>
                ) : (
                  <p className="text-sm text-content-muted">No phone number entered</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
                Email Address
              </span>
              <div>
                {careRecipient?.email ? (
                  <a
                    href={`mailto:${careRecipient.email}`}
                    className="inline-flex items-center space-x-1.5 text-sm font-medium text-brand hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>{careRecipient.email}</span>
                  </a>
                ) : (
                  <p className="text-sm text-content-muted">No email address entered</p>
                )}
              </div>
            </div>

            {/* Workspace Link */}
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-content-muted">
                Workspace
              </span>
              <p className="text-sm font-medium text-content">{workspace.name}</p>
            </div>
          </div>

          {/* Address Section */}
          <div className="pt-2 border-t border-border space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-content-muted flex items-center space-x-1.5">
              <MapPin className="h-3.5 w-3.5 text-brand" />
              <span>Primary Home Address</span>
            </span>
            <p className="text-sm font-medium text-content whitespace-pre-line leading-relaxed">
              {formatAddress()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 3. Care Preferences & Baseline Notes Card */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center space-x-2 font-bold text-content">
            <Heart className="h-4 w-4 text-brand" />
            <span>Care Preferences, Routines &amp; Personal Notes</span>
          </CardTitle>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="h-7 text-xs text-brand"
            >
              Edit
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {careRecipient?.care_context ? (
            <p className="text-sm text-content font-medium leading-relaxed whitespace-pre-wrap">
              {careRecipient.care_context}
            </p>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-content-muted bg-surface-subtle space-y-1">
              <p>No care routines or preferences recorded yet.</p>
              {canEdit && (
                <p className="text-xs text-content-subtle">
                  Record daily schedules, communication preferences, or important habits to keep all caregivers aligned.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Contextual Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Emergency Shortcut */}
        <Link
          href="/emergency"
          className="group flex flex-col justify-between rounded-xl border border-red-200 bg-red-50/50 p-4 sm:p-5 shadow-sm hover:bg-red-50 transition-colors"
        >
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-red-900 font-bold text-base">
              <Shield className="h-5 w-5 text-red-600 shrink-0" />
              <span>Emergency Information</span>
            </div>
            <p className="text-xs text-red-800 leading-relaxed">
              Rapid access to emergency contacts, preferred hospital, allergies, and safety documents.
            </p>
          </div>
          <div className="pt-3 flex items-center text-xs font-bold text-red-700 group-hover:translate-x-0.5 transition-transform">
            <span>Open Emergency Summary</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </Link>

        {/* Medications Shortcut */}
        <Link
          href="/medications"
          className="group flex flex-col justify-between rounded-xl border border-border bg-surface p-4 sm:p-5 shadow-sm hover:bg-surface-subtle transition-colors"
        >
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2 text-content font-bold text-base">
              <Pill className="h-5 w-5 text-brand shrink-0" />
              <span>Medications Reference</span>
            </div>
            <p className="text-xs text-content-muted leading-relaxed">
              Family-entered medication list, dosage schedules, prescriber notes, and review dates.
            </p>
          </div>
          <div className="pt-3 flex items-center text-xs font-bold text-brand group-hover:translate-x-0.5 transition-transform">
            <span>View Medications</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </Link>
      </div>

      {/* Edit Modal */}
      <CareProfileEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        careRecipient={careRecipient}
      />
    </div>
  );
}
