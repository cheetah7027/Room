import { describe, it } from "node:test";
import assert from "node:assert";
import { db } from "../src/lib/db";
import { EventItem } from "../src/types";

describe("ROOM — Audit Remediations & Lifecycle Verification", () => {
  it("should support case-insensitive and trimmed canonical event ID lookup", () => {
    const e1 = db.getEventById("evt-aura-2026");
    const e2 = db.getEventById("  EVT-AURA-2026  ");
    const e3 = db.getEventById("evt-aura-2026".toUpperCase());

    assert.ok(e1, "Direct ID lookup should succeed");
    assert.ok(e2, "Padded uppercase lookup should succeed");
    assert.strictEqual(e1?.id, e2?.id);
    assert.strictEqual(e1?.id, e3?.id);
  });

  it("should preserve consistent analytics across all data surfaces", () => {
    const eventId = "evt-aura-2026";
    const analytics = db.getEventAnalytics(eventId);
    const rawCheckIns = db.checkIns.filter((c) => c.event_id === eventId);
    const rawGuests = db.eventGuests.filter((eg) => eg.event_id === eventId);

    assert.strictEqual(analytics.actualAttendance, rawCheckIns.length);
    assert.strictEqual(analytics.totalInvited, rawGuests.length);
  });

  it("should update event status through lifecycle and revoke passes on cancellation", () => {
    // Create dedicated test event
    const testEvt = db.createEvent({
      organisation_id: db.organisation.id,
      name: "Cancellation Test Activation",
      description: "Testing pass invalidation on cancellation",
      category: "Brand Launch",
      status: "published",
      start_time: "2026-12-30T18:00:00Z",
      end_time: "2026-12-30T22:00:00Z",
      timezone: "Asia/Kolkata",
      venue_name: "Test Arena",
      venue_city: "Mumbai",
      venue_address: "Bandra Kurla Complex",
      capacity: 50,
      visibility: "invitation_only",
      cover_image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
    });

    // Add guest and generate pass
    const g = db.createGuest({
      organisation_id: db.organisation.id,
      full_name: "Rhea Sen",
      email: "rhea.sen@test.in",
      phone: "+91 91122 33445",
      city: "Mumbai",
      organisation: "Sen Atelier",
      category: "VIP",
      tags: ["VIP"],
      relationship_owner: "Rahul Mehta",
      communication_preferences: { email: true, whatsapp: true },
    });

    const eg = db.addGuestToEvent(testEvt.id, g.id, "VIP");
    const inv = db.sendInvitation(testEvt.id, eg.id, "email");
    const rsvp = db.respondRSVP(inv.secure_token, "accepted");
    assert.ok(rsvp.qrPass);
    assert.strictEqual(rsvp.qrPass.is_revoked, false);

    // Cancel event
    db.updateEventStatus(testEvt.id, "cancelled", "usr-rahul-01", "Rahul Mehta", "Test cancellation");
    const updatedEvt = db.getEventById(testEvt.id);
    assert.strictEqual(updatedEvt?.status, "cancelled");

    // Pass should be revoked
    const pass = db.qrPasses.find((p) => p.id === rsvp.qrPass?.id);
    assert.strictEqual(pass?.is_revoked, true);

    // Gate check-in should strictly reject pass
    const checkInResult = db.checkInGuest(
      testEvt.id,
      rsvp.qrPass.secure_token,
      "usr-karan-03",
      "Karan Verma",
      "qr_scan"
    );
    assert.strictEqual(checkInResult.success, false);
    assert.strictEqual(checkInResult.status, "cancelled");
  });

  it("should duplicate event metadata without leaking guestlist or check-in records", () => {
    const sourceId = "evt-aura-2026";
    const duplicated = db.duplicateEvent(sourceId);

    assert.ok(duplicated);
    assert.notStrictEqual(duplicated.id, sourceId);
    assert.strictEqual(duplicated.status, "draft");

    // The duplicated event must start with zero guests
    const dupGuests = db.getEventGuests(duplicated.id);
    assert.strictEqual(dupGuests.length, 0);

    const dupCheckIns = db.checkIns.filter((c) => c.event_id === duplicated.id);
    assert.strictEqual(dupCheckIns.length, 0);
  });

  it("should record and expose creator provenance metadata", () => {
    const creator = db.createCreator({
      organisation_id: db.organisation.id,
      name: "Diya Narang",
      handle: "@diyanarang",
      profile_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
      location: "Delhi",
      categories: ["Couture", "Luxury"],
      languages: ["English", "Hindi"],
      audience_size: "180,000",
      engagement_rate: "5.5%",
      primary_platform: "Instagram",
      social_links: { instagram: "https://instagram.com/diyanarang" },
      collaboration_count: 2,
      average_sentiment: "High",
      is_verified: true,
      provenance: "Agency Verified",
      last_synced_at: new Date().toISOString(),
    });

    assert.ok(creator.id);
    assert.strictEqual(creator.provenance, "Agency Verified");
    assert.ok(creator.last_synced_at);
  });
});
