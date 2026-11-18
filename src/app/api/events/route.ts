import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createEventSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(""),
  category: z.enum([
    "Brand Launch",
    "Influencer Activation",
    "Networking Experience",
    "Private Showcase",
    "Pop-up",
  ]),
  start_time: z.string(),
  end_time: z.string(),
  timezone: z.string().default("Asia/Kolkata"),
  venue_name: z.string().min(2),
  venue_city: z.string(),
  venue_address: z.string().optional().default(""),
  capacity: z.number().int().positive().default(100),
  visibility: z.enum(["invitation_only", "public"]).default("invitation_only"),
  cover_image: z.string().url().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export async function GET(req: NextRequest) {
  const events = db.getEvents(db.organisation.id);
  return NextResponse.json({ success: true, data: events });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createEventSchema.parse(body);

    const created = db.createEvent({
      organisation_id: db.organisation.id,
      ...validated,
      cover_image:
        validated.cover_image ||
        "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Invalid payload" },
      { status: 400 }
    );
  }
}
