"use client";

import React, { useState, useTransition } from "react";
import { StickyNote, Edit2, Trash2, Clock, User, AlertCircle } from "lucide-react";
import { Note, Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { deleteNoteAction } from "@/lib/actions/notes";
import { formatInWorkspaceTz } from "@/lib/timezone";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: Note;
  userRole: Role;
  currentUserId: string;
  timezone?: string;
  onEdit?: (note: Note) => void;
}

export function NoteCard({
  note,
  userRole,
  currentUserId,
  timezone = "America/New_York",
  onEdit,
}: NoteCardProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthor = note.author_id === currentUserId;
  const canEdit =
    userRole === "owner" ||
    userRole === "coordinator" ||
    (userRole === "contributor" && isAuthor);

  // D-17 & PERMISSIONS.md: Only Owner and Coordinator can delete notes
  const canDelete = userRole === "owner" || userRole === "coordinator";

  const handleDeleteConfirm = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteNoteAction(note.id);
      if (!res.success) {
        setError(res.error || "Failed to delete note");
      } else {
        setConfirmOpen(false);
      }
    });
  };

  return (
    <>
      <div
        className="group flex flex-col justify-between rounded-lg border border-border bg-surface p-4 sm:p-5 transition-all hover:border-slate-300 hover:shadow-sm gap-3"
        onClick={() => onEdit && canEdit && onEdit(note)}
      >
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold text-content leading-snug">
              {note.title}
            </h3>
            <Badge variant="secondary" className="text-xs shrink-0">
              {note.category}
            </Badge>
          </div>

          <p className="text-sm text-content leading-relaxed whitespace-pre-wrap line-clamp-6">
            {note.body}
          </p>

          {error && (
            <div className="flex items-center justify-between text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2.5 py-1.5 mt-2">
              <div className="flex items-center space-x-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setError(null);
                }}
                className="ml-2 font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Footer & Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-content-muted">
          <div className="flex items-center space-x-2">
            <Clock className="h-3.5 w-3.5 text-content-subtle" />
            <span>{formatInWorkspaceTz(note.created_at, timezone, "MMM d, yyyy")}</span>
          </div>

          <div className="flex items-center space-x-1">
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit && onEdit(note);
                }}
                aria-label={`Edit note: ${note.title}`}
                className="min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] sm:h-7 sm:w-7 text-content-subtle hover:text-content"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}

            {canDelete && (
              <div className="flex items-center sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmOpen(true);
                  }}
                  aria-label={`Delete note: ${note.title}`}
                  className="min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] sm:h-7 sm:w-7 text-content-subtle hover:text-danger focus-visible:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Note"
        description={`Are you sure you want to delete "${note.title}"? This note will be removed from your workspace.`}
        confirmLabel="Delete Note"
        variant="danger"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
