// Family Care Command Center — Role-Based Permission Checker
// Reference: /docs/PERMISSIONS.md and /docs/DECISIONS.md (D-17)

import { Role, PermissionAction, Resource } from "@/lib/types";

export interface PermissionContext {
  isOwner?: boolean;
  isCreator?: boolean;
  isAssignee?: boolean;
  isUnassigned?: boolean;
}

export function checkPermission(
  userRole: Role,
  resource: Resource,
  action: PermissionAction,
  context?: PermissionContext
): boolean {
  // Viewer: Read-only across all V1 categories
  if (userRole === "viewer") {
    return action === "read";
  }

  // Owner: Full administrative and CRUD authority
  if (userRole === "owner") {
    return true;
  }

  // Coordinator: Full CRUD on care records; cannot transfer ownership, delete workspace, or remove members
  if (userRole === "coordinator") {
    if (resource === "workspace" && (action === "delete" || action === "assign")) {
      return false;
    }
    if (resource === "member" && (action === "delete" || action === "update")) {
      return false;
    }
    return true;
  }

  // Contributor: Read all; Write own notes/tasks/doc uploads; Complete own/unassigned tasks
  if (userRole === "contributor") {
    if (action === "read") {
      return true;
    }
    if (resource === "note") {
      return action === "create" || (action === "update" && !!context?.isCreator);
    }
    if (resource === "document") {
      return action === "upload" || (action === "update" && !!context?.isCreator);
    }
    if (resource === "task") {
      if (action === "create") return true;
      if (action === "update" && !!context?.isCreator) return true;
      if (action === "complete" && (!!context?.isAssignee || !!context?.isUnassigned)) return true;
    }
    return false;
  }

  return false;
}
