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
  addEmergencyContactAction,
  updateEmergencyContactAction,
} from "@/lib/actions/emergency";
import { EmergencyContact } from "@/lib/types";

interface EmergencyContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContact?: EmergencyContact | null;
}

export function EmergencyContactModal({
  open,
  onOpenChange,
  initialContact,
}: EmergencyContactModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialContact) {
      setName(initialContact.name || "");
      setPhone(initialContact.phone || "");
      setRelationship(initialContact.relationship || "");
      setIsPrimary(initialContact.is_primary || false);
    } else {
      setName("");
      setPhone("");
      setRelationship("");
      setIsPrimary(false);
    }
    setError(null);
  }, [initialContact, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Please provide both contact name and phone number.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (initialContact) {
        const res = await updateEmergencyContactAction(initialContact.id, {
          name: name.trim(),
          phone: phone.trim(),
          relationship: relationship.trim() || null,
          isPrimary,
          sortOrder: isPrimary ? 0 : initialContact.sort_order || 1,
        });

        if (!res.success) {
          setError(res.error || "Failed to update emergency contact");
          setLoading(false);
          return;
        }
      } else {
        const res = await addEmergencyContactAction({
          name: name.trim(),
          phone: phone.trim(),
          relationship: relationship.trim() || null,
          isPrimary,
          sortOrder: isPrimary ? 0 : 1,
        });

        if (!res.success) {
          setError(res.error || "Failed to add emergency contact");
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
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {initialContact ? "Edit Emergency Contact" : "Add Emergency Contact"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="c-name">
              Contact Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="c-name"
              placeholder="e.g. Dr. Roberts, Primary Care"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c-phone">
              Phone Number <span className="text-danger">*</span>
            </Label>
            <Input
              id="c-phone"
              type="tel"
              placeholder="e.g. (555) 123-4567"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c-rel">Relationship or Role</Label>
            <Input
              id="c-rel"
              placeholder="e.g. Cardiologist, Eldest Daughter, Neighbor"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              id="c-primary"
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="h-4 w-4 rounded border-border text-brand focus:ring-focus"
            />
            <Label htmlFor="c-primary" className="font-normal text-sm cursor-pointer">
              Set as Primary Emergency Contact
            </Label>
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
                ? "Saving..."
                : initialContact
                ? "Save Contact"
                : "Add Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
