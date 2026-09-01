# Family Care Command Center — Technical Risks

**Document status:** Initial risk register  
**Owner:** Antigravity  
**Decision authority:** Human Product Owner for product-impacting mitigations  
**Last updated:** September 1, 2026

## Risk Severity Scale

| Severity | Definition |
|---|---|
| **Critical** | Could prevent beta launch or cause data breach/loss |
| **High** | Requires significant rework if not addressed early |
| **Medium** | Manageable with planning but creates friction if ignored |
| **Low** | Minor impact; address as encountered |

## Technical Risks

### TR-01: Role Permissions (OQ-02 — RESOLVED)

| Attribute | Detail |
|---|---|
| **Severity** | Low (Resolved) |
| **Description** | Role permissions across all categories were previously ambiguous. Resolved via Product Owner decision D-17 (Option A: Full Read / Tiered Write). |
| **Impact** | Unblocks Slice 2 RLS policies, Server Action authorization checks, and UI rendering. |
| **Mitigation** | Implemented as specified in `PERMISSIONS.md`. |
| **Owner** | Antigravity |

### TR-02: Email Delivery Infrastructure (OQ-04, OQ-18)

| Attribute | Detail |
|---|---|
| **Severity** | High |
| **Description** | Invitation delivery, password recovery, and access-change notifications require transactional email. No email service is configured. Supabase Auth handles auth emails but workspace invitations require custom emails. |
| **Impact** | Without transactional email, the invitation flow requires a manual link-copy workaround. This degrades the onboarding experience for beta testers and weakens the collaboration value proposition. |
| **Mitigation** | Architect for Resend integration from the start. Implement a copy-link fallback for invitations. Push for Product Owner decision on email scope by end of Week 2. Supabase Auth handles password reset emails independently. |
| **Owner** | Antigravity + Product Owner |

### TR-03: File Upload Safety and Scanning (OQ-06, OQ-19)

| Attribute | Detail |
|---|---|
| **Severity** | High |
| **Description** | The product stores user-uploaded files. Without file scanning, malicious uploads could be stored and served to other workspace members via signed URLs. MIME type validation alone is insufficient against sophisticated attacks. |
| **Impact** | Potential security risk if malicious files are shared within a workspace. However, full antivirus scanning infrastructure adds significant complexity for a beta product. |
| **Mitigation** | V1 beta: validate MIME type server-side, enforce file size limits, sanitize filenames, serve files via Content-Disposition: attachment (force download, not inline execution). Document limitations clearly. Defer full scanning to post-beta unless Product Owner escalates. |
| **Owner** | Antigravity |

### TR-04: Workspace Isolation Failure

| Attribute | Detail |
|---|---|
| **Severity** | Critical |
| **Description** | A bug in RLS policies or application code could allow a user in Workspace A to access Workspace B's data. This is the most serious security risk. |
| **Impact** | Complete privacy failure. Trust destruction. Potential legal liability. |
| **Mitigation** | Defense-in-depth: RLS policies as the primary boundary (database level), application-level checks as secondary, comprehensive automated tests for cross-workspace access. Every content table has an explicit RLS policy. Test matrix includes negative cases (user attempts to access non-member workspace). Code review requirement for any RLS policy changes. |
| **Owner** | Antigravity |

### TR-05: Timezone Complexity (OQ-20)

| Attribute | Detail |
|---|---|
| **Severity** | Medium |
| **Description** | Overdue status, due-today calculations, calendar ordering, and dashboard sections all depend on workspace-local date evaluation. Family members may be in different timezones. DST transitions can shift date boundaries. |
| **Impact** | Incorrect overdue status or calendar ordering would undermine the core product promise (knowing "what needs attention today"). Confusing timezone behavior would erode trust. |
| **Mitigation** | Store all timestamps as UTC. Store workspace IANA timezone. Compute all date boundaries server-side using `date-fns-tz`. Unit test DST edge cases explicitly. Display timestamps in workspace timezone consistently. Document the model clearly for users. |
| **Owner** | Antigravity |

### TR-06: Data Retention & Lifecycle (OQ-05 — RESOLVED)

| Attribute | Detail |
|---|---|
| **Severity** | Low (Resolved) |
| **Description** | Data retention, export, and deletion policies were previously undefined. Resolved via Product Owner decision D-21 (Option A: Soft Delete + 30-Day Purge + JSON/ZIP Export). |
| **Impact** | Unblocks database schema deletion constraints, export handlers, and retention cleanup routines. |
| **Mitigation** | Implemented as specified in `DATABASE.md` and `SECURITY.md`. |
| **Owner** | Antigravity |

### TR-07: Supabase Dependency Risk

