"use client";

import React, { useState } from "react";
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
import { addEmergencyContactAction } from "@/lib/actions/emergency";

interface EmergencyContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmergencyContactModal({
  open,
  onOpenChange,
}: EmergencyContactModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError("Please provide both name and phone number.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
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

      setName("");
      setPhone("");
      setRelationship("");
      setIsPrimary(false);
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
          <DialogTitle className="text-xl">Add Emergency Contact</DialogTitle>
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
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-focus"
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
              {loading ? "Adding..." : "Add Contact"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
