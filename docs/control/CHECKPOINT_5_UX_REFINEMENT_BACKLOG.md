# Checkpoint 5 — UX Refinement Backlog
**Family Care Command Center**

**Document Status:** Approved for Implementation Planning  
**Product Authority:** ChatGPT (Product, UX & Strategy)  
**Product Owner:** Trav (Founder / Product Owner)  
**Implementation Authority:** Antigravity (Engineering)  
**Date:** September 8, 2026  
**Scope:** Checkpoint 5 UX/UI Polish & Interaction Excellence  

---

## 1. Executive Summary & Objective

Following the Checkpoint 5 comprehensive browser audit across all 13 primary surfaces and three responsive viewports (375px mobile, 768px tablet, 1280px desktop), the application was rated **GREEN (EXCELLENT)** with zero critical blockers and zero horizontal layout overflow.

This document establishes the canonical **UX Refinement Backlog** under `/docs/control/` to elevate perceived quality, caregiver calm, thumb ergonomics, and operational clarity ahead of beta release. All refinements in this backlog are **strictly non-feature-expanding** and preserve existing product scope, database schemas, authorization rules, and non-clinical boundaries.

---

## 2. Governance, Invariants & Architectural Boundaries

Every refinement defined in this document must strictly adhere to the following product invariants:

1. **No Scope Expansion:** Do not add AI features, native push notifications, chat, messaging, analytics dashboards, gamification, or external calendar synchronizations.
2. **Preserve Information Architecture:** Maintain the primary navigation structure (`Today`, `Tasks`, `Calendar`, `Care`, `Documents`, `Updates/Notes`, `Emergency` utility, `Settings` utility).
3. **Preserve Today’s 5-Tier Hierarchy:** Keep the strict priority order:
   `Needs Attention` $\rightarrow$ `Today's Schedule & Tasks` $\rightarrow$ `Coming Up (Next 7 Days)` $\rightarrow$ `Recent Changes` $\rightarrow$ `Quick Reference`.
4. **Preserve 3-Screen Onboarding:** Keep the streamlined `Welcome → Create Workspace → Ready → Today` model.
5. **Preserve Role-Based Access Control (RBAC):** All capabilities remain bound to Decision `D-17` (Owner, Coordinator, Contributor, Viewer) enforced server-side and via PostgreSQL Row Level Security (RLS).
6. **Preserve Database & Migration Integrity:** No database schema alterations or migration changes.
7. **Strict Non-Clinical Boundary:** Maintain family-entered reference framing without clinical triage, drug interaction calculations, dosage checks, or medical urgency claims.

---

## 3. Approved UX Refinements (UX-01 through UX-09)

### UX-01: Increase Mobile Category Filter Hit Areas on Documents and Notes

#### Current Behavior
On `/documents` and `/notes`, category filter pill buttons (`Insurance`, `Medical`, `Legal`, `General`, `Family`, etc.) render with `py-1 px-3` and text size `text-xs`, resulting in a measured vertical touch target of **26px**. On mobile touchscreens (375px), these pill buttons require precise thumb placement and can cause accidental adjacent mis-taps.

#### Intended Behavior
Category filter pills on mobile and tablet viewports provide generous, thumb-friendly touch zones ($\ge 36\text{px}$ height) with comfortable tap spacing while retaining a compact, non-overwhelming visual footprint.

#### Exact UI Change
- Update pill container styling in `src/components/documents/DocumentList.tsx` and `src/components/notes/NoteList.tsx`.
- Adjust class from `px-3 py-1 text-xs` to:
  `px-3.5 py-1.5 min-h-[36px] sm:min-h-[32px] text-xs font-semibold flex items-center justify-center shrink-0`
- Ensure the horizontal scroll/wrap container provides a `gap-2` for tap clearance.

#### Affected Components / Surfaces
- `src/components/documents/DocumentList.tsx` (`/documents`)
- `src/components/notes/NoteList.tsx` (`/notes`)

