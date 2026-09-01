# Family Care Command Center — User Flows

**Document status:** Final for V1 product/UX handoff  
**Owner:** Manus AI, Product + UX  
**Audience:** Google Antigravity and Human Product Owner  
**Last updated:** September 1, 2026

## Flow Conventions

Each flow below specifies product behavior, not technical architecture. An **authorized user** has the access intended in `PRODUCT_SPEC.md`; Antigravity must implement the resulting access rules and flag any visible constraint. “Quick capture” refers to a short, focused modal or full-screen mobile flow. “Detail page” refers to the record’s authoritative view.

All flows must preserve entered valid data after correctable errors, use plain-language validation, provide a visible loading/saving state, and produce an attributable Timeline event for material shared changes. Passive viewing and navigation do not generate Timeline events.

## 1. Registration

| Element | Definition |
|---|---|
| **Goal** | Create or recover a personal account so the person can create or join a private workspace. |
| **Trigger / precondition** | Person selects Create account, Sign in, or opens a valid invitation. |
| **Expected interface** | A focused authentication entry screen with clear distinction between creating an account, signing in, and accepting an invitation. The workspace/care-recipient context may appear only to the extent approved by privacy design. |
| **Steps** | 1. The person chooses Create account or follows a valid invitation. 2. They enter the required identity/authentication details using Antigravity’s approved method. 3. The system validates inputs and identity. 4. On success, a non-invited user enters workspace creation; an invited user enters invitation confirmation. |
| **Success condition** | The person has an authenticated account and is routed to the appropriate next step without being placed in an unexplained empty workspace. |
| **Error cases** | Invalid input identifies the field and correction. Existing account offers Sign in rather than a generic failure. Authentication failure does not disclose whether another person belongs to a workspace. Expired/invalid invite explains that it cannot be used and provides the approved recovery path. |
| **Edge cases** | A person accepts an invite after already having an account; they are asked to sign in and then see the invite. A person opens an invite in a different browser/device; the flow preserves the intended invitation after authentication. A person is removed between opening and accepting; access is denied with a clear, non-disclosing explanation. |

## 2. Onboarding

| Element | Definition |
|---|---|
| **Goal** | Bring a new coordinator to a minimally operational workspace without forcing a full data-entry session. |
| **Trigger / precondition** | A newly registered non-invited user has no workspace, or has deliberately selected Create workspace. |
| **Expected interface** | A short, calm sequence with one decision per step, an accurate progress indicator if used, Back navigation, Save/continue behavior, and explicit defer options for optional information. |
| **Steps** | 1. Create workspace. 2. Add care recipient preferred name. 3. Choose Add emergency contact now or I’ll add this later. 4. Choose Invite someone now or I’m coordinating alone for now. 5. Add first task or explicitly state no task is ready. 6. Add upcoming appointment or state none is upcoming. 7. Finish and arrive at Today. |
| **Success condition** | The user lands on Today with the care recipient’s name visible and at least enough entered/explicitly deferred information to understand where to add and find core items. |
| **Error cases** | Required workspace/care-recipient name fields provide specific inline messages. An invitation or appointment error retains earlier onboarding information. Network interruption presents a resumable state. |
| **Edge cases** | User leaves partway through; on return, resume from the last completed step without duplicating records. User decides to set up alone; no repeated invitation blocking. User has no task or appointment; Today shows suitable empty guidance without marking the workspace as failed. User enters sensitive details then uses Back; the product warns before discarding unsaved values. |

## 3. Workspace Creation

| Element | Definition |
|---|---|
| **Goal** | Establish a named, private context tied to one care recipient. |
| **Trigger / precondition** | Authenticated user begins onboarding or selects Create workspace, if multiple workspaces are supported. |
| **Expected interface** | A simple creation form with a workspace/family label only if required by the technical model, an explanation that the workspace is for coordinating one person’s care, and no distracting configuration options. |
| **Steps** | 1. User reviews the one-care-recipient purpose. 2. They enter a workspace/family name if requested or accept an intelligent default derived from the care recipient. 3. They continue to care-recipient creation. 4. The system creates the workspace and assigns the creator as Owner. |
| **Success condition** | A private workspace exists with one Owner and a clear active-workspace context. |
| **Error cases** | Empty/invalid name messages are field specific. Duplicate/internal creation failure keeps user input and offers retry. Technical access conflict is escalated to approved support rather than silently creating a duplicate workspace. |
| **Edge cases** | Owner belongs to an existing workspace; the active context must remain clear. User enters a long or non-Latin name; it is accepted within technically reasonable limits and rendered safely. User abandons before save; no empty workspace is created. |

