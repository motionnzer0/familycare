# Family Care Command Center — Antigravity Handoff

**Handoff status:** Product + UX foundation complete; implementation may begin after resolution of decision-critical open questions.  
**Prepared by:** Manus AI, Product + UX  
**Decision authority:** Human Product Owner  
**Last updated:** September 1, 2026

## Final V1 Boundary

V1 is a **responsive, private shared web workspace for one aging care recipient and a small trusted family/care team**. It coordinates the administrative work of caregiving through an action-prioritized Today dashboard; care profile; care team; tasks; appointments; medication reference; documents; timeline; notes; emergency information; and workspace settings.

The product’s smallest complete loop is: create a workspace, add minimum care context, invite a trusted person or deliberately work alone, create/assign work, see today’s priorities, retrieve reference information, and return when the family’s plan changes. V1 does not provide clinical advice or medical verification.

## Key Product Decisions

| Decision | Handoff requirement |
|---|---|
| One care recipient | A workspace supports one care recipient in V1; multi-recipient management is post-V1. |
| Six primary destinations | Use Today, Tasks, Calendar, Care, Documents, and Updates. Emergency is persistent utility access; Settings is utility navigation. |
| Today priority order | Present overdue tasks, due-today tasks, today’s schedule, upcoming seven-day items, recent changes, then reference shortcuts. |
| Tasks vs appointments | Maintain as separate records; link contextually only. Tasks carry explicit ownership; appointments carry time/schedule context. |
| Medication boundary | Store only family-entered reference details; no interaction checking, clinical interpretation, adherence, refill management, or reminders. |
| Emergency access | Persistent from any authenticated primary screen, with contacts first, last-reviewed date, and approved non-clinical safety copy. |
| Collaboration | Role intent is Owner, Coordinator, Contributor, Viewer. Do not silently select field-level permissions. |
| Notification boundary | Baseline V1 uses in-app state and dashboard prioritization, not proactive task/appointment reminders. |
| Timeline / Notes | Timeline records material attributable system events; Notes are authored free-form coordination context. |

Full rationale and change control are in `DECISIONS.md`; functional constraints are in `PRODUCT_SPEC.md`.

## Key UX Decisions

The interface must feel calm, organized, warm, professional, and trustworthy. It must prioritize fast orientation over a generic analytics dashboard. Avoid dense card grids, tiny typography, decorative visual effects, motion-led urgency, hidden responsibilities, and vague clinical language.

| Area | Required UX behavior |
|---|---|
| Dashboard | Current work appears before reference content. Overdue uses explicit text, due date, and non-color cues; it is never hidden below lower-priority sections. |
| Onboarding | Collect only care-recipient name plus intentional emergency/team/task/appointment decisions. All detailed profile/reference content is deferrable. |
| Actions | Use quick capture for task, appointment, note, document, and invite. Use dedicated pages for profile, medications, emergency, record detail, and settings. |
| Mobile | Optimize for check-in, task completion, appointment view, emergency retrieval, and quick capture—not desktop dashboard compression. |
| Accessibility | Target WCAG 2.2 AA; use readable 16px body text, strong contrast, visible focus, non-color status cues, flexible date/time entry, clear errors, and generous controls. |
| Privacy/trust | Explain roles before invitation, confirm high-impact changes, preserve clear error state, and never imply clinical/emergency-response capability. |

Full screen, state, responsive, and component requirements are in `UX_SPEC.md`, `INFORMATION_ARCHITECTURE.md`, and `DESIGN_SYSTEM.md`.

## Open Questions

Implementation must not proceed by silently guessing the following decision-critical issues:

| ID | Open question | Required owner |
|---|---|---|
| OQ-01 | Applicable legal/privacy framework, product claims, notices, and production-data obligations. | Product Owner with qualified legal/privacy counsel. |
| OQ-02 | Role-by-role visibility/edit rights for emergency details, medications, documents, profile, notes, and timeline. | Product Owner + Antigravity. |
| OQ-03 | Invitation/authentication/account-recovery model. | Antigravity; escalate UX impacts. |
| OQ-04 | Transactional email baseline for invitations, recovery, and access changes. | Product Owner + Antigravity. |
| OQ-05 | Data export, deletion, retention, backups, and document storage policy. | Product Owner + privacy/legal counsel + Antigravity. |
| OQ-06 | File type/size/scan/preview constraints and safe fallback states. | Antigravity. |
| OQ-07 | Emergency information content and legally approved safety copy. | Product Owner + legal/privacy counsel. |
| OQ-08 | Support and recovery path for access issues. | Product Owner + Antigravity. |

See `OPEN_QUESTIONS.md` for validation and technical questions, impact, and escalation expectations.

## Post-V1 Ideas

Potential future candidates include opt-in reminders, recurring tasks, external calendar export/synchronization, multiple care recipients, controlled care-recipient view access, shared coordination templates, document search/extraction, and simple notification preferences. None are V1 commitments; each requires repeated validation evidence and review against the product’s privacy, accessibility, and non-clinical boundaries.

## Risks

| Risk | Why it matters | Mitigation in this foundation |
|---|---|---|
| Scope expansion | Eleven information domains can turn into an overbuilt platform. | One-care-recipient boundary, six primary destinations, explicit exclusions, and core-loop acceptance criteria. |
| Privacy / trust failure | Family-sensitive data and unclear sharing can prevent adoption or cause harm. | Role intent, invitation transparency, open legal/privacy gate, no unsupported compliance claims. |
| Clinical-scope drift | Medication/emergency features may be misread as medical decision support. | Reference-only model, prohibited features, safe language, and formal review gate. |
| Cognitive overload | Caregivers have limited attention and fragmented work. | Fixed dashboard priority, progressive disclosure, concise navigation, and restrained component rules. |
| Weak retention | A one-time organizer may not become a coordination habit. | Validation of returning use, shared task loop, recent changes, and real-world beta triggers. |
| Technical constraint changes UX | Files, invitations, time zones, permissions, or session behavior can alter the product promise. | Mandatory escalation rule and tracked technical questions. |
| Emergency access misunderstanding | Users may expect an emergency-response service or cannot find reference details. | Persistent authenticated access, contacts-first layout, explicit local-emergency-services copy. |

## Handoff Status to Antigravity

**Ready for technical architecture and implementation planning.** Antigravity may determine the technology stack, database schema, authentication/authorization implementation, document storage/scanning, transactional delivery, automated testing, accessibility testing, and deployment. Antigravity must preserve the stated product behavior and flag any technical constraint that changes what users can see, do, share, trust, or expect.

The recommended first implementation slice is: authenticated workspace shell; create workspace/care recipient; Today empty/active states; care-team invitation state; task create/assign/complete; appointment create/view; persistent Emergency shell/access; and the Timeline event model. Medication, documents, notes, and settings should follow once the permission, file, and retention decisions are resolved.

| Deliverable | Status |
|---|---|
| `PRODUCT_BRIEF.md` | Complete |
| `PRODUCT_SPEC.md` | Complete |
| `UX_SPEC.md` | Complete |
| `USER_FLOWS.md` | Complete |
| `INFORMATION_ARCHITECTURE.md` | Complete |
| `DESIGN_SYSTEM.md` | Complete |
| `V1_SCOPE.md` | Complete |
| `VALIDATION_PLAN.md` | Complete |
| `OPEN_QUESTIONS.md` | Complete |
| `DECISIONS.md` | Complete |

No application code, technical architecture, data schema, authentication configuration, integration, test suite, deployment, native mobile app, or clinical feature has been created in this phase.
