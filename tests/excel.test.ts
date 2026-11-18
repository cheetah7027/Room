import { test, describe } from "node:test";
import assert from "node:assert";
import { normalizeSpreadsheetRow } from "../src/lib/excel";
import { db } from "../src/lib/db";

describe("ROOM — Excel & Manual Guest Ingestion Suite", () => {
  test("should normalize spreadsheet rows with varied Excel column headers", () => {
    const rawExcelRow = {
      "Full Name": "Karan Singhal",
      "Email Address": "karan@singhal.in",
      "Phone Number": "+91 98200 44332",
      "City": "Mumbai",
      "Company": "Singhal Media Group",
      "Tier": "VIP",
      "Labels": "Entertainment; Keynote",
    };

    const normalized = normalizeSpreadsheetRow(rawExcelRow);
    assert.strictEqual(normalized.full_name, "Karan Singhal");
    assert.strictEqual(normalized.email, "karan@singhal.in");
    assert.strictEqual(normalized.phone, "+91 98200 44332");
    assert.strictEqual(normalized.city, "Mumbai");
    assert.strictEqual(normalized.organisation, "Singhal Media Group");
    assert.strictEqual(normalized.category, "VIP");
    assert.deepStrictEqual(normalized.tags, ["Entertainment", "Keynote"]);
  });

  test("should normalize brand partner category variations", () => {
    const brandRow = {
      name: "Rohan Kapoor",
      email: "rohan@zomato.com",
      phone: "+91 98111 22334",
      category: "Brand Partner",
    };
    const normalized = normalizeSpreadsheetRow(brandRow);
    assert.strictEqual(normalized.category, "Brand Partner");
  });

  test("should support manual guest creation and immediate event linking", () => {
    const org = db.organisation;
    const testEvent = db.createEvent({
      organisation_id: org.id,
      name: "Excel Ingestion Summit",
      description: "Testing manual and bulk guest options",
      category: "Brand Launch",
      status: "draft",
      start_time: "2026-12-15T18:00:00Z",
      end_time: "2026-12-15T22:00:00Z",
      timezone: "Asia/Kolkata",
      venue_name: "The Leela Palace",
      venue_city: "Bengaluru",
      venue_address: "Old Airport Road",
      capacity: 150,
      visibility: "invitation_only",
      cover_image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
    });

    // 1. Manually created guest
    const guest = db.createGuest({
      organisation_id: org.id,
      full_name: "Simran Kaur",
      email: "simran@kaurcreative.in",
      phone: "+91 99887 76655",
      city: "Bengaluru",
      organisation: "Kaur Creative",
      category: "Creator",
      tags: ["Fashion", "Tier-1"],
      notes: "VIP guest from manual addition",
      relationship_owner: "Rahul Mehta",
      social_links: {},
      communication_preferences: { email: true, whatsapp: true },
    });

    assert.ok(guest.id);
    const eventGuest = db.addGuestToEvent(testEvent.id, guest.id, "Creator");
    assert.strictEqual(eventGuest.event_id, testEvent.id);
    assert.strictEqual(eventGuest.guest_id, guest.id);

    // 2. Verify in event guestlist
    const eventGuestlist = db.getEventGuests(testEvent.id);
    const found = eventGuestlist.find((eg) => eg.guest_id === guest.id);
    assert.ok(found);
    assert.strictEqual(found.guest?.full_name, "Simran Kaur");
  });

  test("should deduplicate spreadsheet rows against existing CRM database", () => {
    const org = db.organisation;
    // Add known guest
    db.createGuest({
      organisation_id: org.id,
      full_name: "Aaditya Verma",
      email: "aaditya.verma@example.com",
      phone: "+91 98765 43210",
      city: "Delhi",
      organisation: "Verma Holdings",
      category: "General",
      tags: [],
      notes: "",
      relationship_owner: "Rahul Mehta",
      social_links: {},
      communication_preferences: { email: true, whatsapp: true },
    });

    // Attempt to find duplicate by matching email
    const dupsByEmail = db.findDuplicates("aaditya.verma@example.com", "+91 00000 00000", org.id);
    assert.strictEqual(dupsByEmail.length, 1);
    assert.strictEqual(dupsByEmail[0].full_name, "Aaditya Verma");

    // Attempt to find duplicate by matching phone
    const dupsByPhone = db.findDuplicates("different.email@domain.com", "+91 98765 43210", org.id);
    assert.strictEqual(dupsByPhone.length, 1);
    assert.strictEqual(dupsByPhone[0].full_name, "Aaditya Verma");
  });
});
