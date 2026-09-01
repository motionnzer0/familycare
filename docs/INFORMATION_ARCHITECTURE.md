# Family Care Command Center — Information Architecture

**Document status:** Final for V1 product/UX handoff  
**Owner:** Manus AI, Product + UX  
**Audience:** Google Antigravity and Human Product Owner  
**Last updated:** September 1, 2026

## 1. Architecture Principle

The information architecture organizes care coordination by the questions a family member asks while managing an aging parent—not by an internal database model or generic enterprise dashboard convention.

> **Orientation comes first:** What needs attention now? What happens next? Who owns it? Where is the supporting information?

The architecture uses six primary destinations. It preserves all eleven named V1 information domains while preventing the navigation from becoming a long flat list. Every record type has one authoritative location for review and editing; Today, Timeline, and contextual summaries point to that location rather than create competing copies.

## 2. Primary Navigation Model

| Navigation destination | Primary job | Authoritative content | Included V1 modules |
|---|---|---|---|
| **Today** | Orient to current and near-term care coordination. | Prioritized dashboard summaries only; no record type is edited here beyond quick actions. | Dashboard; recent activity previews; care-team/document/medication shortcuts. |
| **Tasks** | Plan, assign, and complete responsibilities. | Tasks and task details. | Tasks. |
| **Calendar** | See and manage appointments by date. | Appointments and appointment details. | Appointments. |
| **Care** | Understand the person and the people coordinating care. | Care Profile, Care Team, medication reference, and care-context links. | Care Profile; Family/Care Team; Medications. |
| **Documents** | Store and retrieve important family-managed files. | Document index and document metadata. | Documents. |
| **Updates** | Understand what changed and capture free-form coordination context. | Timeline and Notes. | Timeline; Notes. |

Persistent utility navigation exposes **Emergency** from every authenticated primary screen. **Settings** is a utility destination, not a primary task destination. The workspace/care-recipient context appears in the application header or equivalent persistent shell.

### Desktop Navigation

On desktop, use a left-side persistent navigation rail or a stable top-and-side shell with the six primary destinations. Persistent Emergency access must be visually distinct and near the main navigation but should not visually compete with overdue work. The primary action is a labeled **Add** control that opens short, relevant actions: Task, Appointment, Note, Document, and Invite member.

### Mobile Navigation

On mobile, show Today, Tasks, Calendar, Care, and a **More** destination in a bottom navigation pattern. More contains Documents, Updates, and Settings. Emergency remains independently persistent in the header or a clearly labeled control accessible from every primary screen. The Add action may use a fixed, labeled button if it does not obscure content or system controls.

Mobile must not simply compress the desktop rail. It prioritizes checking today’s work, completing a task, viewing an appointment, viewing essential care/emergency reference, and quickly capturing a note or task. Dense tables, hover-only controls, persistent filter panels, and parallel multi-column dashboards are not suitable mobile patterns.

## 3. Site Map

```text
Authenticated workspace shell
├── Today
│   ├── Needs attention (overdue tasks)
│   ├── Today (tasks and agenda)
│   ├── Coming up (next 7 days)
│   ├── Recent changes (preview)
│   └── Quick reference
│       ├── Emergency
│       ├── Medications
│       ├── Care Team
│       └── Documents
├── Tasks
│   ├── All / grouped list
│   ├── Task detail
│   └── Create / edit task
├── Calendar
│   ├── Agenda / date list
│   ├── Appointment detail
│   └── Create / edit appointment
├── Care
│   ├── Profile
│   ├── Care Team
│   │   ├── Member detail / access
│   │   └── Invite member
│   └── Medications
│       └── Medication detail / edit
├── Documents
│   ├── Document list and filter
│   ├── Document detail / preview or download
│   └── Upload document
├── Updates
│   ├── Timeline
│   └── Notes
│       └── Note detail / edit
├── Emergency (persistent utility)
│   ├── Emergency contacts
│   ├── Reference details
│   └── Linked documents
└── Settings
    ├── Workspace settings
    ├── Membership / ownership entry
    ├── Data and privacy information
    └── Account and support entry
```

## 4. Content Placement Rules

The following table answers exactly what belongs on the dashboard, one click away, in navigation, and in contextual detail.

