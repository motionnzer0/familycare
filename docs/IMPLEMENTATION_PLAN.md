# Family Care Command Center — Implementation Plan

**Document status:** Initial implementation sequence  
**Owner:** Antigravity  
**Decision authority:** Human Product Owner for scope changes  
**Last updated:** September 1, 2026

## 1. Implementation Approach

The build follows the recommended implementation slice from `ANTIGRAVITY_HANDOFF.md`. Each slice delivers end-to-end user value and is testable against product acceptance criteria. No slice ships features that depend on unresolved open questions.

**Timeline target:** Usable alpha by Week 4–5; private beta by Week 8.

## 2. Pre-Implementation Gate

Before writing application code, the following must be complete:

| Item | Status |
|---|---|
| All Manus documentation reviewed | ✅ Complete |
| Technical architecture defined (`ARCHITECTURE.md`) | ✅ Complete |
| Database schema designed (`DATABASE.md`) | ✅ Complete |
| Permission model defined (`PERMISSIONS.md`) | ✅ Complete |
| Security architecture defined (`SECURITY.md`) | ✅ Complete |
| Testing strategy defined (`TESTING.md`) | ✅ Complete |
| Technical risks identified (`TECHNICAL_RISKS.md`) | ✅ Complete |
| Open questions documented & blocking decisions resolved | ✅ Complete |
| OQ-02 (role permissions for sensitive categories) resolved | ✅ Resolved (D-17: Option A) |
| OQ-05 (data deletion, export, retention policy) resolved | ✅ Resolved (D-21: Option A) |
| OQ-07 (emergency information scope & safety copy) resolved | ✅ Resolved (D-23: Option A) |
| OQ-03 (auth model defaults active) | ✅ Accepted defaults |
| Product Owner authorization to begin implementation | ⬜ Pending |

## 3. Slice 0: Repository Foundation (Days 1–2)

**Goal:** A buildable, deployable, empty application shell with all tooling configured.

| Task | Details |
|---|---|
| Initialize Next.js project | App Router, TypeScript strict, Tailwind CSS |
| Configure Supabase | Local development setup via `supabase init`; create project config |
| Install and configure shadcn/ui | Base component set; design system tokens as CSS custom properties |
| Configure Tailwind with design tokens | Custom colors, typography, spacing from `DESIGN_SYSTEM.md` |
| Set up Vitest | Unit and integration test configuration |
| Set up Playwright | E2E test configuration with axe-core |
| Set up ESLint + Prettier | Consistent code formatting and linting |
| Create `.env.local.example` | Document required environment variables |
| Configure Vercel project | Connect repo; set up environment variables |
| Create initial database migration | All tables, indexes, and RLS policies from `DATABASE.md` |
| Seed data script | Development workspace with realistic sample data |
| CI pipeline | GitHub Actions for lint, test, build |

**Exit criteria:** `npm run dev` starts the application. `npm test` runs. `supabase start` provisions a local database. Vercel preview deployment succeeds.

## 4. Slice 1: Core Coordination Loop (Weeks 1–3)

**Goal:** An authenticated user can create a workspace, add a care recipient, create and manage tasks and appointments, and see a prioritized Today dashboard.

This slice proves the core product loop: **create work → see priorities → complete work → see what changed.**

### Phase 1A: Auth Shell + Workspace Creation (Week 1)

| Feature | Details | Acceptance |
|---|---|---|
| Registration | Email/password sign-up; magic link sign-in | User can create account and sign in |
| Auth middleware | Session validation on all workspace routes | Unauthenticated users redirected to login |
| Workspace creation | Create workspace form; assign creator as Owner | AC-01 partial |
| Care recipient creation | Preferred name (required) + optional fields | Care recipient name visible in shell |
| App shell | Navigation rail (desktop), bottom nav (mobile), header with workspace context | Navigation structure matches IA spec |
| Emergency shell | Persistent Emergency button/link (empty state) | AC-09 partial |
| Onboarding flow | Progressive disclosure wizard (steps 1–7 from UX spec) | AC-01 |

### Phase 1B: Tasks (Week 2)

| Feature | Details | Acceptance |
|---|---|---|
| Task creation | Quick capture (title, assignee, due date) + full detail | AC-03 |
| Task list | Grouped by Overdue, Today, Upcoming, No due date, Completed | Tasks grouped correctly |
| Task detail | Title, description, assignee, due date/time, status, creator | Full task information visible |
| Task assignment | Assignee selector with active members + Unassigned | AC-03 |
| Task completion | Inline and detail completion with actor/timestamp | AC-03 |
| Task reopening | Reopen from detail; recalculates overdue status | AC-03 |
| Overdue detection | Server-side calculation using workspace timezone | AC-04 |
| Timeline events | Task create, assign, complete, reopen events generated | Timeline model operational |

### Phase 1C: Appointments + Dashboard (Week 3)

| Feature | Details | Acceptance |
|---|---|---|
| Appointment creation | Quick capture + full detail | AC-05 |
| Calendar view | Agenda/date list, upcoming and past, status states | AC-05 |
| Appointment detail | All fields; Scheduled/Completed/Cancelled states | AC-05 |
| Today dashboard | Needs attention → Today → Coming up → Recent changes → Quick reference | AC-03, AC-04 |
| Dashboard empty states | Guided setup when no data; calm "nothing needs attention" state | UX spec compliance |
| Timeline view | Chronological event list with actor/action/object/time | Timeline functional |

