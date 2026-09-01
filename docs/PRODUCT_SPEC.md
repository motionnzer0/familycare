# Family Care Command Center — Product Specification

**Document status:** Final product requirement specification for V1  
**Owner:** Manus AI, Product + UX  
**Audience:** Google Antigravity and Human Product Owner  
**Last updated:** September 1, 2026

## 1. Purpose and Product Contract

Family Care Command Center is a non-clinical coordination workspace for a trusted family/care team organizing care for one aging parent. The V1 contract is that authorized members can reliably understand current responsibilities, upcoming appointments, ownership, changes, and stored reference information in one private place.

The product must not diagnose, triage, prescribe, recommend treatment, calculate medication safety, verify medical information, or imply emergency response capability. All medical, insurance, and emergency details are family-entered reference information. The interface must direct users to local emergency services for an emergency rather than imply the product can provide emergency help.

## 2. Roles, Access Intent, and Lifecycle

### 2.1 Workspace Model

A workspace has one care recipient, one owner, and a small number of invited members. A person may belong to more than one workspace only if Antigravity’s account model supports it without weakening privacy or confusing the active-workspace context; this is a technical constraint to flag, not a V1 product expansion.

| Role | Read access | Create/edit access | Membership access | Prohibited actions |
|---|---|---|---|---|
| **Owner** | All authorized workspace content. | All care, task, appointment, medication, document, note, and emergency content. | Invite, change roles, remove members, initiate ownership transfer, edit settings. | None within the workspace, subject to system policy. |
| **Coordinator** | All authorized workspace content. | All standard records and emergency details. | Invite members only if Owner authorizes this setting; otherwise no membership administration. | Ownership transfer and restricted settings. |
| **Contributor** | All standard workspace content; exact sensitive-category visibility remains subject to OQ-02. | Create notes/documents; create and complete tasks; edit own contributions only unless granted wider access. | No invitations or role changes. | Changing others’ membership, settings, and protected reference content. |
| **Viewer** | Authorized workspace content. | None. | None. | Any create, edit, complete, delete, invite, or membership action. |

The permission matrix is a product intent, not authorization implementation. Before beta, the Product Owner must resolve whether Contributors can see and edit emergency, medication, and document categories. When a member is removed, they immediately lose future access; the Timeline shows an appropriate removal event without exposing unnecessary membership details.

### 2.2 Member States

| State | Meaning | Required experience |
|---|---|---|
| **Invited** | An invitation exists but has not been accepted. | Owner/Coordinator sees invitee, role, invitation date, and resend/cancel actions. Invitee sees a clear invitation purpose and workspace/care-recipient name after account verification. |
| **Active** | The member has accepted and may access authorized content. | Member appears in Care Team with role and current status. |
| **Removed** | Access was revoked. | Removed person cannot access the workspace. Authorized administrators see member history in Care Team; Timeline receives a concise event. |
| **Ownership transfer pending** | The Owner has initiated a deliberate transfer. | Both parties receive an understandable confirmation/recovery path. Exact implementation and eligibility rules remain technical/open. |

## 3. Core Record Types

The following record definitions establish the V1 content model in product terms. Antigravity may design the database, identifiers, validation, and storage model, but the visible behavior must preserve these definitions.

