# Family Care Command Center — V1 Scope

**Document status:** Final for V1 product/UX handoff  
**Owner:** Manus AI, Product + UX  
**Decision authority:** Human Product Owner  
**Last updated:** September 1, 2026

## Final V1 Boundary

V1 is a **responsive, private shared workspace for one aging care recipient and a small trusted family/care team**. It gives a coordinating family member a reliable operating view of current work, upcoming commitments, shared reference information, and changes made by the family. V1 may be placed in front of real caregivers within 90 days because it limits itself to structured coordination and document/reference organization.

The minimum coherent loop is:

> Create a private workspace → add enough context to coordinate → invite one or more trusted people → record and assign work → see what requires attention → update or retrieve the needed information → return when something changes.

A family that can complete this loop has value even if it never uses sophisticated integrations, external synchronization, AI, automation, analytics, or native mobile software.

## Requirement Audit

### Ambiguities Requiring a Product Decision

| Topic | Why it is unclear | V1 default for the handoff | Decision owner / timing |
|---|---|---|---|
| Care-recipient count | The brief names a Care Profile but does not say whether one family can manage multiple people. | **One care recipient per workspace.** Multiple recipients are post-V1. | Human Product Owner before beta recruitment. |
| Invited-member permissions | “Family / Care Team” does not define role rights or sensitive-content access. | Four intent-level roles are defined in `PRODUCT_BRIEF.md`; detailed field permissions require technical/privacy review. | Product Owner + Antigravity before implementation. |
| Reminders and notifications | The product must surface timely work while “elaborate push notification infrastructure” is excluded. | In-app state and dashboard prioritization only in baseline V1. Optional transactional invitation emails are technical implementation detail; task/appointment reminders are deferred. | Product Owner before build. |
| Medication schedule behavior | A “medication schedule” could imply reminders or clinical interpretation. | Record a user-entered medication list and optional schedule details; present it as reference information only. No dose calculation, adherence tracking, refill workflow, or clinical alert. | Product Owner before interaction design implementation. |
| Emergency-information availability | Users may expect an emergency card outside sign-in, which increases exposure risk. | Authenticated, persistent Emergency access with a concise printable/viewable emergency summary. No lock-screen or anonymous sharing in V1. | Product Owner + privacy review. |
| Timeline semantics | The term could mean a care history, an audit log, or both. | A chronological, human-readable activity and care-event view. It is not a substitute for a tamper-proof compliance audit log. | Product Owner + Antigravity. |
| Documents | Required document types, storage limits, and scanning/preview capability are unspecified. | Basic file upload, title, category, date, uploader, and optional note. No OCR, extraction, e-signature, or legal/medical document validation. | Antigravity to flag constraints. |

### Missing Requirements That Must Be Made Explicit

The original module list correctly identifies useful information domains but is insufficient on ownership, lifecycle, permission, retention, and recovery. The product specification will make visible: workspace ownership continuity; invitation expiry and re-invitation; removal and access revocation; the difference between completion and deletion; edit attribution; time-zone rules; empty/loading/error behavior; mobile prioritization; document retention/deletion; data export/deletion requests; and emergency information freshness.

Privacy and security cannot be inferred from the promise of a “private place.” Health-adjacent product developers must evaluate legal obligations based on the product’s functions, data, and relationships; HHS’s developer guidance specifically directs teams to such an assessment rather than assuming a universal status.[1] V1 therefore requires a privacy/compliance review gate before production use, not a claim that the product is HIPAA compliant.

### Potential Tensions Resolved for V1

| Tension | Resolution |
|---|---|
| “Everything” in the promise versus “do not expand V1” | “Everything” means the family’s essential coordination information—not every health, financial, communication, or service workflow. The product promise is bounded by the named coordination modules. |
| Eleven modules versus low cognitive load | Keep the information domains but use **six primary navigation destinations**. Care Profile and Emergency are contextual/reference destinations; Timeline and Notes are combined under Updates; Settings is utility navigation. |
| Comprehensive dashboard versus avoiding clutter | The dashboard uses a fixed priority order and compact summaries with clear drill-down paths. It is a work orientation surface, not a page of simultaneous module cards. |
| Need for timely action versus excluded notification infrastructure | Ensure work is visible on return. Do not promise proactive reminders until the product owner authorizes a simple notification baseline. |
| Medication information versus clinical safety | Allow family-entered reference data, use non-clinical labels and disclaimers, and avoid interpretation or advice. |

### Requirements Removed or Deferred Because They Are Not Needed to Validate V1

External calendar synchronization, generalized calendar management, recurring task engines, automated reminders, medication adherence tracking, prescription/refill workflows, medical decision support, AI summarization, AI agents, content OCR, document analysis, insurance or Medicare flows, provider integrations, telehealth, wearable data, billing, advanced reporting, member chat, native mobile apps, multi-recipient portfolios, and configurable enterprise administration are deliberately excluded.

## In-Scope Product Capabilities

