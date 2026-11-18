# ROOM — Technical Stack

> **Product:** ROOM  
> **Category:** Event Management + Creator Relationship Management SaaS  
> **Strategy:** B2B-first  
> **Document status:** Proposed implementation stack for the MVP  
> **Source:** ROOM Product Requirements Document (PRD)

---

## 1. Architecture principles

ROOM should be built as a multi-tenant SaaS platform for brands and event agencies. The initial architecture should favour a fast, maintainable MVP without blocking later expansion into creator intelligence, campaign management and enterprise integrations.

1. **Multi-tenant by design:** every organisation-owned record must be scoped to an organisation; event-specific operations must also enforce event-level permissions.
2. **One source of truth:** guest profiles, creator profiles, invitations, RSVP states and attendance records should live in a relational database rather than separate spreadsheets.
3. **API-backed integrations:** email, WhatsApp and social-platform integrations must be isolated behind service modules so providers can be changed later.
4. **Reliable event-day operation:** check-in must prevent duplicate entries and provide a manual fallback. The check-in interface should be designed to support a later offline-capable mode.
5. **Privacy and consent:** store only information required for the product, record consent and communication preferences, and support data export and deletion workflows.
6. **MVP-first delivery:** implement P0 capabilities before investing in advanced creator discovery, AI recommendations or a public marketplace.

## 2. Recommended stack at a glance

| Layer | Recommended technology | Purpose |
|---|---|---|
| Web application | **Next.js + TypeScript** | Responsive B2B dashboard and guest-facing pages |
| UI | **Tailwind CSS + shadcn/ui** | Consistent, accessible interface components |
| Forms and validation | **React Hook Form + Zod** | Validated event, guest and organisation forms |
| Server/API | **Next.js Route Handlers** | Application APIs and integration endpoints |
| Database | **PostgreSQL (Supabase)** | Organisations, users, events, guests, creators, invitations and analytics |
| Authentication | **Supabase Auth** | Sign-in, sessions and user identity |
| Authorisation | **Postgres Row-Level Security (RLS) + server-side permission checks** | Tenant and role isolation |
| File storage | **Supabase Storage** | Event covers, profile images and report assets |
| Data access | **Supabase client + typed query/service layer** | Database access and generated TypeScript types |
| Background jobs | **Inngest** (or a managed queue) | Invitation batches, reminders, exports and retryable tasks |
| Email | **Resend** | Transactional invitations and notifications |
| WhatsApp | **WhatsApp Business Platform / Cloud API** | Invitation and reminder messages, subject to approved templates and opt-in |
| QR generation | **`qrcode`** | Unique QR pass generation |
| QR scanning | **`@zxing/browser`** | Browser-based event check-in scanner |
| Charts | **Recharts** | Event and campaign analytics dashboards |
| CSV | **Papa Parse** | Guest import and export |
| PDF reports | **React-PDF** | Downloadable event reports |
| Hosting | **Vercel** | Next.js application deployment |
| Database hosting | **Supabase** | Managed PostgreSQL, Auth, Storage and Realtime where needed |
| Monitoring | **Sentry** | Frontend and backend error monitoring |
| Product analytics | **PostHog** (optional for MVP) | Product usage and funnel analytics |
| Version control | **GitHub** | Source control, pull requests and CI workflows |

These are recommendations, not technologies mandated by the PRD. Provider choice should be validated against expected volume, pricing, data residency, contractual needs and operational constraints before production launch.

## 3. Application architecture

Use a modular monolith for the MVP rather than microservices. Keep business logic separated into domain modules inside one deployable application. This reduces deployment and operational complexity while preserving clear boundaries.

```text
ROOM Platform
│
├── Web application (Next.js)
│   ├── Organisation workspace
│   ├── Event management
│   ├── Guest CRM
│   ├── Creator CRM
│   ├── Invitations and RSVP
│   ├── Event check-in
│   └── Analytics and reports
│
├── Application/API layer
│   ├── Authentication and authorisation
│   ├── Organisation and membership services
│   ├── Event and guest services
│   ├── Invitation and RSVP services
│   ├── QR pass and check-in services
│   ├── Analytics and report services
│   └── Integration adapters
│       ├── Email provider
│       └── WhatsApp Business API
│
├── Background processing
│   ├── Bulk invitation jobs
│   ├── Scheduled reminders
│   ├── Report generation
│   └── Retry and delivery status updates
│
└── Supabase
    ├── PostgreSQL database
    ├── Supabase Auth
    ├── Storage
    └── Realtime (only for features that need live updates)
```

