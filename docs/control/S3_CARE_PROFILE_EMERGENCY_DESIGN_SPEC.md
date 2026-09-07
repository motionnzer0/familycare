# Care Profile + Emergency Design Specification — Family Care Command Center

**Document Status:** Approved Design Specification (Slice 3)  
**Product Authority:** ChatGPT (Product, UX & Strategy)  
**Product Owner:** Trav (Founder / Product Owner)  
**Implementation Authority:** Antigravity (Engineering)  
**Date:** September 6, 2026  
**Scope:** Care Profile and Emergency surfaces only  

---

## 1. Product Objective

Care Profile and Emergency Information provide high-trust, rapid-access situational reference for the family care team. When an authorized caregiver or family member needs critical identity details or emergency contacts for their care recipient, these surfaces must deliver immediate clarity, predictability, and psychological calm.

- **Care Profile:** The authoritative reference for the care recipient's identity, preferred name, contact basics, address, and daily care preferences/notes.
- **Emergency Information:** A focused, high-priority emergency summary putting emergency contacts first, emergency service disclaimers, preferred medical facility, family-entered reference details, linked safety documents, and a clear "last reviewed" verification state.

Both surfaces operate strictly within the **non-clinical boundary**: they organize family-maintained reference data without clinical inference, interaction checking, dosage advice, or triage claims.

---

## 2. Information Hierarchy & Experience Boundaries

### 2.1 Care Profile (/care / /settings Care Context)
1. **Identity & Header Context:** Care recipient preferred name, legal name (optional), relationship/photo (optional), primary location/address, and "Last updated" metadata (backed by `updated_at`).
2. **Contact & Location:** Primary phone, home address, accessibility/entry notes.
3. **Care Preferences & Baseline Notes:** Daily routines, communication preferences, personal habits, special family instructions.
4. **Contextual Navigation:** Seamless cross-links to Emergency Information and Medication reference views.

