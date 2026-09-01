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
import { createDocumentMetadataAction } from "@/lib/actions/documents";
import { DOCUMENT_CATEGORIES } from "@/lib/validations/document";
import { UploadCloud, Shield } from "lucide-react";

interface DocumentUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentUploadModal({
  open,
  onOpenChange,
}: DocumentUploadModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<typeof DOCUMENT_CATEGORIES[number]>("Medical");
  const [file, setFile] = useState<File | null>(null);
  const [isEmergencyAccess, setIsEmergencyAccess] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 25 * 1024 * 1024) {
        setError("File exceeds maximum allowed size of 25MB.");
        setFile(null);
        return;
      }
      setFile(selected);
      if (!title) {
        // Default title to file name without extension
        setTitle(selected.name.replace(/\.[^/.]+$/, ""));
      }
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !file) {
      setError("Please select a file and specify a document title.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // In Slice 2, storage uploads create metadata and store the file path reference
      const filePath = `uploads/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      const res = await createDocumentMetadataAction({
        title: title.trim(),
        category,
        filePath,
        fileSize: file.size,
        mimeType: file.type || "application/octet-stream",
        isEmergencyAccess,
        notes: notes.trim() || null,
      });

      if (!res.success) {
        setError(res.error || "Failed to record document");
        setLoading(false);
        return;
      }

      setTitle("");
      setFile(null);
      setNotes("");
      setIsEmergencyAccess(false);
      onOpenChange(false);
    } catch {
      setError("An unexpected error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Upload Document</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="doc-file">
              Select File <span className="text-danger">* (Max 25MB)</span>
            </Label>
            <Input
              id="doc-file"
              type="file"
              required
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-title">
              Document Title <span className="text-danger">*</span>
            </Label>
            <Input
              id="doc-title"
              placeholder="e.g. Healthcare Proxy, Medicare Card Front/Back"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="doc-cat">Category</Label>
            <select
              id="doc-cat"
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
            <Label htmlFor="doc-notes">Notes (optional)</Label>
            <textarea
              id="doc-notes"
              rows={2}
              placeholder="e.g. Signed on Aug 15, 2025. Original copy in filing cabinet."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex w-full rounded border border-border bg-surface px-3 py-2 text-base text-content placeholder:text-content-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              id="doc-emerg"
              type="checkbox"
              checked={isEmergencyAccess}
              onChange={(e) => setIsEmergencyAccess(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-focus"
            />
            <Label htmlFor="doc-emerg" className="font-normal text-sm cursor-pointer flex items-center space-x-1">
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
            <Button type="submit" variant="primary" disabled={loading || !file}>
              {loading ? "Uploading..." : "Save Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