### Why a modular monolith?

- The MVP has closely related workflows and a small initial customer base.
- A single application is easier to build, test, deploy and operate.
- Domain modules and service interfaces keep future extraction possible if scale or team boundaries justify it.
- Background jobs can run independently without prematurely splitting the core product into microservices.

## 4. Frontend

### Next.js + TypeScript

Use Next.js with the App Router for the organisation dashboard, public invitation pages and creator/guest-facing experiences.

**Key frontend areas:**

- `/app`: authenticated organisation workspace.
- `/events`: event list, creation, editing and event detail pages.
- `/guests`: guest CRM, import, search, filters and profiles.
- `/creators`: creator CRM and creator profiles (P1 if following the PRD priorities strictly).
- `/invitations`: invitation batches, delivery state and RSVP tracking.
- `/check-in`: event-day QR scanner and guest lookup.
- `/analytics`: event metrics and reports.
- `/invite/[token]`: secure guest invitation and RSVP experience.
- `/pass/[token]`: guest QR pass page.

### UI and forms

- **Tailwind CSS:** utility-first styling and responsive layouts.
- **shadcn/ui:** accessible building blocks for tables, dialogs, dropdowns, forms and navigation.
- **React Hook Form:** manage complex forms and CSV import mapping.
- **Zod:** validate data on both client and server; server validation remains authoritative.
- **TanStack Table:** recommended for large guest lists, sorting, filtering and pagination.

Keep the guest invitation and QR pass pages mobile-first. The event manager dashboard should be responsive, while the check-in screen should prioritise large touch targets, fast scanning and minimal navigation.

## 5. Backend and API

### Next.js Route Handlers

For the MVP, implement API endpoints using Next.js Route Handlers. Keep domain logic in service modules rather than embedding it in page components or route handlers.

Suggested module layout:

```text
src/
├── app/
│   ├── (auth)/
│   ├── (workspace)/
│   ├── invite/[token]/
│   ├── pass/[token]/
│   └── api/
├── components/
├── features/
│   ├── organisations/
│   ├── members/
│   ├── events/
│   ├── guests/
│   ├── creators/
│   ├── invitations/
│   ├── check-in/
│   ├── analytics/
│   └── reports/
├── lib/
│   ├── supabase/
│   ├── auth/
│   ├── permissions/
│   ├── validation/
│   └── integrations/
├── services/
├── jobs/
└── types/
```

### API conventions

- Use REST-style endpoints with predictable resource names.
- Validate every request with Zod on the server.
- Derive the acting user from the authenticated session; never trust a client-supplied user or organisation ID as proof of access.
- Enforce organisation and event permissions on every read and write.
- Use pagination for guest, creator, event and invitation lists.
- Make bulk invitation and reminder endpoints enqueue jobs rather than sending all messages in a single request.
- Use idempotency keys or unique constraints for operations that must not run twice, especially check-in and invitation creation.

Example endpoint groups:

| Area | Example endpoints |
|---|---|
| Organisations | `GET/POST /api/organisations`, `GET/PATCH /api/organisations/:id` |
| Members | `GET/POST /api/organisations/:id/members`, `PATCH /api/members/:id/role` |
| Events | `GET/POST /api/events`, `GET/PATCH/DELETE /api/events/:id` |
| Guests | `GET/POST /api/guests`, `POST /api/guests/import`, `GET /api/guests/:id` |
| Invitations | `POST /api/events/:id/invitations`, `GET /api/events/:id/invitations` |
| RSVP | `POST /api/rsvp/:token` |
| Passes | `GET /api/passes/:token` |
| Check-in | `POST /api/events/:id/check-ins`, `GET /api/events/:id/attendance` |
| Analytics | `GET /api/events/:id/analytics` |
| Reports | `POST /api/events/:id/reports`, `GET /api/reports/:id` |

These are illustrative endpoint shapes; final contracts should be defined alongside the database schema and user flows.

## 6. Database and data model