## 4. Care Recipient Creation

| Element | Definition |
|---|---|
| **Goal** | Give the workspace a clear, respectful person-centered context. |
| **Trigger / precondition** | Newly created workspace or authorized Owner/Coordinator selects Edit care profile. |
| **Expected interface** | A dedicated focused form or page headed “About [Care Recipient]” after the preferred name is supplied. Required and optional fields are plainly distinguished. |
| **Steps** | 1. User enters preferred name (required). 2. They may add photo, legal name, contact details, birthday, address, preferences, or care-context summary. 3. The system validates only entered fields. 4. User saves and sees the Care page or next onboarding step. |
| **Success condition** | The preferred name appears consistently in workspace context and the Care profile has an authoritative page. |
| **Error cases** | Missing preferred name blocks save with explicit message. Invalid entered phone/email/date format explains the expected format without erasing other values. Image upload failure retains profile text and explains retry. |
| **Edge cases** | Care recipient uses a nickname, mononym, or non-Latin script; all are handled respectfully. User lacks an address or birth date; those fields remain optional. Profile is later changed; Timeline reports the material update without echoing sensitive field values. |

## 5. Caregiver Invitation

| Element | Definition |
|---|---|
| **Goal** | Add a trusted person to the care circle with a clear role and understandable access expectations. |
| **Trigger / precondition** | Owner or permitted Coordinator selects Invite member from Care Team, onboarding, or Add menu. |
| **Expected interface** | A focused Invite member flow with name, invitation destination/identity method, relationship/role label, workspace role, concise role explanation, and a clear Send invitation action. |
| **Steps** | 1. Authorized user selects Invite member. 2. They enter the person’s name and contact/invitation information. 3. They choose a role and read the concise description of permissions. 4. They send invitation. 5. The invite appears as Pending. 6. Invitee authenticates and accepts. 7. The member appears Active in Care Team. |
| **Success condition** | The invited person can join the intended workspace after valid authentication, and both parties understand whether access is Pending or Active. |
| **Error cases** | Invalid contact format is explained inline. A duplicate active member is identified without exposing unrelated accounts. Delivery failure does not claim send success; offer retry/copy route only if privacy-approved. Expired invite offers resend to the authorized inviter. |
| **Edge cases** | Invitee already has an account; they sign in and accept. Invitee accepts multiple invitations; they choose/see distinct workspaces clearly. Inviter removes/cancels invite before acceptance; it cannot be accepted. A member is invited with a role later changed before acceptance; acceptance screen shows current role. An invite destination is mistyped; Owner can cancel and reissue. |

## 6. Task Creation

| Element | Definition |
|---|---|
| **Goal** | Turn a coordination responsibility into visible, owned, time-aware work. |
| **Trigger / precondition** | Authorized user selects Add task from Today, Tasks, an appointment detail, or contextual prompt. |
| **Expected interface** | Quick capture form with Title, Assignee, Due date, and Add details control. Assignee defaults to Unassigned rather than the creator unless user explicitly chooses themselves. |
| **Steps** | 1. User selects Add task. 2. They enter a concise title. 3. They optionally choose an active care-team assignee, due date/time, and description. 4. They optionally relate it to an appointment/document if such contextual entry is supported. 5. They save. 6. System confirms and routes back to the relevant context. |
| **Success condition** | The task appears in its correct Tasks group and, if overdue/due today/upcoming, in the matching Today section. Assignment and date state are visible. |
| **Error cases** | Missing title blocks save with field message. Invalid date/time is explained and preserves text. A removed/pending assignee cannot be selected; if selected through a stale session, prompt to choose an active member. Save failure retains task draft and explains retry. |
| **Edge cases** | No care-team member exists; Unassigned works without friction. User enters a past due date; label explains it will appear as Overdue on save. User adds a title with a long name; list wraps/truncates accessibly and full detail remains available. A task created in an appointment context should preserve a link without turning the appointment itself into a task. |

## 7. Task Assignment or Reassignment