#### Viewport Behavior
- **Mobile (375px):** Touch target increases to 36px height with smooth horizontal scrolling if pills exceed viewport width.
- **Tablet (768px) & Desktop (1280px):** Clean horizontal pill wrap with 32–36px height.

#### Evidence-Based Accessibility Requirements
- Verified touch target height $\ge 36\text{px}$ (exceeding WCAG 2.2 SC 2.5.8 minimum target size of $24\text{px} \times 24\text{px}$).
- Visible keyboard focus ring (`focus-visible:ring-2 focus-visible:ring-focus`).
- Selected pill state distinguished by dark background (`bg-slate-900 text-white`) plus `aria-pressed="true"` attribute.

#### Acceptance Criteria
- [ ] Category pills measure $\ge 36\text{px}$ touch height on mobile viewports.
- [ ] Active filter pill remains easily distinguishable without relying solely on color hue.
- [ ] 0px horizontal layout overflow across `/documents` and `/notes`.

#### Regression Risks
- Verify horizontal pill wrap does not force main container horizontal scrolling.

---

### UX-02: Standardize Mobile Filter/Segment Tab Hit Areas

#### Current Behavior
Filter tabs on `/tasks` (`Open`, `Completed`, `All`), `/calendar` (`Upcoming`, `Past & Completed`, `All`), and `/medications` (`Active`, `All`) use `py-1.5 px-3 rounded`, measuring **32px** in height.

#### Intended Behavior
Segmented filter tabs standardize to a comfortable **38px–40px** mobile touch target, creating visual and interaction consistency across all list modules.

#### Exact UI Change
- Update segmented filter tab buttons in `TaskList.tsx`, `CalendarView.tsx`, and `MedicationList.tsx`.
- Update classes to:
  `px-3.5 py-2 min-h-[38px] sm:min-h-[34px] text-xs sm:text-sm font-semibold rounded-md transition-colors flex items-center justify-center`

#### Affected Components / Surfaces
- `src/components/tasks/TaskList.tsx` (`/tasks`)
- `src/components/calendar/CalendarView.tsx` (`/calendar`)
- `src/components/medications/MedicationList.tsx` (`/medications`)

#### Viewport Behavior
- **Mobile (375px):** 38px tap target height with full-width or naturally spaced row layout.
- **Tablet & Desktop:** Clean 34–38px segmented control bar.

#### Evidence-Based Accessibility Requirements
- Target size $\ge 38\text{px}$ height.
- Explicit active tab indication with `aria-selected="true"` or `aria-pressed="true"`.
- Keyboard arrow navigation and visible focus outline.

#### Acceptance Criteria
- [ ] Segment tab buttons measure $\ge 38\text{px}$ height on mobile.
- [ ] Active tab displays high-contrast dark fill (`bg-slate-900 text-white`).
- [ ] Tab switching updates lists immediately without page reload or layout shift.

#### Regression Risks
- Ensure longer tab labels (e.g., "Past & Completed (0)") do not wrap onto two awkward lines at 320–375px width.

---

### UX-03: Increase Mobile Authentication Link Hit Areas

#### Current Behavior
On `/login` and `/register`, the footer toggle links ("Create one", "Sign in") are inline anchor tags inside `<p>` elements measuring only **17px** in rendered height.

#### Intended Behavior
The toggle link provides an expanded touch target of at least **40px** height on mobile devices while maintaining an unobtrusive textual appearance.

#### Exact UI Change
- Update `src/app/(auth)/login/page.tsx` and `src/app/(auth)/register/page.tsx`.
- Wrap link or apply inline-block padding:
  `inline-flex items-center text-brand font-semibold hover:underline py-2 px-1 min-h-[40px] focus-visible:ring-2 focus-visible:ring-focus rounded`

#### Affected Components / Surfaces
- `src/app/(auth)/login/page.tsx` (`/login`)
- `src/app/(auth)/register/page.tsx` (`/register`)

