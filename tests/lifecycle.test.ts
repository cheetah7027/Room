import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { db } from "../src/lib/db/index";
import { emailService } from "../src/lib/email/index";

describe("ROOM — Complete Event Lifecycle Verification (P0 & P1)", () => {
  const TEST_ORG_ID = "org-pulse-01";
  const TEST_EVENT_ID = `evt-test-${Date.now()}`;

  // 5 Test Guests with distinct emails and categories
  const TEST_GUESTS = [
    { name: "Aarav Sen", email: "aarav.sen@testlifecycle.com", category: "VIP" as const, phone: "+91 98201 11001" },
    { name: "Dia Kapoor", email: "dia.kapoor@testlifecycle.com", category: "Creator" as const, phone: "+91 98201 11002" },
    { name: "Rohan Verma", email: "rohan.verma@testlifecycle.com", category: "Media" as const, phone: "+91 98201 11003" },
    { name: "Meera Nair", email: "meera.nair@testlifecycle.com", category: "Brand Partner" as const, phone: "+91 98201 11004" },
    { name: "Vikram Singhania", email: "vikram.singh@testlifecycle.com", category: "VVIP" as const, phone: "+91 98201 11005" },
  ];

  let createdEventGuests: any[] = [];
  let generatedInvitations: any[] = [];
  let issuedQRPasses: any[] = [];

  // --------------------------------------------------------------------------
  // Phase 1: Event Creation
  // --------------------------------------------------------------------------
  it("Phase 1: Should create a new event with full metadata", () => {
    const newEvent = db.createEvent({
      organisation_id: TEST_ORG_ID,
      name: "Vogue India Spring Experiential Launch 2026",
      description: "High-touch brand activation hosting India's top creators, editors, and brand partners.",
      category: "Brand Launch",
      status: "published",
      start_time: "2026-11-28T18:30:00.000Z",
      end_time: "2026-11-28T23:30:00.000Z",
      timezone: "Asia/Kolkata",
      venue_name: "The Oberoi Grand Ballroom",
      venue_city: "Bengaluru",
      venue_address: "37-39 MG Road, Yellappa Garden, Bengaluru",
      capacity: 150,
      visibility: "invitation_only",
      cover_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    });

    assert.ok(newEvent, "Event must be created successfully");
    assert.strictEqual(newEvent.organisation_id, TEST_ORG_ID);
    assert.strictEqual(newEvent.status, "published");

    // Use created event id for subsequent lifecycle steps
    (newEvent as any).id = TEST_EVENT_ID;
    db.events.push(newEvent);

    const fetched = db.getEventById(TEST_EVENT_ID);
    assert.ok(fetched, "Event must be retrievable from database");
    assert.strictEqual(fetched.name, "Vogue India Spring Experiential Launch 2026");
  });

  // --------------------------------------------------------------------------
  // Phase 2: Add 5 Guests to Event
  // --------------------------------------------------------------------------
  it("Phase 2: Should add 5 distinct guests to CRM and link to event guestlist", () => {
    createdEventGuests = [];

    for (const g of TEST_GUESTS) {
      // 1. Add to CRM
      const createdGuest = db.createGuest({
        organisation_id: TEST_ORG_ID,
        full_name: g.name,
        email: g.email,
        phone: g.phone,
        city: "Bengaluru",
        organisation: "Vogue / Condé Nast",
        category: g.category,
        tags: ["Test Suite", "VIP", g.category],
        social_links: {
          instagram: `@${g.name.toLowerCase().replace(/\s+/g, "")}`,
        },
        communication_preferences: {
          email: true,
          whatsapp: true,
        },
      });
      assert.ok(createdGuest.id, `Guest ${g.name} must be added to CRM`);

      // 2. Add to Event Guestlist
      const eventGuest = db.addGuestToEvent(TEST_EVENT_ID, createdGuest.id, g.category);
      assert.ok(eventGuest.id, `Guest ${g.name} must be linked to event guestlist`);
      assert.strictEqual(eventGuest.event_id, TEST_EVENT_ID);
      createdEventGuests.push(eventGuest);
    }

    assert.strictEqual(createdEventGuests.length, 5, "Exactly 5 guests must be linked to the event");

    // Populate with relational data
    createdEventGuests = db.getEventGuests(TEST_EVENT_ID);
    assert.strictEqual(createdEventGuests.length, 5, "Database must return 5 event guests");
  });

  // --------------------------------------------------------------------------
  // Phase 3: Invitation Dispatch & Email Delivery
  // --------------------------------------------------------------------------
  it("Phase 3: Should dispatch email invitations with secure bearer tokens and verifiable email delivery", async () => {
    generatedInvitations = [];
    const event = db.getEventById(TEST_EVENT_ID)!;
    createdEventGuests = db.getEventGuests(TEST_EVENT_ID);

    for (const eg of createdEventGuests) {
      const guest = eg.guest;
      assert.ok(guest, "Event guest must be populated with guest CRM record");

      // Dispatch invitation
      const inv = db.sendInvitation(TEST_EVENT_ID, eg.id, "email");
      assert.ok(inv.secure_token.startsWith("tok_"), "Invitation token must have secure prefix");
      assert.strictEqual(inv.status, "sent");

      // Verify email delivery via Email Service
      const inviteUrl = `http://localhost:3000/invite/${inv.secure_token}`;
      const emailResult = await emailService.sendInvitation({
        to: guest.email,
        recipientName: guest.full_name,
        event,
        invitationUrl: inviteUrl,
        secureToken: inv.secure_token,
        category: eg.category,
      });

      assert.strictEqual(emailResult.success, true);
      assert.ok(emailResult.id, "Email dispatch must return delivery ID");

      generatedInvitations.push(inv);
    }

    assert.strictEqual(generatedInvitations.length, 5);

    // Verify outbox records
    const outboxEmails = db.getSentEmails();
    for (const g of TEST_GUESTS) {
      const email = outboxEmails.find((e) => e.to.toLowerCase() === g.email.toLowerCase());
      assert.ok(email, `Sent email must exist in outbox for ${g.email}`);
      assert.strictEqual(email.status, "delivered");
      assert.match(email.subject, /Invitation:/);
    }
  });

  // --------------------------------------------------------------------------
  // Phase 4: RSVP Processing & QR Pass Generation & QR Confirmation Email
  // --------------------------------------------------------------------------
  it("Phase 4: Should process RSVP acceptance, issue unique QR passes, and deliver confirmation emails", async () => {
    issuedQRPasses = [];
    const event = db.getEventById(TEST_EVENT_ID)!;

    // Guests 0, 1, 2, 3 ACCEPT; Guest 4 DECLINES
    for (let i = 0; i < generatedInvitations.length; i++) {
      const inv = generatedInvitations[i];
      const isAccepting = i < 4; // 4 accept, 1 declines
      const response = isAccepting ? "accepted" : "declined";

      const rsvpResult = db.respondRSVP(inv.secure_token, response);
      assert.strictEqual(rsvpResult.success, true);

      if (isAccepting) {
        assert.ok(rsvpResult.qrPass, `Guest ${i + 1} must receive a valid QR pass on acceptance`);
        assert.ok(rsvpResult.qrPass.secure_token.startsWith("PASS_"), "QR token must have PASS_ prefix");
        issuedQRPasses.push(rsvpResult.qrPass);

        // Deliver QR Pass Confirmation Email
        const passUrl = `http://localhost:3000/pass/${rsvpResult.qrPass.secure_token}`;
        const passEmailResult = await emailService.sendQRPass({
          to: inv.recipient_email,
          recipientName: inv.recipient_name,
          event,
          passUrl,
          passToken: rsvpResult.qrPass.secure_token,
          category: createdEventGuests[i].category,
        });

        assert.strictEqual(passEmailResult.success, true);
      } else {
        assert.strictEqual(rsvpResult.qrPass, undefined, "Declined guest must not receive a QR pass");
      }
    }

    assert.strictEqual(issuedQRPasses.length, 4, "Exactly 4 QR passes must be issued for accepted RSVPs");

    // Verify tokens are all mutually distinct
    const uniqueTokens = new Set(issuedQRPasses.map((p) => p.secure_token));
    assert.strictEqual(uniqueTokens.size, 4, "Every issued QR pass must have a unique bearer token");
  });

  // --------------------------------------------------------------------------
  // Phase 5: Event-Day Gate Check-in & Scanner
  // --------------------------------------------------------------------------
  it("Phase 5: Should scan QR passes and check in attendees at the gate", () => {
    // Check in Guest 1 (Aarav Sen)
    const pass1 = issuedQRPasses[0];
    const checkIn1 = db.checkInGuest(
      TEST_EVENT_ID,
      pass1.secure_token,
      "usr-karan-03",
      "Karan Verma",
      "qr_scan"
    );

    assert.strictEqual(checkIn1.success, true);
    assert.strictEqual(checkIn1.status, "checked_in");
    assert.ok(checkIn1.checkIn?.id, "Check-in entry must be created");

    // Check in Guest 2 (Dia Kapoor)
    const pass2 = issuedQRPasses[1];
    const checkIn2 = db.checkInGuest(
      TEST_EVENT_ID,
      pass2.secure_token,
      "usr-karan-03",
      "Karan Verma",
      "qr_scan"
    );

    assert.strictEqual(checkIn2.success, true);
    assert.strictEqual(checkIn2.status, "checked_in");

    // Verify recent check-ins count for this event
    const eventCheckIns = db.checkIns.filter((c) => c.event_id === TEST_EVENT_ID);
    assert.strictEqual(eventCheckIns.length, 2, "2 check-ins must be recorded");
  });

  // --------------------------------------------------------------------------
  // Phase 6: Duplicate Scan Rejection (Idempotency)
  // --------------------------------------------------------------------------
  it("Phase 6: Should prevent duplicate check-ins idempotently and reject duplicate entry", () => {
    const pass1 = issuedQRPasses[0];

    // Attempt second scan for Guest 1 (already checked in)
    const duplicateScan = db.checkInGuest(
      TEST_EVENT_ID,
      pass1.secure_token,
      "usr-karan-03",
      "Karan Verma",
      "qr_scan"
    );

    assert.strictEqual(duplicateScan.success, false);
    assert.strictEqual(duplicateScan.status, "already_checked_in");
    assert.match(duplicateScan.message, /Already checked in/i);

    // Verify check-in count did not increase
    const eventCheckIns = db.checkIns.filter((c) => c.event_id === TEST_EVENT_ID);
    assert.strictEqual(eventCheckIns.length, 2, "Duplicate scan must NOT create duplicate check-in row");
  });

  // --------------------------------------------------------------------------
  // Phase 7: Invalid QR Token Rejection
  // --------------------------------------------------------------------------
  it("Phase 7: Should reject invalid, fabricated, or malformed QR tokens", () => {
    const invalidToken = "PASS_COMPLETELY_FABRICATED_TOKEN_12345";
    const invalidResult = db.checkInGuest(
      TEST_EVENT_ID,
      invalidToken,
      "usr-karan-03",
      "Karan Verma",
      "qr_scan"
    );

    assert.strictEqual(invalidResult.success, false);
    assert.strictEqual(invalidResult.status, "invalid_pass");
    assert.match(invalidResult.message, /Invalid pass token/i);
  });

  // --------------------------------------------------------------------------
  // Phase 8: Cross-Event QR Rejection
  // --------------------------------------------------------------------------
  it("Phase 8: Should strictly reject cross-event QR pass leakage", () => {
    // Pass from a different event (evt-aura-2026)
    const otherEventPass = db.qrPasses.find((p) => p.event_id === "evt-aura-2026");
    assert.ok(otherEventPass, "Another event pass must exist");

    const crossEventResult = db.checkInGuest(
      TEST_EVENT_ID, // Presenting at TEST_EVENT_ID gate
      otherEventPass.secure_token, // But pass belongs to evt-aura-2026
      "usr-karan-03",
      "Karan Verma",
      "qr_scan"
    );

    assert.strictEqual(crossEventResult.success, false);
    assert.strictEqual(crossEventResult.status, "invalid_pass");
    assert.match(crossEventResult.message, /different event/i);
  });

  // --------------------------------------------------------------------------
  // Phase 9: Live Attendance Dashboard & Analytics Verification
  // --------------------------------------------------------------------------
  it("Phase 9: Should compute accurate live attendance statistics and conversion rates", () => {
    const analytics = db.getEventAnalytics(TEST_EVENT_ID);

    assert.strictEqual(analytics.totalInvited, 5, "Total invited must be exactly 5");
    assert.strictEqual(analytics.acceptedCount, 4, "Accepted RSVP count must be 4");
    assert.strictEqual(analytics.declinedCount, 1, "Declined RSVP count must be 1");
    assert.strictEqual(analytics.actualAttendance, 2, "Actual on-site attendance must be 2");

    // Acceptance rate: 4/5 = 80%
    assert.strictEqual(analytics.acceptanceRate, 80);

    // Attendance rate: 2/4 = 50%
    assert.strictEqual(analytics.attendanceRate, 50);

    // Delivery rate: 5/5 = 100%
    assert.strictEqual(analytics.deliveryRate, 100);

    // Check category distribution
    assert.ok(analytics.categoryDistribution.length > 0, "Category distribution must be computed");
    const vipStat = analytics.categoryDistribution.find((c) => c.category === "VIP");
    assert.ok(vipStat, "VIP category stat must be present");
  });
});
