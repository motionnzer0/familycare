# Family Care Command Center — V1 Validation Plan

**Document status:** Final for V1 product/UX handoff  
**Owner:** Manus AI, Product + UX  
**Decision authority:** Human Product Owner  
**Audience:** Human Product Owner and Google Antigravity  
**Last updated:** September 1, 2026

## 1. Validation Purpose

The V1 validation objective is not to prove that families want every imaginable caregiving feature. It is to determine whether a private, calm shared workspace meaningfully reduces the coordination burden of an adult family member caring for an aging parent.

The planned cohort is **10–20 real caregivers** over the first 90 days. This is an appropriate qualitative discovery/early-direction cohort, not a statistically representative market-sizing exercise. The target context is material: AARP and the National Alliance for Caregiving reported that 63 million Americans were caregivers in 2025, with more than 40% providing high-intensity care.[1] The initial research must nevertheless study the specific intended user rather than generalize from that population statistic.

> **V1 hypothesis:** When a family coordinator can see current work, ownership, upcoming appointments, shared reference information, and recent changes in one private workspace, they will coordinate with less uncertainty and choose to return to the workspace as real care needs evolve.

## 2. What We Are Testing

| Validation domain | Core question | V1 evidence needed |
|---|---|---|
| Problem–solution fit | Does the product map to a real coordination problem, rather than a hypothetical wish list? | Participants describe existing fragmentation and recognize a useful purpose without being coached. |
| Activation | Can a coordinator establish a minimally useful workspace with partial information? | Participants create a workspace, add care context, make emergency/team decisions, and add initial work/schedule data. |
| Orientation | Does Today answer what needs attention and what happens next? | Participants correctly find overdue/due-today work, today’s appointment, and recent change. |
| Responsibility | Can a family see and manage who owns a task? | Participants create, assign, reassign, and complete a task without confusion. |
| Retrieval | Can users find sensitive reference information under realistic pressure? | Participants reach Emergency, medication list, care team, and a document quickly and confidently. |
| Shared awareness | Does Timeline/Notes improve understanding of what changed? | Participants distinguish a system change history from an authored coordination note. |
| Trust/privacy | Do users understand who will see their information and what the product does not do? | Participants can describe sharing/access model and do not interpret it as an EMR, clinician, or emergency-response service. |
| Repeat value | Does real use create a reason to return after initial setup? | Participants voluntarily return or report a credible trigger tied to actual coordination work. |
| Willingness to pay | Does the value feel worth paying for after direct use? | Participants express an unprompted or tested value threshold and explain why. |

## 3. Participant Profile and Recruitment

Recruit 10–20 adults who currently coordinate or substantially contribute to the care of a parent, parent-in-law, or similarly close older adult. Prioritize real, current coordination needs rather than people whose caregiving ended long ago. Include both local and remote coordinators, people who coordinate with siblings/relatives, and people who work outside caregiving.

| Recruitment attribute | Target mix | Why it matters |
|---|---|---|
| Primary coordination role | At least 60% identify as the main organizer. | Tests the core persona and activation path. |
| Shared care | At least 50% coordinate with at least one other adult. | Tests invite, assignment, shared awareness, and trust assumptions. |
| Distance | Include nearby and remote family members. | Tests the value of updates and asynchronous coordination. |
| Care intensity | Include routine and higher-intensity administrative coordination. | Avoids designing only for a light, low-stakes use case. |
| Technology comfort | Include confident and less-confident web/mobile users. | Reveals whether plain language, typography, and forms are forgiving enough. |
| Device use | Include participants who primarily use mobile and primarily use desktop. | Validates responsive prioritization. |
| Care-recipient involvement | Optional, with informed consent. | Can identify accessibility and autonomy concerns; do not make this a recruitment requirement. |

Recruit through caregiver organizations, community/aging networks, personal referrals with screening, or paid research panels that can verify current caregiver status. Recruiting should not collect unnecessary medical facts. Store participant contact and consent data separately from product test data. Offer a reasonable thank-you incentive approved by the Product Owner.

## 4. Safety, Privacy, and Research Ethics

