# SailingLoc — Project Overview and Guidelines

> Technical onboarding and enforcement guide for AI agents and developers working on this codebase.

---

## Rules of engagement

1. **Read this file before any work.** All conventions below are mandatory.
2. **Follow every rule.** Do not introduce patterns that contradict this document.
3. **Ask before building the unknown.** Do not implement features, UI flows, integrations, or architectural choices that are not described or implied by this file (or linked project docs) without **explicit user confirmation**. When in doubt, ask — do not assume. Do not add unrequested "helpful extras."
4. **Keep this file current.** Whenever the project changes structurally or conventionally, update `agent.md` in the **same PR/commit** so it stays accurate.

For business context (SailingLoc, team, legal disclaimer), see [README.md](README.md).  
For product requirements, see [documentation/](documentation/).

---

## Project context

**SailingLoc** is a peer-to-peer boat rental platform developed as an academic project (DEV DSP4 G3 2026). The company is fictional; no real transactions occur.

**Current state:** base scaffolding is complete. The following features are now implemented:
- **Public search page** (`/search`) with port/date/type filtering, sidebar filters (type, skipper, price, length, equipment), sort, pagination, and Realtime cache invalidation.
- **Landing page** with a hero search bar (TanStack Form + Zod) that prefills the search page.
- Supabase clients, i18n, theme, TanStack Query provider, `useSupabaseRealtime`, `useCurrentUser`, `fetchCurrentUser`, `useCurrentUserRole`, `fetchCurrentUserRole`.

Edge functions and auth UI are **not yet implemented**.

---

## Technology stack


| Layer        | Choice                                                       |
| ------------ | ------------------------------------------------------------ |
| Framework    | Next.js 16 (App Router, React Compiler enabled)              |
| UI           | React 19, Tailwind CSS 4, shadcn/ui (`radix-nova` style)     |
| i18n         | `next-intl` — locales `en`, `fr`                             |
| Forms        | `@tanstack/react-form` + `zod`                               |
| Server state | `@tanstack/react-query` (15 min backup stale time)           |
| Backend      | Supabase (Auth, Postgres, Realtime, Storage, Edge Functions) |
| Theming      | `next-themes`                                                |


Key dependencies are in [package.json](package.json).

---

## Directory structure

```
src/
├── app/
│   ├── layout.tsx              # Root pass-through layout
│   ├── page.tsx                # Redirects to default locale
│   ├── globals.css             # Tailwind + shadcn CSS variables
│   └── [locale]/
│       ├── layout.tsx          # Providers: Query, i18n, theme, toaster
│       ├── not-found.tsx
│       ├── (public)/           # Unauthenticated routes
│       │   ├── page.tsx        # Home / landing page
│       │   ├── search/
│       │   │   └── page.tsx    # Search page (server component; renders SearchPageClient)
│       │   ├── boats/[id]/     # Boat detail page (not yet implemented)
│       │   ├── login/          # Auth pages (not yet implemented)
│       │   └── register/       # Auth pages (not yet implemented)
│       ├── (authenticated)/    # Logged-in user routes (empty)
│       └── (admin)/            # Admin-only routes (empty)
├── components/
│   ├── ui/                     # shadcn primitives (button, sonner, sheet, slider, pagination)
│   ├── boats/
│   │   └── boat-card.tsx       # Reusable boat card with badges, motorization, skipper icons
│   ├── landing/
│   │   ├── Landing_page.tsx    # Landing page (hero + featured boats)
│   │   └── hero-search-bar.tsx # Hero form (TanStack Form + Zod); accepts defaultValues prop
│   ├── layout/
│   │   ├── site-header.tsx     # Server Component; links to /search
│   │   └── site-footer.tsx
│   └── search/
│       ├── search-page-client.tsx  # "use client" orchestrator for the search page
│       ├── search-summary-bar.tsx  # Compact filter pill + "Modifier" sheet trigger
│       ├── search-breadcrumbs.tsx  # Breadcrumbs for the search page
│       ├── search-filters.tsx      # Sidebar filters (TanStack Form + Zod)
│       └── search-results.tsx      # Grid of BoatCards, sort dropdown, pagination
├── constants/                  # Shared constants (e.g. TanstackQuery.ts)
├── contexts/                   # TanstackQueryClient, ThemeProvider
├── hooks/                      # Domain React Query hooks + useSupabaseRealtime
│   ├── useSupabaseRealtime.ts  # Shared realtime + cache invalidation primitive
│   ├── useCurrentUser.ts       # Current user domain hook
│   ├── useCurrentUserRole.ts   # Current user role domain hook
│   └── useBoats.ts             # Boat search hook; subscribes to boats, availability, reservations
├── queries/                    # Pure async queryFn functions (no React hooks)
│   ├── fetchCurrentUser.ts     # Authenticated user profile
│   ├── fetchCurrentUserRole.ts # Current user role
│   └── fetchBoats.ts           # Calls search_available_boats + get_boat_filter_bounds RPCs
├── i18n/                       # routing, request, navigation
├── lib/
│   ├── utils.ts                # cn() helper
│   └── supabase/               # Client factories + generated types
│       └── updateSupabaseSession.ts  # Proxy session refresh helper
└── proxy.ts                    # Session refresh + route whitelist + locale routing

messages/                       # en.json, fr.json (project root)
supabase/
├── config.toml                 # Local + storage + per-function edge config
├── migrations/                 # SQL migrations
├── seed.sql                    # Local test/fixture data (not for production)
└── functions/                  # Edge functions (not yet scaffolded)
    └── <function-name>/
        ├── index.ts            # Function entrypoint
        └── deno.json           # Function-specific Deno deps (one per function)
```

