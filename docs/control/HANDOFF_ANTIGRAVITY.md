# Handoff: Antigravity (Engineering)

## Current Status
**WAITING**

Antigravity has completed the Care Profile + Emergency surfaces implementation, visual review, and documentation reconciliation. Antigravity is now waiting for authorization and specifications for the next Slice 3 milestone.

> [!IMPORTANT]
> **Completed Milestones:**
> - Onboarding Redesign: APPROVED / COMPLETE
> - Today Dashboard V2: APPROVED / COMPLETE
> - Care Profile + Emergency Surfaces: APPROVED / COMPLETE
>
> Antigravity must **NOT** begin the next Slice 3 feature or make code modifications until **ChatGPT** (Product/UX Authority) and **Trav** (Founder / Product Owner) review, approve, and authorize the next design specification.

---

## Operating Guidelines for Implementation

When implementation authorization is issued, Antigravity must strictly adhere to the following protocol:

1. **Implement Only Approved Scope:**
   - Execute strictly against the approved backlog and acceptance criteria.
   - Do not add unapproved features or alter product behavior without explicit Product Owner approval.

2. **Preserve Architectural and Security Boundaries:**
   - Maintain server-side authorization and Row Level Security (RLS) policies.
   - Never weaken RLS policies or bypass authentication to make code pass.
   - Prohibit the use of `service_role` credentials in client-facing application code.

3. **Verification Checklist:**
   Every implementation milestone must execute and pass:
   - `npm test` (All unit and integration tests passing)
   - `npm run typecheck` (`tsc --noEmit` with 0 errors)
   - `npm run lint` (`next lint` with 0 warnings/errors)
   - `npm run build` (Next.js production build passing)

4. **Reporting and Synchronization Protocol:**
   - Report changed files and clear explanations of changes.
   - Report known issues, risks, or edge cases immediately.
   - Commit completed, verified work cleanly to Git.
   - Push commits to `main` on `origin`.
   - Update project state documentation in `/docs/control/`.
