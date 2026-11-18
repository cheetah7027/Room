import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createCreatorSchema = z.object({
  name: z.string().min(2),
  handle: z.string().min(1),
  profile_image: z.string().url().optional(),
  location: z.string().default("Bengaluru"),
  categories: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  audience_size: z.string().default("100,000"),
  engagement_rate: z.string().default("4.0%"),
  primary_platform: z.enum(["Instagram", "YouTube", "LinkedIn"]).default("Instagram"),
  notes: z.string().optional(),
  is_verified: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const creators = db.getCreators(db.organisation.id);
  return NextResponse.json({ success: true, data: creators });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createCreatorSchema.parse(body);

    const cleanHandle = validated.handle.startsWith("@") ? validated.handle : `@${validated.handle}`;

    const created = db.createCreator({
      organisation_id: db.organisation.id,
      name: validated.name,
      handle: cleanHandle,
      profile_image:
        validated.profile_image ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
      location: validated.location,
      categories: validated.categories,
      languages: validated.languages,
      audience_size: validated.audience_size,
      engagement_rate: validated.engagement_rate,
      primary_platform: validated.primary_platform,
      social_links: {
        instagram: `https://instagram.com/${cleanHandle.replace("@", "")}`,
      },
      collaboration_count: 0,
      average_sentiment: "High",
      notes: validated.notes,
      is_verified: validated.is_verified,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Invalid payload" },
      { status: 400 }
    );
  }
}