| Attribute | Detail |
|---|---|
| **Severity** | Medium |
| **Description** | The architecture depends heavily on Supabase for auth, database, storage, and RLS. A Supabase outage, pricing change, or breaking API change would affect the entire application. |
| **Impact** | Service outage = complete application outage. Migration away from Supabase would require significant rework of auth, storage, and RLS policies. |
| **Mitigation** | Supabase is built on open-source components (PostgreSQL, GoTrue, S3-compatible storage). Migration path exists to self-hosted Supabase or alternative providers. Abstract Supabase-specific code behind service interfaces where practical. Regular database backups independent of Supabase. |
| **Owner** | Antigravity |

### TR-08: 90-Day Timeline Pressure

| Attribute | Detail |
|---|---|
| **Severity** | High |
| **Description** | The validation plan targets beta with real caregivers starting Week 8, with 10–20 caregivers over 90 days. The implementation plan has 8 weeks of build before beta. Any delays compress the testing window. |
| **Impact** | Insufficient build time leads to quality shortcuts. Insufficient testing time leads to unvalidated product decisions. The 90-day window is the product's first opportunity to prove value. |
| **Mitigation** | Strict slice prioritization: Slice 1 (core loop) is the minimum viable product for early testing. If timeline slips, begin Stage 1 concept testing (Weeks 1–3 of validation plan) with prototype/partial build. Do not expand scope to meet the timeline — reduce scope. |
| **Owner** | Product Owner + Antigravity |

### TR-09: Concurrent Edit Conflicts

| Attribute | Detail |
|---|---|
| **Severity** | Medium |
| **Description** | Multiple family members may edit the same record simultaneously (e.g., both reassign a task, both edit a note). Without conflict detection, the last write wins silently. |
| **Impact** | Silent data loss. Family members may not realize their changes were overwritten. This undermines the "shared awareness" promise. |
| **Mitigation** | Implement optimistic concurrency control using an `updated_at` timestamp. Server Actions check that the record's `updated_at` matches the client's known value before applying updates. On conflict, return an error with the current state and prompt the user to review and retry. |
| **Owner** | Antigravity |

### TR-10: Emergency Disclaimer and Legal Copy (OQ-07 — RESOLVED)

| Attribute | Detail |
|---|---|
| **Severity** | Low (Resolved) |
| **Description** | Emergency safety disclaimer copy and field preamble were unapproved. Resolved via Product Owner decision D-23 (Option A: Structured Contacts + Reference Info + Approved 911 Disclaimer & Preamble). |
| **Impact** | Unblocks production copy and UI implementation for the Emergency module. |
| **Mitigation** | Use exact approved copy in emergency header and field preambles. |
| **Owner** | Antigravity |

### TR-11: Invitation Token Security

| Attribute | Detail |
|---|---|
| **Severity** | Medium |
| **Description** | Invitation tokens sent via email could be intercepted, forwarded, or reused. A compromised token could allow unauthorized workspace access. |
| **Impact** | Unauthorized access to sensitive caregiving information. |
| **Mitigation** | Use cryptographically random 256-bit tokens. Hash tokens in the database (store only hash). Set short expiration (7 days). Single-use consumption. Require authentication before acceptance. Allow cancellation. Rate limit invitation creation. Monitor for unusual acceptance patterns. |
| **Owner** | Antigravity |

### TR-12: Accessibility Compliance Gap

| Attribute | Detail |
|---|---|
| **Severity** | Medium |
| **Description** | WCAG 2.2 AA compliance is a design requirement. Automated tools (axe-core) catch many issues but cannot verify all accessibility requirements (e.g., logical focus order, meaningful announcements, cognitive clarity). |
| **Impact** | Accessibility failures exclude older relatives and care recipients who are an important secondary audience. Failure to meet the design system's accessibility promises undermines trust. |
| **Mitigation** | Automated axe-core scanning in CI. Manual keyboard and screen reader testing at each milestone. Use semantic HTML and native controls (shadcn/ui provides this). Follow the design system's typography, contrast, and target-size specifications strictly. Include users of varying technology comfort in beta testing. |
| **Owner** | Antigravity |

## Risk Summary Matrix

| Risk ID | Severity | Blocking? | Resolution Status |
|---|---|---|---|
| TR-01 | Low | No | **Resolved** (D-17 / OQ-02) |
| TR-02 | High | Partial (invite UX) | Active mitigation (Resend + copy link fallback) |
| TR-03 | High | No (mitigated) | Beta default defined; review post-beta |
| TR-04 | Critical | Yes (always) | Continuous testing; RLS enforcement |
| TR-05 | Medium | No (mitigated) | Implemented in Slice 1 |
| TR-06 | Low | No | **Resolved** (D-21 / OQ-05) |
| TR-07 | Medium | No | Architectural awareness; open-source migration path |
| TR-08 | High | No | Strict slice prioritization |
| TR-09 | Medium | No | Optimistic concurrency in Slice 1 |
| TR-10 | Low | No | **Resolved** (D-23 / OQ-07) |
| TR-11 | Medium | No (mitigated) | Implemented in Slice 2 |
| TR-12 | Medium | No | Continuous verification (axe-core + manual) |