**Path alias:** `@/`* → `src/`* ([tsconfig.json](tsconfig.json)).

---

## Architecture overview

```mermaid
flowchart TB
  subgraph frontend [Next.js App]
    Pages["app/[locale]/(public|authenticated|admin)"]
    Forms["TanStack Form + Zod"]
    DomainHooks["src/hooks (domain hooks)"]
    RealtimeHook["useSupabaseRealtime"]
    Queries["src/queries (queryFn)"]
    UI["shadcn/ui components"]
  end

  subgraph supabaseLib [src/lib/supabase]
    BrowserClient[createSupabaseBrowserClient]
    ServerClient[createSupabaseServerClient]
    AdminClient[createSupabaseServerAdmin]
  end

  subgraph supabaseCloud [Supabase]
    DB[(Postgres + RLS)]
    Auth[Auth]
    Realtime[Realtime]
    Storage[Storage]
    EdgeFn[Edge Functions]
  end

  Pages --> Forms
  Pages --> DomainHooks
  DomainHooks --> RealtimeHook
  DomainHooks -->|"optional: auth cache updates"| BrowserClient
  RealtimeHook --> Queries
  Queries --> BrowserClient
  RealtimeHook --> BrowserClient
  RealtimeHook -->|"postgres_changes"| Realtime
  BrowserClient --> DB
  BrowserClient --> Auth
  ServerClient --> DB
  AdminClient --> DB
  EdgeFn --> DB
  DomainHooks -.->|"complex logic"| EdgeFn
```



---

## App routing conventions

- All user-facing routes live under `[src/app/[locale]/](src/app/[locale]/)`.
- Three **route groups** (parentheses = no URL segment):
  - `(public)` — marketing, auth pages, unauthenticated flows
  - `(authenticated)` — renter/owner dashboards, profile, bookings
  - `(admin)` — administrator-only management
- Locale handling:
  - `[src/i18n/routing.ts](src/i18n/routing.ts)` — `en` / `fr`, default `en`
  - `[src/i18n/request.ts](src/i18n/request.ts)` — loads `[messages/{locale}.json](messages/en.json)`
  - `[src/i18n/navigation.ts](src/i18n/navigation.ts)` — locale-aware `Link`, `redirect`, `useRouter`
  - `[src/proxy.ts](src/proxy.ts)` — Next.js 16 proxy (replaces deprecated `middleware.ts`) for session refresh, route protection, and locale detection
  - `[src/lib/supabase/updateSupabaseSession.ts](src/lib/supabase/updateSupabaseSession.ts)` — Supabase client for proxy; refreshes auth cookies via `getUser()`

