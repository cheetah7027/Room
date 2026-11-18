import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailService } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const event = db.getEventById(eventId);
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";

    const eventGuests = db.getEventGuests(eventId);
    const results: Array<{
      guestName: string;
      email: string;
      status: string;
      invitationUrl: string;
    }> = [];

    let sentCount = 0;
    for (const eg of eventGuests) {
      const guest = eg.guest;
      if (!guest || !guest.email) continue;

      // Duplicate prevention: check if invitation already dispatched
      const existingInv = db.invitations.find((i) => i.event_guest_id === eg.id);
      if (existingInv && existingInv.status !== "draft") {
        results.push({
          guestName: guest.full_name,
          email: guest.email,
          status: "already_sent",
          invitationUrl: `${protocol}://${host}/invite/${existingInv.secure_token}`,
        });
        continue;
      }

      // Dispatch new invitation
      const invitation = db.sendInvitation(eventId, eg.id, "email");
      const invitationUrl = `${protocol}://${host}/invite/${invitation.secure_token}`;

      await emailService.sendInvitation({
        to: guest.email,
        recipientName: guest.full_name,
        event,
        invitationUrl,
        secureToken: invitation.secure_token,
        category: eg.category,
      });

      sentCount++;
      results.push({
        guestName: guest.full_name,
        email: guest.email,
        status: "sent",
        invitationUrl,
      });
    }

    db.logAudit("usr-rahul-01", "Rahul Mehta", "BULK_INVITATIONS_SENT", "events", eventId, {
      totalGuests: eventGuests.length,
      sentCount,
    });

    return NextResponse.json({
      success: true,
      sentCount,
      totalGuests: eventGuests.length,
      results,
      message: `Successfully dispatched ${sentCount} invitations for ${event.name}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch bulk invitations" },
      { status: 400 }
    );
  }
}