| Record type | Essential fields | Lifecycle / product rules | Timeline behavior |
|---|---|---|---|
| **Care profile** | Preferred name (required); legal name optional; photo optional; birth date optional; contact details optional; address optional; care context/preference summary optional. | Owner/Coordinator edit. Profile completeness is encouraged, never blocked after minimum onboarding. | Created and material profile changes appear as concise events without repeating sensitive field values. |
| **Care-team member** | Name, relationship/role label, email or invitation mechanism, workspace role, state. | Invited, active, removed. Role changes are attributable. | Invitation, acceptance, removal, and role change appear. |
| **Task** | Title (required); assignee (optional but explicit); due date (optional); due time optional; description optional; status; creator; created/updated timestamps. | Open → Completed; may be reopened. Overdue only applies to open tasks with a past due date. Deletion should be avoided in normal use; if offered, confirm and record behavior per retention decision. | Creation, assignment/reassignment, due-date change, completion, reopening, and deletion/cancellation appear. |
| **Appointment** | Title/reason (required); date (required); time optional; end time optional; location or attendance mode optional; provider/contact text optional; attendees optional; details optional; state. | Scheduled → Completed/occurred or Cancelled. Editing past appointments must be clear and attributable. | Creation, material edit, cancellation, and completion/occurrence appear. |
| **Medication reference** | Name (required); form/strength free text optional; instructions/schedule free text optional; prescriber/pharmacy free text optional; note optional; last-reviewed date. | Active → Archived. No dose calculations, interaction logic, refill workflow, adherence tracking, or reminders. | Creation, material change, archival, and last-reviewed update appear. |
| **Document** | File (required); title (defaulted from file name, editable); category optional; document date optional; note optional; uploader; uploaded timestamp. | Uploaded → available, unavailable/quarantined/error, deleted per policy. File scan/error state must be clear. | Upload, metadata update, deletion, or availability failure appear; do not log passive views. |
| **Note** | Body (required); optional title; author; created/updated time. | Create → edit; delete only with confirmation and a defined retention behavior. Notes are not task comments in V1. | Creation, material edit, and deletion appear. |
| **Emergency information** | Emergency contacts; preferred hospital/provider text optional; allergy/condition text optional; insurance reference text optional; linked documents; last-reviewed date. | Every field is optional, but onboarding must require an explicit add-now or skip-for-now decision. | Create/update/last-reviewed changes appear without repeating sensitive values. |
| **Timeline event** | Actor; action; object; timestamp; link to current authoritative record where available. | System-generated from material actions and optional manually recorded care events. Not editable by ordinary members. | The Timeline is the record itself. |

## 4. Functional Requirements by Product Area

### FR-1: Authentication and Workspace Entry

A new person must be able to register or sign in, understand why they are creating or joining a workspace, and either create a workspace or accept an invitation. Implementation may choose the technical authentication method, but it must support account recovery and prevent ambiguous accidental workspace access.

The active workspace name and care recipient’s preferred name must be visible in the authenticated shell. If a user belongs to multiple workspaces, switching must be deliberate and obvious. If V1 only supports one workspace per person initially, the interface must not expose a misleading switcher.

### FR-2: Dashboard / Today

The Today dashboard must render a prioritized, scannable orientation view. It must not depend on the presence of every module; each section has a useful empty state and a direct action only where it helps completion.

| Section | Inclusion rule | Required content | Primary action |
|---|---|---|---|
| **Needs attention** | At least one overdue task. | Task title, assignee/unassigned, due date, overdue duration, and completion affordance. | Open task; complete; reassign where permitted. |
| **Today** | Due-today tasks and/or today’s appointments. | Separate task and agenda grouping, time where available, owner/attendee context. | Open respective record; complete task. |
| **Coming up** | Items in the next seven calendar days. | Compact time-ordered appointments and due-dated tasks; show a count/expand path if long. | Open full Calendar or Tasks view. |
| **Recent changes** | Material events exist. | Actor, plain-language action, affected object, relative and absolute timestamp on detail. | Open Timeline or the referenced record. |
| **Quick reference** | Always visible. | Emergency, medications, care-team, and documents shortcuts. | Open the relevant authoritative view. |

Dashboard priority is: overdue → due today → today’s schedule → upcoming → recent changes → reference. The interface must never hide overdue tasks below celebratory, informational, or decorative content. On first use, the blank dashboard explains the setup path rather than displaying empty module cards.

### FR-3: Care Profile and Care Context

The Care page must let authorized members view and edit the care recipient’s basic reference profile. The design must clearly separate generally useful contact/preference details from Emergency Information and Medication reference data, which have their own focused sections.

The system should prompt users to improve incomplete, high-value reference data through non-blocking cues. It must not force a full biography or clinical history as a condition of using tasks and appointments.