| Element | Definition |
|---|---|
| **Goal** | Make a responsibility’s owner explicit and update shared awareness when it changes. |
| **Trigger / precondition** | Authorized user opens a task detail or uses a quick assignment control; active care-team members exist. |
| **Expected interface** | A labeled Assignee selector that includes each active eligible member and an explicit Unassigned option. The current assignee, if any, is visible before change. |
| **Steps** | 1. User opens task detail or assignment control. 2. They select a care-team member or Unassigned. 3. They confirm/save. 4. The task summary, Today, Tasks, and Timeline reflect the new assignment. |
| **Success condition** | The task visibly shows the chosen owner or Unassigned state everywhere it is summarized. |
| **Error cases** | Viewer/contributor without permission sees no editable control or receives clear access feedback on a direct link. Removed/pending members cannot receive new assignment. Save failure preserves prior assignment and tells user it did not update. |
| **Edge cases** | Current assignee is removed; authorized user sees Needs reassignment rather than silent reassignment. Task is simultaneously reassigned by another person; system surfaces the conflict/current state and requires intentional resolution. User assigns to themselves; allowed as an explicit choice. User unassigns an overdue task; it remains overdue and clearly Unassigned. |

## 8. Task Completion and Reopening

| Element | Definition |
|---|---|
| **Goal** | Record that work is complete while retaining a trustworthy shared history. |
| **Trigger / precondition** | Authorized member selects Complete on an open task. |
| **Expected interface** | Inline completion action in lists/Today and full completion control in task detail. A successful state visually changes the task without disorienting the user. |
| **Steps** | 1. User selects Complete. 2. System commits the state change and records actor/time. 3. Task leaves active Today/Tasks groups and appears in Completed. 4. Timeline records completion. 5. If permitted, user can Reopen from task detail. |
| **Success condition** | The task no longer appears as actionable, shows completion attribution/time, and can be found in Completed/history. |
| **Error cases** | User without completion permission receives a clear role explanation. Save/network failure leaves task open and preserves the ability to retry. If task was already completed elsewhere, show current status rather than duplicate event. |
| **Edge cases** | Completing an overdue task removes it from Needs attention. Completing a task assigned to another member is allowed only according to resolved role rules and always attributes the completing person. Reopening reintroduces the current due-date status; a past due date returns it to Overdue. A user clicks twice; idempotent behavior must prevent duplicate completion events. |

## 9. Appointment Creation

| Element | Definition |
|---|---|
| **Goal** | Capture a shared, time-bound appointment so family can prepare and attend. |
| **Trigger / precondition** | Authorized user selects Add appointment from Today, Calendar, Add menu, or related care context. |
| **Expected interface** | Focused form with Title/reason, Date, Time optional, Location/mode optional, Provider/contact text optional, attendees optional, preparation task/link optional, and Notes optional. |
| **Steps** | 1. User opens Add appointment. 2. They enter a title and date. 3. They optionally add time, location/mode, provider text, attendees, related task, and note. 4. They save. 5. Calendar receives the scheduled appointment; Today includes it when current/relevant; Timeline receives a creation event. |
| **Success condition** | The appointment is visible in Calendar in workspace-local order, has an authoritative detail view, and is visible on Today when today or in the upcoming horizon. |
| **Error cases** | Missing title/date and invalid date/time receive inline correction. If a date is unavailable due to technical parse issue, user can type it in expected format. Save failure preserves the draft. Attempt to create from an unauthorized role is blocked clearly. |
| **Edge cases** | Time unknown; show Time not set. Appointment has no provider; accepted. Appointment spans a day boundary; technical model must display the intended date/time clearly. User creates a past appointment for history; allowed only with clear past-date state and no implication of attendance. Cancellation requires confirmation; cancellation appears in Calendar/Timeline but should not clutter Today as an active event. |

## 10. Medication Entry

| Element | Definition |
|---|---|
| **Goal** | Maintain a family-entered medication reference list that can be found and reviewed without implying clinical validation. |
| **Trigger / precondition** | Authorized Owner/Coordinator selects Add medication from Care → Medications or an appropriate reference shortcut. |
| **Expected interface** | A dedicated medication entry/detail page headed with the care recipient’s name and a short non-clinical reference notice. Fields: Name, Form/strength, Instructions or schedule, Prescriber/pharmacy, Note, and Last reviewed. |
| **Steps** | 1. User opens Medications and chooses Add medication. 2. They read/acknowledge the reference-information context if required by approved copy. 3. They enter medication name and any known optional details. 4. They save. 5. Item appears in active list with last-reviewed date. 6. Later, authorized user edits, archives, or marks reviewed. |
| **Success condition** | The medication is retrievable from Care → Medications, clearly labeled as family-entered reference information, and contains no calculated safety/recommendation output. |
| **Error cases** | Missing medication name blocks save. Invalid date format for Last reviewed is explained. Permission failures are explicit. Save error preserves non-sensitive input where technically safe and does not claim list update. |
| **Edge cases** | Family does not know strength/instructions; optional fields may remain blank. Medication is stopped; archive rather than erase ordinary history, subject to retention policy. Duplicate medication names are permitted but user receives a gentle duplicate check without clinical assertion. User asks a clinical question through a note field; product does not answer or classify it. |