#### Viewport Behavior
- **Mobile & Tablet:** Touch zone expands vertically to 40px without altering the card text flow.
- **Desktop:** Crisp inline appearance with visible hover and focus rings.

#### Evidence-Based Accessibility Requirements
- Verified target height $\ge 40\text{px}$ (exceeding SC 2.5.8).
- High contrast text (`#0F766E` teal on `#FFFFFF` surface yields $> 4.8:1$ contrast ratio).

#### Acceptance Criteria
- [ ] Auth toggle links measure $\ge 40\text{px}$ touch height on mobile viewports.
- [ ] Keyboard focus ring is fully visible and offset from text.

#### Regression Risks
- None (purely CSS box and padding adjustment).

---

### UX-04: Increase Today / Header Brand Touch Target Modestly

#### Current Behavior
In `AppHeader.tsx`, the left brand identity link (`Care for Mom / Vance Care Space`) has a measured touch target of $142\text{px} \times 36\text{px}$ on mobile.

#### Intended Behavior
Increase the header brand link's minimum touch height to **44px** so returning to the Today dashboard from any subpage is effortless for caregivers on mobile devices.

#### Exact UI Change
- In `src/components/layout/AppHeader.tsx`, update the Link container:
  `className="flex items-center space-x-2.5 py-1 px-1 rounded-lg hover:bg-surface-subtle transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"`

#### Affected Components / Surfaces
- `src/components/layout/AppHeader.tsx` (Global header)

#### Viewport Behavior
- **Mobile (< 768px):** Provides a 44px thumb target for fast return to `/today`.
- **Desktop ($\ge 1024\text{px}$):** Remains aligned with the 64px header height.

#### Evidence-Based Accessibility Requirements
- Target size $44\text{px}$ height.
- Accessible label: `aria-label="Return to Today dashboard"`.

#### Acceptance Criteria
- [ ] Header brand container measures $\ge 44\text{px}$ height.
- [ ] Click/tap immediately routes to `/today`.

#### Regression Risks
- Ensure header vertical alignment remains centered in `h-16` header bar.

---

### UX-05: Refine “Not Specified” Microcopy into Warmer, Family-Oriented Language

#### Current Behavior
On `/care`, `/emergency`, and `/medications`, empty optional fields (such as legal name, address, insurance, access notes) frequently display cold, bureaucratic fallback text such as `"Not specified"`, `"None listed"`, or `"Not specified yet"`.

#### Intended Behavior
Microcopy uses calm, conversational, family-friendly fallback phrasing that communicates reassurance and non-judgmental optionality (e.g., *"No address specified yet"*, *"Add living details when ready"*, *"None recorded"*).

#### Exact UI Change
Update text constants and component rendering in:
- `CareProfileView.tsx`:
  - Legal name: `"Not recorded"` instead of `"Not specified"`.
  - Date of birth: `"Not recorded"` instead of `"Not specified"`.
  - Routines empty state: *"No daily routines recorded yet. Add notes whenever you're ready."*
- `EmergencyView.tsx`:
  - Hospital: `"No hospital preference recorded yet"` instead of `"Not specified yet"`.
  - Allergies: `"No known allergies recorded"` instead of `"None listed"`.
  - Insurance: `"No insurance details recorded"` instead of `"No insurance details entered"`.
  - Access notes: `"No entry or access notes recorded"` instead of `"No access notes provided"`.

#### Affected Components / Surfaces
- `src/components/care/CareProfileView.tsx` (`/care`)
- `src/components/emergency/EmergencyView.tsx` (`/emergency`)
- `src/components/medications/MedicationList.tsx` (`/medications`)

#### Viewport Behavior
- Universal across all viewports (text copy refinement).

