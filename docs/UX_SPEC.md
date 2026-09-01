# Family Care Command Center — UX Specification

**Document status:** Final for V1 product/UX handoff  
**Owner:** Manus AI, Product + UX  
**Audience:** Google Antigravity and Human Product Owner  
**Last updated:** September 1, 2026

## 1. Experience Intent

Family Care Command Center should reduce the feeling that critical family coordination exists only in somebody’s head, inbox, or message thread. The experience is **calm and action-oriented**: it should make the next useful step clear without performing urgency, medical authority, or enterprise complexity.

The interface must feel trustworthy because it handles sensitive information. Trust is earned through predictable navigation, legible status, clear ownership, deliberate sharing controls, understandable error recovery, and no hidden interpretation of a family’s care information. Warmth comes from humane language and respectful treatment of the care recipient, not from decorative excess or sentimental imagery.

## 2. UX Success Criteria

| Experience outcome | Observable signal |
|---|---|
| A user can orient rapidly. | A returning coordinator identifies overdue/due-today work, today’s schedule, and the care-recipient context without navigating away from Today. |
| Responsibility is unambiguous. | Users can identify a task’s owner or see that it is Unassigned from summary and detail views. |
| Essential reference is retrievable under pressure. | An authorized user reaches Emergency Information from any authenticated primary screen in two interactions or fewer. |
| The product works with partial information. | A workspace with only basic profile, one task, and one appointment still feels usable; it is never blocked by incomplete optional data. |
| Users are not punished for mistakes. | Validation errors are specific, inputs are preserved, destructive actions are confirmed, and high-impact access changes are understandable. |
| Mobile remains purposeful. | Core check-in, task completion, appointment view, emergency retrieval, and quick-capture tasks are usable with one hand at narrow widths. |
| The product remains within a non-clinical boundary. | No visual treatment or copy implies diagnosis, treatment advice, medication safety checking, monitoring, or emergency response. |

## 3. Page Shell and Persistent Context

The authenticated shell displays the current workspace and care recipient’s preferred name. It provides stable primary navigation, an Emergency control, a labeled Add action, account access, and an accessible mechanism to switch workspaces only if multiple-workspace access is technically supported.

The care recipient’s name must appear in the page heading or immediately adjacent context on all primary destinations. This prevents cross-workspace errors and reassures a remote family member that they are viewing the correct person’s records.

| Persistent element | Desktop behavior | Mobile behavior | Accessibility requirement |
|---|---|---|---|
| Workspace/care-recipient context | Visible in header/rail. | Visible in compact header; never hidden behind an unlabeled avatar alone. | Textual label and accessible name. |
| Primary navigation | Six visible destinations. | Five high-frequency destinations plus More. | Current page is programmatically and visibly indicated. |
| Emergency | Always visible, visually distinct, not animated. | Always visible in header or independently reachable control. | Text label, keyboard focus, high contrast, no reliance on red alone. |
| Add action | Labeled button opens focused choices. | Labeled fixed/anchored control if it does not obscure content. | Provides a real button label; menu actions are keyboard reachable. |
| Account/menu | Utility header menu. | Utility header menu. | User name/initial is supplemental, never the only accessible label. |

## 4. Today Dashboard

### 4.1 Purpose and Hierarchy

Today must answer: **“What does my family need to know or do right now?”** It must be ordered by action relevance rather than record type, visual novelty, or equal-size cards. The page does not show every module by default.

| Priority | Section | Entry condition | Interaction expectation |
|---|---|---|---|
| 1 | **Needs attention** | One or more overdue tasks. | Each item opens task detail; authorized users can complete or assign from a compact interaction. |
| 2 | **Today** | Due-today tasks and/or today’s appointments. | Tasks and agenda are visually separated within one section. |
| 3 | **Coming up** | Upcoming dated tasks or appointments within seven days. | Compact preview with an obvious full-list route. |
| 4 | **Recent changes** | Material events exist. | Shows 3–5 concise events; each opens Timeline or the related record. |
| 5 | **Quick reference** | Always. | Emergency, medications, care team, and documents are stable shortcuts. |

