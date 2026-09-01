# Family Care Command Center — Product Brief

**Document status:** Final for V1 product/UX handoff  
**Owner:** Manus AI, Product + UX  
**Audience:** Human Product Owner and Google Antigravity  
**Last updated:** September 1, 2026

## Product Definition

**Family Care Command Center** is a private, shared workspace for an adult family member coordinating the administrative care of an aging parent. It brings the current plan, responsibilities, appointments, medication reference details, important documents, notes, and recent changes into one calm, understandable place.

> **Core promise:** “Everything your family needs to coordinate care for an aging parent in one private place.”

The product exists to replace fragmented coordination across text messages, group chats, calls, paper notes, calendars, email, screenshots, and memory. Its immediate value is not analytics or medical advice. It is shared situational awareness: a family should be able to see **what needs attention now, what is next, who owns it, and where the supporting information lives**.

Family caregiving is a substantial and demanding context: AARP and the National Alliance for Caregiving reported that 63 million Americans were caregivers in 2025, and that more than 40% provided high-intensity care.[1] This product is intentionally designed for the realities implied by that workload: limited time, interrupted attention, divided responsibility, and a need for fast retrieval rather than exploration.

## V1 Objective

Within 90 days, validate the smallest genuinely useful web product with 10–20 real caregivers. The V1 must demonstrate that a coordinating family member can set up a usable workspace, invite a small care team, organize core reference information, assign and complete tasks, and return to the product to orient the family around current responsibilities.

The product should feel **calm, trustworthy, modern, organized, warm, professional, and easy to understand**. It should make the next useful action obvious without overstating urgency or creating a noisy stream of alerts.

## Primary User and Jobs

The primary user is an adult family member who is coordinating care for an aging parent. They may live nearby or remotely, coordinate with siblings or a mix of relatives and trusted helpers, work outside the home, and be managing care in moments between other responsibilities.

The primary user needs a single place to answer four questions quickly:

| Question | Product answer | Primary surface |
|---|---|---|
| What needs attention now? | Overdue and due-today responsibilities, with a clear owner and next action. | Dashboard |
| What happens next? | Today’s schedule and near-term appointments, ordered in time. | Dashboard and Appointments |
| Who is responsible? | Named care-team member, role, and task ownership. | Tasks and Care Team |
| Where is the information I need? | A predictable, authoritative home for profile, emergency details, medications, documents, notes, and event history. | Navigation and contextual links |

## Product Principles

| Principle | Product implication |
|---|---|
| **Orient before asking for work** | The dashboard communicates the current situation before it asks the caregiver to enter more information. |
| **One authoritative home** | Each record type has a primary place to edit; the dashboard and timeline summarize and link rather than duplicate. |
| **Responsibility must be visible** | Tasks show owner, due state, and completion state in every relevant summary; unassigned work is explicit. |
| **Urgency is specific, not theatrical** | Only user-defined time-sensitive work is shown as overdue or urgent. The interface does not manufacture clinical urgency. |
| **Progressive disclosure protects attention** | Onboarding and forms collect only the information required to establish a usable workspace; optional reference information can be completed later. |
| **Sensitive by default** | Information sharing is deliberate, role-based, and understandable to a non-technical family member. |
| **Plain language earns trust** | Labels, error messages, and explanations avoid medical, legal, and technical jargon. |
| **Mobile is for checking in and acting** | Mobile prioritizes orientation, viewing essential reference information, completing tasks, and quick capture; desktop supports fuller coordination and management. |

## Product Boundary

V1 is a **responsive private web application** for non-clinical family coordination around one care recipient per workspace. It includes a dashboard; care profile; family/care team; tasks; appointments; medication reference list; documents; timeline; notes; emergency information; and workspace settings.

V1 is **not** an electronic medical record, a medical diagnosis or treatment tool, a medication interaction engine, a prescribing system, telehealth, a provider or caregiver marketplace, an insurance or Medicare integration, external calendar synchronization, an AI clinical assistant, native iOS/Android software, a social network, or a complex analytics system. The system displays family-entered information and records coordination activity; it does not determine whether a care decision is medically appropriate.

## Roles in V1

V1 assumes a small, trusted care circle. Role names may be adapted in implementation, but their product intent must be retained.

| Role | Product purpose | V1 intent |
|---|---|---|
| **Workspace owner** | Establishes the workspace and retains continuity if family responsibilities change. | Manages care profile, members, settings, and all records. Can transfer ownership. |
| **Coordinator** | Helps organize information and work. | Creates/edits records, assigns/completes tasks, uploads documents, writes notes, and views all workspace information. |
| **Contributor** | Completes assigned work and adds context. | Views most workspace information, completes assigned tasks, adds notes, and uploads documents. Editing rights for sensitive areas must be confirmed before implementation. |
| **Viewer** | Needs awareness without editing. | Views authorized workspace information only. Cannot create, edit, complete, or invite. |

## V1 Success Definition

V1 is ready for test placement when a primary caregiver can, without staff assistance, create a workspace, enter the minimum care profile, invite one family member, capture at least one task and appointment, locate emergency information, upload or identify an important document, and understand the dashboard’s priorities. The initial validation plan defines the measurable test thresholds.

## Evidence and Design Rationale

The product deliberately favors readable, forgiving, low-clutter interfaces. Research summarized by Nielsen Norman Group notes that older adults encounter barriers from small type, low contrast, tiny targets, and inflexible input/error handling.[2] Although the initial coordinator is often an adult child, care recipients or older relatives may also view shared information, so these accessibility decisions are core requirements rather than optional polish.

The product also treats privacy and data handling as a foundational design concern. U.S. HHS guidance states that privacy and security protections enhance health-related technology products and points developers to applicable-law assessment tools based on the product’s function and data.[3] This brief does not determine legal status or compliance obligations; it requires Antigravity and the Human Product Owner to obtain appropriate legal/privacy review before production handling of sensitive information.

## References

[1]: https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/ "AARP and National Alliance for Caregiving — Caregiving in the US 2025"
[2]: https://www.nngroup.com/articles/usability-for-senior-citizens/ "Nielsen Norman Group — Usability for Older Adults: Challenges and Changes"
[3]: https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html "U.S. HHS — Resources for Mobile Health Apps Developers"