#### Evidence-Based Accessibility Requirements
- Text contrast $\ge 4.5:1$ using `--color-text-muted` (`#4B5563`) on surface backgrounds.
- Plain language that avoids clinical authority claims or shaming incomplete profiles.

#### Acceptance Criteria
- [ ] All instances of bureaucratic "Not specified" are replaced with warm, family-oriented fallback copy.
- [ ] Non-clinical disclaimer integrity is preserved.

#### Regression Risks
- None (copy string changes only).

---

### UX-06: Add Supported-File Guidance to Documents Empty State

#### Current Behavior
The empty state on `/documents` displays `"No documents uploaded yet"` with an `"Upload a document"` button, but does not state the accepted file formats or size constraints until the user opens the upload modal.

#### Intended Behavior
The document empty state provides upfront clarity on supported file types (`PDF, PNG, JPG up to 25MB`), reducing caregiver uncertainty before initiating an upload.

#### Exact UI Change
In `src/components/documents/DocumentList.tsx`, update the empty state container:
```tsx
<p className="text-sm font-semibold text-content">No documents uploaded yet</p>
<p className="text-xs text-content-muted max-w-sm">
  Keep medical records, insurance cards, and advance directives safe in one place. Supports PDF, PNG, and JPG files up to 25MB.
</p>
```

#### Affected Components / Surfaces
- `src/components/documents/DocumentList.tsx` (`/documents`)

#### Viewport Behavior
- Centered, readable guidance card across mobile, tablet, and desktop.

#### Evidence-Based Accessibility Requirements
- Readable font size ($\ge 14\text{px}$ heading, $\ge 12\text{px}$ helper text) adhering to $4.5:1$ contrast ratio.

#### Acceptance Criteria
- [ ] Empty state explicitly states accepted formats (`PDF, PNG, JPG`) and size limit (`25MB`).
- [ ] Matches Decision `D-06` / `OQ-06` active defaults.

#### Regression Risks
- None.

---

### UX-07: Strengthen Emergency Contact Call Affordance for Fast, Confident Mobile Interaction

#### Current Behavior
On `/emergency`, emergency contact cards feature an inline link `Call {Name} ({Phone})` with `bg-brand-light/60 text-brand`. While functional, the light teal background lacks immediate high-urgency call recognition on mobile.

#### Intended Behavior
Emergency contact cards feature a prominent, high-contrast, thumb-sized dialer button with a bold phone icon and direct `tel:` link, designed for rapid, error-free dialing during stressful moments.

#### Exact UI Change
In `src/components/emergency/EmergencyView.tsx`, update the dialer action container:
```tsx
<a
  href={`tel:${c.phone}`}
  aria-label={`Call ${c.name} at ${c.phone}`}
  className="inline-flex items-center justify-center space-x-2.5 w-full rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white px-4 py-2.5 text-sm font-bold shadow-sm transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
>
  <Phone className="h-4 w-4 shrink-0 stroke-[2.5]" />
  <span>Call {c.name}</span>
  <span className="text-emerald-100 font-normal text-xs ml-1">({c.phone})</span>
</a>
```

#### Affected Components / Surfaces
- `src/components/emergency/EmergencyView.tsx` (`/emergency`)

#### Viewport Behavior
- **Mobile (< 768px):** Full-width, 44px height tap bar for confident one-thumb tapping.
- **Tablet & Desktop:** Structured, full-card-width or comfortable inline call button.

#### Evidence-Based Accessibility Requirements
- High-contrast white text on emerald-700 background ($> 5.2:1$ contrast ratio).
- Touch target $\ge 44\text{px}$ height.
- Accessible name: `aria-label="Call [Contact Name] at [Phone Number]"`.

#### Acceptance Criteria
- [ ] Emergency dialer button measures $\ge 44\text{px}$ height on all viewports.
- [ ] Triggering the button initiates native `tel:` protocol dialer.
- [ ] Passes verified contrast checks in light mode.

#### Regression Risks
- Ensure button styling uses calm emerald tone rather than aggressive emergency sirens.