### 2.2 Emergency Information (/emergency)
1. **Persistent Safety Preamble:** Exact required emergency copy: "For an emergency, call local emergency services."
2. **Emergency Contacts (Primary & Ordered):** Listed first with immediate tel: call actions, relationships, and priority indicators.
3. **Preferred Medical Facility / Hospital:** Facility name, address, phone number, and transport/admission notes.
4. **Family-Entered Reference Information:**
   - Allergies (user-entered plain text)
   - Medical conditions / Diagnoses (user-entered plain text)
   - Insurance Reference (carrier, policy #, group #, primary insured)
   - Critical Emergency Notes (user-entered plain text)
5. **Linked Emergency Documents:** Direct signed-URL access to uploaded documents tagged for emergency reference (e.g., Advance Directives, DNR, POLST, Insurance Cards).
6. **Last-Reviewed Verification:** Clear status indicating when emergency details were last reviewed and by whom, with an explicit "Mark as Reviewed" action for coordinators.

---

## 3. Detailed Component Specifications

### 3.1 Care Profile View & Management
- **Page Heading (h1):** About {careRecipientName} or Care Profile for {careRecipientName}
- **Subtitle:** Basic identity, contact details, and care context for {careRecipientName}.
- **Metadata:** Displays "Last updated: {Date}" based on the existing `care_recipients.updated_at` field (as the care_recipients schema does not contain last_reviewed_at / last_reviewed_by).
- **Fields:**
  - preferred_name (string, required): Display name used across the workspace.
  - legal_name (string, optional): Full legal name for administrative and medical matching.
  - birth_date (date, optional): Formatted in human-readable date.
  - address (text, optional): Street address and living arrangement.
  - phone (string, optional): Contact telephone.
  - notes (text, optional): Personal preferences, routines, and care notes.
- **Action Buttons:**
  - Edit Profile: Accessible to Owner and Coordinator. Opens focused edit modal/form.
  - Read-only presentation for Contributor and Viewer roles.

### 3.2 Emergency View (/emergency)
- **Page Heading (h1):** Emergency Information for {careRecipientName}
- **Safety Banner (Alert):**
  - Text: "For an emergency, call local emergency services."
  - Subtext: "This summary is family-entered reference information for care coordination and does not replace professional emergency response."
  - Visuals: Distinct, calm alert container (bg-red-50/50 border border-red-200 text-red-950). Never use flashing lights or sensational animations.
- **Section 1 — Emergency Contacts:**
  - Sorted by priority_order (primary first).
  - Displays contact name, relationship, phone number, and alternative phone.
  - **Call Action:** Prominent Call {name} button with native tel:{phone} link.
  - Add Contact / Edit Contact triggers (Owner/Coordinator only).
- **Section 2 — Preferred Facility:**
  - Hospital/facility name, full address, main telephone (tel: link), and arrival notes.
- **Section 3 — Family-Entered Reference Details:**
  - Allergies: User-entered free text or tag list.
  - Medical Conditions: User-entered summary list.
  - Insurance: Carrier name, member ID, group ID.
  - Emergency Notes: Special access codes, pet instructions, or immediate coordination steps.
- **Section 4 — Linked Emergency Documents:**
  - Lists documents categorized as emergency references.
  - Secure signed-URL viewing/downloading in 2 clicks or fewer.
- **Section 5 — Last-Reviewed Timestamp & Action:**
  - Displays: "Last reviewed on {Date} by {Member Name}" (or "Not yet reviewed").
  - Prominent "Mark as Reviewed" action for Owner and Coordinator to update freshness without altering record data.

---

## 4. Role-Based Access Control (RBAC)

Adheres strictly to Decision D-17 and Row Level Security (RLS):

| Role | Care Profile View | Care Profile Edit | Emergency View | Emergency Edit / Add Contacts | Mark Emergency Reviewed |
|---|---|---|---|---|---|
| **Owner** | Full Access | Full Access | Full Access | Full Access | Yes |
| **Coordinator** | Full Access | Full Access | Full Access | Full Access | Yes |
| **Contributor** | Full Access | Read-Only (No Edit Controls) | Full Access | Read-Only (No Edit Controls) | No |
| **Viewer** | Full Access | Read-Only (No Edit Controls) | Full Access | Read-Only (No Edit Controls) | No |

- In write-restricted roles (Contributor, Viewer), edit buttons, modal triggers, and delete affordances must be omitted from the DOM, and server-side actions must reject unauthorized mutations.

---

## 5. UX & State Requirements

### 5.1 Feedback States
- **Loading:** Structured skeleton loader matching the header, contact cards, and reference sections.
- **Empty States:**
  - *No Emergency Contacts:* Clear guidance "No emergency contacts added yet" with direct + Add Emergency Contact button (for editors) or informative notice (for viewers).
  - *No Reference Details:* Friendly prompt explaining what to add (allergies, facility, insurance).
- **Error Handling:** Inline validation messages adjacent to inputs; server-side error banners with retry capability.
- **State Preservation:** Form modals must not discard user-entered text if a network glitch occurs.

### 5.2 Responsive & Mobile Requirements
- Single-column layout on mobile viewports (< 768px).
- Fixed mobile navigation clearance (pb-32 or appropriate layout padding) so bottom sections and actions are never obscured.
- Touch targets >= 44px for all interactive buttons, call links, and modal triggers.
- Zero horizontal scrolling across all screen sizes.

### 5.3 Accessibility (WCAG 2.2 AA)
- Semantic heading hierarchy (h1 -> h2 -> h3).
- Accessible labels on phone dialer links (aria-label="Call Jane Doe at 555-0199").
- Keyboard-operable modal dialogs with focus trap and escape-key dismissal.
- High-contrast text meeting standard 4.5:1 ratios for normal text and 3:1 for large headings.

---

## 6. Non-Goals & Invariants

1. **Non-Clinical Boundary:** No clinical calculations, diagnosis inference, drug-allergy interaction checking, or urgency scoring.
2. **Authenticated Access Only:** No public emergency share links, lock-screen bypasses, or QR code generation in V1.
3. **Security Invariants:**
   - Supabase RLS policies on all tables (care_recipients, emergency_contacts, emergency_info, documents).
   - Server-side role authorization on all server actions.
   - Cross-workspace isolation enforced at the database layer.
   - Secure signed URLs for all document access.
4. **Database Invariants:** Preserve existing database schema and migrations. No destructive schema refactoring.
5. **Feature Scope:** No SMS/push alert integrations, no real-time telemetry, no background automated notifications.

---

## 7. Acceptance Criteria

1. Authorized users can navigate to Care Profile and Emergency from the navigation rail, mobile navigation, and Today quick reference shortcuts in 2 interactions or fewer.
2. Care Profile displays care recipient identity, contact details, address, notes, and "Last updated" metadata with clean Owner/Coordinator edit flows and Contributor/Viewer read-only states.
3. Emergency Information presents the required safety copy: "For an emergency, call local emergency services." prominently at the top.
4. Emergency contacts are rendered first with functional tel: call actions and priority ordering.
5. Preferred hospital/facility details, allergies, conditions, insurance, and emergency notes render clearly with accessible edit controls for authorized roles.
6. Linked emergency documents can be opened/downloaded securely via signed URLs.
7. Emergency Information's "Last Reviewed" state accurately shows timestamp and reviewer name, and allows Owner/Coordinator to update the review status.
8. Role-based edit restrictions are enforced both in UI visibility and server-side action validation.
9. Responsive layouts render flawlessly on mobile (<768px), tablet (768px–1024px), and desktop (>1024px) with no horizontal overflow.
10. All automated test suites, typechecks, linter passes, and production builds succeed with 0 errors.