| Information or action | Immediately visible on Today | One click away from Today | Primary navigation location | Contextual detail behavior |
|---|---|---|---|---|
| Overdue task | Yes, ordered first. | Task detail. | Tasks. | Show assignment, due date, description, and related items. |
| Task due today | Yes. | Task detail. | Tasks. | Allow direct completion where permission allows. |
| Unassigned task | Yes if overdue/due today; otherwise in grouped preview. | Task detail. | Tasks. | Explicit “Unassigned” state; assignment action. |
| Today’s appointment | Yes, time-ordered. | Appointment detail. | Calendar. | Location/mode, attendees, provider text, preparation links. |
| Upcoming appointment | Compact preview within next seven days. | Calendar/appointment detail. | Calendar. | Full agenda preserves longer horizon and history. |
| Medication information | Shortcut only; no list on the default dashboard. | Medication list. | Care → Medications. | User-entered details and last reviewed date. |
| Emergency contacts | Shortcut only, always. | Emergency summary. | Persistent Emergency. | Full structured reference page. |
| Care team | Compact shortcut/count; optionally assigned-person names in tasks. | Care Team. | Care → Care Team. | Role, contact, invitation/access state. |
| Recent document | Recent-change event only; no separate “latest files” card. | Document detail/list. | Documents. | Metadata, availability, view/download. |
| Note | Recent-change event only. | Note detail. | Updates → Notes. | Author, time, contents, edit history behavior if supplied. |
| Activity event | Short preview only. | Timeline. | Updates → Timeline. | Actor/action/object/time and link to authoritative record. |
| Create task/appointment/note/document/invite | Labeled Add action. | Focused quick capture. | Corresponding destination. | Open full page when required fields or review become complex. |

## 5. Object Relationships and Source of Truth

```text
Workspace (one care recipient)
├── Members / roles
├── Care Profile
├── Emergency Information
├── Medications [many]
├── Tasks [many] ── optional assignee: Member
│                   └── optional related appointment/document link
├── Appointments [many] ── optional related task/document link
├── Documents [many]
├── Notes [many]
└── Timeline events [many] ── reference actor + source object when relevant
```

The relationship model supports findability without requiring all records to be duplicated. A task that prepares for an appointment may link to it; the appointment remains authoritative in Calendar and the task remains authoritative in Tasks. A document linked in Emergency remains authoritative in Documents. A recent-change event links back to the source object but is not an independently editable version of it.

## 6. Information Hierarchy Within Key Screens

### Today

The page begins with an unambiguous context heading: **“Today for [Care Recipient Preferred Name]”**. The hierarchy is time and responsibility based.

| Order | Section | Why it appears here | Collapse behavior |
|---|---|---|---|
| 1 | Needs attention | Prevents missed time-bound work. | Never auto-collapse when items exist. |
| 2 | Today | Combines today’s actionable tasks with schedule orientation while retaining separate subgroups. | Show all when short; “See all” only for long lists. |
| 3 | Coming up | Supports planning without crowding current action. | Start compact; always provide a clear full-calendar/task route. |
| 4 | Recent changes | Helps remote family members reorient to shared work. | Show 3–5 recent material events. |
| 5 | Quick reference | Supports fast retrieval while preserving action-first focus. | Persistent compact controls. |

### Tasks

The default Tasks view groups rather than relies exclusively on a status-filter table. Groups are Overdue, Today, Upcoming, No due date, and Completed. Within each group, sort by due date/time, then unresolved assignment. The visible row/card density stays compact but comfortably tap-accessible; each entry includes title, owner, and due state without needing to open the detail page.

### Calendar

Calendar defaults to an agenda/date list because it communicates time order well at all widths. It includes Today and upcoming dates first, then past events. An optional month grid cannot be the only view. Appointment rows show title, date/time, location/mode when present, and cancellation state. Do not include tasks as calendar “events” in baseline V1; the dashboard may place task work and today’s schedule beside one another, but their underlying semantics remain distinct.

### Care

Care uses a profile header and clear sections or tabs for Profile, Care Team, and Medications. Do not put Emergency Information inside ordinary Care navigation; it must remain independently findable in persistent Emergency access. The page’s purpose is reference and people, not daily prioritization.

### Documents

Documents defaults to newest uploaded or updated first, with a simple category filter and clear availability states. File name/title, category, date, uploader, and type/size metadata should be scanable. Use a detail page or side panel when preview/download rules, metadata, and related links warrant it.