---

### UX-08: Improve Recent Changes Timestamps for Events Occurring Within the Last 24 Hours

#### Current Behavior
On `/today` (Priority 4 — Recent Changes), all activity events format timestamps as `MMM d, h:mm a` (e.g., `Sep 8, 3:45 PM`). For events that occurred moments or hours ago, caregivers must mentally calculate elapsed time to know if an update is fresh.

#### Intended Behavior
Events created within the last 24 hours display intuitive relative timestamps (e.g., *"Just now"*, *"15m ago"*, *"2h ago"*), while older events display the workspace-localized date (`Sep 7, 2:30 PM`).

#### Exact UI Change
- In `src/lib/timezone.ts`, implement a lightweight relative time helper:
  `formatRelativeTimeInWorkspaceTz(dateStr: string, timezone: string): string`
  - $< 1\text{ minute} \rightarrow$ `"Just now"`
  - $< 60\text{ minutes} \rightarrow$ `"${minutes}m ago"`
  - $< 24\text{ hours} \rightarrow$ `"${hours}h ago"`
  - $\ge 24\text{ hours} \rightarrow$ workspace date (`"MMM d, h:mm a"`)
- Update `TodayDashboard.tsx` to utilize this helper for the Recent Changes event list.

#### Affected Components / Surfaces
- `src/lib/timezone.ts`
- `src/components/dashboard/TodayDashboard.tsx` (`/today`)

#### Viewport Behavior
- Compact relative string fits cleanly on mobile viewports without truncating event titles.

#### Evidence-Based Accessibility Requirements
- Relative time is supplemented with full date title attribute (`title="{fullDateFormatted}"`) for screen readers and tooltips.

#### Acceptance Criteria
- [ ] Events $< 24\text{h}$ old display relative timestamps (*"10m ago"*, *"3h ago"*).
- [ ] Events $\ge 24\text{h}$ old display formatted calendar dates.
- [ ] All calculations adhere strictly to `workspace.timezone`.

#### Regression Risks
- Ensure server and client hydration do not produce timestamp mismatch warnings (render standard initial timestamp or suppress hydration warning on relative time tag).

---

### UX-09: Increase Visual Separation Between Settings Export and Danger Zone

#### Current Behavior
On `/settings`, the Danger Zone container (`Delete Workspace`) is rendered directly below the `Export Workspace Data` panel with standard `space-y-6` spacing. While bordered in red, its proximity to routine export actions creates potential visual confusion.

#### Intended Behavior
The Danger Zone panel has distinct visual and spatial separation ($\ge 32\text{px}$ margin and stronger boundary) to clearly delineate routine administrative exports from permanent workspace deletion.

#### Exact UI Change
- In `src/components/settings/SettingsView.tsx` (or `src/app/(workspace)/settings/page.tsx`), add an explicit divider and expanded spacing:
  `className="mt-10 pt-6 border-t border-border space-y-4"`
- Ensure Danger Zone card retains clear destructive context copy and confirmation safeguards.

#### Affected Components / Surfaces
- `src/components/settings/SettingsView.tsx` / `src/app/(workspace)/settings/page.tsx` (`/settings`)

#### Viewport Behavior
- Consistent spatial isolation on mobile and desktop.

#### Evidence-Based Accessibility Requirements
- Semantic heading `h3` inside the Danger Zone card.
- Red border and background tint paired with warning icon and explicit descriptive text.

#### Acceptance Criteria
- [ ] Danger Zone is separated from Export tools by at least 32px vertical space and a divider.
- [ ] Destructive confirmation modal remains mandatory before workspace deletion.

#### Regression Risks
- None.

---

## 4. Explicitly Deferred / Rejected Items

