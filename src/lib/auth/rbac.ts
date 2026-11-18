import { Role, UserProfile } from "@/types";

// ============================================================================
// Explicit Permission Keys from RBAC.md Section 9
// ============================================================================
export type Permission =
  | "platform.organisations.manage"
  | "platform.subscriptions.manage"
  | "organisation.read"
  | "organisation.update"
  | "organisation.members.read"
  | "organisation.members.manage"
  | "organisation.billing.read"
  | "organisation.billing.manage"
  | "events.read"
  | "events.create"
  | "events.update"
  | "events.publish"
  | "events.cancel"
  | "events.assign_members"
  | "guests.read"
  | "guests.create"
  | "guests.update"
  | "guests.import"
  | "guests.export"
  | "creators.read"
  | "creators.create"
  | "creators.update"
  | "creators.export"
  | "invitations.read"
  | "invitations.send"
  | "invitations.cancel"
  | "invitations.remind"
  | "rsvp.self.manage"
  | "passes.self.read"
  | "passes.issue"
  | "passes.revoke"
  | "checkin.read"
  | "checkin.create"
  | "checkin.manual"
  | "checkin.override"
  | "analytics.event.read"
  | "analytics.campaign.read"
  | "reports.event.export"
  | "reports.campaign.export"
  | "content.self.submit"
  | "content.campaign.manage"
  | "audit.read";

// ============================================================================
// Role-to-Permissions Mapping per RBAC.md Section 4 & 5
// ============================================================================
export const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  PLATFORM_SUPER_ADMIN: new Set<Permission>([
    "platform.organisations.manage",
    "platform.subscriptions.manage",
    "organisation.read",
    "organisation.members.read",
    "events.read",
    "guests.read",
    "creators.read",
    "invitations.read",
    "passes.self.read",
    "passes.issue",
    "passes.revoke",
    "checkin.read",
    "analytics.event.read",
    "analytics.campaign.read",
    "audit.read",
  ]),

  ORGANISATION_OWNER: new Set<Permission>([
    "organisation.read",
    "organisation.update",
    "organisation.members.read",
    "organisation.members.manage",
    "organisation.billing.read",
    "organisation.billing.manage",
    "events.read",
    "events.create",
    "events.update",
    "events.publish",
    "events.cancel",
    "events.assign_members",
    "guests.read",
    "guests.create",
    "guests.update",
    "guests.import",
    "guests.export",
    "creators.read",
    "creators.create",
    "creators.update",
    "creators.export",
    "invitations.read",
    "invitations.send",
    "invitations.cancel",
    "invitations.remind",
    "passes.issue",
    "passes.revoke",
    "checkin.read",
    "checkin.create",
    "checkin.manual",
    "checkin.override",
    "analytics.event.read",
    "analytics.campaign.read",
    "reports.event.export",
    "reports.campaign.export",
    "content.campaign.manage",
    "audit.read",
  ]),

  ORGANISATION_ADMIN: new Set<Permission>([
    "organisation.read",
    "organisation.update",
    "organisation.members.read",
    "organisation.members.manage",
    "organisation.billing.read",
    "events.read",
    "events.create",
    "events.update",
    "events.publish",
    "events.cancel",
    "events.assign_members",
    "guests.read",
    "guests.create",
    "guests.update",
    "guests.import",
    "guests.export",
    "creators.read",
    "creators.create",
    "creators.update",
    "creators.export",
    "invitations.read",
    "invitations.send",
    "invitations.cancel",
    "invitations.remind",
    "passes.issue",
    "passes.revoke",
    "checkin.read",
    "checkin.create",
    "checkin.manual",
    "checkin.override",
    "analytics.event.read",
    "analytics.campaign.read",
    "reports.event.export",
    "reports.campaign.export",
    "content.campaign.manage",
    "audit.read",
  ]),

  EVENT_MANAGER: new Set<Permission>([
    "organisation.read",
    "events.read",
    "events.create",
    "events.update",
    "events.assign_members",
    "guests.read",
    "guests.create",
    "guests.update",
    "creators.read",
    "invitations.read",
    "invitations.send",
    "invitations.remind",
    "passes.issue",
    "checkin.read",
    "checkin.create",
    "checkin.manual",
    "analytics.event.read",
    "reports.event.export",
    "content.campaign.manage",
  ]),

  BRAND_MANAGER: new Set<Permission>([
    "organisation.read",
    "events.read",
    "creators.read",
    "creators.create",
    "invitations.read",
    "invitations.send",
    "analytics.campaign.read",
    "reports.campaign.export",
    "content.campaign.manage",
  ]),

  OPERATIONS_STAFF: new Set<Permission>([
    "events.read",
    "checkin.read",
    "checkin.create",
    "checkin.manual",
    "passes.self.read",
  ]),

  CREATOR: new Set<Permission>([
    "rsvp.self.manage",
    "passes.self.read",
    "content.self.submit",
  ]),

  GUEST: new Set<Permission>([
    "rsvp.self.manage",
    "passes.self.read",
  ]),
};

