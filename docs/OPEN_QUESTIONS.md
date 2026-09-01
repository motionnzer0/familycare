# Family Care Command Center — Open Questions

**Document status:** Open decision register  
**Owner:** Human Product Owner, with input from Google Antigravity and privacy/legal counsel where noted  
**Last updated:** September 1, 2026

> These questions are deliberately unresolved. Antigravity must not choose a product answer implicitly through implementation. Each resolution should be recorded in `docs/DECISIONS.md`.

## Decision-Critical Before Public Beta

| ID | Question | Why it matters | Recommended owner | Required by |
|---|---|---|---|---|
| OQ-01 | What legal/privacy framework applies in the intended launch jurisdiction, considering the product’s actual data, relationships, vendors, and marketing claims? | Determines notices, contracts, security controls, breach procedures, analytics policy, retention, and prohibited claims. HHS guidance directs health-app developers to assess obligations based on function and data, rather than assume a single rule.[1] | Product Owner with qualified legal/privacy counsel | Before production handling of real personal data |
| OQ-02 | Which care-team roles may view/edit each sensitive category: emergency details, medications, documents, profile fields, notes, and timeline? | “Private” is not sufficiently specific; poor access defaults can cause family conflict or unsafe disclosure. | Product Owner + Antigravity | Before authorization design |
| OQ-03 | Does the V1 beta require email invitations only, and what account-identification/authentication approach will be used? | Invitation acceptance, duplicate accounts, identity assurance, recovery, and invite expiration depend on this choice. | Antigravity, escalated to Product Owner if UX changes | Before registration build |
| OQ-04 | Will baseline V1 send transactional email for invitations, password/account recovery, and member removal? | These communications are likely necessary to operate a multi-person workspace but require consent, delivery, and content decisions. | Product Owner + Antigravity | Before beta build |
| OQ-05 | What is the data deletion, export, retention, and backup policy for beta workspaces and documents? | Families need a predictable exit path, and technical storage/recovery choices affect product promises. | Product Owner + privacy/legal counsel + Antigravity | Before beta data collection |
| OQ-06 | Are documents restricted by file type, size, preview format, or virus/malware scanning requirement? | File safety, storage cost, and browser preview behavior materially affect the Document experience. | Antigravity | Before document-upload build |
| OQ-07 | What emergency information can be safely stored and displayed, and which disclaimer/copy has legal approval? | The product must support fast reference access without suggesting clinical advice or emergency-response capability. | Product Owner + legal/privacy counsel | Before emergency module build |
| OQ-08 | What support path is shown if users cannot access a workspace or suspect unauthorized access? | This is necessary to make the privacy promise credible and to handle ownership continuity. | Product Owner + Antigravity | Before public beta |

## Product and Experience Questions to Validate in Testing

| ID | Question | Current V1 default | Validation approach |
|---|---|---|---|
| OQ-09 | Do caregivers understand the label “Today,” or do they expect “Dashboard” or “Home”? | Use **Today** as the navigation label, with the page heading “Today.” | Test label comprehension and first-click behavior with 10–20 caregivers. |
| OQ-10 | Do invited family members need a granular contributor role in V1, or are owner/coordinator/viewer sufficient? | Retain a contributor concept but do not expose unnecessary complexity until permission needs are observed. | Test invitations and collaboration scenarios with a mix of coordinators and contributors. |
| OQ-11 | Do users find the “Calendar” label clear when it represents appointments only? | Use **Calendar** with explanatory page copy, or test **Appointments** as an alternative label. | A/B test terminology in prototype sessions. |
| OQ-12 | What information does a caregiver genuinely need to see in the Emergency summary? | Structured contacts plus carefully labeled, user-entered reference fields. | Card-sort and scenario test; seek legal review before production. |
| OQ-13 | Is manual medication entry perceived as sufficiently useful without reminders, refill handling, or verification? | Provide reference capture only. | Observe whether users enter the information and retrieve it in realistic tasks. |
| OQ-14 | Is a seven-day upcoming horizon right for dashboard scanability? | Show seven days initially, with a full schedule view one click away. | Observe orientation time and missed near-term appointments in usability testing. |
| OQ-15 | Should the care recipient receive a direct view-only invitation in V1? | No dedicated recipient experience; a standard Viewer may be possible after accessibility testing. | Test only if recruitment includes willing care recipients and consent is explicit. |
| OQ-16 | What wording reduces anxiety around “overdue” without obscuring action? | Use **Overdue** with specific due date and clear action; avoid judgmental language. | Test comprehension and emotional response in sessions. |

## Technical Constraints That May Require Product Decisions

| ID | Constraint to assess | Product impact if constrained | Escalation expectation |
|---|---|---|---|
| OQ-17 | Browser preview support for common document formats | If reliable inline preview is unavailable, the UX must clearly offer secure download/open behavior rather than imply preview. | Antigravity should propose supported types and fallback copy. |
| OQ-18 | Email delivery/reliability for invitations and recovery | A failure changes onboarding and member collaboration. | Antigravity should identify the operational plan and user-visible recovery path. |
| OQ-19 | File scanning/quarantine implementation | Upload latency and document availability may affect the expected flow. | Antigravity should describe states and failure handling before implementation. |
| OQ-20 | Time-zone storage and display | Overdue status, calendar ordering, and timestamps can become confusing across remote siblings. | Antigravity should propose a workspace-local rule with clear DST behavior. |
| OQ-21 | Authorization architecture and activity-event immutability | May affect scope of role permissions and the reliability of Timeline entries. | Antigravity should identify limits before interaction behavior is finalized. |
| OQ-22 | Accessible document preview and generated emergency summary | Unsupported viewers or print layouts may reduce accessibility. | Antigravity should propose compliant fallback behavior. |

## Current Escalation Rule

If resolving a question changes what a caregiver sees, can do, shares, trusts, or expects, it is a **product decision** and must be reviewed by the Human Product Owner. If it only changes code structure, hosting, tooling, or implementation sequence without changing the product experience or promises, it belongs to Antigravity’s technical authority.

## References

[1]: https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html "U.S. HHS — Resources for Mobile Health Apps Developers"
