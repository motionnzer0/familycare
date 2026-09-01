# Family Care Command Center — Design System

**Document status:** Final V1 visual and interaction specification  
**Owner:** Manus AI, Product + UX  
**Audience:** Google Antigravity and Human Product Owner  
**Last updated:** September 1, 2026

## 1. Design Direction

The visual system should make a family feel that their information is **organized, private, and manageable**. It favors quiet structure over visual novelty. The default experience is light, warm-neutral, and highly legible, with a restrained teal-blue action color and carefully limited semantic status colors.

> The interface should communicate **“you can find what you need”**, not **“something is always wrong.”**

The system uses cards only to establish a meaningful boundary, such as a grouped current-work section, a stable emergency reference block, or a focused form. It must not turn every label, metric, or navigation item into a floating tile. Decorative gradients, glass effects, dense shadows, illustrations competing with content, excessive rounded containers, and motion-led attention tactics are out of scope.

## 2. Design Tokens

### 2.1 Color Foundation

The color system is semantic. Hex values are a starting implementation palette; Antigravity must perform final automated contrast verification in the implemented interface, including hover/focus/disabled pairs and text over tinted status backgrounds. The product targets WCAG 2.2 AA. WCAG requires at least 4.5:1 contrast for normal text and 3:1 for large text; it also requires visible keyboard focus.[1] [2]

| Token | Value | Primary use | Guardrail |
|---|---:|---|---|
| `--color-canvas` | `#F8FAF9` | Main app background. | Never use for low-contrast secondary text. |
| `--color-surface` | `#FFFFFF` | Forms, panels, menus, dialog surfaces. | Use border or subtle elevation only when surface boundary matters. |
| `--color-surface-subtle` | `#F1F5F3` | Secondary page areas, grouped list background. | Do not use as the only selected-state signal. |
| `--color-border` | `#CBD5D1` | Quiet dividers and control borders. | Focus/validation must use stronger semantic treatment. |
| `--color-text` | `#1F2937` | Primary text. | Default body and control label color. |
| `--color-text-muted` | `#4B5563` | Supporting labels, metadata, helper text. | Do not use below 14px for critical due/owner information. |
| `--color-text-subtle` | `#6B7280` | Non-critical metadata only. | Never carry meaning alone. |
| `--color-primary-700` | `#0F766E` | Primary action, selected navigation, strong links. | White text only after implemented contrast test. |
| `--color-primary-100` | `#CCFBF1` | Calm selected/positive context tint. | Pair with dark text/icon; not status-only. |
| `--color-focus` | `#2563EB` | Keyboard focus ring. | Use a 2–3px high-visibility ring with offset. |
| `--color-danger-700` | `#B91C1C` | Destructive actions and error text. | Never use for generic urgency. |
| `--color-danger-100` | `#FEE2E2` | Error/danger background tint. | Always pair with icon/text. |
| `--color-warning-800` | `#92400E` | Overdue and warning text/icon. | Pair with due date and status label. |
| `--color-warning-100` | `#FEF3C7` | Overdue/warning background tint. | Avoid full-page or pulsing use. |
| `--color-success-800` | `#166534` | Completed/success text/icon. | Does not replace explicit “Completed” label. |
| `--color-success-100` | `#DCFCE7` | Success/completed background tint. | Use sparingly after completion. |
| `--color-info-800` | `#1E40AF` | Informational notice text/icon. | Must not resemble urgent/danger state. |
| `--color-info-100` | `#DBEAFE` | Informational notice background. | Concise, dismissible only if non-critical. |

**Emergency treatment:** Emergency uses `--color-text` on `--color-surface` with a distinctive but calm left keyline or outlined icon in `--color-danger-700`. It is not a full red button, flashing element, or irreversible alarm. The text label **Emergency** is mandatory.

### 2.2 Typography

Use a humanist sans-serif with strong numeral and punctuation clarity, such as **Source Sans 3**; fall back to `system-ui`, `Segoe UI`, `Roboto`, `Helvetica Neue`, and `Arial`. Antigravity may use a different typeface only if its x-height, distinguishable characters, performance, licensing, and accessibility are comparable.

