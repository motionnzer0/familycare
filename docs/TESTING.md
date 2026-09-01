# Family Care Command Center — Testing Strategy

**Document status:** Initial testing plan  
**Owner:** Antigravity  
**Last updated:** September 1, 2026

## 1. Testing Principles

| Principle | Rule |
|---|---|
| **Security tests are non-negotiable** | Every RLS policy, permission check, and workspace isolation boundary has automated tests. |
| **Test the user's experience** | E2E tests verify product acceptance criteria (AC-01 through AC-12), not internal implementation details. |
| **Fast feedback** | Unit and integration tests run in CI on every push. E2E tests run before merge to main. |
| **Accessibility is tested** | Automated accessibility checks in CI. Manual accessibility review before each milestone. |
| **No false confidence** | Tests that always pass are suspect. Security tests specifically attempt unauthorized access. |

## 2. Test Pyramid

```text
        ┌──────────┐
        │   E2E    │   5-15 critical user journeys
        │ Playwright│   (browser, slow, high-confidence)
        ├──────────┤
        │Integration│   Database queries, RLS policies,
        │ Vitest   │   Server Actions, permission checks
        │          │   (fast, high-value)
        ├──────────┤
        │   Unit   │   Validation schemas, date/timezone
        │ Vitest   │   utilities, permission logic, formatters
        │          │   (fastest, isolated)
        └──────────┘
```

## 3. Technology

| Tool | Purpose |
|---|---|
| **Vitest** | Unit and integration tests. Fast, TypeScript-native, compatible with Next.js. |
| **Playwright** | E2E browser tests. Cross-browser, accessible selectors, network interception. |
| **Supabase CLI** | Local Supabase instance for integration tests (Postgres + Auth + Storage). |
| **axe-core / @axe-core/playwright** | Automated accessibility checks within E2E tests. |
| **Testing Library** | Component rendering tests when needed (React Testing Library). |

## 4. Unit Tests

### 4.1 Scope

Unit tests cover pure functions and isolated logic:

| Area | Examples |
|---|---|
| **Validation schemas** | Zod schemas for task creation, appointment creation, medication entry, document metadata, invitation |
| **Date/timezone utilities** | Overdue calculation, "due today" check, 7-day window, workspace-local date conversion, DST edge cases |
| **Permission logic** | `checkPermission()` function for every role × resource × action combination |
| **Formatters** | Timeline event text generation, relative timestamps, name display |
| **Type guards** | Status enum validators, role validators |

### 4.2 Example Test Cases

```text
Timezone:
  ✓ Task with due_date yesterday in workspace tz is overdue
  ✓ Task with due_date today in workspace tz is not overdue
  ✓ Task with due_date tomorrow in workspace tz is upcoming
  ✓ DST transition does not change a task's due date
  ✓ User in different timezone sees workspace-local overdue state

Permissions:
  ✓ Owner can perform all actions
  ✓ Coordinator can create/edit tasks, appointments, medications
  ✓ Contributor can create tasks and notes
  ✓ Contributor can complete tasks assigned to self
  ✓ Contributor cannot assign tasks to others
  ✓ Contributor cannot edit others' tasks
  ✓ Viewer cannot create, edit, or complete anything
  ✓ No role can modify timeline events

Validation:
  ✓ Task title is required and has max length
  ✓ Appointment date is required and valid
  ✓ Medication name is required
  ✓ Document category must be from allowed set
  ✓ Invitation email must be valid format
  ✓ Invalid UUID is rejected
```

## 5. Integration Tests

### 5.1 Scope

Integration tests verify server-side behavior against a real local Supabase instance:

| Area | What is Tested |
|---|---|
| **RLS policies** | Every table's SELECT/INSERT/UPDATE policies with different roles |
| **Workspace isolation** | User in Workspace A cannot read Workspace B data |
| **Server Actions** | Full mutation flow: validate → check permission → mutate → create timeline event |
| **Database queries** | Dashboard summary query, task grouping, calendar ordering, timeline pagination |
| **Invitation flow** | Create → accept → membership created → token consumed |
| **Member removal** | Remove → access denied → tasks show needs-reassignment |
| **Soft delete** | Deleted records excluded from queries but retained in database |

### 5.2 RLS Policy Test Matrix

Each table must have tests for:

| Test Case | Expected Result |
|---|---|
| Active member SELECTs workspace data | ✅ Returns data |
| Non-member SELECTs workspace data | ❌ Returns empty |
| Removed member SELECTs workspace data | ❌ Returns empty |
| Member SELECTs different workspace data | ❌ Returns empty |
| Owner INSERTs record | ✅ Succeeds |
| Coordinator INSERTs record | ✅ Succeeds |
| Contributor INSERTs task/note | ✅ Succeeds |
| Viewer INSERTs record | ❌ Denied |
| Any user UPDATEs timeline_events | ❌ Denied |
| Any user DELETEs timeline_events | ❌ Denied |

### 5.3 Test Database Setup

```text
Each integration test suite:
1. Starts a local Supabase instance (via CLI)
2. Runs migrations to create schema + RLS policies
3. Creates test users via Supabase Auth API
4. Creates test workspaces and memberships
5. Runs tests with different user contexts
6. Cleans up after each test
```