**Slice 1 exit criteria:** Product acceptance criteria AC-01, AC-03, AC-04, AC-05 pass. Dashboard priority order verified. Overdue logic verified across timezone scenarios.

## 5. Slice 2: Collaboration + Reference (Weeks 4–6)

**Goal:** Multiple users can coordinate in a shared workspace. Reference information (medications, emergency, documents, notes) is operational.

> **Dependency:** OQ-02 must be resolved before implementing Contributor/Viewer access to sensitive categories. If unresolved, implement Owner/Coordinator access only and add Contributor/Viewer access later.

### Phase 2A: Care Team + Invitations (Week 4)

| Feature | Details | Acceptance |
|---|---|---|
| Invitation creation | Invite form with email, role, relationship label | AC-02 |
| Invitation email | Transactional email via Resend (or link copy fallback) | AC-02 |
| Invitation acceptance | Token validation, account creation/sign-in, workspace join | AC-02 |
| Care Team view | Active members, pending invitations, roles, status | Care Team functional |
| Member removal | Owner removes member; access revoked; tasks flagged | Member lifecycle complete |
| Role-based UI | Viewer sees no edit controls; permission errors clear | AC-10 |

### Phase 2B: Emergency + Medications (Week 5)

| Feature | Details | Acceptance |
|---|---|---|
| Emergency info page | Contacts first, reference fields, linked docs, last reviewed | AC-09 |
| Emergency edit | Add/edit contacts, reference text, mark reviewed | Emergency complete |
| Persistent Emergency access | ≤2 interactions from any primary screen | AC-09 |
| Medication list | Active medications with non-clinical disclaimer | AC-06 |
| Medication CRUD | Add, edit, archive, mark reviewed | AC-06 |

### Phase 2C: Documents + Notes (Week 6)

| Feature | Details | Acceptance |
|---|---|---|
| Document upload | File selection, progress, metadata entry | AC-07 |
| Document list | Category filter, newest-first, availability state | AC-07 |
| Document download | Signed URL generation, secure retrieval | AC-07 |
| Notes | Create, edit, delete with confirmation | AC-08 |
| Updates view | Timeline and Notes as sibling tabs/views | AC-08 |
| Timeline filters | Actor, record type, date range (basic) | Timeline usable |

**Slice 2 exit criteria:** AC-02, AC-06, AC-07, AC-08, AC-09, AC-10 pass. Invitation flow works end-to-end. Role-based access verified.

## 6. Slice 3: Polish + Beta Preparation (Weeks 7–8)

**Goal:** The application meets all acceptance criteria, is responsive, accessible, and ready for real caregiver testing.

| Feature | Details | Acceptance |
|---|---|---|
| Care profile | Full profile editing with all optional fields | Profile complete |
| Settings | Workspace name, timezone, membership management, data export/deletion | Settings functional |
| Mobile responsive | All screens usable at <768px; touch targets verified | AC-11 |
| Accessibility audit | axe-core clean; keyboard navigation; focus management | WCAG 2.2 AA baseline |
| Error states | All error, empty, loading, permission states implemented | UX spec compliance |
| Dashboard polish | Priority order, item anatomy, empty/full states | AC-03, AC-04 |
| Content/copy review | Non-clinical language; safety disclaimers; plain language | AC-12 |
| Security hardening | CSP headers, RLS verification, signed URL verification | Security checklist |
| Performance | Dashboard loads under 3s; document upload feedback immediate | Performance baseline |
| Onboarding polish | Resume on interruption; explicit deferrals; completion state | UX spec compliance |

**Slice 3 exit criteria:** All 12 acceptance criteria (AC-01 through AC-12) pass. E2E test suite passes. Accessibility audit clean. Security checklist complete. Ready for beta deployment.

## 7. Milestone Summary

| Milestone | Target | Gate |
|---|---|---|
| **Repository ready** | Day 2 | Builds, deploys, tests run |
| **Auth + workspace** | End of Week 1 | User can register, create workspace, see shell |
| **Core loop (tasks + appointments + dashboard)** | End of Week 3 | AC-01, AC-03, AC-04, AC-05 |
| **Collaboration (invitations + roles)** | End of Week 4 | AC-02, AC-10 |
| **Reference modules** | End of Week 6 | AC-06, AC-07, AC-08, AC-09 |
| **Beta-ready** | End of Week 8 | All AC-01 through AC-12 |

## 8. Dependencies and Blockers

| Item | Status | Impact & Operational Plan |
|---|---|---|
| **OQ-02 (Role permissions)** | **RESOLVED** (D-17: Option A) | Permission model finalized; Slice 2 unblocked. |
| **OQ-05 (Data retention/export)** | **RESOLVED** (D-21: Option A) | Soft delete + 30-day purge + JSON/ZIP export defined; Slice 3 unblocked. |
| **OQ-07 (Emergency scope & copy)** | **RESOLVED** (D-23: Option A) | Schema & exact approved copy defined; Slice 2 Emergency module unblocked. |
| **OQ-04 (Transactional email)** | Open (defaults active) | Architect for Resend; copy-link fallback active for invitations until configured. |
| **OQ-01 (Legal/privacy framework)** | Open | Formal legal assessment prior to production beta launch with real personal data. |

## 9. What Is Not In This Plan

Per product scope and explicit exclusions:

- Native mobile applications
- Push notifications or reminders
- External calendar sync
- AI features of any kind
- Recurring tasks
- Multiple care recipients per workspace
- Chat or messaging
- Clinical decision support
- Document OCR or AI extraction
- Analytics dashboard
- Gamification
- Payment processing