| Area | Required V1 capability | Intent and guardrail |
|---|---|---|
| **Dashboard** | Show current priorities in order: overdue, due today, today’s schedule, next seven days, recent changes, and concise reference shortcuts. | Answer “what does the family need to know or do now?” Never present analytics as the main value. |
| **Care Profile** | Store the care recipient’s identity, preferred name, photo optionality, contact basics, address optionality, preferences, and care-context summary. | Minimize initial entry; sensitive details are optional and editable later. |
| **Care Team** | Invite trusted members; display role, status, contact, and relationship/role label. | Coordination visibility, not a provider marketplace or directory. |
| **Tasks** | Create, describe, assign or leave unassigned, set due date, complete, reopen, and view status. | Assignment and due state are always visible; tasks do not imply medical triage. |
| **Appointments** | Create, edit, cancel, and view date/time, location/mode, contact/provider text, attendees, preparation task/link, and notes. | No provider scheduling integration or calendar sync. |
| **Medications** | Maintain user-entered medication reference entries with name, form/strength free text, instructions/schedule free text, prescriber/pharmacy optional text, and last reviewed date. | No clinical validation, interaction checking, dosage calculation, adherence record, or refill management. |
| **Documents** | Upload/download/view authorized files with title, category, date, uploader, and optional note. | No document interpretation or legal/clinical verification. |
| **Updates** | Create free-form notes and review a chronological timeline of material family activity and selected care events. | Notes remain editable user content; Timeline is a readable history, not a legal audit substitute. |
| **Emergency Information** | Provide a fast, authenticated summary of emergency contacts, key conditions/allergies as user-entered text, preferred hospital/provider text, insurance reference text, and document links. | Clearly identify when details were last reviewed; include “call emergency services” language without offering clinical direction. |
| **Settings** | Manage workspace name, ownership transfer request, member roles/access, and account/workspace preferences. | Detailed account/auth configuration belongs to technical implementation. |

## Priority Classification

| Classification | Definition | Dashboard treatment |
|---|---|---|
| **Overdue** | An incomplete task with a due date before the workspace-local current day. | Top priority, explicit overdue label and age; never hidden. |
| **Due today** | An incomplete task due on the current workspace-local date. | Immediately below overdue; ordered by optional time, then creation/priority. |
| **Today’s schedule** | Appointments occurring on the current workspace-local date. | A time-ordered agenda, separate from task work. |
| **Upcoming** | Incomplete tasks and scheduled appointments after today, initially limited to seven calendar days. | Concise, expandable preview; full detail one click away. |
| **Recent change** | An attributable creation, material edit, completion, cancellation, upload, note, or invite event. | A short chronological feed with person, action, object, and timestamp. |
| **Reference** | Important but not time-bound information such as emergency contacts and medications. | Persistent shortcuts; do not compete visually with work requiring action. |

## Definition of a Usable V1

A workspace is considered **activated** when the owner has completed the following: entered a care-recipient name; added or intentionally skipped emergency contacts; invited at least one person or explicitly chosen to work alone; created at least one task; and created at least one appointment or explicitly marked that none is upcoming. Each element can be refined later.

A V1 workspace is considered **operational** when the coordinator can identify their current responsibilities from the dashboard, assign a task to a named care-team member, find emergency reference information in two interactions or fewer from any authenticated primary screen, retrieve an uploaded document, and understand who made the latest change.

## Explicit V1 Exclusions

| Category | Excluded capability | Why excluded |
|---|---|---|
| Clinical decision-making | Diagnosis, treatment recommendation, medication interaction checker, clinical alerts, dosing calculator, medical assistant, physician replacement. | Outside the product boundary and creates unacceptable safety/regulatory risk. |
| Care delivery / commerce | Telehealth, provider marketplace, caregiver marketplace, pharmacy or insurance/Medicare integrations, payments. | Requires partner, operational, and compliance complexity that does not validate coordination value. |
| Integrations / automation | External calendar synchronization, wearables, autonomous agents, automated outreach, complex push infrastructure. | Adds reliability and consent burdens before the core manual loop is proven. |
| Platform expansion | Native iOS/Android applications, multi-recipient portfolio, enterprise administration, social network. | Does not support the 90-day primary test objective. |
| Advanced data features | Complex analytics, recommendations, OCR, document intelligence, AI summaries. | Adds risk and opacity without proving that the foundational workspace is useful. |
| Engagement mechanics | Gamification, activity streaks, feed-style social interactions. | Inappropriate to the trust and low-cognitive-load product posture. |

## Post-V1 Candidate Ideas

Post-V1 candidates are **not commitments**. They may be considered only after real-caregiver validation demonstrates repeat use of the core coordination loop.

| Candidate | Validation prerequisite |
|---|---|
| Simple opt-in task/appointment reminders | Caregivers reliably create due-dated work and say return visibility is insufficient. |
| Recurring tasks or schedules | Repeated work proves common and users cannot manage it with duplicate/copy behavior. |
| External calendar export/synchronization | Users demonstrate missed value from duplicative schedule entry and consent expectations are clear. |
| Multiple care recipients in one account | Multiple-recipient households are a meaningful portion of validated users and navigation remains understandable. |
| Care recipient portal/view | Care recipients express a clear, accessible need to view selected information. |
| Shared care-plan templates | Research shows repeatable, non-clinical coordination patterns without constraining individual family needs. |
| Controlled document extraction/search | Document volume and retrieval failure justify privacy-reviewed processing. |
| Simple notifications | Opt-in preferences, delivery reliability, and urgent-vs-informational language are validated. |

## References

[1]: https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html "U.S. HHS — Resources for Mobile Health Apps Developers"