### UX-10: Keyboard Shortcut Badges in Unified `+ Add` Menu
- **Decision:** **DEFERRED / REJECTED FOR V1 (POST-BETA ONLY)**.
- **Rationale:** Adding keyboard shortcut badges (e.g., `T` for Task, `A` for Appointment) introduces cognitive noise to an otherwise clean action menu and requires custom global key-listener infrastructure that is out of scope for the 90-day beta.
- **Constraint:** Do not add keyboard shortcut badges or shortcut event listeners in V1.

---

## 5. Items Requiring Design Validation Prior to Implementation

The following three candidate refinements require explicit Product Owner design review and validation before they may be slated for code implementation:

| Item | Description | Why Design Validation is Required First |
|---|---|---|
| **DV-01: Universal Mobile Bottom-Sheet Form Modals** | Transitioning all form dialogs (`TaskFormModal`, `AppointmentFormModal`, `CareProfileEditModal`, `EmergencyContactModal`) to bottom-sheet drawers on viewports $< 640\text{px}$. | Must validate mobile virtual keyboard behavior, scrolling inside multi-field forms (e.g. Care Profile), and iOS Safari bottom bar clipping before adopting across all forms. |
| **DV-02: Emergency 30-Day Freshness Badge** | Adding a green "Verified Fresh" badge when emergency details were reviewed $< 30$ days ago. | Must validate whether an explicit green badge inadvertently creates clinical reassurance or false security. The current text display (*"Last reviewed on [Date] by [Name]"*) avoids clinical claims. |
| **DV-03: Expanded Task Completion Animation** | Introducing custom confetti or animated check-reflow transitions upon task completion. | Conflicts with Design System §1 & §6 principles of quiet psychological calm and no gamification. Checkbox check + line-through is currently approved. |

---

## 6. Evidence-Based Accessibility Verification Standards

In accordance with product operating rules, Family Care Command Center documents accessibility using **verified technical evidence** rather than unsubstantiated claims of whole-application certification.

### Verified Accessibility Criteria in Checkpoint 5

| Verification Area | Verified Technical Standard | Evidence in Implemented Codebase |
|---|---|---|
| **Touch Target Size** | Standalone primary touch targets measure $\ge 44\text{px}$; secondary segment controls measure $\ge 36\text{px}$–$38\text{px}$. | Verified across all primary action buttons (`Add`, `Save`, `Edit Profile`, `Call Contact`, `Get Started`) using Playwright bounding-box audits. |
| **Color Contrast** | Normal text $\ge 4.5:1$; large text & icons $\ge 3.0:1$. | Verified text tokens (`#1F2937` primary text, `#4B5563` muted text, `#0F766E` brand action, `#92400E` overdue amber) against white and neutral surfaces. |
| **Keyboard Focus Visibility** | High-contrast 2px focus ring with 2px offset. | Implemented via Tailwind `focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2` on all interactive links, buttons, and inputs. |
| **Dialog Focus Trapping** | Focus is constrained within active modal; `Escape` closes and restores focus. | Implemented via Radix UI `@radix-ui/react-dialog` primitives across all 10 modal forms. |
| **Semantic Heading Hierarchy** | Exactly one `h1` per page; logical `h2` priority tiers and `h3` cards. | Verified in DOM snapshots: `/today` (`h1` $\rightarrow$ `h2` Needs Attention $\rightarrow$ `h2` Workload $\rightarrow$ `h2` Coming Up $\rightarrow$ `h2` Recent Changes $\rightarrow$ `h2` Quick Reference). |
| **Form Label Linkage** | 100% of form inputs have programmatic `<Label htmlFor="...">` association. | Verified across `/login`, `/register`, `/onboarding`, `/settings`, and all modal dialogs (`hasLabel: true`). |
| **Color Independence** | Status states combine color tints with explicit text labels and semantic icons. | Overdue displays amber background + `AlertTriangle` icon + `"Overdue"` text badge. Due Today displays `"Due today"` text badge. |
| **Zero Layout Overflow** | 0px horizontal scrollbar at 375px, 768px, and 1280px widths. | Document scroll width matches viewport width across all 13 surfaces (`hasHorizontalOverflow: false`). |

