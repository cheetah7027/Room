import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const checkInSchema = z.object({
  pass_token: z.string().min(1),
  operator_id: z.string().default("usr-karan-03"),
  operator_name: z.string().default("Karan Verma"),
  method: z.enum(["qr_scan", "manual_search", "emergency_override"]).default("qr_scan"),
  idempotency_key: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await req.json();
    const validated = checkInSchema.parse(body);

    const result = db.checkInGuest(
      eventId,
      validated.pass_token,
      validated.operator_id,
      validated.operator_name,
      validated.method,
      validated.idempotency_key
    );

    return NextResponse.json(result, {
      status: result.success ? 200 : result.status === "already_checked_in" ? 409 : 400,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Invalid payload" },
      { status: 400 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: eventId } = await params;
  const eventCheckIns = db.checkIns.filter((c) => c.event_id === eventId);
  return NextResponse.json({ success: true, data: eventCheckIns });
}
