# Family Care — Project State

## Product
Family Care Command Center

## Product Purpose
Family Care Command Center is a private, shared workspace designed for an adult family member coordinating the administrative and daily care of an aging parent. It replaces fragmented communication across text messages, group chats, phone calls, paper notes, screenshots, and scattered calendars with a single, calm, authoritative coordination hub. 

The V1 purpose is to provide shared situational awareness without introducing clinical decision logic or manufacturing false urgency, validating a calm and reliable coordination loop for 10–20 real caregiving families.

## Core Product Question
> "What needs to happen? Who is responsible? What is happening? What changed? Where is the critical information?"

## Current Phase
Slice 3 — Refinement & Surface Redesigns (Care Profile + Emergency: APPROVED / COMPLETE)

## Checkpoint Status

| Checkpoint | Focus Area | Status |
|---|---|---|
| Checkpoint 0 | Git / AI Synchronization | **COMPLETE** |
| Checkpoint 1 | Product Reconciliation | **IN PROGRESS** |
| - Onboarding Redesign | 3-Screen Progressive Flow | **APPROVED / COMPLETE** |
| - Today Dashboard V2 | Command Center & Quick Add | **APPROVED / COMPLETE** |
| - Care Profile + Emergency | Situation Reference & Safety Hub | **APPROVED / COMPLETE** |
| Checkpoint 2 | Engineering Integrity | **PENDING** |
| Checkpoint 3 | Security & Data Integrity | **PENDING** |
| Checkpoint 4 | End-to-End User Journeys | **PENDING** |
| Checkpoint 5 | UX/UI Design | **PENDING** |
| Checkpoint 6 | Implementation & Reliability | **PENDING** |
| Checkpoint 7 | Beta Readiness | **PENDING** |

---

## Current Functional State

### Verified Working V1 Modules
- **Authentication:** Email/password signup, login, session persistence, logout via Supabase Auth & SSR middleware.
- **Onboarding:** Approved 3-screen progressive disclosure onboarding flow.
- **Workspace Creation:** Automatic workspace provisioning with default timezone and care recipient context.
- **Workspace Membership:** Multi-user membership management with role-based access control (`owner`, `coordinator`, `contributor`, `viewer`).
- **Today Dashboard:** Priority 1 (Needs Attention), Priority 2 (Today), Priority 3 (Coming Up), Priority 4 (Recent Changes), plus universal + Add modal and navigation shortcuts.
- **Care Profile:** Dedicated `/care` surface for identity, living arrangement, preferences, and "Last updated" metadata with full RBAC protection.
- **Emergency Information:** Dedicated `/emergency` surface putting safety disclaimers, ordered contacts, preferred facility, family-entered reference data, emergency documents, and "Last reviewed" verification front-and-center.
- **Tasks:** Task creation, assignment, due date/time scheduling, status toggling, and filtering.
- **Calendar & Appointments:** Appointment creation, attendee assignment, linked tasks, and chronological agenda.
- **Medications:** Medication reference list (name, dosage, frequency, instructions, prescriber, pharmacy, active status).
- **Documents:** Document reference metadata management and secure file links.
- **Notes:** Categorized reference notes with visibility boundaries.
- **Care Team:** Member directory, role displays, invitation link generation and acceptance.
- **Settings:** Workspace configuration, care recipient profile updates, structured data export, and soft deletion.
- **Timeline / Updates:** Append-only chronological activity feed (`/updates`).
- **Recent Changes:** Dynamic recent activity feed on `/today` reflecting live mutation events.

### Significant Resolved Issues
- **Workspace Migration Synchronization:** Standardized local and remote Supabase migration histories.
- **Workspaces RLS Owner Visibility:** Resolved workspace lookup blocking by updating `workspaces_select` policy to `owner_id = auth.uid() OR is_workspace_member(id)`.
- **Authenticated Table Privileges:** Granted required table and sequence DML privileges on schema `public` to the `authenticated` role.
- **PostgREST Nested Embedding:** Corrected `.select("*, workspaces(*, care_recipients(*))")` in `getActiveWorkspaceContext()` to prevent duplicate SQL aliases (Error 42712).
- **Timeline Events INSERT Policy:** Added RLS policy `is_workspace_member(workspace_id) AND auth.uid() = actor_id` to enable append-only activity logging for authenticated caregivers.

---

## Verification State

- **Unit & Integration Tests:** 75 tests passing across 18 test suites (`npm test`).
- **Type Safety:** TypeScript check passing with 0 errors (`tsc --noEmit`).
- **Code Quality:** ESLint passing with 0 warnings/errors (`next lint`).
- **Production Build:** Next.js production build passing cleanly across all 18 routes (`npm run build`).
- **Browser Smoke Testing:** Completed across all primary modules.
- **Task Creation & Completion:** Verified live in real database.
- **Appointment Creation:** Verified live in real database.
- **Timeline Recent Changes:** Verified live on `/today`.
- **Updates Page:** Verified live on `/updates`.

---

## Repository State

- **Canonical Repository:** [https://github.com/motionnzer0/familycare](https://github.com/motionnzer0/familycare)
- **Canonical Branch:** `main`
- **Git State:** Local `main` synchronized with `origin/main`
- **Latest Implementation Commit:** `19e4697` (*feat(rls): add timeline_events insert policy for active workspace members*)

---

## Team

- **Founder / Product Owner:** Trav
- **Product, UX, Strategy & Orchestration:** ChatGPT
- **Engineering / Implementation:** Antigravity

---

## Current Objective

Prepare the actual implemented V1 for beta by reconciling product intent, engineering reality, UX, and scope before implementing further changes.

---

## Active Rules

1. **No feature expansion:** No major new features while validation checkpoints are incomplete.
2. **Preserve V1 scope:** Adhere strictly to approved V1 boundaries.
3. **Security first:** Preserve server-side RLS and database isolation; never weaken policies to bypass bugs.
4. **Isolated changes:** Do not modify unrelated systems or refactor working code outside approved scope.
5. **Traceable decisions:** Every meaningful change requires clear rationale, acceptance criteria, and documentation.
6. **Governance alignment:** Product direction requires Founder approval; ChatGPT leads product/UX direction; Antigravity leads engineering implementation.
7. **Sources of truth:** GitHub repository is the canonical source of truth for code; `/docs` is the canonical source of truth for product and architecture state.