Do not use an overall productivity score, health score, completion chart, greeting carousel, passive notifications, or large decorative hero. When there are no overdue or due-today items, the top of Today should feel settled rather than empty: state that there is nothing needing attention today, show the next appointment/coming-up section when available, and retain the Quick Reference row.

### 4.2 Dashboard Item Anatomy

A task summary always contains an action/status marker, task title, owner or **Unassigned**, due state, and an action for authorized users. An appointment summary contains time/date, title, location/mode if present, and cancellation state. A timeline summary contains actor, plain-language action, object title/type, and time. Quick-reference controls have a text label and an optional count/status but no clinical alarm styling.

The system may use a muted overdue tint and a semantic status badge, but “Overdue” must remain explicit text. Color alone must not indicate task state. Avoid bright red backgrounds, pulsing indicators, countdowns, or terminology such as “critical” except where the user has personally entered it into a free-text note.

### 4.3 Dashboard States

| State | Today experience |
|---|---|
| Newly created workspace | Explain the simple setup sequence and offer one next action: Add a task. Show a secondary route to Add an appointment. |
| No current work | State “Nothing needs attention today” in a calm tone; show Coming up and Quick Reference. |
| Overdue work exists | Render Needs attention first; do not bury it in collapsed content. |
| Many current items | Show the first practical group with a count and explicit “View all tasks” or “View calendar”; never force scrolling through an unbounded mixed feed. |
| Missing care-team members | Keep tasks functional; show ownership as Unassigned and a contextual invite option without forcing it. |
| Offline/load error | Retain last-known content only when clearly labeled as potentially out of date; otherwise show a clear retry state. |

## 5. Onboarding and Progressive Disclosure

The primary onboarding goal is to take a new coordinator from account creation to an operationally meaningful Today view with minimal cognitive load. It must never request detailed clinical data, comprehensive document upload, medication information, or every family member as a prerequisite for starting.

| Step | Required decision or input | Purpose | Deferral path |
|---|---|---|---|
| 1. Create workspace | Workspace/family label if required; otherwise default it from care recipient. | Establish private context. | None if required to continue. |
| 2. Add care recipient | Preferred name required; photo, legal name, contact details, birthday, preferences optional. | Establish a human-centered workspace context. | Optional fields saved for later. |
| 3. Emergency decision | Add one emergency contact **or** explicitly choose “I’ll add this later.” | Makes safety reference an intentional choice without blocking setup. | Return via persistent Emergency shortcut and setup checklist. |
| 4. Team decision | Invite a person **or** choose “I’m coordinating alone for now.” | Acknowledges that collaboration is central but not universal. | Invite via Care Team/Add action. |
| 5. First task | Title required; owner/due date optional. | Creates first actionable coordination item. | Cannot skip unless a clear “I have no task to add yet” path is retained as incomplete activation. |
| 6. Upcoming appointment decision | Add appointment or say none is upcoming. | Establishes schedule behavior without assuming an appointment. | Add from Calendar/Add action. |
| 7. Finish | Show Today with a concise “You can add details anytime” completion state. | Reinforces orientation and prevents a dense post-onboarding checklist. | Care profile/completeness cues remain non-blocking. |

The experience may use a low-pressure setup checklist until activation is complete, but it must not occupy more visual hierarchy than actual overdue/today information and must be dismissible after an explicit user choice. The checklist must not use gamified language, progress confetti, badges, or streaks.

## 6. Interaction Design by Record Type

### 6.1 Tasks

Task quick capture uses only title, assignee, and due date as visible initial fields, with **Add details** revealing description and optional time. The full task detail allows careful review/editing. Selecting an assignee must include an explicit Unassigned option. A completed task visibly shows completion actor/time and supports **Reopen** for authorized users.

A task due date field must accept accessible typed input and offer a picker; a person who cannot use the picker must not be blocked. When a user enters a past date for a new incomplete task, clarify that it will appear as overdue after saving. Do not infer task priority from words or link tasks to medical urgency.