// ============================================================================
// Permission Verification Functions
// ============================================================================
export function hasPermission(role: Role, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role];
  return perms ? perms.has(permission) : false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

// ============================================================================
// Field-Level Privacy & Masking per RBAC.md Section 7
// ============================================================================
export function maskSensitiveData(
  val: string | undefined | null,
  type: "phone" | "email" | "notes",
  role: Role
): string {
  if (!val) return "";

  // Owner and Admin see full unmasked data
  if (role === "ORGANISATION_OWNER" || role === "ORGANISATION_ADMIN" || role === "PLATFORM_SUPER_ADMIN") {
    return val;
  }

  // Operations Staff has masked phone and email by default; no notes
  if (role === "OPERATIONS_STAFF") {
    if (type === "phone") {
      // e.g., "+91 98765 43210" -> "+91 98••• ••210"
      if (val.length > 7) {
        return val.slice(0, 5) + "••• ••" + val.slice(-3);
      }
      return "••••••";
    }
    if (type === "email") {
      // e.g., "arjun@example.com" -> "a•••@example.com"
      const parts = val.split("@");
      if (parts.length === 2 && parts[0].length > 1) {
        return parts[0][0] + "•••@" + parts[1];
      }
      return "••••@••••.com";
    }
    if (type === "notes") {
      return "[Internal note hidden for Operations Staff]";
    }
  }

  // Brand Manager does not see private internal relationship notes
  if (role === "BRAND_MANAGER" && type === "notes") {
    return "[Private agency notes hidden]";
  }

  // External personas (Creator, Guest) never see internal notes
  if ((role === "CREATOR" || role === "GUEST") && type === "notes") {
    return "";
  }

  return val;
}

// ============================================================================
// Navigation Links Configuration per RBAC.md Section 6
// ============================================================================
export interface NavItem {
  label: string;
  href: string;
  badge?: string;
}