#### Proxy route whitelist

Route groups do **not** appear in URLs. Every page must be registered explicitly in one of three arrays at the top of `[src/proxy.ts](src/proxy.ts)`:


| Array                  | Access                                                          |
| ---------------------- | --------------------------------------------------------------- |
| `PUBLIC_ROUTES`        | Anyone (no auth required)                                       |
| `AUTHENTICATED_ROUTES` | Logged-in Supabase user required                                |
| `ADMIN_ROUTES`         | Logged-in user with `ADMINISTRATOR` role in `public.user_roles` |


**Current public routes:** `/`, `/login`, `/register`, `/search`, `/boats`.

**Default deny:** paths not listed in any array redirect to `/{locale}` (home). When adding a page under `(public)`, `(authenticated)`, or `(admin)`, add its locale-stripped path (e.g. `/dashboard`, `/login`) to the matching array in the same change.

All UI strings MUST use `next-intl` with keys in the `messages/` JSON files. Do not hardcode user-facing text.

---

## Conventions

### Forms

- **MUST** use `@tanstack/react-form` with a `zod` schema for validation.
- Do **not** use raw `useState` for production form state.

### CRUD and data fetching

- All Supabase CRUD **MUST** go through the client factories in `[src/lib/supabase/](src/lib/supabase/)`:
  - `createSupabaseBrowserClient` — client components
  - `createSupabaseServerClient` — server components / server actions
  - `createSupabaseServerAdmin` — privileged server-only ops (`NEXT_PRIVATE_SUPABASE_ADMIN_KEY`)

#### Queries vs hooks

Data fetching is split across two layers:


| Layer                          | Responsibility                                                                                                                                                                                       | Example                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `[src/queries/](src/queries/)` | Pure async functions passed as `queryFn` to TanStack Query. Perform Supabase calls via client factories. **Throw on error.** No React hooks, no Realtime subscriptions.                              | `fetchCurrentUser()`, `fetchCurrentUserRole()` |
| `[src/hooks/](src/hooks/)`     | React hooks consumed by components. Export query-key constants. Call `useSupabaseRealtime({ queryKey, queryFn, realtimeSubscriptions })`. May add domain-specific cache logic (e.g. auth listeners). | `useCurrentUser()`, `useCurrentUserRole()`     |


Canonical example:

```ts
// src/queries/fetchCurrentUser.ts
// All queries should always have a predefined return type
export async function fetchCurrentUser(): Promise<ExpectedResultHere> {
  // supabase call via createSupabaseBrowserClient; throw on error
}

// src/hooks/useCurrentUser.ts
export const CURRENT_USER_QUERY_KEY = ["current-user"] as const;

export function useCurrentUser() {
  return useSupabaseRealtime({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: fetchCurrentUser,
    realtimeSubscriptions: [{ table: "users", filter: `auth_id=eq.${authId}` }],
  });
}
```

- Wrap each resource in a dedicated hook under `[src/hooks/](src/hooks/)` using `@tanstack/react-query`.
- **All Supabase DB hooks MUST use `useSupabaseRealtime` for cache invalidation.** Any hook that reads Supabase data must call `useSupabaseRealtime`, passing the query keys it manages, so that when the underlying data is modified (insert, update, delete), the hook's cached data is invalidated automatically. Do **not** write raw `supabase.channel()` subscriptions in components or data hooks, and do not use manual polling.

#### Query client defaults

Configured in `[src/contexts/tanstack-query-client.tsx](src/contexts/tanstack-query-client.tsx)` using `DEFAULT_TANSTACK_QUERY_STALE_TIME_IN_MS` from `[src/constants/TanstackQuery.ts](src/constants/TanstackQuery.ts)`:

- `staleTime: 15 * 60 * 1000` (15 min backup invalidation only — not the primary refresh mechanism)
- Primary invalidation via `useSupabaseRealtime` (Postgres changes) — not polling

#### `useSupabaseRealtime` contract

