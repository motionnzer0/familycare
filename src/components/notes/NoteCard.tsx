"use client";

import React, { useTransition } from "react";
import { StickyNote, Edit2, Trash2, Clock, User } from "lucide-react";
import { Note, Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const isAuthor = note.author_id === currentUserId;
  const canEdit =
    userRole === "owner" ||
    userRole === "coordinator" ||
    (userRole === "contributor" && isAuthor);

  const canDelete =
    userRole === "owner" ||
    userRole === "coordinator" ||
    (userRole === "contributor" && isAuthor);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete note "${note.title}"?`)) {
      startTransition(async () => {
        await deleteNoteAction(note.id);
      });
    }
  };

  return (
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
              aria-label="Edit note"
              className="h-7 w-7 text-content-subtle hover:text-content"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              onClick={handleDelete}
              aria-label="Delete note"
              className="h-7 w-7 text-content-subtle hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