---

## 7. Emergency Copy Fidelity Verification

A ground-truth comparison between the implemented Emergency module (`src/components/emergency/EmergencyView.tsx`, `src/lib/validations/emergency.ts`) and the canonical specification (`/docs/control/S3_CARE_PROFILE_EMERGENCY_DESIGN_SPEC.md` / `DECISIONS.md` D-23) yields the following fidelity report:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│ EMERGENCY COPY FIDELITY AUDIT                                                                  │
├────────────────────────────────┬───────────────────────────────┬───────────────────────────────┤
│ Specification Element          │ Implemented Copy              │ Fidelity Status               │
├────────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Safety Banner Heading          │ "For an emergency, call local │ EXACT MATCH                   │
│                                │ emergency services."          │                               │
├────────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Safety Banner Subtext          │ "This summary is family-      │ EXACT MATCH                   │
│                                │ entered reference information │                               │
│                                │ for care coordination and     │                               │
│                                │ does not replace professional │                               │
│                                │ emergency response."          │                               │
├────────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Family-Maintained Preamble     │ "All details below are        │ EXACT MATCH                   │
│                                │ entered and maintained by     │                               │
│                                │ your family. Confirm medical  │                               │
│                                │ questions with a healthcare   │                               │
│                                │ professional."                │                               │
├────────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Section 1: Contacts Header     │ "Emergency Contacts ({count})"│ EXACT MATCH                   │
├────────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Section 2: Hospital Header     │ "Preferred Hospital & Medical │ EXACT MATCH                   │
│                                │ Facility"                     │                               │
├────────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Section 3: Details Header      │ "Family-Entered Reference     │ EXACT MATCH                   │
│                                │ Details"                      │                               │
├────────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Section 4: Documents Header    │ "Emergency Reference          │ EXACT MATCH                   │
│                                │ Documents"                    │                               │
├────────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Section 5: Freshness Header    │ "Emergency Details Freshness" │ EXACT MATCH                   │
├────────────────────────────────┼───────────────────────────────┼───────────────────────────────┤
│ Action Button Label            │ "Mark as Reviewed"            │ EXACT MATCH                   │
└────────────────────────────────┴───────────────────────────────┴───────────────────────────────┘
```

**Copy Fidelity Verdict:** **100% PERFECT FIDELITY**. No copy discrepancies exist between the approved specifications and the implemented codebase.

---

## 8. Recommended Implementation Sequence for Approved Items

Once authorized by the Product Owner, the approved refinements should be implemented in three focused, low-risk passes:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ PASS 1: Touch Target & Ergonomics Polish (Low Risk / High Immediate Value) │
│ • UX-01: Category filter pill hit areas (Documents, Notes)                  │
│ • UX-02: Segment tab hit areas (Tasks, Calendar, Medications)               │
│ • UX-03: Auth link hit padding (Login, Register)                            │
│ • UX-04: Header brand touch zone (AppHeader)                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ PASS 2: Emergency & Action Clarity (High Caregiver Value)                   │
│ • UX-07: High-contrast Emergency Contact call button (EmergencyView)        │
│ • UX-08: Relative time helper for recent activity (TodayDashboard, timezone)│
│ • UX-09: Danger Zone visual separation (Settings)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│ PASS 3: Microcopy & Empty State Reassurance (Polish & Calm)                 │
│ • UX-05: Warm fallback microcopy (CareProfileView, EmergencyView, Meds)     │
│ • UX-06: File type guidance in Document empty state (DocumentList)          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Current Status & Next Actions

- **Current Repository State:** Clean working tree on `main`, synchronized with `origin/main`.
- **Application Code:** Untouched. No unapproved changes implemented.
- **Next Step:** Antigravity remains in **WAITING** status for Product Owner authorization before executing any code changes.