`useSupabaseRealtime` in `[src/hooks/useSupabaseRealtime.ts](src/hooks/useSupabaseRealtime.ts)` is the **single shared primitive** for Postgres Realtime cache invalidation:

- Called directly inside each data hook that needs invalidation (not mounted at the root layout)
- Encapsulates all Supabase Realtime subscription logic in one place
- Runs `useQuery` with caller-provided `queryKey`, `queryFn`, and optional `enabled`
- Subscribes to `postgres_changes` per `realtimeSubscriptions` entry
- Calls `queryClient.invalidateQueries({ queryKey })` when matching DB events occur
- Domain hooks pass their query keys per invocation; they do not implement Realtime subscriptions themselves
- Use exported types (`RealtimeSubscription`, filter string format) so table/column names stay aligned with `[src/lib/supabase/database.types.ts](src/lib/supabase/database.types.ts)`

#### Auth cache updates

Auth-driven cache updates are **not** handled inside `useSupabaseRealtime`. When a domain hook needs auth-aware cache behavior, add it in the domain hook itself. Reference patterns: `[src/hooks/useCurrentUser.ts](src/hooks/useCurrentUser.ts)` and `[src/hooks/useCurrentUserRole.ts](src/hooks/useCurrentUserRole.ts)` use `supabase.auth.onAuthStateChange` to `setQueryData(null)` on `SIGNED_OUT` and `invalidateQueries` on `SIGNED_IN`, `TOKEN_REFRESHED`, or `USER_UPDATED`.

#### Query-key naming convention

- Export query-key constants from the domain hook file (e.g. `CURRENT_USER_QUERY_KEY = ["current-user"] as const`, `CURRENT_USER_ROLE_QUERY_KEY = ["current-user-role"] as const`)
- `['users', userId]` — single user
- `['boats', 'list', filters]` — paginated boat search (`BOATS_LIST_QUERY_KEY_PREFIX` exported from `src/hooks/useBoats.ts`)
- `['bookings', bookingId]`
- Use a consistent `[resource, ...identifiers]` pattern

**Implemented domain hooks:**

| Hook | File | Query key |
| ---- | ---- | --------- |
| `useCurrentUser` | `src/hooks/useCurrentUser.ts` | `["current-user"]` |
| `useCurrentUserRole` | `src/hooks/useCurrentUserRole.ts` | `["current-user-role"]` |
| `useBoats(filters)` | `src/hooks/useBoats.ts` | `["boats", "list", filters]` |

**Implemented query functions:**

| Function | File | Purpose |
| -------- | ---- | ------- |
| `fetchCurrentUser` | `src/queries/fetchCurrentUser.ts` | Authenticated user profile |
| `fetchCurrentUserRole` | `src/queries/fetchCurrentUserRole.ts` | Current user role |
| `fetchBoats(filters)` | `src/queries/fetchBoats.ts` | Calls `search_available_boats` RPC; returns `PaginatedBoats` |
| `fetchBoatFilterBounds(port)` | `src/queries/fetchBoats.ts` | Calls `get_boat_filter_bounds` RPC for slider bounds |

### Edge functions

Use edge functions for logic beyond simple CRUD: payments, commissions, multi-table transactions, external APIs.

- **MUST** be created and deployed via Supabase CLI.
- **Per-function `deno.json`** (mandatory): each function folder under `supabase/functions/<name>/` owns its own `deno.json`. Do **not** use a shared root `supabase/functions/deno.json` for deployment.
- **Per-function `config.toml` entry** (mandatory): every edge function **MUST** have a matching `[functions.<name>]` block in `[supabase/config.toml](supabase/config.toml)`. At minimum, set `verify_jwt` (default `true`; set `false` only for public webhooks). Add `entrypoint` or `import_map` only when deviating from the default `index.ts` / `deno.json` layout.

Example layout:

```
supabase/functions/process-payment/
├── index.ts
└── deno.json
```

Example config:

```toml
# supabase/config.toml
[functions.process-payment]
verify_jwt = true
```

**Checklist when adding a new edge function:**