### PostgreSQL via Supabase

PostgreSQL is a good fit because ROOM has relational entities and workflows: organisations own events, events have guests and invitations, and check-ins and content records refer to specific people and events.

Use UUID primary keys, `created_at` and `updated_at` timestamps, foreign keys, indexes and database constraints. Store flexible optional metadata in JSONB only where a stable relational schema is not appropriate.

### Core tables

| Table | Purpose / important fields |
|---|---|
| `organisations` | Organisation name, type, logo, settings, subscription reference |
| `profiles` | User profile linked to Supabase Auth |
| `organisation_members` | Organisation, user, role and membership status |
| `events` | Organisation, name, description, category, schedule, venue, capacity, visibility and status |
| `event_members` | Event-level assignments and permissions |
| `guests` | Reusable organisation-scoped guest records and contact preferences |
| `event_guests` | Event-to-guest relationship, category and event-specific status |
| `creators` | Creator profile, location, social links, categories and consented contact information |
| `invitations` | Event, recipient, channel, status, token reference and timestamps |
| `invitation_messages` | Provider, provider message ID, delivery events and error details |
| `rsvps` | Invitation, response, response timestamp and guest count if applicable |
| `qr_passes` | Guest/event pass token hash, status and expiry/revocation fields |
| `check_ins` | Event, guest, pass, check-in time, operator and method |
| `saved_creator_lists` | Organisation-owned saved creator collections (P1) |
| `creator_event_participation` | Creator, event and participation outcome (P1) |
| `content_submissions` | Creator, event, post URL, publication date and manually captured metrics (P1) |
| `audit_logs` | Actor, organisation, action, resource and timestamp |

### Data modelling notes

- Use `organisation_id` on organisation-owned records and index it. Enforce tenant boundaries through RLS and server-side checks.
- Use a join table such as `event_guests` to represent a guest's participation in multiple events without duplicating the reusable guest profile.
- Keep invitation delivery state separate from RSVP state. A message being delivered does not mean a guest accepted.
- Model check-ins as append-only attendance events where possible. Enforce one successful check-in per event/guest with a unique constraint or equivalent transaction-safe rule.
- Do not store raw QR secrets in readable form. Store a secure token hash and validate it server-side.
- Keep creator audience and engagement information only when verified, available through permitted means and appropriately authorised.
- Record consent source, timestamp and scope where relevant. Support correction, export and deletion workflows.

## 7. Authentication, roles and permissions

### Authentication

Use Supabase Auth for identity and session management. Support email-based sign-in initially; add other methods only when justified by customer needs.

### Role model from the PRD

- Platform Super Admin
- Organisation Owner
- Organisation Admin
- Event Manager
- Brand Manager
- Operations Staff
- Creator
- Guest

Implement organisation roles in `organisation_members` and event-specific assignments in `event_members`. Guest and creator invitation flows can use secure, limited-scope tokens rather than requiring a full organisation account.

### Security requirements

- Enable PostgreSQL Row-Level Security on all tenant-owned tables.
- Create policies that verify the authenticated user belongs to the relevant organisation and has the required role.
- Add event-level checks for event-scoped actions.
- Keep Supabase service-role credentials exclusively on the server; never expose them to the browser.
- Apply least-privilege permissions to staff, brand managers and event managers.
- Log sensitive administrative actions, permission changes, exports and check-in overrides.
- Test cross-tenant access explicitly; hiding a UI element is not authorisation.

## 8. Invitations, email and WhatsApp

### Background jobs

Use **Inngest** for durable background workflows, or select an equivalent managed job system if it better fits the deployment environment.

Jobs should handle:

- Bulk invitation dispatch with rate limiting.
- Scheduled RSVP reminders.
- Provider webhook processing and delivery status updates.
- Retry with backoff for transient failures.
- Report generation and large CSV exports.

Track each recipient's message status independently. A batch-level status alone is insufficient for reliable reporting.

### Email — Resend

Use a transactional email provider such as Resend for invitations, confirmations, reminders and operational notifications. Keep templates versioned and store provider message IDs and delivery events.

### WhatsApp — WhatsApp Business Platform

Integrate through the official WhatsApp Business Platform / Cloud API. Use approved message templates where required and respect user opt-in, messaging windows and applicable platform policies. Keep email as a fallback channel. Do not build the MVP around unofficial WhatsApp automation or scraping.

