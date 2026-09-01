# Family Care Command Center — Database Architecture

**Document status:** Initial database design  
**Owner:** Antigravity  
**Decision authority:** Human Product Owner for product-visible changes  
**Last updated:** September 1, 2026

## 1. Design Principles

| Principle | Rule |
|---|---|
| **Workspace-scoped** | Every content table has a `workspace_id` foreign key. Every query is filtered by workspace. RLS enforces this at the database level. |
| **Soft delete default (OQ-05)** | User-created records use a `deleted_at` timestamp. Queries filter `deleted_at IS NULL`. Workspace deletion immediately revokes access and triggers a 30-day permanent purge countdown. |
| **Data export (OQ-05)** | Supports structured JSON workspace export and ZIP document archive generation before workspace purge. |
| **UTC storage** | All timestamps stored as `timestamptz` (UTC). Workspace timezone used for display and date-boundary calculations only. |
| **Append-only timeline** | Timeline events are immutable. No UPDATE or DELETE on the `timeline_events` table by application users. |
| **Historical attribution** | When members are removed, historical records (notes, tasks, audit entries) retain attribution to their display name snapshot. |
| **Minimal required fields** | Only fields the product spec marks as required are `NOT NULL`. Optional fields are nullable to support progressive disclosure. |

## 2. Entity Relationship Overview

```text
auth.users (Supabase Auth)
    │
    ├── 1:N ── workspace_members ── N:1 ── workspaces
    │                                         │
    │                                         ├── 1:1 ── care_recipients
    │                                         ├── 1:1 ── emergency_info
    │                                         ├── 1:N ── tasks
    │                                         ├── 1:N ── appointments
    │                                         ├── 1:N ── medications
    │                                         ├── 1:N ── documents
    │                                         ├── 1:N ── notes
    │                                         ├── 1:N ── timeline_events
    │                                         └── 1:N ── invitations
    │
    └── 1:N ── emergency_contacts ── N:1 ── emergency_info
```

## 3. Table Definitions

### 3.1 workspaces

The root tenant entity. One workspace per care recipient.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `name` | `text` | NOT NULL | Workspace display name |
| `timezone` | `text` | NOT NULL, default `'America/New_York'` | IANA timezone identifier |
| `owner_id` | `uuid` | NOT NULL, FK → `auth.users(id)` | Current workspace owner |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | |
| `deleted_at` | `timestamptz` | nullable | Soft delete |

### 3.2 workspace_members

Join table linking users to workspaces with roles.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `workspace_id` | `uuid` | NOT NULL, FK → `workspaces(id)` | |
| `user_id` | `uuid` | NOT NULL, FK → `auth.users(id)` | |
| `role` | `text` | NOT NULL, CHECK IN (`owner`, `coordinator`, `contributor`, `viewer`) | Product role |
| `relationship_label` | `text` | nullable | e.g., "Daughter", "Neighbor" |
| `display_name` | `text` | nullable | Name shown in workspace context |
| `status` | `text` | NOT NULL, default `'active'`, CHECK IN (`active`, `removed`) | |
| `joined_at` | `timestamptz` | NOT NULL, default `now()` | |
| `removed_at` | `timestamptz` | nullable | When access was revoked |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | |

