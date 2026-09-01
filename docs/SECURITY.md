# Family Care Command Center — Security Architecture

**Document status:** Initial security design  
**Owner:** Antigravity  
**Decision authority:** Human Product Owner for policy decisions  
**Last updated:** September 1, 2026

## 1. Security Posture

This application handles sensitive caregiving information including health-adjacent reference data, family contact details, and private coordination records. The security architecture is designed to protect this data through defense-in-depth across authentication, authorization, transport, storage, and operational practices.

> **This product does not claim HIPAA compliance** (D-19). Legal/privacy review (OQ-01) is required before production handling of real personal data.

## 2. Threat Model Summary

| Threat | Mitigation |
|---|---|
| Unauthorized access to workspace data | Authentication required; RLS-enforced workspace isolation; session management |
| Cross-workspace data leakage | Database-level RLS policies scope every query to authorized workspaces |
| Privilege escalation within workspace | Server-side role checks on every mutation; RLS role enforcement |
| Session hijacking | Secure, HttpOnly, SameSite cookies; short-lived JWTs with refresh tokens |
| Malicious file upload | MIME type validation; file size limits; storage isolation; scanning (OQ-06/OQ-19) |
| XSS / injection | React's built-in escaping; server-side input validation; CSP headers |
| CSRF | SameSite cookies; Server Actions include origin verification |
| Data exposure in URLs | No sensitive data in URL parameters; document access via signed URLs |
| Unauthorized invitation acceptance | Cryptographically random invitation tokens; expiration; cancellation |
| Data loss / unauthorized deletion | Soft-delete pattern; deletion confirmation; backup strategy (OQ-05) |

## 3. Authentication

### 3.1 Provider

Supabase Auth (GoTrue) handles all authentication. No custom authentication system.

### 3.2 Methods (OQ-03)

Initial V1 approach:

| Method | Purpose |
|---|---|
| **Email + password** | Primary registration and sign-in method |
| **Magic link** | Passwordless sign-in option; account recovery |
| **Invitation token** | Custom invitation flow using application-managed tokens |

### 3.3 Session Management

- Sessions are managed via Supabase Auth using HTTP-only, Secure, SameSite=Lax cookies.
- Access tokens are short-lived JWTs (default 1 hour).
- Refresh tokens are long-lived and rotated on use.
- Session validation occurs in Next.js middleware on every request.
- Expired sessions redirect to sign-in with a return URL.

### 3.4 Account Recovery

- Password reset via Supabase Auth's built-in email flow.
- Magic link as an alternative sign-in path.
- No security questions or SMS verification in V1.

### 3.5 Member Removal

When a member is removed from a workspace:

1. Their `workspace_members` status is set to `removed`.
2. RLS policies immediately deny all data access for that workspace.
3. On their next request, they see an access-removed message.
4. Their active Supabase session remains valid for other workspaces but returns no data for the removed workspace.

## 4. Authorization

See `PERMISSIONS.md` for the complete role-based access matrix.

### 4.1 Enforcement Architecture

```text
┌───────────────────┐
│  Next.js Middleware│  → Verify auth session exists
├───────────────────┤
│  Server Action     │  → checkPermission(role, resource, action)
├───────────────────┤
│  PostgreSQL RLS    │  → Database rejects unauthorized queries
└───────────────────┘
```

All three layers must agree. The database layer (RLS) is the final, authoritative enforcement boundary.

### 4.2 Workspace Isolation

PostgreSQL RLS policies ensure that a user belonging to Workspace A can **never** access Workspace B data, even if:

- A client-side bug sends the wrong `workspace_id`
- A Server Action has a logic error
- The user manipulates request parameters

RLS policies check the user's JWT `sub` claim against the `workspace_members` table for every operation.

## 5. Transport Security

| Control | Implementation |
|---|---|
| **HTTPS** | Enforced by Vercel; all traffic is TLS 1.2+ |
| **HSTS** | Strict-Transport-Security header on all responses |
| **Cookie security** | `Secure`, `HttpOnly`, `SameSite=Lax` |
| **CSP** | Content-Security-Policy header restricting script sources, frame ancestors, and object sources |
| **X-Frame-Options** | `DENY` to prevent clickjacking |
| **X-Content-Type-Options** | `nosniff` to prevent MIME sniffing |
| **Referrer-Policy** | `strict-origin-when-cross-origin` |

## 6. Input Validation

### 6.1 Strategy

All user input is validated server-side using Zod schemas before any database operation. Client-side validation provides immediate UX feedback but is not a security boundary.

### 6.2 Rules

| Input Type | Validation |
|---|---|
| **Text fields** | Max length limits; trim whitespace; sanitize for storage |
| **Email** | Format validation via Zod email schema |
| **Dates** | ISO 8601 format validation; reasonable range check |
| **UUIDs** | Format validation for all ID parameters |
| **File uploads** | MIME type allowlist; file size limit; filename sanitization |
| **Free text (notes, descriptions)** | Max length limit; stored as-is (React escapes on render) |
| **Enums (status, role, category)** | Strict allowlist validation |

### 6.3 SQL Injection Prevention

- All database access uses Supabase client libraries with parameterized queries.
- No raw SQL string concatenation in application code.
- Database functions use parameterized inputs.