### Integration adapter pattern

Create a common messaging interface, for example `sendInvitation()`, `sendReminder()` and `getDeliveryStatus()`, with separate email and WhatsApp implementations. This keeps product workflows independent of a specific provider.

## 9. QR passes and event check-in

### QR generation

Use the `qrcode` npm package to generate a QR code containing a random, unguessable pass token or secure pass URL. Do not encode personal guest details directly in the QR payload.

### QR scanning

Use `@zxing/browser` for browser-based camera scanning. Provide manual guest search and manual check-in as fallbacks.

### Validation flow

1. Scanner reads the QR token.
2. Client submits token and event context to the server.
3. Server hashes and validates the token, event, expiry and pass status.
4. Server checks whether the guest has already checked in.
5. Server records attendance transactionally and returns a clear result.
6. UI displays valid, already-used, cancelled or invalid-pass status.

### Event-day reliability

The PRD identifies poor connectivity as an operational pain point and asks for offline-capable check-in. Treat robust offline mode as a planned engineering requirement, even if the first P0 release ships with manual fallback and clear connectivity handling.

For a subsequent offline-capable release:

- Build the check-in interface as a Progressive Web App (PWA).
- Cache the assigned event's authorised guest/pass data locally using IndexedDB.
- Queue check-in actions locally while offline.
- Synchronise queued records when connectivity returns.
- Resolve conflicts on the server and prevent duplicate attendance.
- Protect cached personal data and clear it after the event or session expiry.

Offline support requires threat modelling and careful conflict handling; it should not be represented as complete until tested under real event conditions.

## 10. Analytics and reporting

### MVP analytics

Use PostgreSQL queries and pre-aggregated views where appropriate for:

- Total invited.
- Invitation delivery rate, where provider status is available.
- RSVP acceptance and decline rates.
- Waitlisted guests, if enabled.
- Actual attendance and no-show rate.
- Guest category distribution.
- Creator participation when creator CRM is available.

Use Recharts for dashboard visualisations. Define metric formulas centrally so dashboard cards and exported reports use the same calculations.

### Reports

- **CSV:** Papa Parse or server-side CSV generation for permitted data exports.
- **PDF:** React-PDF for branded event summaries and client-facing reports.
- Generate larger reports asynchronously and provide a time-limited download URL.
- Apply role permissions and audit logging to exports.

Post-event social content metrics should support manual entry and evidence uploads. Automated social insights must only be collected through permitted integrations or creator-authorised connections, as stated in the PRD.

## 11. File storage

Use Supabase Storage for:

- Organisation logos.
- Event cover images.
- Creator profile images.
- Manually uploaded campaign evidence.
- Generated report files, if retained.

Use private buckets for sensitive files and short-lived signed URLs for access. Validate file type and size, use safe filenames, and avoid exposing private uploads through public buckets.

## 12. Testing and quality

| Test layer | Recommended tool | What to test |
|---|---|---|
| Unit tests | Vitest | Domain rules, validation, status transitions and metric calculations |
| Component tests | React Testing Library | Forms, tables, dialogs and interaction states |
| End-to-end tests | Playwright | Sign-in, event creation, import, invitations, RSVP and check-in journeys |
| API/security tests | Vitest + integration test setup | Permission checks, tenant isolation and invalid input |
| Database tests | SQL/integration tests | RLS policies, constraints and transactional check-in behaviour |

Critical test cases:

- A user from Organisation A cannot read or modify Organisation B data.
- Event managers can only manage assigned events.
- An invitation cannot be sent twice accidentally by a retried job.
- RSVP tokens cannot be guessed or reused outside their intended scope.
- A guest cannot be checked in twice for the same event.
- Cancelled or invalid passes are rejected.
- CSV import identifies duplicates and reports invalid rows without silently corrupting records.
- Check-in has a usable manual fallback when camera access or connectivity fails.

## 13. Deployment and environments

### Environments

Maintain separate development, staging and production environments, with separate database projects and credentials.

### Suggested deployment setup