**Indexes:**
- UNIQUE (`workspace_id`, `user_id`) WHERE `status = 'active'`
- INDEX on `user_id` (find user's workspaces)

### 3.3 invitations

Tracks pending workspace invitations.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `workspace_id` | `uuid` | NOT NULL, FK → `workspaces(id)` | |
| `invited_by` | `uuid` | NOT NULL, FK → `auth.users(id)` | |
| `email` | `text` | NOT NULL | Invitee email |
| `role` | `text` | NOT NULL, CHECK IN (`coordinator`, `contributor`, `viewer`) | Intended role |
| `name` | `text` | nullable | Invitee display name |
| `relationship_label` | `text` | nullable | |
| `token` | `text` | NOT NULL, UNIQUE | Secure invitation token |
| `status` | `text` | NOT NULL, default `'pending'`, CHECK IN (`pending`, `accepted`, `cancelled`, `expired`) | |
| `expires_at` | `timestamptz` | NOT NULL | Token expiration |
| `accepted_at` | `timestamptz` | nullable | |
| `cancelled_at` | `timestamptz` | nullable | |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |

**Indexes:**
- UNIQUE on `token`
- INDEX on `email`
- INDEX on (`workspace_id`, `status`)

### 3.4 care_recipients

One care recipient per workspace.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `workspace_id` | `uuid` | NOT NULL, UNIQUE, FK → `workspaces(id)` | 1:1 relationship |
| `preferred_name` | `text` | NOT NULL | Required by product spec |
| `legal_name` | `text` | nullable | |
| `photo_path` | `text` | nullable | Storage path for photo |
| `birth_date` | `date` | nullable | |
| `phone` | `text` | nullable | |
| `email` | `text` | nullable | |
| `address_line1` | `text` | nullable | |
| `address_line2` | `text` | nullable | |
| `city` | `text` | nullable | |
| `state` | `text` | nullable | |
| `postal_code` | `text` | nullable | |
| `care_context` | `text` | nullable | Free-text care preferences/summary |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | |

### 3.5 tasks

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `workspace_id` | `uuid` | NOT NULL, FK → `workspaces(id)` | |
| `title` | `text` | NOT NULL | |
| `description` | `text` | nullable | |
| `assignee_id` | `uuid` | nullable, FK → `auth.users(id)` | NULL = Unassigned |
| `due_date` | `date` | nullable | Date-only; timezone evaluation uses workspace tz |
| `due_time` | `time` | nullable | Optional time component |
| `status` | `text` | NOT NULL, default `'open'`, CHECK IN (`open`, `completed`) | |
| `completed_by` | `uuid` | nullable, FK → `auth.users(id)` | Who completed it |
| `completed_at` | `timestamptz` | nullable | When completed |
| `created_by` | `uuid` | NOT NULL, FK → `auth.users(id)` | |
| `related_appointment_id` | `uuid` | nullable, FK → `appointments(id)` | Contextual link |
| `related_document_id` | `uuid` | nullable, FK → `documents(id)` | Contextual link |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | |
| `deleted_at` | `timestamptz` | nullable | Soft delete |

**Indexes:**
- INDEX on (`workspace_id`, `status`, `due_date`) — dashboard queries
- INDEX on (`workspace_id`, `assignee_id`) — assignment filtering
- INDEX on `workspace_id` WHERE `deleted_at IS NULL` — active tasks

### 3.6 appointments

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `workspace_id` | `uuid` | NOT NULL, FK → `workspaces(id)` | |
| `title` | `text` | NOT NULL | Title or reason |
| `date` | `date` | NOT NULL | Appointment date |
| `start_time` | `time` | nullable | "Time not set" when null |
| `end_time` | `time` | nullable | |
| `location` | `text` | nullable | Physical location or mode |
| `provider_contact` | `text` | nullable | Provider/contact free text |
| `attendees` | `text` | nullable | Free text attendee list |
| `details` | `text` | nullable | Additional notes |
| `status` | `text` | NOT NULL, default `'scheduled'`, CHECK IN (`scheduled`, `completed`, `cancelled`) | |
| `related_task_id` | `uuid` | nullable, FK → `tasks(id)` | Preparation task link |
| `related_document_id` | `uuid` | nullable, FK → `documents(id)` | Related document link |
| `created_by` | `uuid` | NOT NULL, FK → `auth.users(id)` | |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | |
| `deleted_at` | `timestamptz` | nullable | Soft delete |

**Indexes:**
- INDEX on (`workspace_id`, `date`) — calendar and dashboard queries
- INDEX on (`workspace_id`, `status`)

### 3.7 medications

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `workspace_id` | `uuid` | NOT NULL, FK → `workspaces(id)` | |
| `name` | `text` | NOT NULL | Medication name (only required field) |
| `form_strength` | `text` | nullable | Form/strength free text |
| `instructions` | `text` | nullable | Instructions or schedule free text |
| `prescriber_pharmacy` | `text` | nullable | Prescriber/pharmacy free text |
| `note` | `text` | nullable | |
| `status` | `text` | NOT NULL, default `'active'`, CHECK IN (`active`, `archived`) | |
| `last_reviewed_at` | `timestamptz` | nullable | Family-managed review date |
| `last_reviewed_by` | `uuid` | nullable, FK → `auth.users(id)` | |
| `created_by` | `uuid` | NOT NULL, FK → `auth.users(id)` | |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | |
| `deleted_at` | `timestamptz` | nullable | Soft delete |

**Indexes:**
- INDEX on (`workspace_id`, `status`)

### 3.8 documents

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `workspace_id` | `uuid` | NOT NULL, FK → `workspaces(id)` | |
| `title` | `text` | NOT NULL | Defaults to filename, editable |
| `file_path` | `text` | NOT NULL | Supabase Storage path |
| `file_name` | `text` | NOT NULL | Original filename |
| `file_size` | `bigint` | NOT NULL | File size in bytes |
| `mime_type` | `text` | NOT NULL | Detected MIME type |
| `category` | `text` | nullable, CHECK IN (`medical_insurance`, `legal_financial`, `care_plan`, `identification`, `other`) | |
| `document_date` | `date` | nullable | User-entered document date |
| `note` | `text` | nullable | |
| `availability` | `text` | NOT NULL, default `'available'`, CHECK IN (`processing`, `available`, `unavailable`, `error`) | |
| `uploaded_by` | `uuid` | NOT NULL, FK → `auth.users(id)` | |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | |
| `deleted_at` | `timestamptz` | nullable | Soft delete |

**Indexes:**
- INDEX on (`workspace_id`, `category`)
- INDEX on (`workspace_id`, `created_at` DESC) — newest-first default

### 3.9 notes

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `workspace_id` | `uuid` | NOT NULL, FK → `workspaces(id)` | |
| `title` | `text` | nullable | Optional title |
| `body` | `text` | NOT NULL | Note content |
| `author_id` | `uuid` | NOT NULL, FK → `auth.users(id)` | |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | |
| `deleted_at` | `timestamptz` | nullable | Soft delete |

**Indexes:**
- INDEX on (`workspace_id`, `created_at` DESC) — newest-first default

### 3.10 emergency_info

One record per workspace. Stores structured emergency reference information (approved via D-23 / OQ-07: Option A). Strictly family-entered reference data with no public link or QR code in V1.

Approved safety copy banner: *"For an emergency, call 911 or local emergency services immediately. This workspace is a shared family reference tool and does not provide emergency response, medical dispatch, or clinical advice."*

Approved field preamble: *"All details below are entered and maintained by your family. Confirm medical questions with a healthcare professional."*

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `workspace_id` | `uuid` | NOT NULL, UNIQUE, FK → `workspaces(id)` | 1:1 relationship |
| `preferred_hospital` | `text` | nullable | Preferred hospital or facility text |
| `allergies_conditions` | `text` | nullable | Family-entered allergies and conditions text |
| `insurance_info` | `text` | nullable | Family-entered insurance reference text |
| `additional_notes` | `text` | nullable | Additional free-text reference notes |
| `last_reviewed_at` | `timestamptz` | nullable | Timestamp when family last reviewed details |
| `last_reviewed_by` | `uuid` | nullable, FK → `auth.users(id)` | |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | |

### 3.11 emergency_contacts

Structured emergency contacts, ordered with primary contact first.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `emergency_info_id` | `uuid` | NOT NULL, FK → `emergency_info(id)` ON DELETE CASCADE | |
| `workspace_id` | `uuid` | NOT NULL, FK → `workspaces(id)` | Denormalized for RLS |
| `name` | `text` | NOT NULL | Contact name |
| `phone` | `text` | NOT NULL | Phone number (supports `tel:` click-to-call) |
| `relationship` | `text` | nullable | e.g., "Primary Physician", "Daughter" |
| `is_primary` | `boolean` | NOT NULL, default `false` | Primary emergency contact flag |
| `sort_order` | `integer` | NOT NULL, default `0` | Display ordering |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | |

### 3.12 emergency_document_links

Links emergency info to existing documents in the workspace.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `emergency_info_id` | `uuid` | NOT NULL, FK → `emergency_info(id)` ON DELETE CASCADE | |
| `document_id` | `uuid` | NOT NULL, FK → `documents(id)` ON DELETE CASCADE | |
| PK | composite | (`emergency_info_id`, `document_id`) | |

### 3.13 timeline_events

Append-only, immutable activity log.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | |
| `workspace_id` | `uuid` | NOT NULL, FK → `workspaces(id)` | |
| `actor_id` | `uuid` | NOT NULL, FK → `auth.users(id)` | Who performed the action |
| `action` | `text` | NOT NULL | Verb: `created`, `updated`, `completed`, `reopened`, `assigned`, `cancelled`, `archived`, `uploaded`, `removed`, `invited`, `accepted_invite`, `reviewed` |
| `target_type` | `text` | NOT NULL | Entity type: `task`, `appointment`, `medication`, `document`, `note`, `emergency_info`, `care_recipient`, `workspace_member` |
| `target_id` | `uuid` | NOT NULL | ID of the affected record |
| `target_title` | `text` | nullable | Snapshot of the record title at event time |
| `metadata` | `jsonb` | nullable | Additional context (e.g., `{"previous_assignee": "...", "new_assignee": "..."}`) |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | Event timestamp |

**Indexes:**
- INDEX on (`workspace_id`, `created_at` DESC) — newest-first timeline view
- INDEX on (`workspace_id`, `target_type`, `created_at` DESC) — filtered timeline
- INDEX on (`workspace_id`, `actor_id`, `created_at` DESC) — actor-filtered timeline

**Constraints:**
- No UPDATE trigger or permission for application users
- No DELETE trigger or permission for application users

### 3.14 user_profiles

Extended profile information for workspace display. Supplements Supabase Auth's `auth.users`.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `uuid` | PK, FK → `auth.users(id)` | Same as auth user ID |
| `full_name` | `text` | nullable | |
| `avatar_path` | `text` | nullable | Storage path |
| `created_at` | `timestamptz` | NOT NULL, default `now()` | |
| `updated_at` | `timestamptz` | NOT NULL, default `now()` | |

## 4. Row Level Security Strategy

Every table with workspace-scoped data has RLS policies that enforce:

1. **SELECT:** Active workspace members with any valid role (`owner`, `coordinator`, `contributor`, `viewer`) can read workspace records where `deleted_at IS NULL`.
2. **INSERT:**
   - Tasks: `owner`, `coordinator`, `contributor`
   - Appointments: `owner`, `coordinator`
   - Medications: `owner`, `coordinator`
   - Documents: `owner`, `coordinator`, `contributor`
   - Notes: `owner`, `coordinator`, `contributor`
   - Emergency Info & Contacts: `owner`, `coordinator`
   - Care Profile: `owner`, `coordinator`
   - Timeline Events: Server-side service-role only
3. **UPDATE:**
   - Care records, Medications, Emergency Info: `owner`, `coordinator`
   - Tasks: `owner`, `coordinator`, or `contributor` (updating own created task or completing assigned/unassigned task)
   - Documents: `owner`, `coordinator`, or `contributor` (editing metadata for own uploaded file)
   - Notes: `owner`, `coordinator`, or `contributor` (editing own authored note)
4. **DELETE:** Prohibited for application users. Updates set `deleted_at = now()` (soft delete).

Example RLS policy pattern:

```sql
-- SELECT: Members can read active workspace data
CREATE POLICY "workspace_members_select" ON tasks
  FOR SELECT USING (
    deleted_at IS NULL
    AND workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND status = 'active'
    )
  );

-- INSERT: Owners, coordinators, and contributors can create tasks
CREATE POLICY "tasks_insert" ON tasks
  FOR INSERT WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
      AND status = 'active'
      AND role IN ('owner', 'coordinator', 'contributor')
    )
  );
```

Timeline events have a special INSERT-only policy:

```sql
-- INSERT: Only via server-side functions (service role)
-- SELECT: Members can read workspace timeline
-- UPDATE/DELETE: Denied to all application users
```

## 5. Migration Strategy

Migrations are managed via the Supabase CLI (`supabase migration new`, `supabase db push`). Each migration is a numbered SQL file in `supabase/migrations/`.

Migration naming convention: `YYYYMMDDHHMMSS_description.sql`

Migrations must be:
- Idempotent where possible
- Backward-compatible during deployment windows
- Reviewed before applying to production

## 6. Data Lifecycle (Approved via D-21 / OQ-05)

| Record Type | Deletion / Mutation Behavior | Retention & Export Policy |
|---|---|---|
| **Workspace** | Soft delete (`deleted_at = now()`); immediately revokes all member access | Retained in soft-deleted state for **30 days** before permanent automated purge. Export available prior to purge. |
| **Task** | Soft delete (`deleted_at = now()`) | Retained in database; excluded from active views; exportable in structured JSON archive. |
| **Appointment** | Soft delete (`deleted_at = now()`) or status changed to `cancelled` | Retained in database; exportable in structured JSON archive. |
| **Medication** | Archived (`status = 'archived'`) or soft delete (`deleted_at = now()`) | Retained in database; exportable in structured JSON archive. |
| **Document** | Soft delete (`deleted_at = now()`); storage file quarantined/unlinked | Retained in database and Supabase Storage; included in ZIP export archive. |
| **Note** | Soft delete (`deleted_at = now()`) | Retained in database; exportable in structured JSON archive. |
| **Timeline Event** | Never deleted; immutable append-only log | Permanent history; included in structured JSON export archive. |
| **Member** | Status changed to `removed`; `removed_at = now()` | Access revoked immediately. Authored historical records (tasks, notes, audit trail) retain original display name snapshot. |
| **Data Export** | Triggered by Owner/Coordinator in Settings | Generates a structured **JSON file** (profile, tasks, appointments, meds, notes, emergency info, timeline) and a **ZIP archive** of all document files. |

## 7. Dashboard Query Strategy

The Today dashboard requires an efficient summary query. Rather than loading all workspace data:

```sql
-- Pseudocode for dashboard data
1. Overdue tasks: status='open', due_date < CURRENT_DATE(tz), LIMIT 20
2. Today tasks: status='open', due_date = CURRENT_DATE(tz)
3. Today appointments: date = CURRENT_DATE(tz), status='scheduled'
4. Upcoming (7 days): date BETWEEN tomorrow AND +7 days
5. Recent events: ORDER BY created_at DESC LIMIT 5
6. Quick reference counts: medications(active), documents(available), members(active)
```

These can be combined into a single server component that makes parallel queries, or into a database function for efficiency.