1. `npx supabase functions new <name>` — scaffolds `supabase/functions/<name>/index.ts`
2. Add/edit `supabase/functions/<name>/deno.json` with that function's dependencies
3. Add `[functions.<name>]` to `supabase/config.toml`
4. Test locally: `npx supabase functions serve <name>`
5. Deploy: `npx supabase functions deploy <name>`

### Database changes

- **Only** via Supabase CLI migrations: `supabase migration new <name>` → edit SQL in `[supabase/migrations/](supabase/migrations/)` → `supabase db push` / `supabase migration up`.
- **RLS is mandatory on first creation:** any new PostgreSQL object (tables, API-exposed views) **MUST** include RLS policies in the **same migration** that creates it. Never add a table and defer policies to a follow-up migration.
  - `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in the creation migration
  - Explicit `CREATE POLICY` for each required operation (`SELECT`, `INSERT`, `UPDATE`, `DELETE`)
  - Postgres requires a `SELECT` policy for `UPDATE` to work under RLS
  - Policies MUST match the real access model (role-based, ownership via `auth.uid()`, etc.)
  - Use `SECURITY DEFINER` functions only when necessary; keep them out of exposed schemas where possible

**Checklist when adding a new table:**

1. `npx supabase migration new <name>`
2. `CREATE TABLE` + indexes/constraints
3. `ENABLE ROW LEVEL SECURITY` + all `CREATE POLICY` statements in the same file
4. Regenerate TypeScript types (see below)

**Current schema:**

| Table | Description | RLS |
| ----- | ----------- | --- |
| `public.users` | Profile linked to `auth.users` | Users can view/update own row |
| `public.user_roles` | Role enum: `VISITOR`, `RENTER`, `OWNER`, `ADMINISTRATOR` | Users can view own role |
| `public.ports` | Rental ports (name, country) | Public SELECT |
| `public.boats` | Boats listed for rental | Public SELECT |
| `public.boat_reviews` | Reviews left by renters on boats | Public SELECT |
| `public.boat_availability_time_slots` | Date windows when a boat is available | Public SELECT |
| `public.boat_reservations` | Confirmed bookings that block availability | Public SELECT |
| `public.boat_equipment_links` | Junction: boat ↔ `boat_equipment` enum | Public SELECT |

**Enums:** `boat_type` (`SAILBOAT`, `MOTORBOAT`, `CATAMARAN`, `YACHT`), `boat_skipper_option` (`INCLUDED`, `OPTIONAL`, `NONE`), `boat_equipment` (`GPS`, `SLEEPING_BERTHS`, `EQUIPPED_KITCHEN`).

**RPCs:** `search_available_boats(...)` — paginated boat search with availability/date filtering; `get_boat_filter_bounds(p_port_name)` — returns min/max price and length for sidebar sliders.

Triggers: timestamp enforcement, role requirements (email + phone for elevated roles), auto-provision on auth signup/update.

After any migration, regenerate types:

```bash
npx supabase gen types typescript --schema public > src/lib/supabase/database.types.ts
```

> **Note:** [README.md](README.md) references `supabase/database.types.ts`. The canonical path in this project is `src/lib/supabase/database.types.ts`.

### Local seed data

Use `[supabase/seed.sql](supabase/seed.sql)` for **local testing only** — fixture users, sample boats, bookings, etc. Do **not** put seed data in migrations.

- Seed file is referenced in `[supabase/config.toml](supabase/config.toml)` under `[db.seed]` (`sql_paths = ["./seed.sql"]`, `enabled = true`).
- Seed runs automatically after migrations on a full local reset:

```bash
npx supabase db reset
```

- To re-apply migrations + seed without restarting the whole stack, use `db reset` (preferred for a clean local state).
- When adding tables that need test data locally, update `seed.sql` in the **same change** and respect RLS (use `service_role` via SQL or insert data in a way policies allow).
- Seed data is populated: ports, boats, availability windows, reservations, equipment links (for local dev/testing).

### Storage and other Supabase config

`[supabase/config.toml](supabase/config.toml)` is the single source of truth for non-migration Supabase config:


| Section                             | Purpose                                             |
| ----------------------------------- | --------------------------------------------------- |
| `[storage]` / `[storage.buckets.*]` | Bucket settings                                     |
| `[functions.<name>]`                | Per-function edge function config                   |
| `[edge_runtime]`                    | Edge runtime settings (enabled, `deno_version = 2`) |


Storage is enabled; no buckets configured yet. No `[functions.*]` blocks exist yet.

### UI components

- Start from shadcn CLI: `npx shadcn@latest add <component>`
- Config: `[components.json](components.json)` — style `radix-nova`, components land in `src/components/ui/`
- Customize shadcn primitives in-place; build feature components in `src/components/` (not `ui/`)

---

## Environment variables

Do **not** commit `.env` or secret keys. Required variables:


| Variable                          | Usage                        |
| --------------------------------- | ---------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Supabase project URL         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Browser + server anon client |
| `NEXT_PRIVATE_SUPABASE_ADMIN_KEY` | Server admin client only     |


Obtain local values via `npx supabase status` after `npx supabase start`.

### Secrets and version control

- **Never commit** `.env`, API keys, or `NEXT_PRIVATE_SUPABASE_ADMIN_KEY`.
- **May commit** `[.env.example](.env.example)` with placeholder variable names only (not real values).
- **Supabase CLI local state** (`supabase/.temp`, `supabase/.branches`) is gitignored — do not force-add.
- **Generated types** live at `src/lib/supabase/database.types.ts` and **should be committed** after regeneration.
- **IDE local state** (`.vscode/`, `.idea/`, `.cursor/`, etc.) and **Obsidian workspace/cache** files are gitignored — personal editor and vault state must not be committed.

---

## Local development workflow

1. `npm install`
2. `npx supabase login` → `npx supabase link --project-ref <id>`
3. `npx supabase db pull` (sync remote)
4. `npx supabase start`
5. Regenerate types to `src/lib/supabase/database.types.ts`
6. Copy env vars from `npx supabase status` into `.env`
7. `npm run dev`

**Local testing with seed data:** populate `[supabase/seed.sql](supabase/seed.sql)` with fixtures, then run `npx supabase db reset` to apply migrations and seed in one step. Use this to get a repeatable local dataset for development and manual testing.

---

## Current gaps (not yet implemented)

Do **not** assume these exist. Build them when needed, following the conventions above.


| Gap                   | Location / notes                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| No edge functions     | `supabase/functions/` does not exist; no per-function `deno.json`; no `[functions.*]` in `config.toml` |
| Empty route groups    | `(authenticated)` and `(admin)` have no pages                                                           |
| No auth UI            | `/login` and `/register` pages not yet implemented                                                      |
| No booking flow       | `boat_reservations` table exists (Public SELECT only); no CREATE policy or booking UI yet               |
| No boat detail page   | `/boats/[id]` route stub exists but has no content                                                      |
| No boat images        | Gradient placeholders used; no storage bucket configured                                                |
| No owner dashboard    | Owners cannot manage availability, equipment, or boats from the app yet                                 |


---

## Keeping `agent.md` up to date

### Before starting work

- Read this file and follow every rule.
- If the requested work goes beyond what this file specifies (new feature, page flow, table, integration, dependency, etc.), **stop and ask the user for confirmation** before implementing.

### When making changes

Respect all conventions. Update `agent.md` in the **same change** when:


| Trigger                                            | What to update                                                                                      |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| New directory, route group, or architectural layer | Directory structure + architecture diagram                                                          |
| New Supabase table / migration                     | Database schema summary; update `seed.sql` if local fixtures needed; remove from gaps if applicable |
| New edge function                                  | Edge functions section; `config.toml` / `deno.json` examples                                        |
| New hook pattern or query-key convention           | CRUD / realtime section; document query-key constants exported from domain hooks                    |
| New env variable                                   | Environment variables table                                                                         |
| New shadcn component or UI convention              | UI components section                                                                               |
| Convention added or changed                        | Conventions section                                                                                 |
| Feature implemented that was listed under gaps     | Remove or update the gap entry                                                                      |


### After completing work

- Verify the change complies with all rules in this file.
- Verify `agent.md` still reflects the current project state (no stale paths, missing entries, or outdated "not implemented" notes).