## 7. Document Storage Security

### 7.1 Storage Architecture

Documents are stored in Supabase Storage (S3-compatible) with the following structure:

```text
workspaces/{workspace_id}/documents/{document_id}/{filename}
```

### 7.2 Access Control

- Storage buckets are **private** (no public access).
- RLS policies on storage restrict access to workspace members.
- Document retrieval uses **signed URLs** with short expiration (e.g., 60 seconds).
- Signed URLs are generated server-side after permission verification.

### 7.3 Upload Constraints (OQ-06 — Antigravity Proposal)

| Constraint | Proposed Default | Rationale |
|---|---|---|
| **Max file size** | 25 MB | Sufficient for scanned documents and photos; prevents abuse |
| **Allowed MIME types** | PDF, JPEG, PNG, HEIC, GIF, TIFF, DOC/DOCX, TXT | Common document and photo formats |
| **Max files per workspace** | 500 (beta) | Prevents storage abuse during beta |
| **Filename** | Sanitized; special characters removed | Prevents path traversal and display issues |

### 7.4 File Scanning (OQ-19)

V1 beta approach:

- **MIME type validation** on upload (server-side, not just client-side extension check).
- **File size enforcement** on upload.
- **Filename sanitization** to prevent path traversal.
- Full virus/malware scanning infrastructure is deferred to post-beta unless the Product Owner prioritizes it. If implemented, scanned files would use a `processing` → `available` | `quarantined` state machine.

## 8. Invitation Security

| Control | Implementation |
|---|---|
| **Token generation** | Cryptographically random tokens (256-bit) |
| **Token storage** | Hashed in database; raw token sent only in invitation email/link |
| **Expiration** | Tokens expire after 7 days (configurable) |
| **Single use** | Token is consumed on acceptance; cannot be reused |
| **Cancellation** | Owner/inviter can cancel; token becomes invalid |
| **Rate limiting** | Max 20 invitations per workspace per day |
| **Information disclosure** | Invitation acceptance page shows workspace name and care recipient name only after token validation |

## 9. Data Protection

### 9.1 Encryption

| State | Protection |
|---|---|
| **In transit** | TLS 1.2+ (Vercel + Supabase) |
| **At rest** | Supabase encrypts database storage at rest (AES-256) |
| **Storage objects** | Supabase Storage encrypts objects at rest |

### 9.2 Data Minimization

- Collect only information required by the product spec.
- No analytics tracking of sensitive content (note bodies, document contents, health text).
- Timeline events reference record titles but do not echo sensitive field values.
- Beta telemetry (if implemented) tracks only lifecycle events, not content.

### 9.3 Data Retention and Lifecycle (Approved via D-21 / OQ-05)

- **Soft deletion:** User-created records (tasks, appointments, notes, documents, medications) use `deleted_at` timestamps and are excluded from all active queries via RLS and Server Action filters.
- **Workspace deletion & purge:** Deleting a workspace immediately revokes all member access. All database records and storage objects remain in a soft-deleted quarantine state for **30 days**, after which an automated purge permanently deletes database rows and storage bucket objects.
- **Data export:** Workspace Owners and Coordinators can generate a full data export before deletion, producing a structured JSON file of all workspace entities and a ZIP bundle of uploaded document files.
- **Member removal:** When a member is removed, their access is revoked immediately. Authored historical records (tasks, notes, audit trail) remain attributed to the user's historical display name snapshot.

## 10. Secret Management

| Secret | Storage |
|---|---|
| Supabase URL and anon key | Vercel environment variables (public, client-safe) |
| Supabase service role key | Vercel environment variables (server-only, never exposed to client) |
| Resend API key | Vercel environment variables (server-only) |
| Database connection string | Managed by Supabase; not stored in application code |

- **No secrets in source code or Git history.**
- `.env.local` for development; `.env.local.example` committed with placeholder values.
- Vercel preview deployments use separate environment variable sets.

## 11. Logging and Monitoring

### 11.1 Application Logging

- Server-side errors logged via Vercel's built-in logging.
- No sensitive data (passwords, tokens, health information) in log output.
- Authentication failures logged with anonymized identifiers.

### 11.2 Audit Trail

- The `timeline_events` table provides an application-level audit trail of all material mutations.
- Timeline events are append-only and immutable.
- This is a coordination history, not a certified compliance audit log (per V1_SCOPE.md).

## 12. Incident Response Considerations

Before production beta:

- Define a contact path for security concerns (OQ-08).
- Establish procedures for compromised accounts (password reset, session invalidation).
- Define the process for unauthorized workspace access reports.
- Supabase provides infrastructure-level incident management.

## 13. Security Verification Checklist

Before beta deployment:

- [ ] All RLS policies verified with test cases (see TESTING.md)
- [ ] Cross-workspace access tests confirm isolation
- [ ] Role-based action tests confirm permission matrix
- [ ] Session expiration and refresh tested
- [ ] File upload validation tested with malicious inputs
- [ ] Invitation token security verified (expiry, single-use, cancellation)
- [ ] CSP and security headers verified
- [ ] No secrets in client-side code or Git history
- [ ] Signed URL expiration verified
- [ ] Soft-delete verification (deleted records not accessible)
- [ ] Member removal verified (immediate access revocation)
