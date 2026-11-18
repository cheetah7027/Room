import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailService } from "@/lib/email";
import { z } from "zod";

const sendInviteSchema = z.object({
  event_id: z.string().min(1),
  event_guest_id: z.string().min(1),
  channel: z.enum(["email", "whatsapp"]).default("email"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = sendInviteSchema.parse(body);

    const event = db.getEventById(validated.event_id);
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const eg = db.eventGuests.find((e) => e.id === validated.event_guest_id);
    if (!eg) {
      return NextResponse.json({ success: false, error: "Guest not on event guestlist" }, { status: 404 });
    }

    const guest = db.guests.find((g) => g.id === eg.guest_id);
    if (!guest) {
      return NextResponse.json({ success: false, error: "Guest CRM record not found" }, { status: 404 });
    }

    // Create / update invitation in database
    const invitation = db.sendInvitation(validated.event_id, validated.event_guest_id, validated.channel);

    // Build absolute URL or base URL for invitation
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const invitationUrl = `${protocol}://${host}/invite/${invitation.secure_token}`;

    // Dispatch email
    let emailResult = null;
    if (guest.email) {
      emailResult = await emailService.sendInvitation({
        to: guest.email,
        recipientName: guest.full_name,
        event,
        invitationUrl,
        secureToken: invitation.secure_token,
        category: eg.category,
      });
    }

    return NextResponse.json({
      success: true,
      invitation,
      invitationUrl,
      emailResult,
      message: `Invitation dispatched to ${guest.full_name} (${guest.email || "No email"})`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch invitation" },
      { status: 400 }
    );
  }
}
