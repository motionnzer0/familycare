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
import { updateCareRecipientAction } from "@/lib/actions/care";
import { CareRecipient } from "@/lib/types";

interface CareProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  careRecipient: CareRecipient | null;
}

export function CareProfileEditModal({
  open,
  onOpenChange,
  careRecipient,
}: CareProfileEditModalProps) {
  const [preferredName, setPreferredName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [careContext, setCareContext] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (careRecipient) {
      setPreferredName(careRecipient.preferred_name || "");
      setLegalName(careRecipient.legal_name || "");
      setBirthDate(careRecipient.birth_date || "");
      setPhone(careRecipient.phone || "");
      setEmail(careRecipient.email || "");
      setAddressLine1(careRecipient.address_line1 || "");
      setAddressLine2(careRecipient.address_line2 || "");
      setCity(careRecipient.city || "");
      setState(careRecipient.state || "");
      setPostalCode(careRecipient.postal_code || "");
      setCareContext(careRecipient.care_context || "");
    }
    setError(null);
  }, [careRecipient, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!preferredName.trim()) {
      setError("Preferred name is required.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await updateCareRecipientAction({
        preferredName: preferredName.trim(),
        legalName: legalName.trim() || null,
        birthDate: birthDate || null,
        phone: phone.trim() || null,
        email: email.trim() || null,
        addressLine1: addressLine1.trim() || null,
        addressLine2: addressLine2.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        postalCode: postalCode.trim() || null,
        careContext: careContext.trim() || null,
      });

      if (!res.success) {
        setError(res.error || "Failed to update care profile");
        setLoading(false);
        return;
      }

      onOpenChange(false);
    } catch {
      setError("An unexpected error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Care Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cp-pref-name">
                Preferred Name <span className="text-danger">*</span>
              </Label>
              <Input
                id="cp-pref-name"
                placeholder="e.g. Mom, Eleanor"
                required
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cp-legal-name">Full Legal Name</Label>
              <Input
                id="cp-legal-name"
                placeholder="e.g. Eleanor Vance"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cp-birth-date">Date of Birth</Label>
              <Input
                id="cp-birth-date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cp-phone">Primary Phone</Label>
              <Input
                id="cp-phone"
                type="tel"
                placeholder="e.g. (555) 012-3456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cp-email">Email Address</Label>
            <Input
              id="cp-email"
              type="email"
              placeholder="e.g. eleanor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Address */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-content-muted">
              Home Address &amp; Living Arrangement
            </h4>

            <div className="space-y-1.5">
              <Label htmlFor="cp-addr1">Street Address</Label>
              <Input
                id="cp-addr1"
                placeholder="e.g. 742 Evergreen Terrace"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cp-addr2">Apartment / Unit / Room</Label>
              <Input
                id="cp-addr2"
                placeholder="e.g. Apt 3B, Senior Living Wing"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="cp-city">City</Label>
                <Input
                  id="cp-city"
                  placeholder="Springfield"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="cp-state">State</Label>
                <Input
                  id="cp-state"
                  placeholder="IL"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div className="space-y-1.5 col-span-1">
                <Label htmlFor="cp-zip">ZIP</Label>
                <Input
                  id="cp-zip"
                  placeholder="62701"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Care Context & Preferences */}
          <div className="space-y-1.5 pt-1">
            <Label htmlFor="cp-context">
              Care Preferences, Routines &amp; Personal Notes
            </Label>
            <textarea
              id="cp-context"
              rows={4}
              placeholder="e.g. Prefers morning walks before 10 AM. Hard of hearing on left side. Likes black tea with breakfast. Front gate code is 1234."
              value={careContext}
              onChange={(e) => setCareContext(e.target.value)}
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
