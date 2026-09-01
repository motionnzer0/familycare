import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { getWorkspaceNotes } from "@/lib/actions/notes";
import { getCurrentUser } from "@/lib/actions/auth";
import { NoteList } from "@/components/notes/NoteList";

export default async function NotesPage() {
  const context = await getActiveWorkspaceContext();
  const user = await getCurrentUser();

  if (!context || !user) {
    return null;
  }

  const notes = await getWorkspaceNotes(context.workspace.id);

  return (
    <NoteList
      initialNotes={notes}
      userRole={context.userRole}
      currentUserId={user.id}
      careRecipientName={context.careRecipient?.preferred_name || "Mom"}
      timezone={context.workspace.timezone}
    />
  );
}