export function getNavigationForRole(role: Role): NavItem[] {
  switch (role) {
    case "ORGANISATION_OWNER":
      return [
        { label: "Overview", href: "/dashboard" },
        { label: "Events", href: "/events" },
        { label: "Guest CRM", href: "/guests" },
        { label: "Creator CRM", href: "/creators" },
        { label: "Intelligence", href: "/reports" },
        { label: "Settings", href: "/settings" },
      ];

    case "ORGANISATION_ADMIN":
      return [
        { label: "Overview", href: "/dashboard" },
        { label: "Events", href: "/events" },
        { label: "Guest CRM", href: "/guests" },
        { label: "Creator CRM", href: "/creators" },
        { label: "Intelligence", href: "/reports" },
        { label: "Settings", href: "/settings" },
      ];

    case "EVENT_MANAGER":
      return [
        { label: "My Events", href: "/events" },
        { label: "Guest CRM", href: "/guests" },
        { label: "Gate Check-in", href: "/events/evt-aura-2026/check-in", badge: "Active" },
        { label: "Event Analytics", href: "/events/evt-aura-2026/analytics" },
        { label: "Reports", href: "/reports" },
      ];

    case "BRAND_MANAGER":
      return [
        { label: "Shared Campaigns", href: "/events" },
        { label: "Creator Discovery", href: "/creators" },
        { label: "Content Tracking", href: "/events/evt-aura-2026/content", badge: "Live" },
        { label: "Campaign Intelligence", href: "/reports" },
      ];

    case "OPERATIONS_STAFF":
      return [
        { label: "Gate Scanner & Check-in", href: "/events/evt-aura-2026/check-in", badge: "Live" },
        { label: "Assigned Event", href: "/events/evt-aura-2026" },
      ];

    case "CREATOR":
      return [
        { label: "My Digital Pass", href: "/pass/PASS_AURA_ANANYA_99182" },
        { label: "My Invitation", href: "/invite/tok_ananya_aura_2026_xyz" },
        { label: "Content Tracking", href: "/events/evt-aura-2026/content" },
      ];

    case "GUEST":
      return [
        { label: "My Invitation", href: "/invite/tok_kabir_aura_2026_abc" },
        { label: "My Digital Pass", href: "/pass/PASS_AURA_KABIR_77219" },
      ];

    case "PLATFORM_SUPER_ADMIN":
      return [
        { label: "Platform Overview", href: "/dashboard" },
        { label: "All Events", href: "/events" },
        { label: "Guest CRM", href: "/guests" },
        { label: "Creator CRM", href: "/creators" },
        { label: "Audit & Intelligence", href: "/reports" },
        { label: "Settings", href: "/settings" },
      ];

    default:
      return [{ label: "Overview", href: "/dashboard" }];
  }
}

// ============================================================================
// Default Landing Route per Role
// ============================================================================
export function getDefaultRouteForRole(role: Role): string {
  switch (role) {
    case "ORGANISATION_OWNER":
    case "ORGANISATION_ADMIN":
    case "PLATFORM_SUPER_ADMIN":
      return "/dashboard";
    case "EVENT_MANAGER":
      return "/events";
    case "BRAND_MANAGER":
      return "/events/evt-aura-2026/content";
    case "OPERATIONS_STAFF":
      return "/events/evt-aura-2026/check-in";
    case "CREATOR":
      return "/pass/PASS_AURA_ANANYA_99182";
    case "GUEST":
      return "/invite/tok_kabir_aura_2026_abc";
    default:
      return "/dashboard";
  }
}

// ============================================================================
// Route Protection & Policy Resolution
// ============================================================================
export function canAccessRoute(
  role: Role,
  pathname: string
): { allowed: boolean; reason?: string; redirect?: string } {
  // Public pass & invitation endpoints are accessible to anyone with the token
  if (pathname.startsWith("/pass/") || pathname.startsWith("/invite/") || pathname.startsWith("/sign-")) {
    return { allowed: true };
  }

  // 1. Guest: External invitee limited to own invitation & digital pass
  if (role === "GUEST") {
    return {
      allowed: false,
      reason: "Guest access is limited to your personal event invitation and digital pass.",
      redirect: "/invite/tok_kabir_aura_2026_abc",
    };
  }

  // 2. Creator: External influencer persona
  if (role === "CREATOR") {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/guests") ||
      pathname.startsWith("/creators") ||
      pathname.startsWith("/reports") ||
      pathname.includes("/check-in") ||
      pathname.startsWith("/events/new")
    ) {
      return {
        allowed: false,
        reason: "Creator persona is restricted to own invitations, digital passes, and content submissions.",
        redirect: "/pass/PASS_AURA_ANANYA_99182",
      };
    }
  }

  // 3. Operations Staff: Restricted to assigned event & gate check-in console
  if (role === "OPERATIONS_STAFF") {
    if (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/guests") ||
      pathname.startsWith("/creators") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/reports") ||
      pathname.startsWith("/events/new")
    ) {
      return {
        allowed: false,
        reason: "Operations Staff access is restricted to assigned event check-in and attendee lookup.",
        redirect: "/events/evt-aura-2026/check-in",
      };
    }
  }

  // 4. Brand Manager: Cannot configure agency settings, create agency events, or run operations check-in
  if (role === "BRAND_MANAGER") {
    if (
      pathname.startsWith("/settings") ||
      pathname.startsWith("/events/new") ||
      pathname.includes("/check-in")
    ) {
      return {
        allowed: false,
        reason: "Brand Managers cannot configure agency settings, create agency events, or access gate check-in.",
        redirect: "/events/evt-aura-2026/content",
      };
    }
  }

  // 5. Event Manager: Cannot configure organisation-wide settings or billing
  if (role === "EVENT_MANAGER") {
    if (pathname.startsWith("/settings")) {
      return {
        allowed: false,
        reason: "Organisation-wide settings and billing are restricted to Organisation Owners and Admins.",
        redirect: "/events",
      };
    }
  }

  return { allowed: true };
}