| Token | Size / line height | Weight | Use |
|---|---:|---:|---|
| `--type-display` | 32px / 40px desktop; 28px / 36px mobile | 650–700 | Page title only; no more than one per screen. |
| `--type-h1` | 24px / 32px | 650–700 | Main section title or record name. |
| `--type-h2` | 20px / 28px | 650 | Section title. |
| `--type-h3` | 16px / 24px | 650 | Subsection, list group title. |
| `--type-body` | 16px / 24px | 400–450 | Default information and form content. |
| `--type-body-strong` | 16px / 24px | 600 | Task title, owner name, key labels. |
| `--type-small` | 14px / 20px | 400–500 | Supporting metadata and secondary labels. |
| `--type-label` | 14px / 20px | 600 | Form labels, tabs, small controls. |
| `--type-caption` | 13px / 18px | 400–500 | Non-critical timestamp/support copy only. |

Do not use body text below 16px for primary reading. Due state, person ownership, error text, emergency contact details, and primary action labels must never use caption size as their only presentation. Use sentence case, not all caps; status badges may use 12–13px medium/semibold text only when the same status is also readable in surrounding content.

### 2.3 Spacing, Shape, and Elevation

Use a 4px base unit. Generous but disciplined whitespace reduces cognitive density without pushing current information below the fold.

| Token | Value | Common use |
|---|---:|---|
| `--space-1` | 4px | Icon-to-label adjustments, dense inline gaps. |
| `--space-2` | 8px | Field label gap, icon/text gap. |
| `--space-3` | 12px | List item internal rhythm, small component separation. |
| `--space-4` | 16px | Standard control padding, content-stack gap. |
| `--space-5` | 20px | Form-group and list-group gap. |
| `--space-6` | 24px | Card/panel padding, main section gap. |
| `--space-8` | 32px | Major page-section gap. |
| `--space-10` | 40px | Page-title-to-content gap when needed. |
| `--space-12` | 48px | Large desktop layout separation only. |

The default control and small panel radius is 8px. Larger containers may use 12px only where the boundary is meaningful. Use a 1px border for ordinary surface separation. Elevation is restricted to menus, dialogs, and temporary overlays: a soft shadow with low opacity and no dramatic blur. Avoid nested bordered cards inside bordered cards.

## 3. Layout System

| Layer | Rule |
|---|---|
| App shell | Maximum content width of 1280px after navigation; center content on large screens with 24–40px horizontal page gutters. |
| Page header | Title, short contextual subtitle if useful, and at most two primary-level actions. Avoid action toolbars that compete with the title. |
| Main reading column | Keep long-form profile, notes, settings, and medication forms to a comfortable maximum width, approximately 720px. |
| Dashboard | Use one strong main column; at larger widths add one secondary column only for Recent changes/Quick reference, never a grid of equal cards. |
| Lists | Use full-width, grouped rows with stable columns/information order. On mobile, stack secondary details below title. |
| Forms | Single column by default. Use two columns only for tightly related short fields on desktop and collapse on medium/small widths. |
| Dividers | Use subtle dividers to distinguish repeated list rows or form groups. Do not box every element. |

## 4. Components

### 4.1 Buttons and Action Hierarchy

| Component | Visual treatment | Use | Prohibited use |
|---|---|---|---|
| **Primary button** | `primary-700` fill, white text, 44px minimum height, 16px label. | One main action in a focused context: Add task, Save, Send invitation. | Multiple competing actions in same group; destructive action. |
| **Secondary button** | Surface fill, `border`, dark text. | Supporting action: Cancel, View all, Add details. | Repeating at every row where a text/inline action is clearer. |
| **Tertiary / text button** | No fill, primary/dark text, visible hover/focus. | Low-emphasis action: Edit, View Timeline, Reopen. | Sole control for high-risk destructive action. |
| **Danger button** | Danger fill only inside a destructive confirmation context. | Confirm remove member/delete document/workspace. | Everyday task urgency, cancellation without confirmation. |
| **Icon button** | Minimum 40px visible target; accessible text name/tooltip. | Close modal, filter, more actions where label repetition is genuinely unnecessary. | Primary navigation or Emergency access without text. |
| **Split button** | Not used in V1. | — | Adds choice complexity and error risk. |

Buttons should use verbs that describe the result: **Add task**, **Save changes**, **Send invitation**, **Complete task**, **Remove member**. Avoid vague labels such as Submit, Continue when the next step is unknown, or OK.

