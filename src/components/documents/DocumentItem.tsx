"use client";

import React, { useTransition, useState } from "react";
import {
  FileText,
  Download,
  Shield,
  Trash2,
  Edit2,
  AlertCircle,
} from "lucide-react";
import { Document, Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  deleteDocumentAction,
  getDocumentSignedUrlAction,
} from "@/lib/actions/documents";
import { formatInWorkspaceTz } from "@/lib/timezone";
import { cn } from "@/lib/utils";

interface DocumentItemProps {
  doc: Document;
  userRole: Role;
  currentUserId: string;
  timezone?: string;
  onEdit?: (doc: Document) => void;
}

export function DocumentItem({
  doc,
  userRole,
  currentUserId,
  timezone = "America/New_York",
  onEdit,
}: DocumentItemProps) {
  const [isPending, startTransition] = useTransition();
  const [downloading, setDownloading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUploader = doc.uploaded_by === currentUserId;
  const canDelete = userRole === "owner" || userRole === "coordinator";
  const canEdit = canDelete || (userRole === "contributor" && isUploader);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = async () => {
    setError(null);
    setDownloading(true);
    try {
      const res = await getDocumentSignedUrlAction(doc.id);
      if (res.success && res.data?.signedUrl) {
        window.open(res.data.signedUrl, "_blank");
      } else {
        setError(res.error || "Failed to generate download link");
      }
    } catch {
      setError("An unexpected error occurred while downloading");
    } finally {
      setDownloading(false);
    }
  };

  const handleDeleteConfirm = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteDocumentAction(doc.id);
      if (!res.success) {
        setError(res.error || "Failed to delete document");
      } else {
        setConfirmOpen(false);
      }
    });
  };

  return (
    <>
      <div className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-lg border border-border bg-surface p-4 transition-all hover:border-slate-300 hover:shadow-sm gap-3">
        {/* Left: Document Icon & Details */}
        <div className="flex items-start space-x-3 min-w-0">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-brand mt-0.5">
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base font-bold text-content leading-snug break-words">
                {doc.title}
              </span>

              <Badge variant="secondary" className="text-xs font-semibold">
                {doc.category}
              </Badge>

              {doc.is_emergency_access && (
                <Badge variant="overdue" className="text-xs flex items-center space-x-1">
                  <Shield className="h-3 w-3 mr-0.5" />
                  <span>Emergency Access</span>
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted">
              <span>{formatFileSize(doc.file_size)}</span>
              <span>•</span>
              <span>Uploaded {formatInWorkspaceTz(doc.created_at, timezone, "MMM d, yyyy")}</span>
              {doc.notes && (
                <>
                  <span>•</span>
                  <span className="italic truncate max-w-[200px]">{doc.notes}</span>
                </>
              )}
            </div>

            {error && (
              <div className="flex items-center justify-between text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2.5 py-1.5 mt-2">
                <div className="flex items-center space-x-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="ml-2 font-bold hover:underline"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={downloading}
            onClick={handleDownload}
            className="min-h-[44px] sm:min-h-[32px] h-auto sm:h-8 px-2.5 text-xs font-semibold flex items-center space-x-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{downloading ? "Opening..." : "Download"}</span>
          </Button>

          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit && onEdit(doc)}
              className="min-h-[44px] sm:min-h-[32px] h-auto sm:h-8 px-2 text-xs text-content-muted hover:text-content"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          )}

          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmOpen(true);
              }}
              aria-label={`Delete document: ${doc.title}`}
              className="min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] sm:h-8 sm:w-8 text-content-subtle hover:text-danger sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Document"
        description={`Are you sure you want to delete "${doc.title}"? This action cannot be undone.`}
        confirmLabel="Delete Document"
        variant="danger"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
