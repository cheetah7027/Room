"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TopNav } from "@/components/layout/TopNav";
import { RoomLoading } from "@/components/ui/RoomLoading";
import {
  CalendarBlank,
  MapPin,
  CheckCircle,
  QrCode,
  DownloadSimple,
  ShareNetwork,
  ShieldCheck,
  Warning,
} from "@phosphor-icons/react";

export default function GuestPassPage() {
  const params = useParams();
  const token = params.token as string;

  const [context, setContext] = useState<any>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ctx = db.getPassByToken(token);
    if (ctx) {
      setContext(ctx);
      // Generate scannable QR Code containing the token
      QRCode.toDataURL(
        ctx.pass.secure_token,
        {
          width: 280,
          margin: 2,
          color: {
            dark: "#2b3364", // Twilight Indigo from design system
            light: "#ffffff",
          },
        },
        (err, url) => {
          if (!err && url) {
            setQrDataUrl(url);
          }
        }
      );
    }
    setLoading(false);
  }, [token]);

  if (loading) {
    return <RoomLoading fullPage size="lg" text="Validating pass token..." />;
  }

  if (!context || !context.pass) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="font-extrabold text-2xl text-ink">ROOM.</div>
          <h2 className="headline text-xl text-ink">Pass Not Found or Expired</h2>
          <p className="text-sm text-ink/70">
            This digital pass token is invalid, has been revoked, or does not exist.
          </p>
        </div>
      </div>
    );
  }

  const { pass, event, guest, eventGuest, checkIn } = context;
  const isCheckedIn = !!checkIn || eventGuest?.status === "checked_in";

  return (
    <div className="min-h-screen bg-surface-soft text-ink flex flex-col justify-between">
      {/* Top Navigation & Persona Switcher */}
      <TopNav />

      <main className="max-w-md mx-auto w-full my-auto">
        <div className="bg-canvas border border-hairline rounded-lg overflow-hidden shadow-soft">
          {/* Top Banner (Navy #2b3364) */}
          <div className="bg-block-navy text-white p-6 space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-block-lime font-bold">
                {event?.category}
              </span>
              <Badge
                variant={
                  eventGuest?.category === "VVIP"
                    ? "vvip"
                    : eventGuest?.category === "VIP"
                    ? "vip"
                    : eventGuest?.category === "Creator"
                    ? "creator"
                    : "outline"
                }
              >
                {eventGuest?.category} PASS
              </Badge>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold font-sans">
              {event?.name}
            </h1>
            <p className="text-xs text-white/70">
              {event?.venue_name}, {event?.venue_city}
            </p>
          </div>

          {/* Ticket Notch Styling */}
          <div className="relative flex items-center justify-between bg-canvas px-4 py-2 border-y border-dashed border-hairline">
            <div className="w-4 h-8 bg-surface-soft rounded-r-full -ml-4" />
            <span className="font-mono text-[11px] text-ink/40 tracking-wider">
              OFFICIAL ENTRY TOKEN
            </span>
            <div className="w-4 h-8 bg-surface-soft rounded-l-full -mr-4" />
          </div>

          {/* QR Code & Guest Section */}
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="space-y-1">
              <div className="text-xs font-mono uppercase text-ink/60">
                Pass Holder
              </div>
              <h2 className="text-2xl font-bold text-ink font-sans">
                {guest?.full_name}
              </h2>
              <div className="text-xs text-ink/60">
                {guest?.organisation || "Guest"}
              </div>
            </div>

            {/* QR Visual */}
            <div className="p-4 bg-white rounded-lg border-2 border-hairline inline-block shadow-sm">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Pass QR Code"
                  className="w-56 h-56 mx-auto object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center font-mono text-xs text-ink/50">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Token String */}
            <div>
              <div className="font-mono text-xs tracking-widest font-bold text-ink uppercase bg-surface-soft py-1.5 px-3 rounded inline-block border border-hairline">
                {pass.secure_token}
              </div>
              <p className="text-[11px] text-ink/50 mt-1.5">
                Present this screen at gate check-in for instant verification.
              </p>
            </div>

            {/* Verification Status Banner */}
            <div className="pt-2">
              {isCheckedIn ? (
                <div className="bg-[#edf7ed] border border-[#287a57] rounded-md p-3 text-xs text-[#287a57] font-semibold flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>CHECKED IN AT {checkIn ? new Date(checkIn.checked_in_at).toLocaleTimeString("en-IN") : "GATE"}</span>
                </div>
              ) : (
                <div className="bg-block-lime/40 border border-[#ecd959] rounded-md p-3 text-xs text-ink font-medium flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>VERIFIED PASS • READY FOR CHECK-IN</span>
                </div>
              )}
            </div>

            {/* Date and Venue Metadata */}
            <div className="text-xs text-ink/70 space-y-1 border-t border-hairline pt-4 text-left">
              <div className="flex items-center gap-2">
                <CalendarBlank className="w-3.5 h-3.5 text-primary" />
                <span>
                  {new Date(event.start_time).toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  at{" "}
                  {new Date(event.start_time).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{event.venue_address || `${event.venue_name}, ${event.venue_city}`}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-4 flex gap-3">
          <Button
            variant="secondary"
            onClick={() => window.print()}
            className="w-full gap-2 text-xs"
          >
            <DownloadSimple className="w-3.5 h-3.5" />
            <span>Save / Print Pass</span>
          </Button>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-ink/50 font-mono">
        ROOM IDEMPOTENT ATTENDANCE SECURITY • INDIA
      </footer>
    </div>
  );
}