### 4.2 Inputs and Forms

| Component | Specification |
|---|---|
| Text input | 44px minimum height; label visible above; helper text below only when necessary; clear focus ring; placeholder is an example, never a label. |
| Text area | Visible label; supports multi-line notes; reasonable default height; character limit only when technically necessary and stated. |
| Date/time input | Text-entry path plus accessible picker; expected format stated when locale parsing is uncertain; time optionality explicitly visible. |
| Select / combobox | Use for known, short sets such as assignee, category, or role. Current selection is clear; keyboard accessible; never hide choice behind placeholder. |
| Checkbox | Use for independent binary choices, never as a disguised confirmation of high-impact actions. |
| Radio group | Use when exactly one short mutually exclusive choice is required, such as workspace role. Explain consequences in supporting copy. |
| File input | Give full text label and accepted constraints before selection; show upload/processing state and error recovery. |
| Validation | Redundant system: `danger-700` text/icon, clear message, field state, and programmatic association. Do not use red border alone. |

Form section headings and help should explain why sensitive information is being requested and whether it is optional. For destructive or access-changing actions, use a confirmation dialog that names the affected person or item and consequence; do not use an unlabelled checkbox as the only safeguard.

### 4.3 Lists, Panels, and Cards

A **list row** is the default pattern for repeated work: task, appointment, medication, document, note, activity event, or member. List rows use a clear left-to-right or top-to-bottom scan order: primary label/title; state; supporting identity/date; relevant action. A task row must not require opening detail to learn its assignee or due state.

A **panel/card** exists only when it groups a distinct task or reference area. It has a descriptive heading, modest 16–24px padding, and usually a soft border. Dashboard sections may be panels; individual dashboard rows should not each be separate cards. Nested cards should be avoided.

| Pattern | Required contents | Use |
|---|---|---|
| Task row | Title, assignee/Unassigned, due state/date, completion control for authorized user. | Today and Tasks. |
| Appointment row | Date/time, title, location/mode if present, cancellation state. | Today and Calendar. |
| Medication row | Name, abbreviated instruction/schedule only if it remains legible, last reviewed. | Care → Medications. |
| Document row | Title, category, date, availability state. | Documents. |
| Timeline row | Actor, action, object, time, link affordance. | Updates → Timeline. |
| Note row | Optional title, excerpt, author, time. | Updates → Notes. |
| Member row | Name, relationship label, role, invitation/access state. | Care → Care Team. |

### 4.4 Badges and Status Indicators

Badges are compact semantic labels. They must not be used to decorate every row or replace readable language. Status text should occur in the badge and, for critical task status, in the row’s accessible name.

| State | Label | Token treatment | Additional cue |
|---|---|---|---|
| Overdue | **Overdue** | Warning background + warning text/icon. | Exact due date and duration where useful. |
| Due today | **Due today** | Neutral/primary emphasis, not warning by default. | Due date/time. |
| Unassigned | **Unassigned** | Neutral surface/border treatment. | Clear assignment action when permitted. |
| Completed | **Completed** | Success tint/text, low visual prominence after completion. | Completion actor/time in detail. |
| Cancelled | **Cancelled** | Muted text + icon; avoid successful/active treatment. | Persist in Calendar history. |
| Pending invite | **Invite pending** | Info/neutral style. | Invite date/expiry and resend/cancel action. |
| File unavailable | **Unavailable** | Danger or neutral error treatment based on cause. | Plain reason and recovery action. |
| Last reviewed | **Last reviewed [date]** | Textual metadata; no “verified” badge. | Edit/review action for authorized user. |

### 4.5 Navigation and Icons

Primary navigation items pair a 20–24px outline icon with a text label. The selected item uses a primary-text/icon state plus a subtle background or left indicator; it is not identified by color only. Emergency retains a text label and a recognizable but non-alarmist symbol.

Use one consistent outline-icon family with rounded, calm geometry. Icons communicate a familiar category or action; they never replace text for primary navigation, due state, permission changes, or emergency access. Avoid ambiguous heartbeats, medical crosses used as product authority, or patient-monitoring motifs.

### 4.6 Dialogs, Sheets, and Toasts