The product context may involve sensitive personal and health-adjacent information. Research sessions should use realistic but fictionalized scenarios whenever possible. If a participant elects to enter real information into a prototype or beta, obtain explicit consent, explain who can access it, and minimize collection. Do not record or share sensitive screens unnecessarily.

Do not ask participants for diagnoses, medication specifics, account passwords, legal documents, insurance identifiers, or emergency details that are not necessary to answer the research question. Moderators must not give medical, legal, or emergency advice. If a participant describes a real emergency, stop the task and direct them to appropriate emergency services; the study is not a support channel.

Before production beta, legal/privacy review must establish the correct notice, consent, retention, deletion, incident response, vendor, and security practices for the actual product model. HHS guidance for health-related app developers emphasizes assessing laws based on the app’s function, data, and services rather than assuming a universal compliance status.[2]

## 5. Study Design and Cadence

Use three lightweight stages, moving from controlled comprehension to real-use evidence. Do not wait for a feature-complete product to learn whether the orientation and responsibility model works.

| Stage | Timing | Participants | Method | Purpose |
|---|---|---:|---|---|
| **1. Concept and prototype** | Weeks 1–3 | 5–7 | Moderated remote or in-person sessions, 45–60 minutes. | Validate language, navigation, dashboard hierarchy, onboarding, and permission mental model before build. |
| **2. Usable alpha** | Weeks 4–7 | 5–8, including some stage-1 replacements or new participants. | Moderated task tests using working flows; accessibility review. | Validate actual interaction, error recovery, responsive behavior, and document/emergency retrieval. |
| **3. Private beta** | Weeks 8–12 | 10–20 total active caregivers, including invited family where consented. | 2–4 week naturalistic use, lightweight diary/check-in, optional analytics, 15–20 minute exit interview. | Test repeated use, trust, real collaboration behavior, and willingness to pay. |

The plan assumes the build becomes usable in time for stages 2–3. If technical implementation is delayed, retain stage 1 but do not substitute a presentation-only test for the actual file, assignment, persistence, permission, and error-handling behavior required to validate V1.

## 6. Moderated Usability Script and Core Scenarios

Moderators should begin with context questions, then ask participants to think aloud while completing realistic scenarios. Do not lead with the desired navigation label or tell the participant where a function lives. Record observed behavior, quotes, task outcome, notable hesitation, incorrect assumptions, and workaround attempts.

| Scenario | Prompt | What to observe | Success criterion |
|---|---|---|---|
| First orientation | “You have just opened the workspace for your parent. What would you look at first?” | First click, scan order, interpretation of Today sections. | Participant identifies current action/schedule without searching modules. |
| Setup | “Set this up enough that a sibling could help you coordinate this week.” | Optional vs required comprehension, perceived burden, missing expectations. | Participant reaches usable Today without abandon/confusion. |
| Shared work | “Add a task to arrange transportation and ask Alex to handle it by Friday.” | Task title, assignment, date entry, ownership understanding. | Task is created, assigned, and discoverable. |
| Task follow-up | “Alex completed the task. What now? What if it needs to be done again?” | Completion/reopen model, history expectations, dashboard update. | Participant completes then locates/reopens as appropriate. |
| Appointment | “Add the upcoming appointment and find what is happening today.” | Calendar label comprehension, time/date handling, distinction from tasks. | Appointment is created and correctly found. |
| Reference retrieval | “You need the emergency contact and the medication list.” | Route, time, confidence, interpretation of safety language. | Participant finds both without searching or entering edit mode. |
| Document retrieval | “Find the uploaded insurance document.” | Document labels, filters, availability understanding. | Participant reaches the document and understands open/download state. |
| Change awareness | “Your sibling changed something yesterday. How would you see what happened?” | Timeline vs Notes mental model, activity-detail expectations. | Participant opens Timeline and identifies actor/action. |
| Privacy/roles | “Invite a relative who should be able to view but not change things.” | Role comprehension, invitation confidence, concerns. | Participant selects a role that matches stated intent and can explain it. |
| Returning use | “You have not checked this in a few days. What changed and what do you need to do?” | Recent changes visibility, urgency interpretation, return orientation. | Participant identifies a current action and recent update quickly. |

## 7. Measures and Success Thresholds

