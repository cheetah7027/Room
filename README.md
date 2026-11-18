# ROOM — India's Operating System for Brand Experiences & Creator Relationships

> **Category:** Event Management + Creator Relationship Management SaaS  
> **Strategy:** B2B-first MVP  
> **Architecture:** Multi-tenant modular monolith (Next.js 15, TypeScript, Tailwind CSS, Supabase PostgreSQL with RLS, QR Security)  
> **Design Specification:** Editorial white-led canvas with 60:30:10 color harmony (Dark Raspberry `#990b47`, Twilight Indigo `#2b3364`, Light Gold `#fff49d`, Soft Periwinkle `#adbaff`, Seashell `#f7eee9`)

---

## 1. Overview & Problem Solved

ROOM replaces fragmented spreadsheets, manual WhatsApp messaging, and unverified guest check-ins with an integrated operational workspace for experiential event agencies and brand marketing teams in India (Bengaluru, Mumbai, Delhi NCR, Hyderabad).

### Solved Core Pain Points
1. **Centralized Guest & Creator CRM:** Reusable database with tags, past event history, VIP tiers, and duplicate detection.
2. **Automated Invitations & RSVPs:** Unguessable bearer token links with real-time delivery and response tracking.
3. **Idempotent Gate Check-In:** High-contrast digital QR passes validated server-side to guarantee zero duplicate entries, with instant manual search fallback.
4. **Post-Event Content Tracking:** Connect verified creator attendance to published social posts (reels, stories, videos) and audience engagement metrics.
5. **Auditable Multi-Tenancy:** Organisation-level data isolation, role-based access control, and complete audit logging.

---

## 2. Personas & Workflows Supported

- **Rahul Mehta (Event Agency Owner):** Coordinates multiple client brand launches, imports CSV guestlists, dispatches bulk invitations, and generates client dossiers.
- **Priya Sharma (Brand Marketing Manager):** Discovers verified creators, filters by aesthetic and audience demographics, sends invitations, and measures campaign reach.
- **Karan Verma (Operations Staff):** Event-day gate coordinator using the camera-enabled QR check-in console with zero-downtime manual lookup.
- **Ananya Rao (Creator):** Receives invitation links, confirms RSVP in one click, and receives a digital QR event pass.

---

## 3. Technology Stack & Key Libraries

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling & Tokens:** Tailwind CSS with custom editorial design tokens (`rounded-pill`, `block-lime`, `block-lilac`, `block-navy`, `surface-soft`)
- **Icons:** Phosphor Icons (`@phosphor-icons/react` from [phosphoricons.com](https://phosphoricons.com))
- **QR Generation & Scanning:** `qrcode` + camera API with manual fallback
- **Data & Ingestion:** `papaparse` for high-throughput CSV guest importing and exporting
- **Validation:** Zod schemas for all API payloads and route handlers
- **Database & Multi-tenancy:** Supabase PostgreSQL migration schema with Row-Level Security (RLS) policies located in `supabase/migrations/20261117_init_room_schema.sql`

---

## 4. Key Routes & Capabilities

### Workspace Routes (Authenticated)
- [`/dashboard`](file:///Users/ashwanipratapsingh/Downloads/Rooms/src/app/(workspace)/dashboard/page.tsx): Executive overview, active flagship events, attendance rates, recent audit log stream.
- [`/events`](file:///Users/ashwanipratapsingh/Downloads/Rooms/src/app/(workspace)/events/page.tsx): Event catalogue with status filters, search, and one-click duplication.
- [`/events/new`](file:///Users/ashwanipratapsingh/Downloads/Rooms/src/app/(workspace)/events/new/page.tsx): Event creation form (venue, schedule, capacity, access rules).
- [`/events/[eventId]`](file:///Users/ashwanipratapsingh/Downloads/Rooms/src/app/(workspace)/events/[eventId]/page.tsx): Event hub managing assigned guests, invitation dispatch, and pass previews.
- [`/events/[eventId]/check-in`](file:///Users/ashwanipratapsingh/Downloads/Rooms/src/app/(workspace)/events/[eventId]/check-in/page.tsx): Live QR camera scanner, instant pass token validation, duplicate prevention lock, and live gate feed.
- [`/events/[eventId]/analytics`](file:///Users/ashwanipratapsingh/Downloads/Rooms/src/app/(workspace)/events/[eventId]/analytics/page.tsx): Event analytics dashboard, category distribution, no-show rates, and CSV export.
- [`/events/[eventId]/content`](file:///Users/ashwanipratapsingh/Downloads/Rooms/src/app/(workspace)/events/[eventId]/content/page.tsx): Post-event creator content tracking (post URLs, views, likes, shares, hashtags).
- [`/guests`](file:///Users/ashwanipratapsingh/Downloads/Rooms/src/app/(workspace)/guests/page.tsx): Organisation-wide reusable guest CRM, CSV bulk importer with duplicate detection.
- [`/creators`](file:///Users/ashwanipratapsingh/Downloads/Rooms/src/app/(workspace)/creators/page.tsx): Creator directory with verified metrics, locations, and direct event invite trigger.
- [`/reports`](file:///Users/ashwanipratapsingh/Downloads/Rooms/src/app/(workspace)/reports/page.tsx): Intelligence hub and downloadable organisation audit trail.
- [`/settings`](file:///Users/ashwanipratapsingh/Downloads/Rooms/src/app/(workspace)/settings/page.tsx): Organisation settings, team role management, and SaaS subscription tiers (Starter ₹2,999, Growth ₹9,999, Enterprise).

### Public Token Routes (Guest-Facing)
- [`/invite/[token]`](file:///Users/ashwanipratapsingh/Downloads/Rooms/src/app/invite/[token]/page.tsx): Public invitation view with event details and one-click RSVP accept/decline.
- [`/pass/[token]`](file:///Users/ashwanipratapsingh/Downloads/Rooms/src/app/pass/[token]/page.tsx): Scannable high-resolution QR pass with VIP category badge and check-in instructions.

---

## 5. Development & Testing Commands

```bash
# Start local development server
npm run dev

# Run domain unit & security test suite
npm test

# Build production bundle
npm run build
```
