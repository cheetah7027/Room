import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";
import { GuestCategory } from "@/types";

const importBatchSchema = z.object({
  guests: z.array(
    z.object({
      full_name: z.string(),
      email: z.string().optional().default(""),
      phone: z.string().optional().default(""),
      city: z.string().optional().default("Bengaluru"),
      organisation: z.string().optional().default(""),
      category: z.string().optional().default("General"),
      tags: z.array(z.string()).optional().default([]),
      notes: z.string().optional(),
    })
  ),
  deduplication_strategy: z.enum(["skip", "update", "create_new"]).default("skip"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = importBatchSchema.parse(body);

    let imported = 0;
    let skipped = 0;
    const errors: any[] = [];

    for (const item of validated.guests) {
      const existing = db.findDuplicates(item.email, item.phone, db.organisation.id);
      if (existing.length > 0 && validated.deduplication_strategy === "skip") {
        skipped++;
        continue;
      }

      db.createGuest({
        organisation_id: db.organisation.id,
        full_name: item.full_name,
        email: item.email,
        phone: item.phone,
        city: item.city,
        organisation: item.organisation,
        category: (item.category as GuestCategory) || "General",
        tags: item.tags,
        notes: item.notes || "Imported via batch API",
        relationship_owner: "Rahul Mehta",
        social_links: {},
        communication_preferences: { email: true, whatsapp: true },
      });
      imported++;
    }

    db.logAudit("usr-rahul-01", "Rahul Mehta", "GUEST_IMPORT_EXECUTED", "guests", db.organisation.id, {
      imported,
      skipped,
    });

    return NextResponse.json({
      success: true,
      data: {
        total: validated.guests.length,
        imported,
        skipped,
        errors,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Invalid payload" },
      { status: 400 }
    );
  }
}