Use both behavioral and attitudinal evidence. Task completion is not enough if users complete tasks while misunderstanding sharing, urgency, or clinical scope. Conversely, early qualitative findings should guide iteration even when sample sizes do not support population-level percentages.

| Measure | Stage | Target success signal | Concern / failure signal |
|---|---|---|---|
| Setup completion | Prototype / alpha | At least 80% complete the minimal setup without moderator rescue. | More than 20% abandon, skip unintentionally, or believe detailed health data is mandatory. |
| Time to usable Today | Prototype / alpha | Median under 8 minutes for core setup scenario, excluding authentication. | Repeated delays due to unclear optionality or navigation. |
| Current-work findability | Prototype / alpha | At least 85% find overdue/due-today work and today’s appointment on first attempt. | Participants search across modules, miss overdue tasks, or mistake reference content for priority. |
| Responsibility comprehension | Prototype / alpha | At least 80% correctly identify assignee/unassigned state and complete assignment scenario. | Users assume creator owns task, cannot distinguish invitation role, or distrust assignment visibility. |
| Emergency retrieval | Prototype / alpha | At least 90% reach emergency contacts within two interactions from a primary screen. | Users search, open unrelated Care/profile area, or expect anonymous emergency access. |
| Medication-scope comprehension | Prototype / alpha | At least 80% describe the list as reference information, not advice/verification. | Users expect interaction checks, dosing advice, or alerts from V1. |
| Timeline/Notes comprehension | Prototype / alpha | At least 75% distinguish “what changed” from “what someone wrote.” | Timeline feels like a noisy feed or Notes are used as task assignment substitute. |
| Repeat use | Private beta | At least 50% of activated primary coordinators return on two or more separate days over 14 days, with a documented coordination trigger. | Most activity is single-session setup; users revert to messages/notes as their sole system. |
| Collaborative activation | Private beta | At least 40% of activated workspaces have a second active member or a documented reason for working alone. | Invitation is confusing or participants are unwilling to share due to unclear privacy. |
| Trust | All | Most participants can explain who can see the workspace and name a boundary the product does not cross. | Frequent privacy surprise, unclear role expectations, or belief the product is a clinical system. |
| Value / willingness to pay | Exit | At least 40% of active primary coordinators state a credible willingness to pay or willingness for a household member to pay, anchored to reduced coordination burden. | Interest is polite but users cannot name a recurring value or substitute it for a free shared note. |

“Median under 8 minutes” and percentage targets are early product decision thresholds, not validated industry benchmarks. They provide a clear accept/iterate signal for this 90-day test and should be interpreted alongside qualitative evidence.

## 8. Repeated-Use Indicators

Repeated use should show a real coordination loop, not accidental page opens. In a privacy-reviewed beta instrumentation plan, measure only events needed to understand product use. Do not introduce surveillance-like tracking or content analysis.

| Indicator | What it suggests | Minimum event evidence |
|---|---|---|
| Return to Today after initial setup | The workspace remains an orientation tool. | Separate authenticated sessions/days. |
| Task created, assigned, then completed | Family uses explicit responsibility rather than only storing information. | Create → assignment or explicit Unassigned → completion events. |
| More than one active member changes/views relevant shared records | Shared workspace has collaboration value. | Accepted invitation plus attributable material action; passive viewing only if privacy-approved. |
| Appointment and related task both used | Family links schedule to preparation. | Appointment creation plus a related task or follow-up task. |
| Emergency/medication/document retrieval | Reference information is useful after entry. | Retrieval event only if privacy-approved and non-content-based; self-report is acceptable. |
| Timeline review after another person’s update | The change-awareness model is functioning. | Timeline open after material event, or interview report. |
| Emergency/medication “last reviewed” updated | Family maintains reference information. | Explicit review/update action, not passive passage of time. |

## 9. Willingness-to-Pay Research

Ask price/value questions only after participants have experienced representative functionality. Do not lead with a price before they understand what problem the product addresses. The aim is to learn value framing, not to lock pricing.

