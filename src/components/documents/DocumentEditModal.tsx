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
import { updateDocumentMetadataAction } from "@/lib/actions/documents";
import { DOCUMENT_CATEGORIES } from "@/lib/validations/document";
import { Document } from "@/lib/types";
import { Shield } from "lucide-react";

interface DocumentEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document?: Document | null;
}

export function DocumentEditModal({
  open,
  onOpenChange,
  document,
}: DocumentEditModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<typeof DOCUMENT_CATEGORIES[number]>("Medical");
  const [isEmergencyAccess, setIsEmergencyAccess] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document) {
      setTitle(document.title || "");
      setCategory((document.category as typeof DOCUMENT_CATEGORIES[number]) || "Medical");
      setIsEmergencyAccess(document.is_emergency_access || false);
      setNotes(document.notes || "");
    }
  }, [document, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !document) {
      setError("Please specify a document title.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await updateDocumentMetadataAction(document.id, {
        title: title.trim(),
        category,
        isEmergencyAccess,
        notes: notes.trim() || null,
      });

      if (!res.success) {
        setError(res.error || "Failed to update document metadata");
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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Document Details</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="e-doc-title">
              Document Title <span className="text-danger">*</span>
            </Label>
            <Input
              id="e-doc-title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="e-doc-cat">Category</Label>
            <select
              id="e-doc-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof DOCUMENT_CATEGORIES[number])}
              className="flex h-11 w-full rounded border border-border bg-surface px-3 py-2 text-base text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
            >
              {DOCUMENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="e-doc-notes">Notes</Label>
            <textarea
              id="e-doc-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex w-full rounded border border-border bg-surface px-3 py-2 text-base text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              id="e-doc-emerg"
              type="checkbox"
              checked={isEmergencyAccess}
              onChange={(e) => setIsEmergencyAccess(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-focus"
            />
            <Label htmlFor="e-doc-emerg" className="font-normal text-sm cursor-pointer flex items-center space-x-1">
              <Shield className="h-3.5 w-3.5 text-red-600 mr-1" />
              <span>Mark as Essential for Emergency Access</span>
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
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
