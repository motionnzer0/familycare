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
import { createNoteAction, updateNoteAction } from "@/lib/actions/notes";
import { NOTE_CATEGORIES } from "@/lib/validations/note";
import { Note } from "@/lib/types";

interface NoteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note | null;
}

export function NoteFormModal({
  open,
  onOpenChange,
  note,
}: NoteFormModalProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<typeof NOTE_CATEGORIES[number]>("General");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!note;

  useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setBody(note.body || "");
      setCategory((note.category as typeof NOTE_CATEGORIES[number]) || "General");
    } else {
      setTitle("");
      setBody("");
      setCategory("General");
    }
    setError(null);
  }, [note, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError("Please provide both a title and note content.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isEditing && note) {
        const res = await updateNoteAction(note.id, {
          title: title.trim(),
          body: body.trim(),
          category,
        });

        if (!res.success) {
          setError(res.error || "Failed to update note");
          setLoading(false);
          return;
        }
      } else {
        const res = await createNoteAction({
          title: title.trim(),
          body: body.trim(),
          category,
        });

        if (!res.success) {
          setError(res.error || "Failed to create note");
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Note" : "Create Note"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="n-title">
              Title <span className="text-danger">*</span>
            </Label>
            <Input
              id="n-title"
              placeholder="e.g. Dr. Roberts visit summary, Care notes from weekend"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="n-cat">Category</Label>
            <select
              id="n-cat"
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof NOTE_CATEGORIES[number])}
              className="flex h-11 w-full rounded border border-border bg-surface px-3 py-2 text-base text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
            >
              {NOTE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="n-body">
              Note Content <span className="text-danger">*</span>
            </Label>
            <textarea
              id="n-body"
              rows={6}
              placeholder="Write your observation, update, or notes here..."
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="flex w-full rounded border border-border bg-surface px-3 py-2 text-base text-content placeholder:text-content-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
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
              {loading
                ? isEditing
                  ? "Saving..."
                  : "Saving..."
                : isEditing
                ? "Save Changes"
                : "Create Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
