# Family Care Command Center — Permission Model

**Document status:** Initial permission design  
**Owner:** Antigravity + Product Owner  
**Decision authority:** Human Product Owner for role behavior changes  
**Last updated:** September 1, 2026

## 1. Authority Boundary

This document defines the **technical implementation** of the role-based access model. The product intent for each role is defined in `PRODUCT_SPEC.md` and approved in `DECISIONS.md` (D-17 / OQ-02: Option A — Full Read / Tiered Write). This document translates that decision into enforceable rules across database RLS, server actions, and UI rendering.

## 2. Role Definitions

| Role | Product Intent | Technical Scope |
|---|---|---|
| **Owner** | Establishes and maintains the workspace. Full administrative authority. | All CRUD operations. Member management. Settings. Ownership transfer initiation. Workspace deletion. |
| **Coordinator** | Helps organize information and work across the care team. | All CRUD on care records (tasks, appointments, meds, docs, emergency, notes, profile). Can invite members (if Owner permits). Cannot transfer ownership or delete workspace. |
| **Contributor** | Completes assigned work and adds coordination context. | Read access to all V1 categories (Emergency, Medications, Documents, Profile, Notes, Timeline, Tasks, Appointments). Create/edit own notes. Upload documents and edit metadata for own uploads. Create/complete own or unassigned tasks. No edit rights for Care Profile, Medications, or Emergency Information. |
| **Viewer** | Needs awareness without editing capability. | Read-only access across all V1 categories. Zero create, edit, complete, delete, or membership actions. |

## 3. Permission Matrix

### 3.1 Workspace & Membership

| Action | Owner | Coordinator | Contributor | Viewer |
|---|---|---|---|---|
| View workspace info | ✅ | ✅ | ✅ | ✅ |
| Edit workspace name | ✅ | ❌ | ❌ | ❌ |
| Edit workspace timezone | ✅ | ❌ | ❌ | ❌ |
| Invite member | ✅ | ✅* | ❌ | ❌ |
| Cancel invitation | ✅ | ✅* | ❌ | ❌ |
| Remove member | ✅ | ❌ | ❌ | ❌ |
| Change member role | ✅ | ❌ | ❌ | ❌ |
| Initiate ownership transfer | ✅ | ❌ | ❌ | ❌ |
| Delete workspace | ✅ | ❌ | ❌ | ❌ |

*\*Coordinator invitation rights may be controlled by an Owner setting (future refinement).*

### 3.2 Care Recipient Profile

| Action | Owner | Coordinator | Contributor | Viewer |
|---|---|---|---|---|
| View profile | ✅ | ✅ | ✅ | ✅ |
| Edit profile fields | ✅ | ✅ | ❌ | ❌ |
| Upload/change photo | ✅ | ✅ | ❌ | ❌ |

### 3.3 Tasks

| Action | Owner | Coordinator | Contributor | Viewer |
|---|---|---|---|---|
| View all tasks | ✅ | ✅ | ✅ | ✅ |
| Create task | ✅ | ✅ | ✅ | ❌ |
| Edit any task | ✅ | ✅ | ❌ | ❌ |
| Edit own created task | ✅ | ✅ | ✅ | ❌ |
| Assign/reassign task | ✅ | ✅ | ❌ | ❌ |
| Complete any task | ✅ | ✅ | ❌ | ❌ |
| Complete assigned-to-self task | ✅ | ✅ | ✅ | ❌ |
| Complete unassigned task | ✅ | ✅ | ✅ | ❌ |
| Reopen task | ✅ | ✅ | ❌ | ❌ |
| Delete task | ✅ | ✅ | ❌ | ❌ |

### 3.4 Appointments

| Action | Owner | Coordinator | Contributor | Viewer |
|---|---|---|---|---|
| View appointments | ✅ | ✅ | ✅ | ✅ |
| Create appointment | ✅ | ✅ | ❌ | ❌ |
| Edit appointment | ✅ | ✅ | ❌ | ❌ |
| Cancel appointment | ✅ | ✅ | ❌ | ❌ |
| Mark completed | ✅ | ✅ | ❌ | ❌ |

### 3.5 Medications
 
| Action | Owner | Coordinator | Contributor | Viewer |
|---|---|---|---|---|
| View medications | ✅ | ✅ | ✅ | ✅ |
| Add medication | ✅ | ✅ | ❌ | ❌ |
| Edit medication | ✅ | ✅ | ❌ | ❌ |
| Archive medication | ✅ | ✅ | ❌ | ❌ |
| Mark reviewed | ✅ | ✅ | ❌ | ❌ |

### 3.6 Documents

| Action | Owner | Coordinator | Contributor | Viewer |
|---|---|---|---|---|
| View documents | ✅ | ✅ | ✅ | ✅ |
| Upload document | ✅ | ✅ | ✅ | ❌ |
| Edit document metadata | ✅ | ✅ | Own only | ❌ |
| Download/view document | ✅ | ✅ | ✅ | ✅ |
| Delete document | ✅ | ✅ | ❌ | ❌ |

### 3.7 Notes

| Action | Owner | Coordinator | Contributor | Viewer |
|---|---|---|---|---|
| View notes | ✅ | ✅ | ✅ | ✅ |
| Create note | ✅ | ✅ | ✅ | ❌ |
| Edit own note | ✅ | ✅ | ✅ | ❌ |
| Edit any note | ✅ | ✅ | ❌ | ❌ |
| Delete note | ✅ | ✅ | ❌ | ❌ |