- **Application:** Vercel.
- **Database/Auth/Storage:** Supabase managed project per environment.
- **Source control:** GitHub.
- **CI:** GitHub Actions for linting, type checking, tests and build verification on pull requests.
- **Monitoring:** Sentry for exceptions; provider logs and job dashboards for messaging failures.

### Release safeguards

- Apply database migrations through version-controlled migration files.
- Back up production data and test restoration procedures.
- Keep secrets in environment-variable management, not in source control.
- Use preview deployments for pull requests without connecting them to production data.
- Add rate limits to public invitation, RSVP and pass-validation endpoints.
- Monitor job failures, message delivery failures, API latency and check-in error rates.

## 14. Privacy and compliance

The PRD requires applicable Indian privacy and data protection compliance. Before launch, obtain appropriate legal review for the applicable Indian data protection requirements and the platform's role as a data fiduciary or processor in each workflow.

Engineering controls should include:

- Clear privacy notice and purpose limitation.
- Consent and communication preference records where required.
- Data minimisation and retention rules.
- User-accessible correction and deletion request workflows.
- Access controls and audit trails.
- Encryption in transit and at rest through managed infrastructure and secure configuration.
- Vendor review and appropriate data-processing terms.
- Secure handling of creator contact and audience information.
- No unrestricted Instagram scraping or unauthorised social-media data collection.

This section is an engineering checklist, not legal advice or a claim that a particular implementation alone guarantees compliance.

## 15. Build order aligned with the PRD

### Phase 1 — Core platform (P0)

1. Next.js application foundation, environments and CI.
2. Supabase project, schema and migrations.
3. Authentication and organisation registration.
4. Organisation membership, role permissions and RLS policies.
5. Event creation, editing, assignment and status lifecycle.
6. Guest CRM, search, tagging and CSV import/export.
7. Invitation records and email dispatch.
8. Guest invitation page and RSVP flow.
9. QR pass generation and validation.
10. Check-in scanner, guest search and manual fallback.
11. Basic event analytics and PDF/CSV report export.
12. Audit logs, backups, monitoring and security tests.

### Phase 2 — First post-launch release (P1)

- Creator CRM and creator profiles.
- Advanced creator filters and saved lists.
- WhatsApp Business integration.
- Waitlist management.
- Team collaboration improvements.
- Post-event content tracking.
- Advanced analytics.
- Offline-capable check-in PWA and sync workflow.

### Phase 3 — Future releases (P2)

- AI creator recommendations and matching.
- Campaign management.
- Permitted social account integrations.
- Relationship intelligence.
- Creator marketplace and public event discovery.
- Enterprise integrations.

## 16. Keep out of the initial MVP

To protect delivery speed and focus, do not initially build:

- Microservices or Kubernetes infrastructure.
- A public event ticketing marketplace.
- An open social network.
- Unrestricted Instagram scraping.
- Automated influencer payment settlement.
- Public creator ranking.
- AI creator recommendations before the underlying creator and event data is reliable.
- Complex enterprise data warehouse infrastructure before real customer reporting needs are established.

## 17. Key technical decisions to validate before production

| Decision | Initial recommendation | Validate before launch |
|---|---|---|
| Hosting and data region | Vercel + Supabase | Customer contracts, data residency expectations and latency |
| Multi-tenancy | Shared PostgreSQL with RLS | Security review and tenant-isolation tests |
| Messaging | Resend + official WhatsApp Cloud API | Template approval, opt-in, deliverability and pricing |
| Background jobs | Inngest | Volume, retry guarantees, regional availability and cost |
| Check-in offline mode | PWA + IndexedDB in P1 | Device support, cached-data security and conflict resolution |
| PDF generation | React-PDF | Branding, export complexity and performance |
| Creator data | Manual/authorised inputs first | Permitted APIs, creator consent and data accuracy |

---

## 18. Final recommendation

For ROOM's first release, use a **Next.js + TypeScript modular monolith with Supabase (PostgreSQL, Auth and Storage), Tailwind/shadcn/ui, background jobs, Resend email, official WhatsApp Business integration, and browser-based QR check-in**.

This stack directly supports the PRD's P0 workflows while keeping the system simple enough for a small team to ship and operate. Build the data model, tenant isolation and invitation/check-in reliability carefully from the beginning; add creator intelligence, deeper social integrations and AI only after the core event workflow is proven with real B2B customers.