### 6.2 Appointments

Appointment quick capture uses title/reason, date, and time as the core sequence; time remains optional. Location/mode, provider/contact text, attendees, related preparation task, and notes are progressive detail. The UI distinguishes **Scheduled**, **Completed/occurred**, and **Cancelled** states. Cancelling asks for confirmation and makes the resulting state clear in Calendar, Today, and Timeline.

The date/time interaction must accept flexible text entry or an accessible picker. If a time is unspecified, display “Time not set” rather than inventing a default. If an appointment is changed, the Timeline summarizes the event but the family should be able to see current authoritative detail in Calendar.

### 6.3 Care Profile and Care Team

Care Profile uses a readable structured page. The header may contain preferred name and optional photo; it must not overemphasize age or medical information. Sections are short and editable. Optional values are labeled as optional, and no sensitive data is pre-filled.

Care Team explains why a person is being invited, their role, and what that role can generally do before the invitation is sent. Role assignment changes and removals require confirmation. The interface should make Pending invitations and Active members visually and semantically distinct. It must never share a care recipient’s sensitive details in a pre-authenticated invitation preview beyond what privacy policy and authorization design permit.

### 6.4 Medications

Medication entry takes place in a focused Care → Medications page or detail view—not a dashboard modal. It uses a clear reference-information preamble and a visible **Last reviewed** date. “Name” is the only required data point. Do not make fields clinically constrained unless a user-experience and legal review confirms that a constraint cannot cause unsafe exclusion. Use text labels such as “Instructions or schedule (as written or understood by your family)” rather than implying verified dispensing data.

### 6.5 Documents

The upload interaction starts with file selection, then presents title, category, document date, and note. The user must see upload/scan availability state. If a file cannot be accepted, state why in plain language, preserve non-file metadata when feasible, and offer a safe retry. No file is treated as verified by the platform.

### 6.6 Updates

Timeline event language has a consistent grammar: **[Person] [action] [record] [time]**. For example, “Maya completed ‘Pick up prescriptions’ today at 10:14 AM.” Avoid exposing sensitive field values in event rows. Notes have author, time, and clear edit behavior. Notes are not a real-time chat experience; no typing indicators, read receipts, reactions, or social feed mechanics belong in V1.

### 6.7 Emergency

Emergency opens immediately to emergency contacts with phone actions where technically supported. The first screen contains a concise safety statement, emergency contacts, and last-reviewed date. Details may continue vertically, but core contacts cannot be placed behind tabs or accordions. The editing experience may be a page or focused section, and it should prompt owners/coordinators to record when details were last reviewed rather than making a claim that they are current.

## 7. Responsive Behavior

| Area | Desktop, 1024px and above | Tablet / medium width | Mobile, below 768px |
|---|---|---|---|
| Today | Two purposeful columns only when each maintains readable line length: action/schedule plus updates/reference. | Prefer one main column with compact reference row. | Single column; Needs attention and Today always above Coming up. |
| Tasks | Grouped list; filters may be horizontal and persistent. | Grouped list; filters collapse to a controlled menu. | Grouped stack; owner/due state remains visible; filters in a bottom sheet/page. |
| Calendar | Agenda default; optional month view may have side detail. | Agenda first; month view secondary. | Agenda only by default; date jump accessible. |
| Care | Two-column profile/detail layout where readable. | Single column with section anchors/tabs. | Single column; avoid horizontal data grids. |
| Documents | List/table may show metadata columns. | Reduce secondary columns. | Card/list rows with title, category, and state; details on open. |
| Updates | Timeline and Notes may use tabs with wider record context. | Same model. | Tabs remain text-labeled; filters go to a separate accessible sheet. |
| Navigation | Stable left rail/top shell. | Condensed rail or top navigation. | Bottom navigation + More, persistent Emergency, clear active state. |

Touch targets must be comfortably sized, key actions must remain reachable without hover, and long task/document titles must wrap or truncate with accessible full-name exposure. Avoid two-dimensional scrolling. A modal that is usable on desktop but cramped on mobile must become a full-screen focused form rather than force a small scrollable overlay.