| Question | Purpose |
|---|---|
| “What, if anything, would make you return here instead of using messages, notes, and calendar tools?” | Identifies recurring differentiated value. |
| “If this were no longer available tomorrow, what would be hardest to replace?” | Tests replacement cost and attachment. |
| “Who, if anyone, would expect to pay for a private family coordination tool like this?” | Reveals payer, household, and trust expectations. |
| “At what monthly amount would it feel inexpensive, reasonable, expensive but still worth considering, and too expensive?” | Produces directional price sensitivity after value discussion. |
| “What would have to be true before you would trust it enough to pay?” | Identifies privacy, reliability, sharing, and feature thresholds. |

Do not treat stated willingness as a revenue forecast. Give greater weight to participants who used the workspace across multiple care events, invited someone, or articulated a concrete avoided coordination failure.

## 10. Major Failure Signals and Response Rules

| Failure signal | Interpretation | Required response |
|---|---|---|
| Participants do not recognize a meaningful coordination problem or prefer existing tools without tension. | Weak problem–solution fit. | Revisit target segment/problem framing before expanding features. |
| Setup requires too much personal data or feels emotionally exhausting. | Progressive disclosure is failing. | Remove/defers fields; re-test onboarding before adding features. |
| Users cannot identify what needs attention from Today. | Core information hierarchy is failing. | Rework priority order and item anatomy; do not add analytics/cards. |
| Families do not understand who owns work. | Task model/assignment is failing. | Simplify task state and ownership presentation; do not solve with notifications first. |
| Participants expect clinical advice/medication safety checks. | Positioning and boundary are unclear. | Clarify product language; resist adding clinical functionality to V1. |
| Participants refuse to invite family because they cannot predict access. | Privacy/role model is failing. | Resolve OQ-02 and improve invitation/role transparency before broader beta. |
| Emergency information is difficult to find or participants perceive it as emergency response. | High-risk UX failure. | Fix persistent access/copy; complete legal/privacy review. |
| Users set up once but do not return during relevant care events. | The product is not creating a usable recurring loop. | Examine whether current-work/recent-change value is insufficient before scope expansion. |
| Document upload/retrieval is unreliable or confusing. | A trust-damaging foundational capability is failing. | Resolve technical file states/constraints before expecting adoption. |
| Product is used primarily as a generic notes app. | Information architecture is not making structured coordination value clear. | Improve tasks/appointments/Timeline integration; do not add chat/social features. |

## 11. Analysis and Iteration Cadence

After every 3–5 sessions, synthesize observations into a short decision report. Separate **observed behavior**, **participant interpretation**, **root-cause hypothesis**, **recommended change**, and **confidence level**. Tag each finding to an existing product principle, flow, or design-system requirement. This prevents isolated participant requests from expanding V1 without evidence.

| Severity | Definition | Action timing |
|---|---|---|
| **Blocker** | Prevents completion of a core flow or creates a material privacy/safety misunderstanding. | Fix before the next testing stage. |
| **High** | Causes repeated confusion, incorrect action, or loss of trust in a core area. | Prioritize in the next iteration. |
| **Medium** | Causes hesitation or workaround but task remains complete. | Track; address when pattern repeats across participants. |
| **Low** | Preference or cosmetic issue without impact on comprehension, access, or trust. | Log; do not disrupt 90-day scope. |

At the end of beta, hold a scope review with the Human Product Owner. The decision should be **continue/iterate**, **narrow or reposition**, or **pause**. Do not use the review to automatically add a long list of feature requests. Each possible expansion must be tied to repeated behavioral evidence and must not compromise privacy, accessibility, or non-clinical scope.

## 12. Deliverables from Validation

Each stage produces an evidence-backed artifact: a session guide and scenario set; an observation matrix; prioritized issue list; updated decision log; and a concise recommendation. The private beta additionally produces a de-identified activation/repeat-use summary and a willingness-to-pay synthesis. All participant data and recordings must follow the approved privacy/retention plan.

## References

[1]: https://www.aarp.org/pri/topics/ltss/family-caregiving/caregiving-in-the-us-2025/ "AARP and National Alliance for Caregiving — Caregiving in the US 2025"
[2]: https://www.hhs.gov/hipaa/for-professionals/special-topics/health-apps/index.html "U.S. HHS — Resources for Mobile Health Apps Developers"
