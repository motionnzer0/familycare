# Family Care Command Center — Decision Log

**Document status:** Final for V1 product/UX handoff  
**Owner:** Manus AI, Product + UX  
**Decision authority:** Human Product Owner  
**Last updated:** September 1, 2026

This log records decisions that Antigravity must preserve unless the Human Product Owner explicitly changes them. It avoids silent product or UX reinterpretation during technical design.

| ID | Decision | Rationale | Status | Owner |
|---|---|---|---|---|
| D-01 | V1 is a responsive web workspace, not a native mobile application. | A responsive product can test the core coordination loop within 90 days without multiplying platform scope. | Decided | Product + UX |
| D-02 | Each V1 workspace represents one care recipient. | A single-recipient information model keeps navigation, permissions, onboarding, and dashboard orientation understandable for the initial validation cohort. | Decided | Product + UX |
| D-03 | The dashboard’s priority order is overdue work, due-today work, today’s schedule, upcoming items, recent changes, then reference shortcuts. | A caregiver’s first need is orientation and action, not analytics or comprehensive module summaries. | Decided | Product + UX |
| D-04 | The dashboard is a prioritization surface, not an analytics dashboard and not a collection of equal-weight cards. | Equal-weight cards and decorative density obscure urgent and current work. | Decided | Product + UX |
| D-05 | Tasks and appointments are separate but cross-linkable records. | A task is an owned responsibility; an appointment is a time-bound event. Combining them makes ownership and schedule semantics ambiguous. | Decided | Product + UX |
| D-06 | The product uses structured responsibility: every task visibly shows its assignee or an explicit “Unassigned” state. | Families need to understand ownership at a glance; inferred ownership causes coordination failures. | Decided | Product + UX |
| D-07 | V1 supports manual, user-entered medication reference details only. | This preserves a useful reference function without creating clinical decision support, adherence claims, dosage calculation, or medication-interaction risk. | Decided | Product + UX |
| D-08 | Emergency information is always available through persistent authenticated access and carries a visible “last reviewed” date. | This makes critical reference information easy to find while avoiding an unprotected public/lock-screen data surface in V1. | Decided | Product + UX |
| D-09 | V1 has six primary navigation destinations: Today, Tasks, Calendar, Care, Documents, and Updates; Emergency is persistent utility access and Settings is a utility destination. | Eleven named information domains do not require eleven top-level destinations. Grouping by caregiver mental model reduces navigation load. | Decided | Product + UX |
| D-10 | “Calendar” in V1 is an appointments-focused schedule view, not an external calendar product. | The user needs visibility into appointments without calendar synchronization or broad event management. | Decided | Product + UX |
| D-11 | Timeline and notes live under Updates. The Timeline records attributable activity and selected care events; Notes are intentional free-form communication. | These are complementary ways to understand what changed, but must not be confused as the same record type. | Decided | Product + UX |
| D-12 | Every record has one authoritative edit location; dashboard, timeline, and search/summaries link to it. | Prevents divergence, confusion about source of truth, and duplicated editing behavior. | Decided | Product + UX |
| D-13 | Onboarding uses progressive disclosure. The minimum setup is care-recipient name, emergency contact decision, team-invite decision, one task, and upcoming-appointment decision. | Requiring every detail before first value creates abandonment; deferring everything leaves a blank, non-useful workspace. | Decided | Product + UX |
| D-14 | Quick captures are limited to task, appointment, note, document, and care-team invite. Full care profile, medication, and emergency entries require dedicated pages or focused flows. | Modal capture is appropriate for short, interruptible content. Sensitive or multi-field reference information requires reviewable context and error recovery. | Decided | Product + UX |
| D-15 | Overdue is determined by an incomplete task whose due date is before the workspace-local day. | A predictable, non-clinical rule avoids arbitrary urgency. Times are optional and do not change the date-based overdue state. | Decided | Product + UX |
| D-16 | No task or appointment reminders are promised in baseline V1. | In-app visibility is sufficient to test organization value. Reminders introduce consent, channel, reliability, and notification-design decisions. | Decided | Product + UX |
| D-17 | V1 defaults to a small trusted care circle with role-based access: Owner/Admin (full CRUD/manage), Coordinator (full CRUD on care records/invites), Contributor (read all V1 categories, create/edit own notes, upload docs/edit own doc metadata, create/complete own or unassigned tasks, no edit on profile/meds/emergency), and Viewer (read-only throughout). (Resolves OQ-02) | Balances family visibility with edit protection for critical reference info. | Decided | Product Owner |
| D-18 | Design favors clear typography, large targets, high contrast, plain language, and forgiving error recovery over visual novelty. | These choices serve time-pressured caregivers and make the experience more inclusive for care recipients or older relatives. [1] | Decided | Product + UX |
| D-19 | The product must make no claim of HIPAA compliance in V1 documentation or interface copy without formal assessment. | Health-app obligations depend on actual functions, data, and relationships; a legal/privacy assessment is required before production use.[2] | Decided | Product Owner + legal/privacy review |
| D-20 | No clinical labels such as “urgent medication issue” are inferred by the product. | The product may show user-entered emergency/reference information and dated work, but it must not create clinical determinations. | Decided | Product + UX |
| D-21 | Data lifecycle follows soft deletion for user records, immediate access revocation on workspace deletion with permanent purge after 30 days, structured JSON + document ZIP export in Settings, and immediate access revocation on member removal with historical attribution preserved. (Resolves OQ-05) | Protects against accidental data loss, provides clean exit path, maintains audit history. | Decided | Product Owner |
| D-22 | “Recent changes” includes materially relevant coordination events, not every passive view or navigation event. | A readable family history must be informative rather than surveillance-like or noisy. | Decided | Product + UX |
| D-23 | Emergency Information includes structured contacts, facility preference, family-entered allergy/condition/insurance text, notes, linked docs, and last-reviewed date. Uses approved 911 disclaimer and family-maintained preamble. No public links or QR codes in V1. (Resolves OQ-07) | Provides critical rapid reference while strictly enforcing the non-clinical and private workspace boundary. | Decided | Product Owner |

## Decision Change Process

A later technical constraint may require a change, but it must not be silently implemented. Antigravity should record the constraint, affected user experience, alternatives, recommendation, and decision owner in `docs/OPEN_QUESTIONS.md`. Once accepted by the Human Product Owner, update this log with the new decision, date, and rationale.

## References

[1]: https://www.nngroup.com/articles/usability-for-senior-citizens/ "Nielsen Norman Group — Usability for Older Adults: Challenges and Changes"
[2]: https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html "U.S. HHS — Resources for Mobile Health Apps Developers"