## 8. Accessibility Requirements

The V1 product must meet WCAG 2.2 AA as the implementation target. This is a design requirement and requires technical verification by Antigravity. Important baseline rules are summarized below.

| Requirement | Design rule |
|---|---|
| Text and scale | Body text must be readable at browser zoom and user text-size changes; do not use tiny metadata as the sole carrier of a due date or person. |
| Contrast | Text, icons, focus indicators, and state badges meet AA contrast; no light-gray critical information. |
| Focus | All actionable controls show a highly visible focus indicator; keyboard focus order follows visual order. |
| Semantics | Use native semantic controls and correct headings; status changes should be announced appropriately without creating screen-reader noise. |
| Status communication | Overdue, completed, cancelled, pending, and unavailable states use text plus optional icon/color. |
| Form error recovery | Identify the invalid field, explain the correction, preserve valid input, and move focus predictably on submit. |
| Motion | Do not depend on animation; respect reduced-motion preferences; no pulsing or flashing urgency treatment. |
| Touch and dexterity | Provide sufficiently large targets and spacing; avoid precision-dependent drag/drop as the only interaction. |
| Language | Labels and instructions use familiar words; icons do not stand alone; date/time inputs support a clear text alternative. |

The product should be accessible to care recipients or relatives who may be older, even though the primary V1 user is an adult coordinator. Research with adults aged 65+ has documented challenges from small text, tiny targets, weak contrast, and rigid forms, reinforcing the importance of this baseline.[1]

## 9. Error, Empty, and High-Impact States

| Situation | Required UX response |
|---|---|
| User lacks permission | Keep page context where safe, state that the action is unavailable for their role, and avoid exposing controls that will fail. |
| Member removed while viewing workspace | End the session/workspace view safely; explain access is no longer available without revealing additional content. |
| Pending invite re-opened | State invitation status, expiration if applicable, and one clear action to accept or request a new invite. |
| Task assignee removed | Show a “Needs reassignment” state to authorized users. Do not silently reassign work. |
| Appointment has passed | Display as past/occurred based on user action; do not auto-mark medical attendance or outcomes. |
| Document upload fails | Explain the safe reason if known, retain metadata where possible, and offer retry; no false success. |
| Network loss during edit | Preserve local draft when technically safe, identify unsaved status clearly, and offer retry/resolution. |
| Emergency information incomplete | Show an unobtrusive but clear “Some emergency details are not entered” message with Add/Review action; never fabricate information. |
| Destructive action | Use confirmation that names the affected record/person and consequence; after action, confirm result and provide undo only where technically reliable. |

## 10. Content Style

The voice is calm, direct, compassionate, and nonjudgmental. Use short verbs and specific nouns. Prefer “Add an emergency contact” to “Configure emergency information.” Prefer “No one is assigned yet” to “Owner missing.” Prefer “Review medication list” to “Reconcile medications.” Avoid jargon, blame, urgency theater, and care-recipient infantilization.

| Use | Avoid |
|---|---|
| “Needs attention” | “Critical alerts” |
| “Due today” | “Delinquent” |
| “No one is assigned yet” | “Unowned task” |
| “Add details when you’re ready” | “Complete required profile” for optional fields |
| “For an emergency, call local emergency services.” | “We’ll get you help.” |
| “Shared reference information” | “Verified medical record” |

## 11. UX Acceptance Review Checklist

Before implementation is accepted for beta, the Product Owner and Antigravity should verify that Today retains the specified priority order; tasks always show ownership; calendar behavior remains appointment-focused; Emergency is persistently reachable; partial setup is functional; every form is usable by keyboard and at mobile width; destructive/access changes have confirmation; medication/emergency copy remains non-clinical; and technical limitations have not silently changed a user-visible decision.

## References

[1]: https://www.nngroup.com/articles/usability-for-senior-citizens/ "Nielsen Norman Group — Usability for Older Adults: Challenges and Changes"
