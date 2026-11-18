import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createGuestSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  city: z.string().default("Bengaluru"),
  organisation: z.string().optional().default(""),
  category: z.enum(["VIP", "VVIP", "Creator", "Media", "Brand Partner", "General"]).default("General"),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  relationship_owner: z.string().optional().default("Rahul Mehta"),
});

export async function GET(req: NextRequest) {
  const guests = db.getGuests(db.organisation.id);
  return NextResponse.json({ success: true, data: guests });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createGuestSchema.parse(body);

    const guest = db.createGuest({
      organisation_id: db.organisation.id,
      ...validated,
      social_links: {},
      communication_preferences: { email: true, whatsapp: true },
    });

    return NextResponse.json({ success: true, data: guest }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Invalid payload" },
      { status: 400 }
    );
  }
}