## 11. Document Upload

| Element | Definition |
|---|---|
| **Goal** | Store and retrieve an important authorized file with enough context to find it later. |
| **Trigger / precondition** | Authorized user selects Upload document from Documents, Add menu, Emergency linked-files context, or a related record. |
| **Expected interface** | A focused upload flow: file selection, upload progress/state, editable title, category, document date, note, and Save. Supported file constraints are visible before selection. |
| **Steps** | 1. User selects Upload document. 2. They choose a file. 3. System evaluates/receives file and displays processing state. 4. User reviews title and adds optional metadata. 5. They save/confirm. 6. Document appears in Documents with availability state; related context links to it if selected; Timeline records upload. |
| **Success condition** | An authorized user can find the document by title/category/date and safely open/download it using the implementation’s supported behavior. |
| **Error cases** | Unsupported type, file too large, failed processing, inaccessible source file, and upload interruption each get distinct plain-language explanations. Metadata persists when feasible. User is never told upload succeeded if processing failed. Permission error does not expose whether a document with a sensitive title exists. |
| **Edge cases** | Duplicate file/title; permit with clear metadata rather than overwrite. User uploads a photo/scanned document; accepted only if supported and treated as an ordinary file—no OCR claims. File is temporarily quarantined/unavailable; show appropriate state and prevent misleading open action. Related task/appointment is later deleted; document remains in Documents but the stale link is resolved safely. |

## 12. Timeline Review

| Element | Definition |
|---|---|
| **Goal** | Reconstruct meaningful shared activity and recent care coordination changes without scanning messages. |
| **Trigger / precondition** | Member selects Updates → Timeline or a Recent changes item from Today. |
| **Expected interface** | A newest-first chronological list with actor, action, object, time, and a destination link when available. Optional simple filters are visually contained and resettable. |
| **Steps** | 1. User opens Timeline. 2. They scan recent events or apply an available actor/type/date filter. 3. They select an event if they need current record detail. 4. They return to Timeline without losing sensible filter/scroll context where feasible. |
| **Success condition** | User can understand what changed, who changed it, and where to find current information without encountering a noisy record of passive views. |
| **Error cases** | No events explains that activity will appear after shared changes. Loading failure provides retry. A referenced record no longer available displays a retained concise event and clear “This item is no longer available” explanation subject to privacy policy. Unauthorized users cannot use Timeline to learn details of a now-restricted record. |
| **Edge cases** | Multiple events occur in close succession; preserve order and timestamps. The same record is edited several times; show meaningful individual events or a technically defensible grouped event without obscuring actor/time. A member changes their displayed name; historic events retain understandable identity behavior per technical policy. Long histories must paginate/load progressively without disrupting orientation. |

## 13. Note Creation and Management

| Element | Definition |
|---|---|
| **Goal** | Capture shared coordination context that is neither a task nor an appointment. |
| **Trigger / precondition** | Authorized user selects Add note from Add menu, Updates → Notes, or appropriate contextual link. |
| **Expected interface** | A focused quick-capture form with Note text required and optional title. It includes concise guidance: use a task for a responsibility and an appointment for a scheduled event. |
| **Steps** | 1. User chooses Add note. 2. They enter a body and optional title. 3. They save. 4. Note appears in Updates → Notes; Timeline records a note-created event without exposing the body in the event row. 5. Author/authorized editor may edit or delete according to permission rule. |
| **Success condition** | The note is attributable, readable, and distinct from Timeline events; a user can later find it in Notes. |
| **Error cases** | Empty body blocks save. Permission/role feedback is explicit. Save failure retains draft where technically safe. Delete requires confirmation and clearly explains history/retention behavior. |
| **Edge cases** | User enters a to-do in a note; product may offer a non-blocking “Create a task instead” action but must not auto-create work. Notes can be long; editor and rendering remain accessible. Multiple people edit simultaneously; technical model must prevent silent overwrite or clearly surface current version. Deleted note remains represented in Timeline only as permitted by privacy/retention policy. |

## 14. Emergency Information Access and Update

