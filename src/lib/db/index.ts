import {
  initialOrganisation,
  initialUsers,
  initialEvents,
  initialGuests,
  initialEventGuests,
  initialInvitations,
  initialQRPasses,
  initialCheckIns,
  initialCreators,
  initialContentSubmissions,
  initialAuditLogs,
} from "./mock-data";

import {
  Organisation,
  UserProfile,
  EventItem,
  Guest,
  EventGuest,
  Invitation,
  QRPass,
  CheckIn,
  Creator,
  ContentSubmission,
  AuditLog,
  EventStatus,
  GuestCategory,
  CheckInStatus,
} from "@/types";

import { generateToken } from "@/lib/utils";

// In-memory data store with singleton pattern across Node server process
class RoomDatabase {
  private static instance: RoomDatabase;

  public organisation: Organisation = { ...initialOrganisation };
  public users: UserProfile[] = [...initialUsers];
  public events: EventItem[] = [...initialEvents];
  public guests: Guest[] = [...initialGuests];
  public eventGuests: EventGuest[] = [...initialEventGuests];
  public invitations: Invitation[] = [...initialInvitations];
  public qrPasses: QRPass[] = [...initialQRPasses];
  public checkIns: CheckIn[] = [...initialCheckIns];
  public creators: Creator[] = [...initialCreators];
  public contentSubmissions: ContentSubmission[] = [...initialContentSubmissions];
  public auditLogs: AuditLog[] = [...initialAuditLogs];
  public emailOutbox: any[] = [];

  public static getInstance(): RoomDatabase {
    if (!RoomDatabase.instance) {
      RoomDatabase.instance = new RoomDatabase();
    }
    return RoomDatabase.instance;
  }

