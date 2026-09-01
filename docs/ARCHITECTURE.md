# Family Care Command Center — Technical Architecture

**Document status:** Initial technical architecture  
**Owner:** Antigravity  
**Decision authority:** Human Product Owner for product-visible changes  
**Last updated:** September 1, 2026

## 1. Architecture Principles

| Principle | Implication |
|---|---|
| **Simplest reliable choice** | Use managed services (Supabase, Vercel) over custom infrastructure. Avoid microservices, message queues, and custom auth. |
| **Server-side authority** | All authorization, data access, and mutation logic is enforced server-side. Client UI reflects permissions but never enforces them alone. |
| **Workspace isolation** | Every data query is scoped to the authenticated user's authorized workspace. Cross-workspace data leakage is an architectural impossibility, not a runtime check. |
| **Progressive delivery** | Build in vertical slices that each deliver end-to-end user value. Slice 1 delivers the core coordination loop before expanding to reference modules. |
| **No premature abstraction** | No custom state management libraries, no GraphQL, no event bus, no custom caching layer. Add complexity only when measured need arises. |

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Server Components, Server Actions, built-in API routes, middleware auth checks, ISR/SSR flexibility. Single deployable unit. |
| **Language** | TypeScript (strict mode) | Type safety across client and server boundaries. Shared types for database models, API contracts, and form validation. |
| **Styling** | Tailwind CSS 3+ | Utility-first CSS matching the design system's token-based approach. Custom CSS variables for design tokens. |
| **Components** | shadcn/ui | Accessible, composable Radix-based primitives. Not a heavy dependency — components are copied into the project and customized. |
| **Database** | PostgreSQL via Supabase | Managed Postgres with Row Level Security (RLS), real-time subscriptions (future), and built-in connection pooling. |
| **Authentication** | Supabase Auth | Email/password and magic link support. Session management, account recovery, and JWT tokens. No custom auth system. |
| **File Storage** | Supabase Storage | S3-compatible object storage with RLS policies. Signed URLs for secure document access. |
| **Email** | Supabase Auth emails + Resend (transactional) | Auth emails handled by Supabase. Invitation and notification emails via Resend (pending OQ-04 resolution). |
| **Deployment** | Vercel | Zero-config Next.js deployment, edge middleware, preview deployments, environment variable management. |
| **Validation** | Zod | Runtime schema validation shared between client forms and server actions. |
| **Date/Time** | date-fns + date-fns-tz | Lightweight timezone-aware date manipulation. No Moment.js. |
| **Icons** | Lucide React | Consistent outline icon set matching design system requirements. |

## 3. System Topology

```text
┌─────────────────────────────────────────────────────┐
│                      Vercel                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │  Edge        │  │  Server      │  │  Static   │  │
│  │  Middleware   │  │  Components  │  │  Assets   │  │
│  │  (Auth check)│  │  + Actions   │  │  (CDN)    │  │
│  └──────┬───────┘  └──────┬───────┘  └───────────┘  │
│         │                 │                          │
└─────────┼─────────────────┼──────────────────────────┘
          │                 │
          │    ┌────────────┴────────────┐
          │    │        Supabase         │
          │    │  ┌──────────────────┐   │
          └────┤  │  Auth (GoTrue)   │   │
               │  └──────────────────┘   │
               │  ┌──────────────────┐   │
               │  │  PostgreSQL      │   │
               │  │  + RLS Policies  │   │
               │  └──────────────────┘   │
               │  ┌──────────────────┐   │
               │  │  Storage (S3)    │   │
               │  │  + RLS Policies  │   │
               │  └──────────────────┘   │
               │  ┌──────────────────┐   │
               │  │  Edge Functions  │   │
               │  │  (webhooks,      │   │
               │  │   background)    │   │
               │  └──────────────────┘   │
               └─────────────────────────┘
                         │
               ┌─────────┴─────────┐
               │  Resend (email)   │
               │  (transactional)  │
               └───────────────────┘
```

## 4. Application Architecture

### 4.1 Directory Structure

```text
familycare/
├── docs/                          # Shared project documentation
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Auth route group (login, register, invite)
│   │   ├── (workspace)/           # Authenticated workspace route group
│   │   │   ├── today/
│   │   │   ├── tasks/
│   │   │   │   └── [id]/
│   │   │   ├── calendar/
│   │   │   │   └── [id]/
│   │   │   ├── care/
│   │   │   │   ├── profile/
│   │   │   │   ├── team/
│   │   │   │   └── medications/
│   │   │   │       └── [id]/
│   │   │   ├── documents/
│   │   │   │   └── [id]/
│   │   │   ├── updates/
│   │   │   │   ├── timeline/
│   │   │   │   └── notes/
│   │   │   │       └── [id]/
│   │   │   ├── emergency/
│   │   │   └── settings/
│   │   ├── onboarding/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                    # shadcn/ui base components
│   │   ├── layout/                # Shell, navigation, header
│   │   ├── dashboard/             # Today page sections
│   │   ├── tasks/
│   │   ├── calendar/
│   │   ├── care/
│   │   ├── documents/
│   │   ├── updates/
│   │   ├── emergency/
│   │   └── shared/                # Badges, empty states, error boundaries
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser Supabase client
│   │   │   ├── server.ts          # Server Supabase client
│   │   │   ├── middleware.ts      # Auth middleware helper
│   │   │   └── admin.ts           # Service-role client (migrations, admin)
│   │   ├── actions/               # Server Actions by domain
│   │   ├── queries/               # Data fetching by domain
│   │   ├── validations/           # Zod schemas
│   │   ├── permissions.ts         # Role-based permission checks
│   │   ├── timeline.ts            # Timeline event creation helpers
│   │   ├── timezone.ts            # Workspace-aware date utilities
│   │   └── types.ts               # Shared TypeScript types
│   ├── hooks/                     # Client-side React hooks
│   └── styles/
│       └── tokens.css             # Design system CSS custom properties
├── supabase/
│   ├── migrations/                # SQL migration files
│   ├── seed.sql                   # Development seed data
│   └── config.toml                # Supabase local dev config
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 4.2 Request Flow

1. **Browser** → Vercel Edge (middleware checks auth cookie)
2. **Middleware** → Redirects unauthenticated users to `/login`; verifies session with Supabase Auth
3. **Server Component** → Loads data using server-side Supabase client (inherits user's RLS context)
4. **Server Action** → Validates input with Zod, checks permissions, mutates data, creates timeline event
5. **Response** → Server Component re-renders with fresh data; toast/redirect confirms action

### 4.3 Data Access Pattern

All database access uses Supabase's client libraries with the authenticated user's JWT. PostgreSQL Row Level Security policies enforce workspace isolation at the database level. There is no application-level query filter that can be bypassed.

```text
Server Component/Action
  → createServerClient(cookies)    # Creates Supabase client with user's session
  → supabase.from('tasks')         # RLS policy: workspace_id IN user's memberships
  → PostgreSQL executes with RLS   # Database rejects cross-workspace access