### FR-4: Care Team

The Care Team view must show active members, their role, relationship/role label, invitation status, and available contact method. Authorized users can invite, resend, cancel an invitation, remove a member, and change permitted roles. Every destructive or access-changing action requires confirmation that explains the consequence.

When assigning work, the task interface must use the same active member list. A removed or pending member cannot be newly assigned. Existing work assigned to a removed member must show a legible resolution state and prompt an authorized user to reassign it.

### FR-5: Tasks

Tasks are the primary mechanism for coordination ownership. Users with permission can create a task through quick capture or the full Tasks view. The full view supports status and time-based groups: Overdue, Today, Upcoming, No due date, and Completed.

A task must show title, current status, assignee or Unassigned, due date/time if present, and a direct route to its details. The task detail supports description, assignment, due date/time, completion/reopen, and links to related appointment/document where relevant. No priority score, clinical severity, automation, recurring task pattern, comments system, or subtask hierarchy is required in V1.

### FR-6: Calendar / Appointments

The Calendar view is an appointments-focused date-based view. V1 requires a list/agenda presentation as the accessible baseline; a month view is optional only if it does not reduce clarity or delay the 90-day test. The page must show upcoming and past appointments, scheduled/cancelled state, date/time, location/mode, and relevant preparation task(s).

Users with permission can create and edit appointments. The quick-create flow should use a date/time field that accepts sensible manual text entry or an accessible picker. Appointment creation must not require provider integration, recurrence, external syncing, or detailed medical reason information.

### FR-7: Medication Reference

Medication information is a reference list owned by the family. The page opens with a clear non-clinical notice such as: **“This list is shared reference information. Confirm medication questions and emergencies with an appropriate clinician, pharmacist, or emergency service.”** Legal review is required before final production copy.

Each item has a readable summary and a detail view. The primary actions are add, edit, archive, and mark reviewed. The product must avoid red/green interaction or safety language that implies medication verification. There is no alarm, adherence percentage, refill computation, interaction warning, or recommendation.

### FR-8: Documents

The Documents view is a secure index of family-managed files. It supports upload, title/metadata edit, category filter, date display, opening/downloading an authorized document, and controlled deletion. The interface must distinguish file-processing/availability errors from user permission errors and preserve user-entered metadata where possible.

The initial category set is intentionally small: Medical & insurance, Legal & financial, Care plan, Identification, and Other. These labels organize files; they do not validate their content or confer access beyond the workspace’s configured permission rules.

### FR-9: Updates — Timeline and Notes

Updates provides two tabs or clearly separated views. **Timeline** is system-generated, chronological, and non-editable to ordinary users; it creates shared awareness of meaningful changes. **Notes** are authored by people, intentionally free-form, and suitable for coordination context that does not belong in a task or appointment.

Both views default to newest first and display author, timestamp, and a direct route to the related record when available. Filters are limited to actor, record type, and date range only if needed to retrieve usable histories; full-text search is not a V1 requirement.

### FR-10: Emergency Information

Emergency access must be persistent in the authenticated interface, visually distinctive without using alarmist animation. It opens a concise reference view with emergency contacts first, followed by user-entered health/condition/allergy text, preferred care locations/contact information, insurance reference, linked files, and last-reviewed date.

The page must display approved safety language: **“For an emergency, call local emergency services. This workspace does not provide emergency response or medical advice.”** V1 must not offer anonymous links, lock-screen widgets, or share-by-text functions. The printable/downloadable emergency summary is optional and only in scope if its access, data exposure, and print reliability are resolved.

### FR-11: Settings and Workspace Continuity

Settings includes workspace name, member-management entry, ownership transfer initiation, data/export/deletion policy information, and account/support links. Account authentication details are technical. Ownership transfer and deletion must use explicit confirmation and a recovery/support path because their effects are high impact.

## 5. Cross-Cutting Experience Requirements

### 5.1 States and Feedback

Every surface must define and implement the following states:

