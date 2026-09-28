# Family Care — Project State

## Product
Family Care Command Center

## Product Purpose
Family Care Command Center is a private, shared workspace designed for an adult family member coordinating the administrative and daily care of an aging parent. It replaces fragmented communication across text messages, group chats, phone calls, paper notes, screenshots, and scattered calendars with a single, calm, authoritative coordination hub. 

The V1 purpose is to provide shared situational awareness without introducing clinical decision logic or manufacturing false urgency, validating a calm and reliable coordination loop for 10–20 real caregiving families.

## Core Product Question
> "What needs to happen? Who is responsible? What is happening? What changed? Where is the critical information?"

## Current Phase
V1 Beta Readiness & Release Synchronization (Checkpoints 0–6: APPROVED/COMPLETE, Checkpoint 7: AUDITED/BETA READY)

## Checkpoint Status

| Checkpoint | Focus Area | Status |
|---|---|---|
| Checkpoint 0 | Git / AI Synchronization | **COMPLETE** |
| Checkpoint 1 | Product Reconciliation | **COMPLETE** |
| - Onboarding Redesign | 3-Screen Progressive Flow | **APPROVED / COMPLETE** |
| - Today Dashboard V2 | Command Center & Quick Add | **APPROVED / COMPLETE** |
| - Care Profile + Emergency | Situation Reference & Safety Hub | **APPROVED / COMPLETE** |
| Checkpoint 2 | Engineering Integrity | **COMPLETE** |
| Checkpoint 3 | Security & Data Integrity | **COMPLETE** |
| Checkpoint 4 | End-to-End User Journeys | **COMPLETE** |
| Checkpoint 5 | UX/UI Design Excellence | **COMPLETE** (Commit `f552c97`, `3c70624`) |
| Checkpoint 6 | Implementation & Reliability | **COMPLETE** (Commit `ddbfd56`) |
| Checkpoint 7 | Beta Readiness & Release Sync | **AUDITED / BETA READY** (Commit `2bf7a67`) |

---

## Current Functional State

### Verified Working V1 Modules
- **Authentication:** Email/password signup, login, session persistence, logout via Supabase Auth & SSR middleware with auto-login fallback.
- **Onboarding:** Approved 3-screen progressive disclosure onboarding flow with route protection.
- **Workspace Creation:** Transactional atomic workspace provisioning (`create_workspace_atomic` RPC) with default timezone and care recipient context.
- **Workspace Membership:** Multi-user membership management with role-based access control (`owner`, `coordinator`, `contributor`, `viewer`).
- **Today Dashboard:** Priority 1 (Needs Attention), Priority 2 (Today), Priority 3 (Coming Up), Priority 4 (Recent Changes), plus universal + Add modal and navigation shortcuts.
- **Care Profile:** Dedicated `/care` surface for identity, living arrangement, preferences, and "Last updated" metadata with full RBAC protection.
- **Emergency Information:** Dedicated `/emergency` surface with canonical D-23 safety disclaimer, ordered contacts with tel: links, preferred facility, family-entered reference data, emergency documents, and "Last reviewed" verification workflow.
- **Tasks:** Task creation, assignment, due date/time scheduling, status toggling, and filtering.
- **Calendar & Appointments:** Appointment creation, attendee assignment, linked tasks, and chronological agenda.
- **Medications:** Medication reference list matching database schema (`name`, `form_strength`, `instructions`, `prescriber_pharmacy`, `note`, `status`).
- **Documents:** Document reference metadata management and secure signed file links.
- **Notes:** Categorized reference notes with author attribution and touch-friendly filter pills.
- **Care Team:** Member directory, role displays, invitation link generation and acceptance.
- **Settings:** Workspace configuration, care recipient profile updates, structured JSON/Markdown data export, and soft deletion.
- **Timeline / Updates:** Append-only chronological activity feed (`/updates`).
- **Recent Changes:** Dynamic recent activity feed on `/today` reflecting live mutation events.

### Significant Resolved Issues
- **Registration Session Persistence (`2bf7a67`):** Added fallback sign-in after signup ensuring HTTP-only session cookies and protected onboarding in middleware.
- **Medications & Notes Action Alignment (`ddbfd56`):** Aligned server action payloads with live PostgreSQL column schema.
- **Emergency Copy D-23 Alignment (`3c70624`):** Synchronized safety banner copy with canonical Decision D-23.
- **Checkpoint 5 UX Refinements (`f552c97`):** Implemented all 9 approved UX polish items (UX-01 to UX-09).
- **Atomic Workspace Creation (`7e632e4`):** Implemented `create_workspace_atomic` RPC and hardened RLS policies.
- **Workspace Migration Synchronization:** Standardized local and remote Supabase migration histories (6 migrations applied).
- **Workspaces RLS Owner Visibility:** Resolved workspace lookup blocking by updating `workspaces_select` policy.
- **Authenticated Table Privileges:** Granted required table and sequence DML privileges on schema `public` to the `authenticated` role.
- **PostgREST Nested Embedding:** Corrected `.select("*, workspaces(*, care_recipients(*))")` in `getActiveWorkspaceContext()`.
- **Timeline Events INSERT Policy:** Added RLS policy `is_workspace_member(workspace_id) AND auth.uid() = actor_id`.

---

## Verification State

- **Unit & Integration Tests:** 95 tests passing across 19 test suites (`npm test`).
- **Type Safety:** TypeScript check passing with 0 errors (`tsc --noEmit`).
- **Code Quality:** ESLint passing with 0 warnings/errors (`next lint`).
- **Production Build:** Next.js 14 production build passing cleanly across all 19 routes (`npm run build`).
- **Local Runtime Smoke Test:** Verified all routes and unauthenticated 307 redirects on live Next.js server.
- **Supabase Cloud Remote DB:** Fully reachable, 6/6 migrations applied, `create_workspace_atomic` operational, RLS active.

---

## Repository State

- **Canonical Repository:** [https://github.com/motionnzer0/familycare](https://github.com/motionnzer0/familycare)
- **Canonical Branch:** `main`
- **Git State:** Synchronized with `origin/main`
- **Latest Implementation Commit:** `2bf7a67` (*fix(auth): ensure session cookies on registration and protect onboarding route in middleware*)

---

## Team

- **Founder / Product Owner:** Trav
- **Product, UX, Strategy & Orchestration:** ChatGPT
- **Engineering / Implementation:** Antigravity

---

## Current Objective

Complete Git/documentation synchronization and prepare for beta cohort onboarding.

---

## Active Rules

1. **No feature expansion:** No major new features while validation checkpoints are incomplete.
2. **Preserve V1 scope:** Adhere strictly to approved V1 boundaries.
3. **Security first:** Preserve server-side RLS and database isolation; never weaken policies to bypass bugs.
4. **Isolated changes:** Do not modify unrelated systems or refactor working code outside approved scope.
5. **Traceable decisions:** Every meaningful change requires clear rationale, acceptance criteria, and documentation.
6. **Governance alignment:** Product direction requires Founder approval; ChatGPT leads product/UX direction; Antigravity leads engineering implementation.
7. **Sources of truth:** GitHub repository is the canonical source of truth for code; `/docs` is the canonical source of truth for product and architecture state.