| Element | Definition |
|---|---|
| **Goal** | Retrieve family-entered emergency reference information rapidly and update it deliberately. |
| **Trigger / precondition** | Authenticated member selects persistent Emergency control; authorized user may select Edit. |
| **Expected interface** | A direct, no-tab landing page with approved safety statement, emergency contacts first, call actions when supported, essential reference sections, linked documents, last-reviewed date, and Edit for authorized roles. |
| **Steps** | 1. User selects Emergency from any authenticated primary screen. 2. The summary opens immediately. 3. User may call a listed contact/device action, read reference details, or open authorized linked document. 4. Authorized user chooses Edit to add/change data and save. 5. System records a non-sensitive update event and reflects last-reviewed date. |
| **Success condition** | An authorized user reaches emergency contacts and reference details in two interactions or fewer, with no need to search or enter edit mode. |
| **Error cases** | Incomplete data states exactly which broad section is not entered without fabricating content. View permission failure is clear. Edit validation retains correct values. A linked document unavailable state offers the document’s safe fallback behavior. |
| **Edge cases** | No emergency contact has been entered; page shows a plain Add contact action and the product safety statement. Contact number lacks a type; user can still view/copy, but editor may encourage a label. User is on desktop without calling; number is copyable/readable. User needs immediate emergency help; product displays approved direction to call local emergency services and does not collect/triage the event. |

## 15. Dashboard / Today Usage

| Element | Definition |
|---|---|
| **Goal** | Quickly orient to the family’s current coordination needs and take the next useful action. |
| **Trigger / precondition** | Authenticated member opens the product, selects Today, or completes an action and returns. |
| **Expected interface** | Page heading “Today for [Care Recipient]”; Needs attention, Today, Coming up, Recent changes, and Quick reference in fixed priority order; labeled Add action and persistent Emergency. |
| **Steps** | 1. User scans Needs attention for overdue tasks. 2. They scan Due today and schedule items. 3. They complete/open/assign a task or open an appointment as needed. 4. They review Coming up and Recent changes when relevant. 5. They open reference content or create a new record via Add. |
| **Success condition** | User can identify the most time-relevant work and its owner without opening multiple modules. Actions update corresponding authoritative views and return the user to a coherent Today state. |
| **Error cases** | Loading uses an explicit state rather than empty cards. No current data gives calm, actionable empty guidance. Item opening failure reports safe retry. Permission action failures state access limitation without implying the data is missing. |
| **Edge cases** | Many overdue tasks; keep section ordered/scrollable with route to all Tasks, but never hide the count. No tasks but appointments today; schedule leads. Multiple events at same time; preserve clear order. Mobile view remains single column and does not collapse urgent items behind a “See more.” Workspace has stale/last known data; display freshness only when technically defensible. |

## 16. Returning User Experience

| Element | Definition |
|---|---|
| **Goal** | Allow a caregiver returning after an interruption to re-establish shared awareness in seconds. |
| **Trigger / precondition** | Existing member signs in or returns to an active session. |
| **Expected interface** | Today loads as the default authenticated destination for the active workspace, with current care-recipient context, prioritized work, recent changes, and persistent Emergency. No generic marketing landing page or repetitive onboarding gate appears. |
| **Steps** | 1. User authenticates or resumes session. 2. System lands on Today for last active workspace, unless invitation/permission status requires another route. 3. User sees overdue/due-today/schedule priorities and recent changes. 4. User chooses a task, appointment, reference view, or Add action. 5. Optional non-blocking setup cue appears only if critical activation elements remain intentionally deferred. |
| **Success condition** | The user understands what changed and what needs attention without retracing onboarding or hunting through the navigation. |
| **Error cases** | Expired session routes to authentication then returns to intended authorized page where safe. Workspace access removed routes to a clear no-access state. Data loading/error has retry and does not show stale information as current. |
| **Edge cases** | User belongs to multiple workspaces; visibly confirm which workspace is active and provide deliberate switching. User returns months later; Today prioritizes current dated work and offers Recent changes without flooding the screen with all history. User has no outstanding work; show settled state and next appointment/reference links. Emergency data is older; show last-reviewed date but do not automatically assert it is incorrect. |

## Flow Coverage and Non-Goals

These flows intentionally do not cover clinical decision support, medication verification, provider scheduling, external calendar synchronization, medical alerts, telehealth, automated reminders, insurance/Medicare workflows, native app flows, marketplace interactions, AI agents, or complex analytics. Requests arising during validation should be recorded as evidence and considered only after the core coordination loop proves repeat value.
