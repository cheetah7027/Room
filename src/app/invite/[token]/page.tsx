"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { TopNav } from "@/components/layout/TopNav";
import { RoomLoading } from "@/components/ui/RoomLoading";
import {
  CalendarBlank,
  MapPin,
  CheckCircle,
  XCircle,
  QrCode,
  Sparkle,
  ArrowRight,
  ShieldCheck,
  UserCheck,
} from "@phosphor-icons/react";

export default function GuestInvitePage() {
  const params = useParams();
  const token = (params?.token as string) || "";
  const router = useRouter();

  const [context, setContext] = useState<any>(() => {
    if (token) return db.getInvitationByToken(token);
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => !token);
  const [submitting, setSubmitting] = useState(false);
  const [responseSubmitted, setResponseSubmitted] = useState<string | null>(() => {
    if (token) {
      const ctx = db.getInvitationByToken(token);
      if (ctx && (ctx.invitation.status === "accepted" || ctx.invitation.status === "declined")) {
        return ctx.invitation.status;
      }
    }
    return null;
  });
  const [generatedPass, setGeneratedPass] = useState<any>(() => {
    if (token) {
      const ctx = db.getInvitationByToken(token);
      return ctx?.qrPass || null;
    }
    return null;
  });

  useEffect(() => {
    const ctx = token ? db.getInvitationByToken(token) : null;
    if (ctx) {
      setContext(ctx);
      if (ctx.invitation.status === "accepted" || ctx.invitation.status === "declined") {
        setResponseSubmitted(ctx.invitation.status);
      }
      if (ctx.qrPass) {
        setGeneratedPass(ctx.qrPass);
      }
    }
    setLoading(false);
  }, [token]);

  const handleRSVP = async (response: "accepted" | "declined") => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/rsvp/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response, plus_ones: 0 }),
      });
      const data = await res.json();
      if (data.qrPass) {
        setGeneratedPass(data.qrPass);
      }
    } catch {
      // Local fallback
      const result = db.respondRSVP(token, response);
      if (result.qrPass) {
        setGeneratedPass(result.qrPass);
      }
    } finally {
      setSubmitting(false);
      setResponseSubmitted(response);
    }
  };

  if (loading) {
    return <RoomLoading fullPage size="lg" text="Loading invitation..." />;
  }

  if (!context || !context.event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="font-extrabold text-2xl text-ink">ROOM.</div>
          <h2 className="headline text-xl text-ink">Invalid or Expired Invitation</h2>
          <p className="text-sm text-ink/70">
            This invitation link is not recognized or may have expired. Please contact the event organizer.
          </p>
        </div>
      </div>
    );
  }

  const { event, guest, eventGuest, invitation } = context;

  return (
    <div className="min-h-screen bg-[#f7eee9] text-ink flex flex-col justify-between">
      {/* Top Navigation & Persona Switcher */}
      <TopNav />

      {/* Main Container */}
      <main className="max-w-xl mx-auto w-full px-4 py-8">
        <div className="bg-canvas border border-hairline rounded-lg overflow-hidden shadow-soft transition-all">
          {/* Cover Image */}
          <div className="relative h-56 sm:h-64 w-full bg-surface-soft">
            <img
              src={event.cover_image}
              alt={event.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-block-lime text-ink font-bold inline-block mb-1.5">
                {event.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight drop-shadow-sm font-sans">
                {event.name}
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Personalized Guest Greeting */}
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <span className="text-xs font-mono uppercase text-ink/60">
                  Invited Guest
                </span>
                <div className="text-lg font-bold text-ink">
                  {guest?.full_name || invitation.recipient_name}
                </div>
              </div>
              <Badge
                variant={
                  eventGuest?.category === "VVIP"
                    ? "vvip"
                    : eventGuest?.category === "VIP"
                    ? "vip"
                    : eventGuest?.category === "Creator"
                    ? "creator"
                    : "default"
                }
              >
                {eventGuest?.category || "Guest"}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-sm text-ink/80 leading-relaxed font-normal">
              {event.description}
            </p>

            {/* Event Time & Location Details */}
            <div className="bg-surface-soft rounded-lg p-4 space-y-3 border border-hairline text-xs">
              <div className="flex items-start gap-3">
                <CalendarBlank className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-ink">
                    {new Date(event.start_time).toLocaleDateString("en-IN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-ink/60 mt-0.5 font-mono">
                    {new Date(event.start_time).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {new Date(event.end_time).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    IST
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-hairline">
                <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-ink">{event.venue_name}</div>
                  <div className="text-ink/60 mt-0.5">
                    {event.venue_address || event.venue_city}
                  </div>
                </div>
              </div>
            </div>

            {/* RSVP Form / Result Section */}
            <div className="pt-2">
              {responseSubmitted === "accepted" ? (
                <div className="bg-[#edf7ed] border border-[#287a57]/40 rounded-lg p-5 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#287a57] text-white flex items-center justify-center mx-auto">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#287a57]">
                      RSVP Confirmed!
                    </h3>
                    <p className="text-xs text-[#287a57]/80 mt-1">
                      We look forward to welcoming you. Your entry pass has been generated.
                    </p>
                  </div>

                  {generatedPass && (
                    <Link
                      href={`/pass/${generatedPass.secure_token}`}
                      className="block"
                    >
                      <Button variant="primary" className="w-full gap-2">
                        <QrCode className="w-4 h-4" />
                        <span>View Digital QR Pass</span>
                      </Button>
                    </Link>
                  )}

                  <button
                    onClick={() => setResponseSubmitted(null)}
                    className="text-xs text-ink/60 hover:text-primary underline block mx-auto pt-1 font-mono"
                  >
                    Change RSVP Response
                  </button>
                </div>
              ) : responseSubmitted === "declined" ? (
                <div className="bg-surface-soft border border-hairline rounded-lg p-5 text-center space-y-3">
                  <XCircle className="w-8 h-8 text-[#b42318] mx-auto" />
                  <h3 className="font-bold text-base text-ink">
                    RSVP Marked as Declined
                  </h3>
                  <p className="text-xs text-ink/60">
                    Thank you for notifying us. We hope to see you at future experiences.
                  </p>
                  <button
                    onClick={() => setResponseSubmitted(null)}
                    className="text-xs text-ink/60 hover:text-primary underline block mx-auto pt-1 font-mono"
                  >
                    Change RSVP Response
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-bold text-base text-ink">
                      Will you be attending?
                    </h3>
                    <p className="text-xs text-ink/60 mt-1">
                      Please respond to secure your spot and generate your entry pass.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      disabled={submitting}
                      onClick={() => handleRSVP("declined")}
                      className="w-full"
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      disabled={submitting}
                      onClick={() => handleRSVP("accepted")}
                      className="w-full"
                    >
                      Accept &amp; Get Pass
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-ink/50 font-mono">
        POWERED BY ROOM • SECURE OPAQUE BEARER TOKEN
      </footer>
    </div>
  );
}
