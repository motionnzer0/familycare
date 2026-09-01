"use client";

import React, { useState } from "react";
import { Plus, StickyNote } from "lucide-react";
import { Note, Role } from "@/lib/types";
import { NoteCard } from "./NoteCard";
import { NoteFormModal } from "./NoteFormModal";
import { Button } from "@/components/ui/button";
import { NOTE_CATEGORIES } from "@/lib/validations/note";

interface NoteListProps {
  initialNotes: Note[];
  userRole: Role;
  currentUserId: string;
  careRecipientName?: string;
  timezone?: string;
}

export function NoteList({
  initialNotes,
  userRole,
  currentUserId,
  careRecipientName = "Mom",
  timezone = "America/New_York",
}: NoteListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...NOTE_CATEGORIES];

  const displayedList =
    activeCategory === "All"
      ? initialNotes
      : initialNotes.filter((n) => n.category === activeCategory);

  const handleCreate = () => {
    setSelectedNote(null);
    setModalOpen(true);
  };

  const handleEdit = (note: Note) => {
    setSelectedNote(note);
    setModalOpen(true);
  };

  const canCreate = userRole !== "viewer";

  return (
    <div className="space-y-6 max-w-reading">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
            Notes
          </h1>
          <p className="text-base text-content-muted mt-0.5">
            Observations, updates, and family notes for {careRecipientName}.
          </p>
        </div>

        {canCreate && (
          <Button
            variant="primary"
            onClick={handleCreate}
            className="flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Add Note</span>
          </Button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3 text-sm font-medium">
        {categories.map((cat) => {
          const count =
            cat === "All"
              ? initialNotes.length
              : initialNotes.filter((n) => n.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-slate-900 text-white"
                  : "bg-surface text-content-muted hover:bg-surface-subtle border border-border"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Note Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedList.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            userRole={userRole}
            currentUserId={currentUserId}
            timezone={timezone}
            onEdit={handleEdit}
          />
        ))}

        {displayedList.length === 0 && (
          <div className="md:col-span-2 rounded-lg border border-dashed border-border p-8 text-center space-y-3 bg-surface-subtle">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-slate-200 text-content-muted">
              <StickyNote className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-content">No notes in this category</p>
              <p className="text-sm text-content-muted">
                Capture quick observations, caregiver shift updates, or questions for the doctor.
              </p>
            </div>
            {canCreate && (
              <Button variant="secondary" size="sm" onClick={handleCreate}>
                Write a note
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <NoteFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        note={selectedNote}
      />
    </div>
  );
}