## 6. E2E Tests

### 6.1 Scope

E2E tests cover the critical user journeys from the product acceptance criteria and user flows:

| Test Journey | Maps To |
|---|---|
| Registration and workspace creation | AC-01, User Flow 1-3 |
| Onboarding flow (progressive disclosure) | AC-01, User Flow 2 |
| Task create → assign → complete → reopen | AC-03, AC-04, User Flow 6-8 |
| Appointment create → view on Today and Calendar | AC-05, User Flow 9 |
| Medication entry without clinical interpretation | AC-06, User Flow 10 |
| Document upload → find → download | AC-07, User Flow 11 |
| Timeline and Notes distinction | AC-08, User Flow 12-13 |
| Emergency access from any primary screen | AC-09, User Flow 14 |
| Viewer cannot see editing controls | AC-10 |
| Mobile viewport usability | AC-11 |
| Invitation flow (invite → accept → active member) | AC-02, User Flow 5 |
| Dashboard priority order | AC-03, AC-04, User Flow 15 |
| Returning user orientation | User Flow 16 |

### 6.2 E2E Test Structure

```text
tests/e2e/
├── auth/
│   ├── registration.spec.ts
│   ├── login.spec.ts
│   └── invitation-acceptance.spec.ts
├── onboarding/
│   └── workspace-setup.spec.ts
├── dashboard/
│   ├── today-priority-order.spec.ts
│   └── empty-states.spec.ts
├── tasks/
│   ├── task-crud.spec.ts
│   ├── task-assignment.spec.ts
│   └── task-completion.spec.ts
├── calendar/
│   └── appointment-crud.spec.ts
├── care/
│   ├── profile.spec.ts
│   ├── care-team.spec.ts
│   └── medications.spec.ts
├── documents/
│   └── document-upload.spec.ts
├── updates/
│   ├── timeline.spec.ts
│   └── notes.spec.ts
├── emergency/
│   └── emergency-access.spec.ts
├── permissions/
│   ├── viewer-restrictions.spec.ts
│   └── contributor-restrictions.spec.ts
└── responsive/
    └── mobile-usability.spec.ts
```

### 6.3 Accessibility Testing in E2E

Every E2E test page visit includes an axe-core scan:

```typescript
// Conceptual pattern
test('Today page is accessible', async ({ page }) => {
  await page.goto('/today');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

Additional manual accessibility checks:

- [ ] Keyboard navigation through all primary flows
- [ ] Screen reader testing (VoiceOver, NVDA) for key screens
- [ ] Focus management in modals and quick-capture flows
- [ ] Color contrast verification against design system tokens
- [ ] Touch target size verification on mobile viewport

## 7. Security-Specific Tests

### 7.1 Workspace Isolation Tests

```text
Given: User A is a member of Workspace 1
       User B is a member of Workspace 2
When:  User A queries tasks with workspace_id = Workspace 2
Then:  Query returns empty results (not an error, not Workspace 2 data)

Given: User A is removed from Workspace 1
When:  User A queries any Workspace 1 data
Then:  Query returns empty results
```

### 7.2 Privilege Escalation Tests

```text
Given: User with Viewer role in a workspace
When:  User sends a task creation Server Action
Then:  Action returns permission error
And:   No task is created
And:   No timeline event is created

Given: User with Contributor role
When:  User sends a member removal Server Action
Then:  Action returns permission error
And:   Member is not removed
```

### 7.3 Invitation Security Tests

```text
Given: An expired invitation token
When:  User attempts to accept it
Then:  Acceptance is denied with clear message

Given: A cancelled invitation token
When:  User attempts to accept it
Then:  Acceptance is denied

Given: An already-accepted invitation token
When:  Another user attempts to accept it
Then:  Acceptance is denied
```

## 8. CI/CD Pipeline

```text
On every push:
  1. Lint (ESLint + TypeScript)
  2. Unit tests (Vitest)
  3. Integration tests (Vitest + local Supabase)

On pull request to main:
  4. E2E tests (Playwright + local Supabase)
  5. Accessibility audit (axe-core)
  6. Preview deployment (Vercel)

On merge to main:
  7. Production deployment (Vercel)
  8. Post-deploy smoke test (critical path E2E)
```

## 9. Test Data Management

- **Development seed data:** `supabase/seed.sql` creates a realistic workspace with sample tasks, appointments, medications, documents, notes, and timeline events across multiple roles.
- **Test fixtures:** Reusable test factories for creating workspaces, users, and records.
- **No production data in tests:** All test data is synthetic and non-sensitive.
- **Test isolation:** Each test suite runs in a clean database state.

## 10. Quality Gates

| Gate | Threshold | Blocking |
|---|---|---|
| Unit test pass rate | 100% | Yes |
| Integration test pass rate | 100% | Yes |
| E2E critical path pass rate | 100% | Yes |
| axe-core violations | 0 critical, 0 serious | Yes |
| TypeScript strict mode | No errors | Yes |
| ESLint | No errors | Yes |
| RLS policy test coverage | Every table, every role | Yes |
