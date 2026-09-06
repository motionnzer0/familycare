# Family Care Command Center — Slice 3 Onboarding Design Specification

**Status:** Approved product direction  
**Product Owner:** Trav  
**Product / UX / Strategy:** ChatGPT  
**Implementation:** Antigravity  
**Scope:** Onboarding experience only

## 1. Product Objective

Onboarding should take a new caregiver from account creation to an operationally meaningful Today experience with minimal cognitive load.

The experience should feel like a short welcome/setup flow, not a form-heavy administrative wizard.

The onboarding must communicate what Family Care is, establish the care workspace and care recipient, then get out of the way so the user can begin using Today.

## 2. Approved Product Decision

The approved onboarding model is:

**Welcome → Create Workspace → Ready → Today**

Only the workspace and care-recipient context are essential to entering the product.

Emergency contact, care team, first task, appointment, medication, document, and note setup are not required onboarding steps. They become optional post-onboarding actions.

## 3. Screen 1 — Welcome

### Heading
**Let’s get your care space ready.**

### Supporting copy
**Family Care keeps your family’s care responsibilities, schedule, information, and updates together in one private workspace.**

### Primary action
**Get started →**

### Requirements
- No form fields.
- No technical setup language.
- No progress indicator.
- No numbered multi-step presentation.
- No application navigation rail.
- No optional configuration checklist.
- Clear, calm, welcoming presentation.

## 4. Screen 2 — Create Workspace

### Heading
**Who are you caring for?**

### Required inputs

**Workspace name**
- Required.
- Example/placeholder: "Care for Mom"
- User may change it later.

**Care recipient preferred name**
- Required.
- Example/placeholder: "Mom"
- This becomes the primary human context throughout the authenticated product.

### Supporting copy
**You can change these details later.**

### Primary action
**Create workspace →**

### Behavior

Submitting creates/initializes the workspace using the existing secure onboarding/backend lifecycle.

The existing implementation's required initialization behavior must be preserved, including:
- authenticated user context
- workspace creation
- owner membership
- care recipient creation
- emergency container initialization where already required by the current backend
- active workspace context
- existing authorization/RLS behavior

The UX change must not weaken or bypass security.

## 5. Screen 3 — Ready

### Heading
**You’re ready to care together.**

### Supporting copy
**Your family’s care workspace is ready for [Care Recipient].**

### Secondary explanation
**Add tasks, appointments, medications, documents, notes, or caregivers whenever you need them.**

### Primary action
**Go to Today →**

### Behavior
The primary action routes the user directly to `/today`.

There should be no requirement to complete optional setup before entering Today.

Do not add a competing secondary action unless explicitly approved.

## 6. Removed From Mandatory Onboarding

The following are no longer mandatory onboarding steps:

- Emergency contact
- Care team invitation
- First task
- Upcoming appointment
- Medication
- Document
- Note

These actions remain available after entering the application through the approved global Add system and their authoritative modules.

## 7. UX Principles

- Minimize cognitive load.
- Orient before asking for work.
- Establish the care recipient context early.
- Progressive disclosure: defer optional information until the user is ready.
- No gamification.
- No confetti.
- No progress scoring.
- No artificial completion percentage.
- No medical intake framing.
- No clinical data collection as an onboarding prerequisite.
- No unnecessary form fields.
- The user should reach the actual product quickly.

## 8. Responsive Requirements

The three-screen experience must work on desktop, tablet, and mobile.

Mobile:
- Single-column layout.
- Comfortable touch targets.
- No horizontal scrolling.
- Keyboard must not be obscured by the form/action controls.
- Form content should remain readable at narrow widths.

Desktop:
- Focused centered content.
- Avoid excessive use of screen width.
- Do not expose authenticated application navigation during onboarding.

## 9. Accessibility Requirements

For the redesigned onboarding interactions:
- Proper semantic heading hierarchy.
- Every field has a visible label and accessible name.
- Keyboard navigation works in logical order.
- Visible focus indication.
- Form validation identifies the affected field and explains the correction.
- Valid user input is preserved after validation failure when technically safe.
- Buttons communicate their action clearly.
- Do not rely on color alone for validation/error communication.
- Respect reduced-motion preferences.
- Do not claim whole-application WCAG certification from this change; redesigned onboarding interactions must meet applicable WCAG 2.2 AA requirements.

## 10. Error / Loading / Success States

### Create workspace loading
The primary action enters a clear pending state and prevents duplicate submission.

### Validation error
State the specific field problem in plain language and preserve valid input.

### Backend failure
Tell the user the workspace could not be created and provide a clear retry path. Do not falsely show the Ready state.

### Successful creation
Proceed to the Ready screen, then `/today`.

### Session/access failure
Use the existing authentication/authorization recovery behavior. Do not expose workspace data or bypass access checks.

## 11. Non-Goals

Do not:
- redesign the authenticated Today page as part of this task
- implement the global Add launcher as part of this task unless required solely to remove an obsolete onboarding dependency
- change database schema
- change RLS policies
- change workspace authorization rules
- introduce new care features
- add external integrations
- add clinical functionality
- add notification/reminder functionality
- add analytics dashboards
- add AI/medical interpretation
- alter existing data lifecycle policy

## 12. Acceptance Criteria

1. A new user sees the Welcome screen first.
2. The user can proceed to workspace creation without completing optional care configuration.
3. Workspace name and care recipient preferred name are the only required onboarding inputs.
4. Successful workspace creation preserves the existing secure backend initialization and authorization behavior.
5. The user reaches the Ready screen after successful initialization.
6. The Ready screen identifies the care recipient by preferred name.
7. The user reaches `/today` directly from the Ready screen.
8. No seven-step onboarding flow remains.
9. No mandatory emergency/team/task/appointment setup remains in onboarding.
10. No new security bypasses, schema changes, or unrelated refactors are introduced.
11. Redesigned onboarding works at mobile and desktop widths.
12. Redesigned onboarding interactions satisfy applicable WCAG 2.2 AA requirements.
13. Existing automated tests continue to pass.
14. Typecheck, lint, and production build remain clean.

## 13. Implementation Boundary

Antigravity must treat this document as the complete product specification for the onboarding redesign.

If a technical constraint requires behavior not specified here, stop and report the constraint rather than inventing a product decision.

Do not begin work on other Slice 3 areas until this onboarding implementation is separately reviewed and approved.