// ============================================================================
// Standard Persona Catalog representing the 8 PRD Roles
// ============================================================================
export interface Persona {
  id: string;
  name: string;
  email: string;
  role: Role;
  title: string;
  avatar: string;
  description: string;
  badgeColor: string;
}

export const PERSONAS: Persona[] = [
  {
    id: "usr-rahul-01",
    name: "Rahul Mehta",
    email: "rahul@pulselabs.in",
    role: "ORGANISATION_OWNER",
    title: "Agency Founder & CEO",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
    description: "Full organisation authority, billing, team admin, creator & guest CRM, event governance.",
    badgeColor: "bg-[#990b47] text-white",
  },
  {
    id: "usr-sneha-02",
    name: "Sneha Kapoor",
    email: "sneha.k@pulselabs.in",
    role: "ORGANISATION_ADMIN",
    title: "Head of Operations",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80",
    description: "Workspace operations admin, invitations, CRM, team members. Cannot delete org/owner.",
    badgeColor: "bg-[#2b3364] text-white",
  },
  {
    id: "usr-arjun-03",
    name: "Arjun Roy",
    email: "arjun@pulselabs.in",
    role: "EVENT_MANAGER",
    title: "Lead Event Producer",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    description: "Assigned event operations, attendee lists, check-in supervision, event analytics & reports.",
    badgeColor: "bg-[#175cd3] text-white",
  },
  {
    id: "usr-priya-04",
    name: "Priya Sharma",
    email: "priya.sharma@aurabeauty.com",
    role: "BRAND_MANAGER",
    title: "Brand Marketing Lead (AURA)",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
    description: "Shared brand campaign access, creator discovery & content tracking. No agency billing/settings.",
    badgeColor: "bg-[#b54708] text-white",
  },
  {
    id: "usr-karan-05",
    name: "Karan Verma",
    email: "karan@pulselabs.in",
    role: "OPERATIONS_STAFF",
    title: "Gate & Entry Concierge",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    description: "Fast QR pass scanner, attendee verification, masked contact privacy. No CRM/billing.",
    badgeColor: "bg-[#287a57] text-white",
  },
  {
    id: "usr-ananya-06",
    name: "Ananya Rao",
    email: "ananya@creatorhub.in",
    role: "CREATOR",
    title: "Fashion & Lifestyle Creator",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80",
    description: "External influencer persona. View own invitation, submit RSVP, access QR pass, post URL logging.",
    badgeColor: "bg-[#adbaff] text-ink",
  },
  {
    id: "usr-kabir-07",
    name: "Kabir Sen",
    email: "kabir.sen@vogue.in",
    role: "GUEST",
    title: "Invited Attendee (Vogue India)",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&q=80",
    description: "External invitee. Direct access to personalized RSVP invitation page and encrypted QR pass.",
    badgeColor: "bg-[#fff49d] text-ink",
  },
  {
    id: "usr-super-admin-08",
    name: "ROOM Admin",
    email: "support@roomplatform.io",
    role: "PLATFORM_SUPER_ADMIN",
    title: "ROOM Support Lead",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    description: "Platform support & compliance audit oversight, multi-tenant diagnostics.",
    badgeColor: "bg-[#7a5af8] text-white",
  },
];
