"use client";

import React, { useState } from "react";
import { Plus, FileText, FolderOpen } from "lucide-react";
import { Document, Role } from "@/lib/types";
import { DocumentItem } from "./DocumentItem";
import { DocumentUploadModal } from "./DocumentUploadModal";
import { DocumentEditModal } from "./DocumentEditModal";
import { Button } from "@/components/ui/button";
import { DOCUMENT_CATEGORIES } from "@/lib/validations/document";

interface DocumentListProps {
  initialDocuments: Document[];
  userRole: Role;
  currentUserId: string;
  careRecipientName?: string;
  timezone?: string;
}

export function DocumentList({
  initialDocuments,
  userRole,
  currentUserId,
  careRecipientName = "Mom",
  timezone = "America/New_York",
}: DocumentListProps) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...DOCUMENT_CATEGORIES];

  const displayedList =
    activeCategory === "All"
      ? initialDocuments
      : initialDocuments.filter((d) => d.category === activeCategory);

  const handleEdit = (doc: Document) => {
    setSelectedDoc(doc);
    setEditModalOpen(true);
  };

  const canUpload = userRole !== "viewer";

  return (
    <div className="space-y-6 max-w-reading">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
            Documents
          </h1>
          <p className="text-base text-content-muted mt-0.5">
            Private medical records, insurance cards, and legal documents for {careRecipientName}.
          </p>
        </div>

        {canUpload && (
          <Button
            variant="primary"
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Upload Document</span>
          </Button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3 text-sm font-medium">
        {categories.map((cat) => {
          const count =
            cat === "All"
              ? initialDocuments.length
              : initialDocuments.filter((d) => d.category === cat).length;

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

      {/* Document List */}
      <div className="space-y-3">
        {displayedList.map((doc) => (
          <DocumentItem
            key={doc.id}
            doc={doc}
            userRole={userRole}
            currentUserId={currentUserId}
            timezone={timezone}
            onEdit={handleEdit}
          />
        ))}

        {displayedList.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center space-y-3 bg-surface-subtle">
            <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-slate-200 text-content-muted">
              <FolderOpen className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-content">No documents in this category</p>
              <p className="text-sm text-content-muted">
                Upload insurance cards, power of attorney, or recent clinic summaries.
              </p>
            </div>
            {canUpload && (
              <Button variant="secondary" size="sm" onClick={() => setUploadModalOpen(true)}>
                Upload a document
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <DocumentUploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
      />
      <DocumentEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        document={selectedDoc}
      />
    </div>
  );
}
