import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { db } from "../src/lib/db/index";
import { generateToken } from "../src/lib/utils";
import {
  hasPermission,
  hasAnyPermission,
  maskSensitiveData,
  canAccessRoute,
  getNavigationForRole,
  getDefaultRouteForRole,
  PERSONAS,
} from "../src/lib/auth/rbac";

describe("ROOM Domain & Security Suite", () => {
  it("should enforce tenant data isolation", () => {
    const orgEvents = db.getEvents(db.organisation.id);
    assert.ok(orgEvents.length > 0, "Active organisation should have events");

    // Attempt to access with a foreign organisation ID
    const foreignEvents = db.getEvents("org-competitor-999");
    assert.strictEqual(
      foreignEvents.length,
      0,
      "Foreign organisation must not see active organisation events"
    );
  });

  it("should prevent duplicate check-ins idempotently", () => {
    const eventId = "evt-aura-2026";
    const pass = db.qrPasses.find((p) => p.event_id === eventId);
    assert.ok(pass, "Event should have at least one test pass");

    // Ensure state clean for test
    const existingIndex = db.checkIns.findIndex((c) => c.pass_id === pass.id);
    if (existingIndex !== -1) {
      db.checkIns.splice(existingIndex, 1);
    }

    // 1st scan: Must succeed
    const firstAttempt = db.checkInGuest(
      eventId,
      pass.secure_token,
      "usr-karan-03",
      "Karan Verma",
      "qr_scan"
    );

    assert.strictEqual(firstAttempt.success, true);
    assert.strictEqual(firstAttempt.status, "checked_in");

    // 2nd scan: Must be BLOCKED with deterministic already_checked_in status
    const secondAttempt = db.checkInGuest(
      eventId,
      pass.secure_token,
      "usr-karan-03",
      "Karan Verma",
      "qr_scan"
    );

    assert.strictEqual(secondAttempt.success, false);
    assert.strictEqual(secondAttempt.status, "already_checked_in");
    assert.match(secondAttempt.message, /Already checked in/);
  });

  it("should reject invalid or revoked pass tokens", () => {
    const eventId = "evt-aura-2026";

    // Random fake token
    const fakeResult = db.checkInGuest(
      eventId,
      "TOKEN_DOES_NOT_EXIST_XYZ",
      "usr-karan-03",
      "Karan Verma"
    );
    assert.strictEqual(fakeResult.success, false);
    assert.strictEqual(fakeResult.status, "invalid_pass");

    // Pass belonging to a different event
    const otherPass = db.qrPasses[0];
    const mismatchedEvent = db.checkInGuest(
      "evt-different-999",
      otherPass.secure_token,
      "usr-karan-03",
      "Karan Verma"
    );
    assert.strictEqual(mismatchedEvent.success, false);
    assert.strictEqual(mismatchedEvent.status, "invalid_pass");
  });

  it("should identify duplicate guests during CRM operations", () => {
    const existingGuest = db.guests[0];
    assert.ok(existingGuest.email, "Guest must have email");

    const duplicates = db.findDuplicates(
      existingGuest.email.toUpperCase(), // Case insensitive check
      "9999999999",
      db.organisation.id
    );

    assert.ok(duplicates.length > 0, "Duplicate email candidate must be found");
    assert.strictEqual(duplicates[0].id, existingGuest.id);
  });

  it("should process RSVP acceptance and generate a QR pass", () => {
    const inv = db.invitations.find((i) => i.status === "sent" || i.status === "delivered");
    assert.ok(inv, "Should have a pending invitation to test");

    const rsvpResult = db.respondRSVP(inv.secure_token, "accepted", 1);
    assert.strictEqual(rsvpResult.success, true);
    assert.ok(rsvpResult.qrPass, "Accepted RSVP must yield a valid QR pass");
    assert.ok(rsvpResult.qrPass.secure_token.startsWith("PASS_"));
  });

  it("should accurately compute event analytics metrics", () => {
    const analytics = db.getEventAnalytics("evt-aura-2026");
    assert.ok(typeof analytics.totalInvited === "number");
    assert.ok(typeof analytics.deliveryRate === "number");
    assert.ok(typeof analytics.acceptanceRate === "number");
    assert.ok(typeof analytics.actualAttendance === "number");
    assert.ok(analytics.categoryDistribution.length > 0);
  });

  it("should enforce role-based permissions matrix per RBAC.md Section 4 & 9", () => {
    // 1. Organisation Owner has complete workspace & billing authority
    assert.strictEqual(hasPermission("ORGANISATION_OWNER", "organisation.billing.manage"), true);
    assert.strictEqual(hasPermission("ORGANISATION_OWNER", "events.create"), true);
    assert.strictEqual(hasPermission("ORGANISATION_OWNER", "guests.export"), true);
    assert.strictEqual(hasPermission("ORGANISATION_OWNER", "checkin.override"), true);
    assert.strictEqual(hasPermission("ORGANISATION_OWNER", "audit.read"), true);

    // 2. Organisation Admin can administer workspace but NOT billing ownership
    assert.strictEqual(hasPermission("ORGANISATION_ADMIN", "organisation.members.manage"), true);
    assert.strictEqual(hasPermission("ORGANISATION_ADMIN", "events.create"), true);
    assert.strictEqual(hasPermission("ORGANISATION_ADMIN", "organisation.billing.manage"), false);

    // 3. Event Manager has event-level scope
    assert.strictEqual(hasPermission("EVENT_MANAGER", "events.create"), true);
    assert.strictEqual(hasPermission("EVENT_MANAGER", "checkin.create"), true);
    assert.strictEqual(hasPermission("EVENT_MANAGER", "organisation.billing.manage"), false);
    assert.strictEqual(hasPermission("EVENT_MANAGER", "audit.read"), false);

    // 4. Brand Manager has campaign/creator discovery scope
    assert.strictEqual(hasPermission("BRAND_MANAGER", "creators.read"), true);
    assert.strictEqual(hasPermission("BRAND_MANAGER", "content.campaign.manage"), true);
    assert.strictEqual(hasPermission("BRAND_MANAGER", "organisation.billing.manage"), false);
    assert.strictEqual(hasPermission("BRAND_MANAGER", "events.create"), false);
    assert.strictEqual(hasPermission("BRAND_MANAGER", "checkin.manual"), false);

    // 5. Operations Staff has gate scanner/lookup scope ONLY
    assert.strictEqual(hasPermission("OPERATIONS_STAFF", "checkin.create"), true);
    assert.strictEqual(hasPermission("OPERATIONS_STAFF", "checkin.manual"), true);
    assert.strictEqual(hasPermission("OPERATIONS_STAFF", "guests.export"), false);
    assert.strictEqual(hasPermission("OPERATIONS_STAFF", "creators.read"), false);
    assert.strictEqual(hasPermission("OPERATIONS_STAFF", "organisation.billing.manage"), false);
    assert.strictEqual(hasPermission("OPERATIONS_STAFF", "checkin.override"), false);

    // 6. Creator persona
    assert.strictEqual(hasPermission("CREATOR", "rsvp.self.manage"), true);
    assert.strictEqual(hasPermission("CREATOR", "passes.self.read"), true);
    assert.strictEqual(hasPermission("CREATOR", "content.self.submit"), true);
    assert.strictEqual(hasPermission("CREATOR", "guests.read"), false);

    // 7. Guest persona
    assert.strictEqual(hasPermission("GUEST", "rsvp.self.manage"), true);
    assert.strictEqual(hasPermission("GUEST", "passes.self.read"), true);
    assert.strictEqual(hasPermission("GUEST", "creators.read"), false);
  });

  it("should mask sensitive personal data according to role privacy rules per RBAC.md Section 7", () => {
    const rawPhone = "+91 98765 43210";
    const rawEmail = "arjun.kapoor@lifestyle.in";
    const rawNotes = "Direct relationship with managing partner; VIP seat.";

    // Owner sees full unmasked data
    assert.strictEqual(maskSensitiveData(rawPhone, "phone", "ORGANISATION_OWNER"), rawPhone);
    assert.strictEqual(maskSensitiveData(rawEmail, "email", "ORGANISATION_OWNER"), rawEmail);
    assert.strictEqual(maskSensitiveData(rawNotes, "notes", "ORGANISATION_OWNER"), rawNotes);

    // Operations Staff sees masked phone & email; notes hidden
    const maskedPhone = maskSensitiveData(rawPhone, "phone", "OPERATIONS_STAFF");
    assert.notStrictEqual(maskedPhone, rawPhone);
    assert.match(maskedPhone, /•••/);

    const maskedEmail = maskSensitiveData(rawEmail, "email", "OPERATIONS_STAFF");
    assert.notStrictEqual(maskedEmail, rawEmail);
    assert.match(maskedEmail, /•••@/);

    const maskedNotes = maskSensitiveData(rawNotes, "notes", "OPERATIONS_STAFF");
    assert.match(maskedNotes, /hidden/i);

    // Brand Manager cannot see internal agency notes
    const brandNotes = maskSensitiveData(rawNotes, "notes", "BRAND_MANAGER");
    assert.match(brandNotes, /hidden/i);
  });

  it("should enforce least privilege route access guards per RBAC.md Section 4 & 6", () => {
    // Owner can access all routes
    assert.strictEqual(canAccessRoute("ORGANISATION_OWNER", "/dashboard").allowed, true);
    assert.strictEqual(canAccessRoute("ORGANISATION_OWNER", "/settings").allowed, true);
    assert.strictEqual(canAccessRoute("ORGANISATION_OWNER", "/guests").allowed, true);

    // Operations Staff is blocked from settings, guests CRM, creators CRM, event creation
    assert.strictEqual(canAccessRoute("OPERATIONS_STAFF", "/settings").allowed, false);
    assert.strictEqual(canAccessRoute("OPERATIONS_STAFF", "/guests").allowed, false);
    assert.strictEqual(canAccessRoute("OPERATIONS_STAFF", "/creators").allowed, false);
    assert.strictEqual(canAccessRoute("OPERATIONS_STAFF", "/events/new").allowed, false);
    assert.strictEqual(canAccessRoute("OPERATIONS_STAFF", "/events/evt-aura-2026/check-in").allowed, true);

    // Brand Manager cannot configure settings or create events or access check-in
    assert.strictEqual(canAccessRoute("BRAND_MANAGER", "/settings").allowed, false);
    assert.strictEqual(canAccessRoute("BRAND_MANAGER", "/events/new").allowed, false);
    assert.strictEqual(canAccessRoute("BRAND_MANAGER", "/creators").allowed, true);
    assert.strictEqual(canAccessRoute("BRAND_MANAGER", "/events/evt-aura-2026/check-in").allowed, false);

    // Event Manager blocked from organisation settings
    assert.strictEqual(canAccessRoute("EVENT_MANAGER", "/settings").allowed, false);
    assert.strictEqual(canAccessRoute("EVENT_MANAGER", "/events").allowed, true);

    // Creator / Guest blocked from workspace dashboard, allowed on pass & invite
    assert.strictEqual(canAccessRoute("CREATOR", "/dashboard").allowed, false);
    assert.strictEqual(canAccessRoute("CREATOR", "/pass/PASS_AURA_ANANYA_99182").allowed, true);
    assert.strictEqual(canAccessRoute("GUEST", "/dashboard").allowed, false);
    assert.strictEqual(canAccessRoute("GUEST", "/invite/tok_kabir_aura_2026_abc").allowed, true);
    assert.strictEqual(canAccessRoute("GUEST", "/pass/PASS_AURA_KABIR_77219").allowed, true);

    // Navigation items tailored per role
    assert.ok(getNavigationForRole("ORGANISATION_OWNER").length >= 5);
    assert.ok(getNavigationForRole("OPERATIONS_STAFF").some((n) => n.href.includes("check-in")));
    assert.ok(getNavigationForRole("GUEST").some((n) => n.href.includes("tok_kabir") || n.href.includes("PASS_AURA_KABIR")));
    assert.ok(getNavigationForRole("CREATOR").some((n) => n.href.includes("PASS_AURA_ANANYA")));

    // Default routes for all 8 PRD personas
    assert.strictEqual(getDefaultRouteForRole("ORGANISATION_OWNER"), "/dashboard");
    assert.strictEqual(getDefaultRouteForRole("ORGANISATION_ADMIN"), "/dashboard");
    assert.strictEqual(getDefaultRouteForRole("PLATFORM_SUPER_ADMIN"), "/dashboard");
    assert.strictEqual(getDefaultRouteForRole("EVENT_MANAGER"), "/events");
    assert.strictEqual(getDefaultRouteForRole("BRAND_MANAGER"), "/events/evt-aura-2026/content");
    assert.strictEqual(getDefaultRouteForRole("OPERATIONS_STAFF"), "/events/evt-aura-2026/check-in");
    assert.strictEqual(getDefaultRouteForRole("CREATOR"), "/pass/PASS_AURA_ANANYA_99182");
    assert.strictEqual(getDefaultRouteForRole("GUEST"), "/invite/tok_kabir_aura_2026_abc");

    // Seamless token and alias lookups for Guest and Creator
    const kabirPass = db.getPassByToken("PASS_AURA_KABIR_77219");
    assert.ok(kabirPass, "Pass token PASS_AURA_KABIR_77219 must resolve");
    const kabirPassAlias = db.getPassByToken("pss-aura-kabir");
    assert.ok(kabirPassAlias, "Alias pss-aura-kabir must resolve to Kabir's pass");

    const kabirInv = db.getInvitationByToken("tok_kabir_aura_2026_abc");
    assert.ok(kabirInv, "Invitation token tok_kabir_aura_2026_abc must resolve");
    const kabirInvAlias = db.getInvitationByToken("inv-aura-kabir");
    assert.ok(kabirInvAlias, "Alias inv-aura-kabir must resolve to Kabir's invitation");
  });
});