### Updates

Updates defaults to Timeline, then offers Notes as a sibling view. Timeline rows must be short, factual, attributable, and linkable. Notes are clearly distinguished by authored content and an optional title; they must never be rendered as generic activity events.

### Emergency

Emergency information opens with **Emergency contacts** and an immediate safety statement. It follows with user-entered reference details, linked documents, and last-reviewed state. It must be usable in a tense moment: no nested tabs, decorative content, hidden contact numbers, or requirement to edit before viewing.

## 7. Modal, Page, and Inline-Action Policy

| Interaction pattern | Use when | V1 examples | Do not use when |
|---|---|---|---|
| **Inline action** | Action is low-risk, single purpose, and does not need additional detail. | Complete task; mark medication reviewed; switch Timeline/Notes tab. | It changes access, deletes data, changes complex content, or needs a multi-field decision. |
| **Focused modal or side sheet** | Entry is short, interruptible, and benefits from keeping orientation to the current view. | Add task; add appointment; add note; invite member; upload document metadata. | A narrow viewport cannot show form/context accessibly, or a user must review many linked records. |
| **Dedicated page** | Information is sensitive, multi-section, reviewable, or needs a durable link. | Care profile; Emergency; medication detail; document detail; task/appointment detail; Settings. | The action could be finished safely in a small, focused interaction. |
| **Confirmation dialog** | Consequence is destructive, access-changing, or difficult to reverse. | Remove member; cancel invite; delete document/note; ownership transfer; workspace deletion. | It merely confirms successful low-risk creation or repeats information. |

## 8. Empty-State Architecture

No screen should look like a failed dashboard when data is absent. Each empty state must identify the domain, describe why a family might add information, and offer only the most useful next action.

| Surface | Empty-state intent | Preferred next action |
|---|---|---|
| Today | Explain that today’s priorities will appear as work and appointments are added. | Add a task or appointment. |
| Tasks | Explain shared responsibility tracking. | Create task. |
| Calendar | Explain appointment coordination. | Add appointment. |
| Care Team | Explain why inviting trusted family can reduce duplicate work. | Invite member; allow skip. |
| Medications | Explain that the list is family-entered reference, not clinical advice. | Add medication. |
| Documents | Explain what types of reference files are useful. | Upload document. |
| Timeline | Explain that material changes will appear automatically. | Add a task, appointment, note, or document. |
| Notes | Explain when to use a note versus a task. | Add note. |
| Emergency | Explain the benefit of entering contacts and reference details while calm. | Add emergency contact; allow skip. |

## 9. Labels and Terminology

| Preferred label | Meaning | Avoid |
|---|---|---|
| **Today** | The action-prioritized dashboard. | Dashboard, Command Center, Overview as the primary navigation label. |
| **Needs attention** | Overdue tasks needing resolution. | Critical, alert, urgent unless the family explicitly provides that wording. |
| **Due today** | Incomplete tasks with a current-date due date. | Late, delinquent. |
| **Calendar** | Appointments-focused schedule. | Scheduler, Care plan calendar if it suggests external synchronization. |
| **Care Team** | Trusted relatives and helpers in the workspace. | Staff, provider network, community. |
| **Updates** | Timeline and intentional Notes. | Feed, Activity stream. |
| **Emergency** | Fast reference information and contacts. | SOS, Panic, Emergency response. |
| **Unassigned** | Task needs an owner. | Nobody, Owner missing. |
| **Last reviewed** | When the family last checked reference information. | Verified, medically confirmed. |

## 10. Accessibility and Findability Requirements

Information architecture supports accessibility by reducing memory demands and avoiding hidden navigation. Labels must be textual; icons supplement rather than replace labels. Navigation order must match visual order, and each page must have a unique descriptive heading. Deep links or direct URLs must result in a clear permission state if access is unavailable rather than a confusing blank/404 experience.

Readable typography, high contrast, large controls, clear error correction, and flexible input are especially important when a care recipient or older relative uses the workspace. Research with adults aged 65+ identifies small text, tiny targets, low contrast, and rigid form behaviors as recurring barriers.[1]

## References

[1]: https://www.nngroup.com/articles/usability-for-senior-citizens/ "Nielsen Norman Group — Usability for Older Adults: Challenges and Changes"
