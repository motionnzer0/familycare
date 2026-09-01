# Family Care Command Center — Agent Operating Rules

**Last updated:** September 1, 2026

This file defines the operating rules Antigravity must follow when working in this repository. These rules exist to protect the product's integrity, the family's data privacy, and the collaboration between Manus (Product/UX) and Antigravity (Technical).

## Authority Model

### Manus Owns (Product/UX Authority)
- What the product does and why
- Who the users are and what they need
- User experience, interface behavior, and information architecture
- Product scope, feature boundaries, and exclusions
- User flows, labels, terminology, and content voice
- Validation plan and success criteria

### Antigravity Owns (Technical Authority)
- How the product is built
- Technology stack and architecture decisions
- Database schema and implementation
- Authentication and authorization implementation
- Security controls and practices
- Testing strategy and test implementation
- Deployment and infrastructure
- Performance and reliability

### Human Product Owner
- Final decision-maker when product and technical considerations conflict
- Approves scope changes, new features, and policy decisions

## Rules

### 1. Never Silently Change Product Behavior

If a technical constraint, dependency limitation, or implementation preference would change what a user sees, can do, shares, trusts, or expects, **stop and document it** in `/docs/OPEN_QUESTIONS.md` before proceeding.

Examples of changes that require escalation:
- Altering the dashboard priority order
- Changing which roles can perform an action
- Modifying the onboarding sequence
- Changing record lifecycle behavior (e.g., hard delete vs. soft delete)
- Altering emergency access behavior
- Adding or removing fields from a record type
- Changing terminology or labels

### 2. Never Silently Introduce New Features

Do not add functionality that is not in `PRODUCT_SPEC.md`, `V1_SCOPE.md`, or an approved decision in `DECISIONS.md`. This includes:
- AI features
- Push notifications
- Analytics dashboards
- Chat or messaging
- Clinical decision support
- External integrations
- Gamification mechanics

If a feature seems obviously useful, document the suggestion in `/docs/OPEN_QUESTIONS.md` and wait for Product Owner approval.

### 3. Preserve Documentation Integrity

**Manus-owned documents** (do not modify without Product Owner approval):
- `/docs/PRODUCT_BRIEF.md`
- `/docs/PRODUCT_SPEC.md`
- `/docs/UX_SPEC.md`
- `/docs/USER_FLOWS.md`
- `/docs/INFORMATION_ARCHITECTURE.md`
- `/docs/DESIGN_SYSTEM.md`
- `/docs/V1_SCOPE.md`
- `/docs/VALIDATION_PLAN.md`
- `/docs/ANTIGRAVITY_HANDOFF.md`

**Antigravity-owned documents** (maintain and update as implementation progresses):
- `/docs/ARCHITECTURE.md`
- `/docs/DATABASE.md`
- `/docs/PERMISSIONS.md`
- `/docs/SECURITY.md`
- `/docs/TESTING.md`
- `/docs/IMPLEMENTATION_PLAN.md`
- `/docs/TECHNICAL_RISKS.md`

**Shared governance documents** (both authorities can update; respect each other's entries):
- `/docs/DECISIONS.md`
- `/docs/OPEN_QUESTIONS.md`

### 4. Security First

- All authorization is enforced server-side and at the database level (RLS).
- Never rely on client-side authorization alone.
- Every database table with workspace-scoped data must have RLS policies.
- Cross-workspace data access must be architecturally impossible.
- No secrets in client-side code, Git history, or public assets.
- File uploads must be validated server-side.
- Document access uses short-lived signed URLs.

### 5. Respect the Non-Clinical Boundary

This product is not a medical system. Never:
- Add clinical decision logic
- Calculate medication interactions or dosages
- Infer medical urgency from user data
- Use clinical terminology for system-generated labels
- Send caregiving data to external AI/LLM services
- Claim HIPAA compliance without formal assessment

### 6. Follow the Implementation Sequence

Build in the order defined in `/docs/IMPLEMENTATION_PLAN.md`:
1. Slice 0: Repository foundation
2. Slice 1: Core coordination loop (auth, workspace, tasks, appointments, dashboard)
3. Slice 2: Collaboration + reference (invitations, emergency, medications, documents, notes)
4. Slice 3: Polish + beta preparation

Do not skip ahead to build features that depend on unresolved open questions.

### 7. Test Security and Permissions

Every code change must maintain:
- RLS policy test coverage for every table and role
- Cross-workspace isolation tests
- Permission matrix tests (positive and negative cases)
- E2E tests for critical user journeys

Failing security tests block all deployments.

### 8. Accessibility Is Not Optional

- Target WCAG 2.2 AA compliance
- Run axe-core in CI on every build
- Follow the design system's typography, contrast, and target-size specifications
- Use semantic HTML and native controls
- Test keyboard navigation at each milestone
- Test at mobile viewports (< 768px)

### 9. Update Documents When Plans Change

When implementation reveals new constraints, risks, or decisions:
- Update `/docs/TECHNICAL_RISKS.md` with new risks
- Update `/docs/OPEN_QUESTIONS.md` with new questions requiring Product Owner input
- Update `/docs/IMPLEMENTATION_PLAN.md` if the sequence changes
- Update `/docs/DECISIONS.md` when decisions are made (with date and rationale)

### 10. Do Not Overengineer

The 90-day beta timeline demands focused, simple solutions:
- No microservices
- No custom authentication
- No custom storage infrastructure
- No custom state management
- No GraphQL
- No message queues or event buses
- No unnecessary external APIs
- No real-time subscriptions in V1

Add complexity only when a measured need arises and the simpler approach has proven insufficient.

## Quick Reference: Open Questions Requiring Resolution

| ID | Summary | Needed By | Status |
|---|---|---|---|
| OQ-01 | Legal/privacy framework | Before production data | Open (assessment before production) |
| OQ-02 | Role-by-role sensitive-category permissions | Before Slice 2 | **Resolved** (D-17: Option A) |
| OQ-03 | Auth/invitation model details | Before Slice 1 | Active default (Supabase Auth) |
| OQ-04 | Transactional email scope | Before Slice 2 | Active default (Resend + copy-link) |
| OQ-05 | Data retention/deletion/export policy | Before beta | **Resolved** (D-21: Option A) |
| OQ-06 | File type/size/scanning constraints | Before document module | Active default (25MB, standard types) |
| OQ-07 | Emergency disclaimer copy | Before emergency module | **Resolved** (D-23: Option A) |
| OQ-08 | Support/recovery path for access issues | Before beta | Open (support path before beta) |