| Pattern | Use | Behavior |
|---|---|---|
| Modal dialog | Short input / confirmation where desktop space is adequate. | Traps focus appropriately; has title, close path, visible focus, and returns focus to trigger. |
| Full-screen mobile form | Modal-level input that would become cramped on small screens. | Includes clear close/back and unsaved-changes guard. |
| Side sheet | Contextual detail only when it does not reduce form accessibility. | Not required; avoid nesting sheet inside modal. |
| Toast / transient confirmation | Low-risk saved/completed feedback. | Must not be only confirmation for high-impact actions; should be screen-reader appropriate and non-obscuring. |
| Inline alert | Persistent error, incomplete emergency information, or important explanatory state. | Text, icon, semantic role, and specific action/link if available. |

## 5. Responsive Rules

| Breakpoint intent | Layout behavior | Interaction behavior |
|---|---|---|
| Large desktop, ≥1024px | Stable navigation rail; Today may use purposeful two-column layout; content remains capped in width. | Persistent Add and Emergency; hover may supplement but never replace visible actions. |
| Medium, 768–1023px | Condensed rail/top navigation; collapse non-essential secondary panels below core content. | Forms remain accessible; menus must not cover core state without clear close. |
| Mobile, <768px | Single-column content; bottom navigation plus More; order current work before reference; avoid horizontal list tables. | 44px preferred touch target for primary controls; quick capture becomes full-screen if needed; no hover-dependent state. |

WCAG 2.2 sets a 24-by-24 CSS-pixel minimum target-size criterion, while larger targets are beneficial for many users.[3] Family Care Command Center therefore uses a 44px preferred control height for primary/standalone touch controls and never relies on an undersized adjacent icon target to complete a core action.

## 6. Accessibility Rules

| Area | V1 rule |
|---|---|
| Contrast | Normal text targets 4.5:1 or greater; large text 3:1 or greater; final implementation tests actual colors and backgrounds. |
| Focus | Every keyboard-operable control has a visible, persistent focus indicator. Never remove browser focus without providing an accessible alternative. |
| Target size | Standalone controls use 44px preferred height; any exception must pass WCAG target-size rules and remain practical. |
| Semantic structure | One H1/page; logical heading hierarchy; native button/link/input semantics before custom widgets. |
| Error handling | Explain error in text, associate it with field, preserve values, and move focus predictably. |
| Status | Use text, icon/shape, placement, and optional color. No semantic state depends on color alone. |
| Motion | Motion is subtle, ≤200ms for ordinary state changes, never required to understand state, and reduced under user preference. |
| Zoom and reflow | Content must remain usable at browser zoom; no critical function requires horizontal scrolling at narrow reflow width. |
| Screen readers | Announce meaningful save/error/status updates without reading a stream of passive activity; dialogs have name, description, and correct focus behavior. |
| Images | The care recipient photo is optional and decorative unless intentionally used as identity; provide alt text strategy appropriate to user-uploaded content. |

## 7. Content and Status Rules

The language system is part of the design system. It must not create anxiety or imply expertise the product does not have.

| Intent | Approved style | Avoid |
|---|---|---|
| Current action | “Needs attention” and “Due today.” | “Critical alert,” “Delinquent.” |
| Ownership | “No one is assigned yet.” | “Owner missing,” “Nobody.” |
| Medication | “Shared reference information.” | “Verified medication record,” “Safe to take.” |
| Emergency | “For an emergency, call local emergency services.” | “Get emergency help here.” |
| Incomplete setup | “Add details when you’re ready.” | “Your profile is incomplete” for optional data. |
| Error | “We couldn’t save your changes. Your information is still here—try again.” | “Error 500,” “Invalid.” without explanation. |

## 8. Design System Acceptance Criteria

The V1 implementation follows the system when each primary screen can be scanned without relying on tiny text, visual decoration, or color-only status; text/controls meet verified accessibility rules; task ownership/due state is visible; Emergency is text-labeled and always reachable; forms preserve recovery context; responsive screens prioritize core coordination; and overlays do not create inaccessible or nested interaction traps.

## References

[1]: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html "W3C WAI — Understanding SC 1.4.3: Contrast (Minimum)"
[2]: https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html "W3C WAI — Understanding SC 2.4.7: Focus Visible"
[3]: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html "W3C WAI — Understanding SC 2.5.8: Target Size (Minimum)"