### 3.8 Emergency Information

| Action | Owner | Coordinator | Contributor | Viewer |
|---|---|---|---|---|
| View emergency info | ✅ | ✅ | ✅ | ✅ |
| Edit emergency info | ✅ | ✅ | ❌ | ❌ |
| Add/edit emergency contacts | ✅ | ✅ | ❌ | ❌ |
| Mark reviewed | ✅ | ✅ | ❌ | ❌ |

### 3.9 Timeline & Updates

| Action | Owner | Coordinator | Contributor | Viewer |
|---|---|---|---|---|
| View timeline | ✅ | ✅ | ✅ | ✅ |
| View notes | ✅ | ✅ | ✅ | ✅ |

Timeline events are system-generated and cannot be created, edited, or deleted by any user through the application.

## 4. Enforcement Layers

Permissions are enforced at three layers:

### Layer 1: Database (RLS Policies)
- **Primary enforcement.** PostgreSQL Row Level Security policies check the user's workspace membership and role on every query.
- Cross-workspace access is impossible regardless of application bugs.
- Role-based write restrictions are enforced in RLS INSERT/UPDATE policies.

### Layer 2: Server (Application Logic)
- Server Actions check permissions before executing mutations via a `checkPermission(userId, workspaceId, requiredRole, action)` function.
- Returns typed errors that the UI can translate into appropriate messages.
- Provides granular checks beyond what RLS can express (e.g., "can complete only own assigned tasks or unassigned tasks", "can edit only own document metadata").

### Layer 3: Client (UI Rendering)
- UI hides controls the user cannot use (e.g., no Edit button for Viewers or Contributors on Medications).
- This is a UX convenience, not a security boundary.
- Direct URL access to restricted actions returns a clear permission error, not a 404.

```text
Client (hide controls) → Server Action (check permission) → Database (RLS enforces)
        UX only              Application logic              Security boundary
```

## 5. Permission Check Implementation

```typescript
type Role = 'owner' | 'coordinator' | 'contributor' | 'viewer';
type Action = 'create' | 'read' | 'update' | 'delete' | 'complete' | 'assign' | 'invite' | 'upload' | 'archive' | 'review';
type Resource = 'task' | 'appointment' | 'medication' | 'document' | 'note' | 'emergency' | 'member' | 'workspace' | 'care_recipient';

interface PermissionContext {
  isOwner?: boolean;
  isCreator?: boolean;
  isAssignee?: boolean;
  isUnassigned?: boolean;
}

function checkPermission(
  userRole: Role,
  resource: Resource,
  action: Action,
  context?: PermissionContext
): boolean {
  // Viewer: read only on all resources
  if (userRole === 'viewer') {
    return action === 'read';
  }

  // Owner: full access
  if (userRole === 'owner') {
    return true;
  }

  // Coordinator: full access except workspace ownership transfer and deletion
  if (userRole === 'coordinator') {
    if (resource === 'workspace' && (action === 'delete' || action === 'assign')) {
      return false;
    }
    return true;
  }

  // Contributor: Read all; Write own notes/tasks/doc uploads; Complete own/unassigned tasks
  if (userRole === 'contributor') {
    if (action === 'read') return true;
    if (resource === 'note' && (action === 'create' || (action === 'update' && context?.isCreator))) return true;
    if (resource === 'document' && (action === 'upload' || (action === 'update' && context?.isCreator))) return true;
    if (resource === 'task') {
      if (action === 'create') return true;
      if (action === 'update' && context?.isCreator) return true;
      if (action === 'complete' && (context?.isAssignee || context?.isUnassigned)) return true;
    }
    return false;
  }

  return false;
}
```

## 6. Member Lifecycle Permissions

| Event | Who Can Trigger | Post-Event Behavior |
|---|---|---|
| Invite sent | Owner, Coordinator* | Invitation appears as Pending in Care Team |
| Invitation accepted | Invitee | Member becomes Active; timeline event |
| Invitation cancelled | Owner, original inviter | Token invalidated; invitee cannot accept |
| Invitation expired | System | Token invalidated after expiry period |
| Role changed | Owner | Immediate effect; timeline event |
| Member removed | Owner | Immediate access revocation; tasks show "Needs reassignment"; timeline event; historical authorship preserved |
| Ownership transferred | Owner (initiator) + new Owner (acceptor) | Previous owner becomes Coordinator; timeline event |

## 7. Edge Cases

| Scenario | Behavior |
|---|---|
| Removed member's assigned tasks | Tasks retain the assignment record but show "Needs reassignment" state. Authorized users can reassign. |
| Removed member's authored notes/documents | Historical authored records remain attributed to the original member name snapshot. |
| User accesses workspace after removal | Session invalidated; clear "Access is no longer available" message. No workspace content visible. |
| Viewer navigates to edit URL directly | Server Action returns permission error; UI displays "This action is not available for your access level." |
| Contributor tries to assign a task | Assignment control is not rendered. Direct API call returns permission error. |
| Last Owner tries to leave | Cannot leave without transferring ownership or deleting workspace. |
| Concurrent role change during action | Server checks role at execution time, not at page load time. Stale UI may show controls that are rejected server-side. |

## 8. Resolution Status

All role permission ambiguities (OQ-02) have been resolved via Product Owner approval of Option A (Full Read / Tiered Write). The permission model is finalized for V1 implementation.