  // --- Audit Logging ---
  public logAudit(
    actorId: string,
    actorName: string,
    action: string,
    resourceType: string,
    resourceId: string,
    metadata?: Record<string, unknown>
  ) {
    const log: AuditLog = {
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organisation_id: this.organisation.id,
      actor_id: actorId,
      actor_name: actorName,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      metadata,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    return log;
  }

  // --- Email Delivery Outbox ---
  public recordSentEmail(record: any) {
    this.emailOutbox.unshift(record);
    return record;
  }

  public getSentEmails(recipientEmail?: string) {
    if (recipientEmail) {
      return this.emailOutbox.filter((e) => e.to.toLowerCase() === recipientEmail.toLowerCase());
    }
    return this.emailOutbox;
  }

  // --- Organisation ---
  public getOrganisation(orgId: string): Organisation | undefined {
    if (this.organisation.id === orgId) return this.organisation;
    return undefined;
  }

  public updateOrganisation(orgId: string, update: Partial<Organisation>): Organisation {
    if (this.organisation.id === orgId) {
      this.organisation = { ...this.organisation, ...update };
      this.logAudit("usr-rahul-01", "Rahul Mehta", "ORGANISATION_UPDATED", "organisations", orgId, update);
    }
    return this.organisation;
  }

  // --- Events ---
  public getEvents(orgId: string): EventItem[] {
    return this.events.filter((e) => e.organisation_id === orgId);
  }

  public getEventById(eventId: string): EventItem | undefined {
    return this.events.find((e) => e.id === eventId);
  }

  public createEvent(data: Omit<EventItem, "id" | "created_at" | "updated_at">): EventItem {
    const newEvent: EventItem = {
      ...data,
      id: `evt-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.events.unshift(newEvent);
    this.logAudit("usr-rahul-01", "Rahul Mehta", "EVENT_CREATED", "events", newEvent.id, { name: newEvent.name });
    return newEvent;
  }

  public updateEvent(eventId: string, update: Partial<EventItem>): EventItem | undefined {
    const idx = this.events.findIndex((e) => e.id === eventId);
    if (idx === -1) return undefined;
    this.events[idx] = {
      ...this.events[idx],
      ...update,
      updated_at: new Date().toISOString(),
    };
    this.logAudit("usr-rahul-01", "Rahul Mehta", "EVENT_UPDATED", "events", eventId, update);
    return this.events[idx];
  }

  public duplicateEvent(eventId: string): EventItem | undefined {
    const source = this.getEventById(eventId);
    if (!source) return undefined;
    const duplicated: EventItem = {
      ...source,
      id: `evt-${Date.now()}`,
      name: `${source.name} (Copy)`,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.events.unshift(duplicated);
    this.logAudit("usr-rahul-01", "Rahul Mehta", "EVENT_DUPLICATED", "events", duplicated.id, { originalId: eventId });
    return duplicated;
  }

  // --- Guests ---
  public getGuests(orgId: string): Guest[] {
    return this.guests.filter((g) => g.organisation_id === orgId);
  }

  public getGuestById(id: string): Guest | undefined {
    return this.guests.find((g) => g.id === id);
  }

  public createGuest(data: Omit<Guest, "id" | "created_at">): Guest {
    const newGuest: Guest = {
      ...data,
      id: `gst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    this.guests.unshift(newGuest);
    this.logAudit("usr-rahul-01", "Rahul Mehta", "GUEST_CREATED", "guests", newGuest.id, { name: newGuest.full_name });
    return newGuest;
  }

  public updateGuest(id: string, update: Partial<Guest>): Guest | undefined {
    const idx = this.guests.findIndex((g) => g.id === id);
    if (idx === -1) return undefined;
    this.guests[idx] = { ...this.guests[idx], ...update };
    return this.guests[idx];
  }

  public findDuplicates(email: string, phone: string, orgId: string): Guest[] {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    return this.guests.filter((g) => {
      if (g.organisation_id !== orgId) return false;
      const matchEmail = g.email && g.email.trim().toLowerCase() === cleanEmail;
      const gCleanPhone = g.phone ? g.phone.replace(/[^0-9]/g, "") : "";
      const matchPhone = cleanPhone && gCleanPhone && cleanPhone.slice(-10) === gCleanPhone.slice(-10);
      return matchEmail || matchPhone;
    });
  }

  // --- Event Guests & Invitations ---
  public getEventGuests(eventId: string): (EventGuest & { guest?: Guest; invitation?: Invitation; qr_pass?: QRPass; check_in?: CheckIn })[] {
    return this.eventGuests
      .filter((eg) => eg.event_id === eventId)
      .map((eg) => {
        const guest = this.guests.find((g) => g.id === eg.guest_id);
        const invitation = this.invitations.find((inv) => inv.event_guest_id === eg.id);
        const qr_pass = this.qrPasses.find((p) => p.event_guest_id === eg.id);
        const check_in = this.checkIns.find((c) => c.event_guest_id === eg.id);
        return {
          ...eg,
          guest,
          invitation,
          qr_pass,
          check_in,
        };
      });
  }

  public addGuestToEvent(eventId: string, guestId: string, category: GuestCategory): EventGuest {
    let existing = this.eventGuests.find((eg) => eg.event_id === eventId && eg.guest_id === guestId);
    if (existing) {
      existing.category = category;
      return existing;
    }
    const newEventGuest: EventGuest = {
      id: `eg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      event_id: eventId,
      guest_id: guestId,
      category,
      status: "invited",
      plus_ones_allowed: 0,
      plus_ones_registered: 0,
    };
    this.eventGuests.push(newEventGuest);
    return newEventGuest;
  }

  public sendInvitation(
    eventId: string,
    eventGuestId: string,
    channel: "email" | "whatsapp" = "email"
  ): Invitation {
    const eg = this.eventGuests.find((e) => e.id === eventGuestId);
    const guest = eg ? this.guests.find((g) => g.id === eg.guest_id) : undefined;
    const recipientEmail = guest ? guest.email : "guest@example.com";
    const recipientName = guest ? guest.full_name : "Guest";

    let invitation = this.invitations.find((i) => i.event_guest_id === eventGuestId);
    if (invitation) {
      invitation.status = "sent";
      invitation.sent_at = new Date().toISOString();
      invitation.delivered_at = new Date(Date.now() + 2000).toISOString();
      return invitation;
    }

    const secureToken = `tok_${generateToken(24)}`;
    invitation = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      event_id: eventId,
      event_guest_id: eventGuestId,
      recipient_email: recipientEmail,
      recipient_name: recipientName,
      channel,
      status: "sent",
      secure_token: secureToken,
      sent_at: new Date().toISOString(),
      delivered_at: new Date(Date.now() + 1500).toISOString(),
      created_at: new Date().toISOString(),
    };
    this.invitations.push(invitation);
    this.logAudit("usr-rahul-01", "Rahul Mehta", "INVITATION_SENT", "invitations", invitation.id, {
      recipient: recipientName,
      channel,
    });
    return invitation;
  }

  public getInvitationByToken(token: string) {
    if (!token) return undefined;
    const clean = token.trim().toLowerCase();
    const invitation = this.invitations.find((i) => {
      const iToken = i.secure_token.toLowerCase();
      const iId = i.id.toLowerCase();
      if (iToken === clean || iId === clean) return true;
      // Support slug aliases (e.g. inv-aura-kabir -> Kabir's invitation)
      if (clean.includes("kabir") && (iToken.includes("kabir") || i.recipient_name.toLowerCase().includes("kabir"))) return true;
      if (clean.includes("ananya") && (iToken.includes("ananya") || i.recipient_name.toLowerCase().includes("ananya"))) return true;
      if (clean.includes("tanya") && (iToken.includes("tanya") || i.recipient_name.toLowerCase().includes("tanya"))) return true;
      if (clean.includes("rohan") && (iToken.includes("rohan") || i.recipient_name.toLowerCase().includes("rohan"))) return true;
      if (clean.includes("vikram") && (iToken.includes("vikram") || i.recipient_name.toLowerCase().includes("vikram"))) return true;
      return false;
    });
    if (!invitation) return undefined;
    const event = this.events.find((e) => e.id === invitation.event_id);
    const eventGuest = this.eventGuests.find((eg) => eg.id === invitation.event_guest_id);
    const guest = eventGuest ? this.guests.find((g) => g.id === eventGuest.guest_id) : undefined;
    const qrPass = eventGuest ? this.qrPasses.find((p) => p.event_guest_id === eventGuest.id) : undefined;
    return {
      invitation,
      event,
      eventGuest,
      guest,
      qrPass,
    };
  }

  public respondRSVP(
    token: string,
    response: "accepted" | "declined",
    plusOnes = 0
  ): { success: boolean; message: string; qrPass?: QRPass } {
    const context = this.getInvitationByToken(token);
    if (!context) return { success: false, message: "Invalid or expired invitation token." };

    const { invitation, eventGuest, event } = context;
    if (!invitation || !eventGuest) return { success: false, message: "Invitation record not found." };

    invitation.status = response === "accepted" ? "accepted" : "declined";
    invitation.responded_at = new Date().toISOString();
    eventGuest.status = response === "accepted" ? "confirmed" : "declined";
    eventGuest.plus_ones_registered = Math.min(plusOnes, eventGuest.plus_ones_allowed || 1);

    let pass: QRPass | undefined;
    if (response === "accepted") {
      // Generate or retrieve QR Pass
      let existingPass = this.qrPasses.find((p) => p.event_guest_id === eventGuest.id);
      if (!existingPass) {
        const passToken = `PASS_${event?.id || "EVT"}_${generateToken(12).toUpperCase()}`;
        existingPass = {
          id: `pass-${Date.now()}`,
          event_id: invitation.event_id,
          event_guest_id: eventGuest.id,
          token_hash: `hash_${passToken}`,
          secure_token: passToken,
          is_revoked: false,
          issued_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 14 * 86400000).toISOString(),
        };
        this.qrPasses.push(existingPass);
      }
      pass = existingPass;
    }

    this.logAudit("usr-guest-token", invitation.recipient_name, "RSVP_SUBMITTED", "rsvps", invitation.id, {
      response,
      plusOnes,
    });

    return {
      success: true,
      message: response === "accepted" ? "RSVP confirmed! Your digital pass is ready." : "RSVP marked as declined.",
      qrPass: pass,
    };
  }

  // --- Passes and Check-in ---
  public getPassByToken(passToken: string) {
    if (!passToken) return undefined;
    const clean = passToken.trim().toUpperCase();
    const pass = this.qrPasses.find((p) => {
      const pToken = p.secure_token.toUpperCase();
      const pId = p.id.toUpperCase();
      const pHash = p.token_hash.toUpperCase();
      if (pToken === clean || pId === clean || pHash === clean) return true;
      // Support slug aliases (e.g. pss-aura-kabir or pass-kabir)
      if (clean.includes("KABIR") && pToken.includes("KABIR")) return true;
      if (clean.includes("ANANYA") && pToken.includes("ANANYA")) return true;
      if (clean.includes("TANYA") && pToken.includes("TANYA")) return true;
      if (clean.includes("ROHAN") && pToken.includes("ROHAN")) return true;
      if (clean.includes("VIKRAM") && pToken.includes("VIKRAM")) return true;
      return false;
    });
    if (!pass) return undefined;
    const event = this.events.find((e) => e.id === pass.event_id);
    const eventGuest = this.eventGuests.find((eg) => eg.id === pass.event_guest_id);
    const guest = eventGuest ? this.guests.find((g) => g.id === eventGuest.guest_id) : undefined;
    const checkIn = this.checkIns.find((c) => c.event_guest_id === pass.event_guest_id);
    return {
      pass,
      event,
      eventGuest,
      guest,
      checkIn,
    };
  }

  public checkInGuest(
    eventId: string,
    passToken: string,
    operatorId: string,
    operatorName: string,
    method: "qr_scan" | "manual_search" | "emergency_override" = "qr_scan",
    idempotencyKey?: string
  ): {
    success: boolean;
    status: CheckInStatus | "already_checked_in";
    message: string;
    guest?: Guest;
    category?: GuestCategory;
    checkIn?: CheckIn;
  } {
    const passContext = this.getPassByToken(passToken);
    if (!passContext) {
      return {
        success: false,
        status: "invalid_pass",
        message: "Invalid pass token. No matching record in registry.",
      };
    }

    const { pass, eventGuest, guest, checkIn } = passContext;
    if (pass.event_id !== eventId) {
      return {
        success: false,
        status: "invalid_pass",
        message: "This pass belongs to a different event.",
        guest,
      };
    }

    if (pass.is_revoked) {
      return {
        success: false,
        status: "cancelled",
        message: "This pass has been revoked or cancelled.",
        guest,
      };
    }

    if (checkIn) {
      return {
        success: false,
        status: "already_checked_in",
        message: `Already checked in at ${new Date(checkIn.checked_in_at).toLocaleTimeString("en-IN")} by ${checkIn.operator_name}`,
        guest,
        category: eventGuest?.category,
        checkIn,
      };
    }

    // Perform check-in transactionally
    const finalKey = idempotencyKey || `idem_${Date.now()}_${pass.id}`;
    const newCheckIn: CheckIn = {
      id: `chk-${Date.now()}`,
      event_id: eventId,
      event_guest_id: pass.event_guest_id,
      pass_id: pass.id,
      operator_id: operatorId,
      operator_name: operatorName,
      method,
      checked_in_at: new Date().toISOString(),
      idempotency_key: finalKey,
    };

    this.checkIns.push(newCheckIn);
    if (eventGuest) {
      eventGuest.status = "checked_in";
    }

    this.logAudit(operatorId, operatorName, "GUEST_CHECKED_IN", "check_ins", newCheckIn.id, {
      guest_name: guest?.full_name,
      method,
      category: eventGuest?.category,
    });

    return {
      success: true,
      status: "checked_in",
      message: `Welcome, ${guest?.full_name}! Check-in verified.`,
      guest,
      category: eventGuest?.category,
      checkIn: newCheckIn,
    };
  }

  // --- Creators CRM ---
  public getCreators(orgId: string): Creator[] {
    return this.creators.filter((c) => c.organisation_id === orgId);
  }

  public getCreatorById(id: string): Creator | undefined {
    return this.creators.find((c) => c.id === id);
  }

  public createCreator(data: Omit<Creator, "id" | "created_at">): Creator {
    const newCreator: Creator = {
      ...data,
      id: `crt-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.creators.unshift(newCreator);
    this.logAudit("usr-rahul-01", "Rahul Mehta", "CREATOR_ADDED", "creators", newCreator.id, {
      name: newCreator.name,
      handle: newCreator.handle,
    });
    return newCreator;
  }

  // --- Content Submissions ---
  public getContentSubmissions(eventId?: string): ContentSubmission[] {
    if (eventId) {
      return this.contentSubmissions.filter((c) => c.event_id === eventId);
    }
    return this.contentSubmissions;
  }

  public addContentSubmission(data: Omit<ContentSubmission, "id" | "created_at">): ContentSubmission {
    const newSub: ContentSubmission = {
      ...data,
      id: `cnt-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    this.contentSubmissions.unshift(newSub);
    this.logAudit("usr-priya-02", "Priya Sharma", "CONTENT_SUBMISSION_ADDED", "content_submissions", newSub.id, {
      post_url: newSub.post_url,
      creator: newSub.creator_name,
    });
    return newSub;
  }

  // --- Analytics Engine ---
  public getEventAnalytics(eventId: string) {
    const egList = this.eventGuests.filter((eg) => eg.event_id === eventId);
    const invitations = this.invitations.filter((i) => i.event_id === eventId);
    const checkIns = this.checkIns.filter((c) => c.event_id === eventId);
    const content = this.contentSubmissions.filter((c) => c.event_id === eventId);

    const totalInvited = egList.length;
    const deliveredCount = invitations.filter((i) => i.delivered_at || i.status === "delivered" || i.status === "opened" || i.status === "accepted").length;
    const deliveryRate = totalInvited > 0 ? Math.round((deliveredCount / totalInvited) * 100) : 0;

    const acceptedCount = invitations.filter((i) => i.status === "accepted").length;
    const declinedCount = invitations.filter((i) => i.status === "declined").length;
    const rsvpResponses = acceptedCount + declinedCount;
    const acceptanceRate = rsvpResponses > 0 ? Math.round((acceptedCount / rsvpResponses) * 100) : 0;
    const declineRate = rsvpResponses > 0 ? Math.round((declinedCount / rsvpResponses) * 100) : 0;

    const actualAttendance = checkIns.length;
    const attendanceRate = acceptedCount > 0 ? Math.round((actualAttendance / acceptedCount) * 100) : 0;
    const noShowRate = acceptedCount > 0 ? Math.max(0, Math.round(((acceptedCount - actualAttendance) / acceptedCount) * 100)) : 0;

    // Category distribution
    const categoryCounts: Record<string, number> = {};
    egList.forEach((eg) => {
      categoryCounts[eg.category] = (categoryCounts[eg.category] || 0) + 1;
    });

    // Content reach
    const totalViews = content.reduce((acc, curr) => acc + (curr.metrics.views || 0), 0);
    const totalLikes = content.reduce((acc, curr) => acc + (curr.metrics.likes || 0), 0);
    const totalShares = content.reduce((acc, curr) => acc + (curr.metrics.shares || 0), 0);

    return {
      eventId,
      totalInvited,
      deliveredCount,
      deliveryRate,
      acceptedCount,
      declinedCount,
      acceptanceRate,
      declineRate,
      actualAttendance,
      attendanceRate,
      noShowRate,
      categoryDistribution: Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
      })),
      creatorParticipation: egList.filter((eg) => eg.category === "Creator").length,
      contentCount: content.length,
      totalViews,
      totalLikes,
      totalShares,
    };
  }
}

export const db = RoomDatabase.getInstance();
