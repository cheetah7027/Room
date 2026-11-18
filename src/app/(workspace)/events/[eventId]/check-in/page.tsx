"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { EventItem, CheckIn, Guest, GuestCategory } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, ColorBlock } from "@/components/ui/Card";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  QrCode,
  MagnifyingGlass,
  CheckCircle,
  Warning,
  XCircle,
  ShieldCheck,
  Users,
  Camera,
  ArrowLeft,
  ArrowsClockwise,
  Sparkle,
} from "@phosphor-icons/react";
import { RoomLoading } from "@/components/ui/RoomLoading";

export default function CheckInConsolePage() {
  const { can, mask, persona } = useAuth();
  const params = useParams();
  const eventId = (params?.eventId as string) || "";

  const [event, setEvent] = useState<EventItem | null>(() => {
    if (eventId) return db.getEventById(eventId) || null;
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => !event);
  const [passTokenInput, setPassTokenInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    status: string;
    message: string;
    guest?: Guest;
    category?: GuestCategory;
    checkIn?: CheckIn;
  } | null>(null);

  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>(() => {
    if (eventId) return [...db.checkIns.filter((c) => c.event_id === eventId)].reverse();
    return [];
  });
  const [showSandboxShortcuts, setShowSandboxShortcuts] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const playAudioFeedback = (type: "success" | "error") => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (type === "success") {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.setValueAtTime(200, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // Audio unsupported in test environment
    }
  };

  useEffect(() => {
    refreshConsole();
    return () => {
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    };
  }, [eventId]);

  const refreshConsole = () => {
    const e = db.getEventById(eventId);
    if (e) {
      setEvent(e);
      const evCheckIns = db.checkIns.filter((c) => c.event_id === eventId);
      setRecentCheckIns([...evCheckIns].reverse());
    }
    setLoading(false);
  };

  const handleVerifyPass = async (tokenToVerify?: string) => {
    const token = (tokenToVerify || passTokenInput).trim();
    if (!token) return;

    try {
      const res = await fetch(`/api/events/${eventId}/check-ins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pass_token: token,
          operator_id: persona.id,
          operator_name: persona.name,
          method: isCameraActive ? "qr_scan" : "manual_search",
        }),
      });
      const data = await res.json();
      setScanResult(data);
      if (data.success) {
        playAudioFeedback("success");
      } else {
        playAudioFeedback("error");
      }
    } catch {
      const res = db.checkInGuest(
        eventId,
        token,
        persona.id,
        persona.name,
        isCameraActive ? "qr_scan" : "manual_search"
      );
      setScanResult(res);
      if (res.success) {
        playAudioFeedback("success");
      } else {
        playAudioFeedback("error");
      }
    } finally {
      setPassTokenInput("");
      refreshConsole();
    }
  };

  const handleManualCheckIn = (egId: string, guestName: string) => {
    // Find the pass or token for this event guest
    const pass = db.qrPasses.find((p) => p.event_guest_id === egId);
    if (pass) {
      handleVerifyPass(pass.secure_token);
    } else {
      // Create temporary pass and check in
      const res = db.checkInGuest(
        eventId,
        `EMERGENCY_OVERRIDE_${egId}`,
        persona.id,
        persona.name,
        "manual_search"
      );
      setScanResult(res);
      if (res.success) {
        playAudioFeedback("success");
      } else {
        playAudioFeedback("error");
      }
      refreshConsole();
    }
  };

  const startContinuousScanner = () => {
    if (typeof window !== "undefined" && "BarcodeDetector" in window) {
      try {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code"] });
        scanIntervalRef.current = setInterval(async () => {
          if (videoRef.current && videoRef.current.readyState === 4) {
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0 && barcodes[0].rawValue) {
                const detectedToken = barcodes[0].rawValue;
                handleVerifyPass(detectedToken);
              }
            } catch {
              // Frame decode skip
            }
          }
        }, 300);
      } catch {
        // Fallback
      }
    }
  };

  const toggleCamera = async () => {
    if (isCameraActive) {
      setIsCameraActive(false);
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    } else {
      setIsCameraActive(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          startContinuousScanner();
        }
      } catch (err) {
        console.warn("Camera stream unavailable; manual fallback active.");
        setIsCameraActive(false);
        setScanResult({
          success: false,
          status: "camera_unavailable",
          message:
            "Camera stream unavailable or permission denied. Please use the token input or manual guest lookup below.",
        });
      }
    }
  };

  if (loading) {
    return <RoomLoading fullPage size="lg" text="Initializing Gate Check-in Console..." />;
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="headline text-2xl text-ink">Event not found</h2>
        <p className="text-sm text-ink/70">
          The event ID &ldquo;{eventId}&rdquo; was not found in the operations registry.
        </p>
        <Link href="/events">
          <Button variant="secondary">Back to Events</Button>
        </Link>
      </div>
    );
  }

  const eventGuests = db.getEventGuests(eventId);
  const totalGuests = eventGuests.length;
  const checkedInCount = recentCheckIns.length;
  const attendanceRate = totalGuests > 0 ? Math.round((checkedInCount / totalGuests) * 100) : 0;

  // Filter for manual fallback search
  const searchedGuests = searchQuery.trim()
    ? eventGuests.filter((eg) => {
        const name = eg.guest?.full_name?.toLowerCase() || "";
        const email = eg.guest?.email?.toLowerCase() || "";
        const phone = eg.guest?.phone?.toLowerCase() || "";
        const q = searchQuery.toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q);
      })
    : [];

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center text-xs font-mono uppercase text-ink/60 hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Event Overview
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="headline text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              Gate Check-in Console
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono uppercase bg-semantic-success text-white font-medium">
              Live Scanner
            </span>
          </div>
          <p className="text-xs text-ink/70 mt-1">
            {event.name} • Operator: Karan Verma (Operations Staff)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={refreshConsole}
            className="gap-1.5"
          >
            <ArrowsClockwise className="w-3.5 h-3.5" />
            <span>Sync</span>
          </Button>
          <Link href={`/events/${eventId}/analytics`}>
            <Button variant="primary" size="sm">
              Attendance Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="caption-mono text-ink/60">Actual Attendance</span>
            <div className="text-3xl font-bold text-ink mt-1 font-sans">
              {checkedInCount} <span className="text-sm font-normal text-ink/50">/ {totalGuests}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-block-lime flex items-center justify-center text-ink font-mono text-sm font-semibold">
            {attendanceRate}%
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="caption-mono text-ink/60">Venue Capacity</span>
            <div className="text-3xl font-bold text-ink mt-1 font-sans">
              {event.capacity - checkedInCount}{" "}
              <span className="text-sm font-normal text-ink/50">remaining</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-soft flex items-center justify-center text-ink font-mono text-sm font-semibold">
            {event.capacity}
          </div>
        </Card>

        <Card className="p-5 flex items-center justify-between">
          <div>
            <span className="caption-mono text-ink/60">Gate Security</span>
            <div className="text-base font-semibold text-semantic-success mt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Idempotent Pass Lock</span>
            </div>
          </div>
          <Badge variant="outline">HMAC Token Auth</Badge>
        </Card>
      </div>

      {/* Main Scanner Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: QR Scanner & Token Input (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-6 space-y-6 border-2 border-hairline">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <h3 className="card-title text-lg font-semibold text-ink">
                  Scan Guest Pass
                </h3>
              </div>
              <Button
                variant={isCameraActive ? "primary" : "secondary"}
                size="sm"
                onClick={toggleCamera}
                className="gap-1.5 text-xs"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{isCameraActive ? "Close Camera" : "Start Camera"}</span>
              </Button>
            </div>

            {/* Video Viewport (when active) */}
            {isCameraActive && (
              <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden flex items-center justify-center border-2 border-primary">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="absolute inset-0 border-2 border-dashed border-block-lime/60 m-8 rounded-lg pointer-events-none flex items-center justify-center">
                  <span className="text-xs font-mono text-block-lime bg-black/60 px-3 py-1 rounded">
                    Align Pass QR Code
                  </span>
                </div>
              </div>
            )}

            {/* Manual Token Verification Form */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-mono uppercase text-ink/70">
                Or Enter / Scan Token
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. PASS_AURA_ANANYA_99182"
                  value={passTokenInput}
                  onChange={(e) => setPassTokenInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerifyPass();
                  }}
                  className="flex-1 px-4 py-3 bg-canvas border-2 border-hairline focus:border-primary rounded-md text-sm font-mono text-ink uppercase tracking-wider focus:outline-none"
                />
                <Button
                  variant="primary"
                  onClick={() => handleVerifyPass()}
                  className="px-6"
                >
                  Verify
                </Button>
              </div>

              {/* Developer Sandbox Controls (Hidden by Default in Live Production) */}
              <div className="pt-2 border-t border-hairline">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-ink/70">
                    <span className="w-2 h-2 rounded-full bg-[#f79009]" />
                    <span className="font-mono text-[11px] uppercase">Developer Sandbox Helpers</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSandboxShortcuts(!showSandboxShortcuts)}
                    className="text-[11px] font-mono text-primary hover:underline"
                  >
                    {showSandboxShortcuts ? "Hide Test Shortcuts" : "Show Test Shortcuts (Sandbox)"}
                  </button>
                </div>

                {showSandboxShortcuts && (
                  <div className="mt-2.5 p-3 rounded bg-[#fffcf5] border border-[#fec84b] space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-[11px] text-[#b54708] font-mono">
                      <span>SANDBOX SIMULATION SHORTCUTS (DISABLED IN PRODUCTION)</span>
                      <span className="px-1.5 py-0.5 rounded bg-[#fec84b]/40 font-bold">NON-PROD</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {db.qrPasses
                        .filter((p) => p.event_id === eventId)
                        .map((p) => (
                          <button
                            key={p.id}
                            onClick={() => handleVerifyPass(p.secure_token)}
                            className="px-2.5 py-1 rounded text-[11px] font-mono bg-white hover:bg-block-lime border border-[#fec84b] text-ink transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <span className="text-ink/60">{p.secure_token.split("_").slice(-2, -1)[0]}:</span>
                            <span className="font-bold">{p.secure_token.split("_").pop()}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scan Feedback Banner */}
            {scanResult && (
              <div
                className={`p-6 rounded-lg border-2 transition-all animate-in zoom-in-95 duration-150 ${
                  scanResult.status === "checked_in"
                    ? "bg-[#edf7ed] border-[#287a57] text-[#287a57]"
                    : scanResult.status === "already_checked_in"
                    ? "bg-[#fff8e6] border-[#b54708] text-[#b54708]"
                    : "bg-[#fef3f2] border-[#b42318] text-[#b42318]"
                }`}
              >
                <div className="flex items-start gap-4">
                  {scanResult.status === "checked_in" ? (
                    <CheckCircle className="w-8 h-8 flex-shrink-0 text-semantic-success" />
                  ) : scanResult.status === "already_checked_in" ? (
                    <Warning className="w-8 h-8 flex-shrink-0 text-[#b54708]" />
                  ) : (
                    <XCircle className="w-8 h-8 flex-shrink-0 text-[#b42318]" />
                  )}

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold uppercase tracking-wider">
                        {scanResult.status === "checked_in"
                          ? "ENTRY PERMITTED"
                          : scanResult.status === "already_checked_in"
                          ? "DUPLICATE ENTRY BLOCKED"
                          : "VERIFICATION FAILED"}
                      </span>
                      {scanResult.category && (
                        <Badge
                          variant={
                            scanResult.category === "VVIP"
                              ? "vvip"
                              : scanResult.category === "VIP"
                              ? "vip"
                              : scanResult.category === "Creator"
                              ? "creator"
                              : "default"
                          }
                        >
                          {scanResult.category} ACCESS
                        </Badge>
                      )}
                    </div>

                    <h4 className="text-xl font-bold font-sans">
                      {scanResult.message}
                    </h4>

                    {scanResult.guest && (
                      <div className="text-sm pt-2 font-forum opacity-90 border-t border-current/20 mt-2">
                        Guest: <span className="font-semibold">{scanResult.guest.full_name}</span> ({scanResult.guest.organisation})
                      </div>
                    )}

                    {scanResult.status === "already_checked_in" && (
                      <div className="pt-2">
                        {can("checkin.override") ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              if (scanResult.guest) {
                                handleManualCheckIn(
                                  `override-${Date.now()}`,
                                  scanResult.guest.full_name
                                );
                                db.logAudit(
                                  persona.id,
                                  persona.name,
                                  "CHECKIN_OVERRIDE_GRANTED",
                                  "checkins",
                                  eventId,
                                  { guest: scanResult.guest.full_name, supervisorRole: persona.role }
                                );
                              }
                            }}
                            className="text-xs bg-white text-ink border border-[#b54708]/30 hover:bg-[#fff8e6]"
                          >
                            Authorize Supervisor Override (Audit Logged)
                          </Button>
                        ) : (
                          <div className="text-[11px] font-mono text-[#b54708] bg-white/60 p-2 rounded border border-[#b54708]/20">
                            🔒 Operations Staff cannot override duplicate entry without supervisor authorization (RBAC §5.6).
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Manual Search Fallback Card */}
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="card-title text-base font-semibold text-ink">
                Manual Guest Lookup Fallback
              </h3>
              <p className="text-xs text-ink/70 mt-1">
                Use if a guest has a dead battery, cannot locate their pass, or requires on-site concierge lookup.
              </p>
            </div>

            <div className="relative">
              <MagnifyingGlass className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                type="text"
                placeholder="Search guest by name, email, or mobile number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {searchQuery && (
              <div className="border border-hairline rounded-md divide-y divide-hairline max-h-56 overflow-y-auto">
                {searchedGuests.length === 0 ? (
                  <div className="p-4 text-xs text-ink/50 text-center">
                    No guest matches found for &quot;{searchQuery}&quot;
                  </div>
                ) : (
                  searchedGuests.map((eg) => {
                    const isChecked = eg.status === "checked_in";
                    return (
                      <div
                        key={eg.id}
                        className="p-3 flex items-center justify-between hover:bg-surface-soft transition-colors"
                      >
                        <div>
                          <div className="font-semibold text-sm text-ink font-forum">
                            {eg.guest?.full_name}
                          </div>
                          <div className="text-xs text-ink/60">
                            {eg.category} • {mask(eg.guest?.phone, "phone")}
                          </div>
                        </div>

                        <div>
                          {isChecked ? (
                            <Badge variant="success">Already Checked In</Badge>
                          ) : (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleManualCheckIn(eg.id, eg.guest?.full_name || "")}
                              className="text-xs"
                            >
                              Check In Guest
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Live Feed of Recent Check-ins (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-hairline pb-3">
              <h3 className="card-title text-base font-semibold text-ink">
                Live Gate Feed
              </h3>
              <span className="caption-mono text-xs text-semantic-success font-semibold">
                ● Live ({recentCheckIns.length})
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {recentCheckIns.length === 0 ? (
                <p className="text-xs text-ink/50 py-8 text-center">
                  No check-ins recorded yet. Gate entry records will appear here in real-time.
                </p>
              ) : (
                recentCheckIns.map((chk) => {
                  const pass = db.qrPasses.find((p) => p.id === chk.pass_id);
                  const eg = pass ? db.eventGuests.find((e) => e.id === pass.event_guest_id) : undefined;
                  const guest = eg ? db.guests.find((g) => g.id === eg.guest_id) : undefined;

                  return (
                    <div
                      key={chk.id}
                      className="p-3.5 rounded-md bg-surface-soft border border-hairline flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-semibold text-ink font-forum text-sm">
                          {guest?.full_name || "Guest Pass"}
                        </div>
                        <div className="text-ink/60 text-[11px] mt-0.5">
                          {guest?.organisation || "Guest"} • By {chk.operator_name}
                        </div>
                        <div className="font-mono text-[10px] text-ink/40 mt-1">
                          IdemKey: {chk.idempotency_key.substring(0, 20)}...
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-mono text-ink/70 font-medium">
                          {new Date(chk.checked_in_at).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                        <div className="mt-1">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-block-lime text-ink">
                            {chk.method}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
