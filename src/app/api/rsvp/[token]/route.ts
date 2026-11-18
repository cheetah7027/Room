import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailService } from "@/lib/email";
import { z } from "zod";

const rsvpSchema = z.object({
  response: z.enum(["accepted", "declined"]),
  plus_ones: z.number().int().nonnegative().default(0),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const context = db.getInvitationByToken(token);
  if (!context) {
    return NextResponse.json({ success: false, error: "Invitation not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: context });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await req.json();
    const validated = rsvpSchema.parse(body);

    const contextBefore = db.getInvitationByToken(token);
    const result = db.respondRSVP(token, validated.response, validated.plus_ones);

    // If accepted and QR pass generated, automatically dispatch the QR pass email
    if (result.success && validated.response === "accepted" && result.qrPass && contextBefore) {
      const { guest, event, eventGuest } = contextBefore;
      if (guest && guest.email && event) {
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const passUrl = `${protocol}://${host}/pass/${result.qrPass.secure_token}`;

        await emailService.sendQRPass({
          to: guest.email,
          recipientName: guest.full_name,
          event,
          passUrl,
          passToken: result.qrPass.secure_token,
          category: eventGuest?.category,
        });
      }
    }

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Invalid payload" },
      { status: 400 }
    );
  }
}
