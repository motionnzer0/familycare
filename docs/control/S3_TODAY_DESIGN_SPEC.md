# Today V2 Design Specification — Family Care Command Center

**Document Status:** Approved Design Specification (Slice 3 / Checkpoint 1)  
**Product Authority:** ChatGPT (Product, UX & Strategy)  
**Product Owner:** Trav (Founder / Product Owner)  
**Implementation Authority:** Antigravity (Engineering)  
**Date:** September 6, 2026  

---

## 1. Product Objective

Today is the primary decision surface and 10-second situational orientation hub for family caregivers. When an adult family member opens Family Care, Today must immediately answer five foundational questions:

1. **What needs attention?** (Overdue items requiring immediate intervention)
2. **What is happening today?** (Coordinated schedule of today's tasks and appointments)
3. **What is coming next?** (Near-term 7-day planning horizon)
4. **What changed since I last checked?** (Recent care team collaboration and activity)
5. **Where can I quickly access critical information?** (Direct shortcuts to high-frequency reference areas)

Today is a **decision surface**, not an exhaustive database table dump. It prioritizes action relevance, psychological calm, and shared situational awareness over visual novelty or metric dashboards.

---

## 2. User Problem

Adult family members coordinating care for an aging parent operate under continuous cognitive strain, fragmented communications (SMS threads, paper notes, voicemails, scattered screenshots), and severe time constraints. 

When checking the application between daily obligations, the caregiver cannot afford to hunt through menus or parse dense tables to determine what must be handled. Today solves this by presenting a unified, prioritized, and actionable view of care coordination for their parent.

---

## 3. Today Information Hierarchy

The Today dashboard is organized into five strictly ordered priority tiers:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Header & Page Identity                                                   │
│    "Today for [Care Recipient]" | Date | Unified [+ Add] Launcher           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Priority 1: NEEDS ATTENTION                                                 │
│ [Rendered only when overdue work exists]                                    │
│ Distinct, non-alarmist amber container for overdue tasks.                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ Priority 2: TODAY'S WORKLOAD                                                │
│ Combined, synchronized schedule of Today's appointments and due-today tasks.│
│ (Appointments lead; tasks follow; calm settled state when empty).           │
├─────────────────────────────────────────────────────────────────────────────┤
│ Priority 3: COMING UP                                                       │
│ 7-day lookahead agenda providing forward context with Calendar routing.     │
├─────────────────────────────────────────────────────────────────────────────┤
│ Priority 4: RECENT CHANGES                                                  │
│ Interactive chronological stream of the last 3–5 team activity events.      │
├─────────────────────────────────────────────────────────────────────────────┤
│ Priority 5: QUICK REFERENCE                                                 │
│ Compact utility shortcuts: Emergency, Medications, Documents, Care Team.    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Header & Page Identity

### Specification
- **Primary Title (`h1`):** `Today for {careRecipientName}` (e.g., `Today for Eleanor`).
- **Supporting Information:** Current date formatted in the workspace's configured timezone: `EEEE, MMMM d, yyyy` (e.g., `Sunday, September 6, 2026`).
- **Context Subtitle:** `Priorities and coordination schedule for {careRecipientName}.`
- **Primary Action:** Unified `+ Add` launcher button (see Section 10).
- **Tone:** Calm, human, trustworthy, clear, and action-oriented.

### Interaction Details
- **Intent:** Establish immediate emotional and cognitive connection to the care recipient.
- **Trigger:** Page load / route navigation to `/today`.
- **Expected Behavior:** Displays care recipient preferred name prominently; date dynamically reflects workspace timezone rather than device local timezone.
- **Accessibility:** `h1` element provides page landmark; date formatted in human-readable plain language.

---

## 5. Priority 1 — Needs Attention Specification

### Specification
- **Purpose:** Surface items requiring immediate action or rescheduling.
- **Entry Condition:** Rendered **only** when `overdueTasks.length > 0`. If 0 overdue tasks exist, this entire section is omitted from the DOM to conserve vertical space and eliminate unnecessary anxiety.
- **Visual Container:** Light warm amber tint (`bg-amber-50/50 border border-amber-300 rounded-xl p-4 sm:p-5`).
- **Section Header:** `AlertTriangle` icon (`text-amber-800`), `h2` title `"Needs Attention"`, and explicit text badge `{count} Overdue`.
- **Guardrail:** Never manufacture urgency; never use flashing indicators, pulsing sirens, or bright red alarm backgrounds for non-clinical family tasks.

### Item Presentation & Interaction
- Renders `TaskItem` components for each overdue task.
- Each item displays:
  - Accessible checkbox toggle (with `aria-label`).
  - Task title with strikethrough upon completion.
  - Semantic `Overdue` badge (text + color).
  - Assignee name (or bold `Unassigned` indicator).
  - Due date formatted in workspace timezone.
- **Actions:** Complete toggle, edit modal trigger, delete trigger.

---

## 6. Priority 2 — Today's Workload Specification

### Specification
- **Purpose:** Present the complete operational workload for the current day.
- **Structure:** Combines appointments and tasks into a unified, visually coordinated daily schedule.
- **Section Header:** `h2` title `"Today's Schedule & Tasks"` with count badge `{count} scheduled`.
- **Ordering Strategy:**
  1. **Appointments Lead:** Scheduled appointments occurring today (`status != 'cancelled'`), sorted chronologically by `start_time ASC` (null times sorted last).
  2. **Tasks Follow:** Open tasks due today (`status = 'open'`), sorted by `due_time ASC` (null times sorted last).
- **Visual Distinction:**
  - Appointments use structured card styling with calendar icons, time ranges, and provider/location metadata.
  - Tasks use actionable checkbox rows with assignee badges.

### Empty State
When `todayAppointments.length === 0` and `todayTasks.length === 0`:
- Renders a settled surface card:
  - Heading: `"You're all caught up"`
  - Description: `"Nothing requires your attention today."`
  - Secondary prompt: `+ Add Task` shortcut.

---

## 7. Priority 3 — Coming Up Specification

### Specification
- **Purpose:** Provide near-term planning context without overwhelming today's focus.
- **Planning Window:** Next 7 days (`date > today AND date <= today + 7 days`).
- **Visual Weight:** Subordinate to Priority 2; uses lighter card borders and compact padding.
- **Section Header:** `h2` title `"Coming Up (Next 7 Days)"` with right-aligned action link `"View Calendar →"` routing to `/calendar`.
- **Item Order:** Chronological by date. Upcoming appointments and tasks are listed with date badges (`MMM d`) and time cues.
- **Empty State:** When 0 upcoming items exist in 7 days, renders a single muted text line: `"No upcoming items scheduled for the next 7 days."`

---

## 8. Priority 4 — Recent Changes Specification

### Specification
- **Purpose:** Answer: *"What happened since I last checked?"*
- **Entry Condition:** Rendered when `timelineEvents.length > 0`.
- **Data Query:** Last 5 material events from `timeline_events` for the active workspace (`order by created_at DESC limit 5`).
- **Section Header:** `Activity` icon (`text-brand`), `h2` uppercase title `"Recent Changes"`.

### Interactivity & Navigation Model
Every activity entry is **fully interactive**:
- **Task Events (`target_type = 'task'`):** Clicking navigates directly to `/tasks` (or opens task detail).
- **Appointment Events (`target_type = 'appointment'`):** Clicking navigates to `/calendar`.
- **Medication Events (`target_type = 'medication'`):** Clicking navigates to `/medications`.
- **Document Events (`target_type = 'document'`):** Clicking navigates to `/documents`.
- **Note Events (`target_type = 'note'`):** Clicking navigates to `/notes`.
- **Emergency / Care Profile Events:** Clicking navigates to `/emergency` or `/care`.
- **Fallback:** Navigates to `/updates` timeline if direct target route cannot be resolved.
- **Event Item Content:**
  - Plain-language action verb (`Created`, `Completed`, `Updated`, `Deleted`).
  - Target entity type and title (truncated safely with ellipsis).
  - Relative timestamp formatted in workspace timezone (`MMM d, h:mm a`).

---

## 9. Priority 5 — Quick Reference Specification

### Specification
- **Purpose:** Provide immediate, predictable access to essential reference destinations from Today.
- **Position:** Positioned below Recent Changes at the base of the Today canvas.
- **Visual Form:** Compact 4-column responsive grid / horizontal tile strip.
- **Items Included:**
  1. **Emergency:** Red-accented keyline badge with phone icon $\rightarrow$ routes to `/emergency`.
  2. **Medications:** Pill icon + `"Medications"` label $\rightarrow$ routes to `/medications`.
  3. **Documents:** FileText icon + `"Documents"` label $\rightarrow$ routes to `/documents`.
  4. **Care Team:** Users icon + `"Care Team"` label $\rightarrow$ routes to `/team`.
- **Visual Hierarchy:** Subordinate to active coordination cards; uses quiet surface styling (`bg-surface border border-border hover:border-brand/50 transition-colors`).

---

## 10. Unified "+ Add" Launcher Specification

### Specification
Replaces the fragmented dual buttons (`+ Add Task` and `Appointment`) in the header with a single, high-efficiency **`+ Add`** action menu.

```text
┌───────────────────────────────┐
│ [+ Add ▾]                     │
├───────────────────────────────┤
│ ✓ Task                        │
│ 📅 Appointment                │
│ 📝 Note                       │
│ 📄 Document                   │
│ 👥 Invite Caregiver           │
└───────────────────────────────┘
```

### Options & Role Permissions
| Action | Role Requirement | Triggered Modal / Flow |
|---|---|---|
| **Task** | Owner, Coordinator, Contributor | Opens `TaskFormModal` (create mode) |
| **Appointment** | Owner, Coordinator | Opens `AppointmentFormModal` (create mode) |
| **Note** | Owner, Coordinator, Contributor | Opens `NoteFormModal` (create mode) |
| **Document** | Owner, Coordinator, Contributor | Opens `DocumentUploadModal` (upload mode) |
| **Invite Caregiver** | Owner, Coordinator | Opens `InviteMemberModal` |

### Interaction Behavior
- **Desktop:** Accessible dropdown menu / popover aligned to button right edge.
- **Mobile:** Accessible bottom sheet or touch-friendly action sheet menu.
- **Keyboard Navigation:** `Enter`/`Space` opens; arrow keys navigate items; `Escape` closes and restores focus to the launcher button.
- **Server Gating:** Server Actions independently enforce RBAC rules and reject unauthorized mutations.

---

## 11. Empty States Specification

Empty states must communicate a positive, settled system condition rather than an incomplete or broken state.

| Surface | Copy Requirement | Visual & Action Treatment |
|---|---|---|
| **Priority 1 (Needs Attention)** | *No text rendered.* | Entire container is omitted when 0 overdue tasks exist. |
| **Priority 2 (Today Schedule)** | Title: `"You're all caught up"`<br>Subtitle: `"Nothing requires your attention today."` | Clean bordered card with subtle `+ Add Task` button. |
| **Priority 3 (Coming Up)** | `"No upcoming items scheduled for the next 7 days."` | Single-line muted text with `"View Calendar →"` link. |
| **Priority 4 (Recent Changes)** | *No text rendered.* | Entire section is omitted when 0 events exist. |
| **Brand New Workspace** | `"Welcome to {careRecipientName}'s care workspace."`<br>`"Get started by adding your first task or appointment."` | Welcoming, non-blocking orientation card with `Add Task` and `Add Appointment` primary actions. |

---

## 12. Loading States Specification

- **Initial Server Render:** Uses React Suspense and page streaming to eliminate layout shift.
- **Skeleton Structure:** Renders structural skeletons for the Header, Today's Workload, Coming Up, and Quick Reference matching exact production component dimensions.
- **Interactive Mutations (In-Flight):**
  - Checkbox toggles and status button clicks use React `useTransition`.
  - While pending (`isPending === true`), button controls show a subtle opacity shift and prevent duplicate submissions.
  - Modals display an inline spinner and disable the submit button while awaiting Server Action resolution.

---

## 13. Error States Specification

- **Form Modal Errors:** If a Server Action fails (e.g. validation error or permission denial), an `<Alert variant="destructive">` displays the exact plain-language error message at the top of the modal without clearing user inputs.
- **Data Fetching Failures:** If background queries fail, the page renders available sections gracefully and displays a non-intrusive banner with a `"Retry"` action.
- **Unauthorized Actions:** If a role violation occurs, the system informs the user: `"You do not have permission to perform this action in this workspace"` without altering the layout or corrupting local state.

---

## 14. Success States Specification

- **Instant Visual Feedback:** Interactive controls immediately transition to the target state (optimistic update).
- **Modal Closure:** Upon successful creation/update, the modal closes immediately, clears form fields, and restores focus to the triggering element.
- **Cache Revalidation:** Server Actions invoke `revalidatePath("/today")` to synchronize all dashboard priority tiers seamlessly.
- **Audit Logging:** Successful mutations automatically append a timeline event to `public.timeline_events`, which populates the Recent Changes tier.

---

## 15. Task & Appointment Interaction Lifecycle

### Task Completion Sequence
1. **Trigger:** User clicks or presses `Space`/`Enter` on the task checkbox.
2. **Visual Transition:** Checkbox fills with green background and check icon; task title applies strikethrough styling and muted opacity (`opacity-75`).
3. **Optimistic State:** React `useTransition` registers pending mutation.
4. **Graceful Reflow:** Item smoothly transitions or remains visually checked in-place until page revalidation.
5. **Server Sync:** `toggleTaskCompleteAction` updates database status to `'completed'`, sets `completed_at` and `completed_by`, and logs a timeline event.

### Appointment Status Sequence
1. **Trigger:** User clicks `"Complete"` or `"Cancel"`.
2. **Confirmation:** Cancelling an appointment triggers a standard confirmation dialog.
3. **Visual Transition:** Status badge updates immediately (`Completed` or `Cancelled` line-through).
4. **Server Sync:** `updateAppointmentStatusAction` updates record in PostgreSQL and logs an attributable timeline event.

### Reduced-Motion Support
For users with `prefers-reduced-motion: reduce`, all animated transitions and reflows are instantaneous (0ms transition duration).

---

## 16. Responsive Behavior Specification

### Breakpoints & Layout Adapters
- **Desktop ($\ge 1024\text{px}$):**
  - Left navigation rail (`w-64`).
  - Single primary reading column (`max-w-reading`, approx. 700px) centered in app canvas.
  - Quick Reference rendered as a 4-column horizontal grid.
- **Tablet ($768\text{px} - 1023\text{px}$):**
  - Compact left navigation rail.
  - Full-width content with 24px side padding.
  - Quick Reference rendered as a 2x2 grid.
- **Mobile ($< 768\text{px}$):**
  - Persistent top header (`AppHeader`) with Care recipient title and Emergency shortcut.
  - Fixed bottom navigation bar (`MobileNav`) with 96px bottom padding (`pb-24`) on main scroll container.
  - Strict single-column hierarchy:
    `Needs Attention` $\rightarrow$ `Today` $\rightarrow$ `Coming Up` $\rightarrow$ `Recent Changes` $\rightarrow$ `Quick Reference`.
  - Item cards stack metadata and actions vertically to eliminate horizontal overflow.
  - Touch targets maintain minimum dimensions of $44\text{px} \times 44\text{px}$.

---

## 17. Accessibility Requirements (WCAG 2.2 AA)

1. **Heading Hierarchy:** Valid document outline using semantic tags (`h1` for page title, `h2` for priority sections, `h3` for modal headings).
2. **Interactive Elements & ARIA:**
   - Task toggle uses `role="checkbox"` with `aria-checked` and explicit `aria-label` (e.g. `aria-label="Mark Morning Medication as complete"`).
   - Dialog modals utilize Radix UI primitives with focus trapping, `aria-labelledby`, `aria-describedby`, and `Escape` key listeners.
3. **Visible Keyboard Focus:** High-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2`) on all interactive buttons, links, and checkboxes.
4. **Color Independence:** Status states (Overdue, Due Today, Completed, Cancelled) always pair color tints with explicit text labels and semantic badges.
5. **Contrast Standards:** All text elements adhere to minimum 4.5:1 contrast against surface backgrounds (3:1 for large text $\ge 18\text{pt}$ and icons).

---

## 18. Role-Based Behavior Matrix on Today

| Capability / Surface | Owner | Coordinator | Contributor | Viewer |
|---|:---:|:---:|:---:|:---:|
| **View Today Dashboard** | Yes | Yes | Yes | Yes |
| **View Needs Attention / Overdue** | Yes | Yes | Yes | Yes |
| **View Today Schedule & Tasks** | Yes | Yes | Yes | Yes |
| **View Coming Up & Recent Changes** | Yes | Yes | Yes | Yes |
| **Complete Any Task** | Yes | Yes | Yes (Assigned / Unassigned) | No |
| **Edit Any Task** | Yes | Yes | Yes (Own created) | No |
| **Delete Any Task** | Yes | Yes | No | No |
| **Complete / Cancel Appointment** | Yes | Yes | No | No |
| **Edit / Delete Appointment** | Yes | Yes | No | No |
| **Unified "+ Add" Button** | Full Options | Full Options | Task, Note, Document | Hidden |

---

## 19. Technical Constraints & Architecture

1. **Workspace Timezone Integrity:** All date boundaries (`todayDateStr`, `nextWeekStr`, `isTaskOverdue`, `isTaskDueToday`) must continue evaluating against `workspace.timezone` via `src/lib/timezone.ts`. Device local time must not be used for server queries or priority binning.
2. **PostgreSQL RLS & Zero Service Keys:** All client-triggered data fetching and mutations must run through authenticated Server Actions (`createServerSupabaseClient()`) evaluating PostgreSQL RLS policies. Service-role credentials must never be introduced into client-facing actions.
3. **PostgREST Query Syntax:** Any joined relational queries must utilize correct nested embedding syntax (`workspaces(*, care_recipients(*))`) to prevent duplicate join alias errors (Error 42712).
4. **Server Action Cache Revalidation:** Mutations must invoke `revalidatePath("/today")` alongside corresponding entity paths (`/tasks`, `/calendar`, `/updates`).

---

## 20. Acceptance Criteria

- [ ] **AC-01 (Page Identity):** Page renders `Today for [Care Recipient Name]` as `h1` with the workspace timezone date as supporting metadata.
- [ ] **AC-02 (Needs Attention):** Overdue tasks appear at Priority 1 in an amber container when overdue items exist; section is completely omitted when count is 0.
- [ ] **AC-03 (Today Workload):** Today's appointments lead and due-today tasks follow under Priority 2.
- [ ] **AC-04 (Today Empty State):** When no tasks or appointments are due today, a settled card stating *"You're all caught up — Nothing requires your attention today"* is displayed.
- [ ] **AC-05 (Coming Up):** 7-day lookahead items render at Priority 3 with a working `"View Calendar →"` link.
- [ ] **AC-06 (Recent Changes):** Last 5 timeline events render at Priority 4; clicking an event navigates to the associated record or `/updates`.
- [ ] **AC-07 (Quick Reference):** Priority 5 renders compact shortcuts to Emergency, Medications, Documents, and Care Team.
- [ ] **AC-08 (Unified Add):** Header renders a single `+ Add` launcher with role-filtered options (Task, Appointment, Note, Document, Invite Caregiver).
- [ ] **AC-09 (Task Completion):** Toggling a task checkbox immediately reflects completed state and updates the database via `toggleTaskCompleteAction`.
- [ ] **AC-10 (Appointment Actions):** Authorized users can Complete or Cancel appointments directly from Today with instant feedback.
- [ ] **AC-11 (Responsive Layout):** Preserves 5-tier order on mobile without horizontal scrolling or obscured tap targets.
- [ ] **AC-12 (Accessibility):** Full keyboard navigation, visible focus indicators, WCAG 2.2 AA contrast, and screen reader labels verified.

---

## 21. Explicit Non-Goals (Out of Scope for V1)

- **No Clinical Logic:** No medication interaction warnings, dosage checking, symptom triage, or clinical decision support.
- **No Push Notifications:** No native mobile push notifications, SMS gateways, or automated alert streams.
- **No External Sync:** No Google Calendar / Apple Calendar two-way synchronization in V1.
- **No Complex Analytics:** No caregiver productivity scores, completion velocity graphs, or gamification mechanics.
- **No Real-Time Sockets:** No WebSocket subscriptions; data updates on navigation, mutation, and standard page refreshes.