| State | Requirement |
|---|---|
| **Loading** | Use a clear skeleton or labeled progress state. Do not show a misleading empty state while data is loading. |
| **Empty** | Explain what belongs here, why it may be useful, and one appropriate next action. Avoid celebratory illustrations that obscure task focus. |
| **Success** | Confirm the completed action in plain language and preserve the user’s orientation. Prefer undo for low-risk reversible changes where technically reliable. |
| **Validation error** | Place a specific explanation adjacent to the affected field, preserve valid input, and describe the correction needed. |
| **Permission error** | State that the action is unavailable for the user’s access level, not that the record does not exist. Offer an appropriate escalation route if defined. |
| **Network/system error** | State that the action did not complete, preserve drafts where feasible, and provide a safe retry path. Never imply a record was saved when its state is uncertain. |
| **No access / removed** | Explain that workspace access is no longer available and offer approved support/account options without exposing workspace details. |

### 5.2 Time, Dates, and History

The workspace has one explicitly stored local time zone. Dates/times are displayed in that time zone across the dashboard, tasks, appointments, and timeline. A due-date-only task becomes overdue at the start of the day following its due date in the workspace time zone. Date-only appointments appear in the calendar but must visibly indicate that time is unspecified.

Timestamps use relative language for recent events alongside accessible absolute date/time in detail or assistive text. Daylight-saving changes and users in other time zones must not silently alter the intended date/time; Antigravity must confirm the technical model in OQ-20.

### 5.3 Language, Accessibility, and Safety

The product must use plain language, descriptive labels, readable contrast, visible focus, keyboard-operable controls, understandable icons, and non-color status cues. Research with older adults identifies small type, tiny targets, poor contrast, and unforgiving forms as recurring barriers; the V1 design system treats those concerns as baseline requirements.[1]

Clinical labels, advice, or risk assessments are prohibited. Where medication or emergency content appears, the interface must make clear that information is family-entered reference material and direct the user to appropriate professional or emergency channels as relevant.

## 6. Product Acceptance Criteria

V1 product/UX acceptance is achieved when the implementation enables the following observable outcomes:

| ID | Acceptance outcome |
|---|---|
| AC-01 | A new coordinator can create a workspace and reach a usable Today dashboard without completing every optional profile field. |
| AC-02 | An authorized member can invite another person, and the workspace clearly distinguishes pending from active access. |
| AC-03 | A coordinator can create, assign, complete, and reopen a task; the dashboard and task list reflect the resulting state. |
| AC-04 | An incomplete task due before the workspace-local current day appears as Overdue and remains visible at the top of Today. |
| AC-05 | An authorized member can create an appointment and see it in both Today when relevant and the Calendar view. |
| AC-06 | An authorized member can enter medication reference information without seeing clinical interpretation, reminders, or safety claims. |
| AC-07 | An authorized member can upload, identify, find, and open/download an allowed document; failure states are comprehensible. |
| AC-08 | Users can distinguish authored Notes from system Timeline events and see who changed what at a useful level of detail. |
| AC-09 | An authorized user can open Emergency Information from any authenticated primary screen in two interactions or fewer. |
| AC-10 | Viewer-role users cannot see editing controls or take write actions; permission feedback is clear if they use a direct URL. |
| AC-11 | The interface remains usable at narrow mobile widths for check-in, quick capture, task completion, appointment viewing, document retrieval, and emergency access. |
| AC-12 | The product makes no unsupported privacy/compliance claim and no clinical decision or emergency-response claim. |

## 7. Antigravity Handoff Constraints

Antigravity owns data model, authentication, authorization implementation, document storage/scanning, audit/event architecture, email delivery, test automation, and deployment. Before implementation, Antigravity must flag any constraint that changes visible capability, record retention, role behavior, invitation/onboarding flow, file behavior, time-zone semantics, emergency access, or accessibility. Such constraint belongs in `docs/OPEN_QUESTIONS.md` for a Product Owner decision.

## References

[1]: https://www.nngroup.com/articles/usability-for-senior-citizens/ "Nielsen Norman Group — Usability for Older Adults: Challenges and Changes"