```

### 4.4 Server Actions

Mutations use Next.js Server Actions rather than custom API routes. Each action:

1. Validates input against a Zod schema
2. Verifies the user's role permits the action (via `checkPermission()`)
3. Performs the database mutation within a transaction
4. Creates a timeline event within the same transaction
5. Returns a typed result or error
6. Triggers `revalidatePath()` to refresh affected pages

### 4.5 Timezone Handling (OQ-20)

Each workspace stores an IANA timezone string (e.g., `America/New_York`). All date boundary calculations (overdue, due today, upcoming 7-day window, calendar grouping) are computed relative to the workspace timezone.

- **Storage:** All timestamps stored as UTC `timestamptz` in PostgreSQL.
- **Display:** Converted to workspace timezone for rendering using `date-fns-tz`.
- **Overdue logic:** A task is overdue when `status = 'open'` AND `due_date < CURRENT_DATE` in the workspace timezone. Evaluated server-side.
- **DST:** The IANA timezone database handles DST transitions. No custom offset arithmetic.

### 4.6 Multi-Workspace Support

The product spec allows a user to belong to multiple workspaces if the architecture supports it without confusion. The database model supports this via the `workspace_members` join table. The application stores the user's active workspace in a cookie/session to maintain clear context. Workspace switching is deliberate and explicit.

## 5. Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| App Router vs Pages Router | App Router | Server Components reduce client JS; Server Actions simplify mutations; layouts provide the persistent shell. |
| RLS vs application-level auth | Both, RLS as primary | Database-level isolation is the strongest guarantee against cross-workspace leakage. Application checks provide UX-appropriate error messages. |
| Server Actions vs API routes | Server Actions | Simpler request/response cycle for form mutations. No REST endpoint sprawl. Type-safe end-to-end. |
| Supabase vs custom Postgres | Supabase | Managed auth, storage, and database in one platform. Reduces infrastructure complexity for a 90-day beta. |
| Single Next.js app vs separate API | Single app | One deployable, one codebase, shared types. Microservice separation adds no value at this scale. |
| No custom state management | React Server Components + minimal client state | Server Components eliminate most client-side data fetching. `useOptimistic` for immediate UI feedback on mutations. |
| No real-time in V1 | Polling/refresh on navigation | Real-time subscriptions add complexity. Dashboard freshness on page load is sufficient for beta. |

## 6. Performance Considerations

- **Server Components** reduce client-side JavaScript bundle.
- **Dashboard query** fetches a lightweight summary (overdue tasks, today's items, 7-day lookahead, 5 recent events) — not all workspace data.
- **Document downloads** use short-lived signed URLs generated server-side.
- **Static assets** served from Vercel CDN.
- **Database indexes** on `workspace_id`, `due_date`, `status`, `created_at` for common query patterns.

## 7. Dependencies on Open Questions

| Open Question | Architectural Impact | Current Approach & Resolution |
|---|---|---|
| OQ-02 (Role permissions) | Determines `checkPermission()` logic and RLS policy granularity | **RESOLVED (D-17: Option A):** Full read for all roles; tiered write (Owner/Coord full write, Contributor own notes/tasks/doc uploads, Viewer read-only). |
| OQ-03 (Auth model) | Determines Supabase Auth configuration | Default to email/password + magic link. Custom token table for invitations. |
| OQ-04 (Transactional email) | Determines email service integration | Architect for Resend; copy-link fallback for invitations. |
| OQ-05 (Data retention) | Determines soft-delete vs hard-delete patterns | **RESOLVED (D-21: Option A):** Soft-delete default (`deleted_at`), 30-day workspace purge, structured JSON + ZIP export. |
| OQ-06 (File constraints) | Determines upload validation and storage policies | 25MB max, common document MIME types, force-download. |
| OQ-07 (Emergency scope & copy) | Determines emergency schemas and safety copy | **RESOLVED (D-23: Option A):** Contacts + free-text reference + linked docs + approved 911 banner/preamble. |
| OQ-20 (Timezone) | Determines date computation approach | Workspace-level IANA timezone; UTC storage; server-side date boundary evaluation. |
