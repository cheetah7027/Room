"use client";

import React from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, ColorBlock } from "@/components/ui/Card";
import {
  CalendarBlank,
  Users,
  QrCode,
  Sparkle,
  TrendUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  ArrowSquareOut,
} from "@phosphor-icons/react";

export default function DashboardPage() {
  const org = db.organisation;
  const events = db.getEvents(org.id);
  const guests = db.getGuests(org.id);
  const creators = db.getCreators(org.id);
  const auditLogs = db.auditLogs.slice(0, 5);

  // Active flagship event
  const activeEvent = events[0];
  const analytics = activeEvent ? db.getEventAnalytics(activeEvent.id) : null;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-12">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-hairline">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="caption-mono text-primary font-semibold">
              Agency Workspace • {org.name}
            </span>
            <span className="text-hairline">|</span>
            <span className="caption-mono text-ink/70">Plan: {org.plan}</span>
            <span className="text-hairline">|</span>
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-block-lime/60 text-ink font-bold">
              Pilot Sandbox Mode
            </span>
          </div>
          <h1 className="display-lg text-ink tracking-tight">
            Event operations &amp; <br />
            creator intelligence.
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/guests">
            <Button variant="secondary" size="md">
              <Users className="w-4 h-4 mr-2" />
              Manage Guests
            </Button>
          </Link>
          <Link href="/events/new">
            <Button variant="primary" size="md">
              <Sparkle className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Signature Color-Block Hero Section (Periwinkle: #adbaff) */}
      {activeEvent && (
        <div className="bg-block-lilac text-ink rounded-lg p-8 md:p-12 transition-all">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 mb-3">
              <Badge variant="vvip">FLAGSHIP ACTIVATION</Badge>
              <span className="text-xs font-mono uppercase tracking-wider text-ink font-semibold">
                {activeEvent.category} • {activeEvent.venue_city}
              </span>
            </div>
            <h2 className="display-xl text-ink font-normal mb-4">
              {activeEvent.name}
            </h2>
            <p className="text-lg text-ink/80 mb-8 font-normal leading-relaxed">
              {activeEvent.description}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href={`/events/${activeEvent.id}/check-in`}>
                <Button variant="primary" size="md" className="gap-2">
                  <QrCode className="w-4 h-4" />
                  <span>Launch QR Check-in</span>
                </Button>
              </Link>
              <Link href={`/events/${activeEvent.id}`}>
                <Button variant="secondary" size="md" className="gap-2 bg-white">
                  <span>Manage Guest List &amp; Invites</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href={`/events/${activeEvent.id}/analytics`}>
                <Button variant="secondary" size="md" className="gap-2 bg-white">
                  <span>View Live Metrics</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Key Metric Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-ink/60 mb-2">
              <span className="caption-mono">Total Guests CRM</span>
              <Users className="w-4 h-4 text-ink/40" />
            </div>
            <div className="text-4xl font-semibold tracking-tight text-ink font-sans">
              {guests.length}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-xs text-ink/70">
            <span>Deduplicated contacts</span>
            <Link href="/guests" className="text-primary hover:underline font-medium">
              View CRM →
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-ink/60 mb-2">
              <span className="caption-mono">RSVP Acceptance</span>
              <CheckCircle className="w-4 h-4 text-semantic-success" />
            </div>
            <div className="text-4xl font-semibold tracking-tight text-ink font-sans">
              {analytics ? `${analytics.acceptanceRate}%` : "80%"}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-xs text-ink/70">
            <span>{analytics?.acceptedCount || 0} Confirmed Attendees</span>
            <span className="text-semantic-success font-medium">High Intent</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-ink/60 mb-2">
              <span className="caption-mono">Gate Idempotency</span>
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="text-3xl font-semibold tracking-tight text-ink font-sans">
              Active
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-xs text-ink/70">
            <span>Cryptographic pass hashing</span>
            <span className="font-mono text-[11px] text-semantic-success font-medium">● Enforced</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-ink/60 mb-2">
              <span className="caption-mono">Creator CRM Network</span>
              <TrendUp className="w-4 h-4 text-ink/40" />
            </div>
            <div className="text-4xl font-semibold tracking-tight text-ink font-sans">
              {creators.length}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-xs text-ink/70">
            <span>Profiles with provenance</span>
            <Link href="/creators" className="text-primary hover:underline font-medium">
              Explore →
            </Link>
          </div>
        </Card>
      </div>

      {/* Second Color Block Section: Light Gold (#fff49d) - Operational Workflow */}
      <div className="bg-block-lime text-ink rounded-lg p-8 md:p-12 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="caption-mono text-ink font-bold">
              Operational Workflow • Automated RSVP &amp; Check-in
            </span>
            <h3 className="headline text-2xl font-semibold mt-2 mb-3">
              Automated invitation lifecycles &amp; instant gate entry.
            </h3>
            <p className="text-ink/80 text-base leading-relaxed">
              ROOM centralises your guest relationships across WhatsApp and Email. Guests receive an unguessable token link to view details and RSVP; upon confirmation, a cryptographically signed QR pass is generated instantly for scanning on event day.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/events">
              <Button variant="secondary" className="w-full sm:w-auto bg-white">
                View All Events
              </Button>
            </Link>
            <Link href="/guests">
              <Button variant="primary" className="w-full sm:w-auto">
                Import CSV Guestlist
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Events List & Recent Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Events */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="card-title text-xl text-ink font-sans font-bold">
              Upcoming &amp; Managed Events
            </h3>
            <Link href="/events" className="text-sm font-medium text-primary hover:underline">
              See all ({events.length})
            </Link>
          </div>

          <div className="space-y-4">
            {events.map((evt) => (
              <Card key={evt.id} className="p-5 hover:border-ink/40 transition-all">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          evt.status === "published"
                            ? "success"
                            : evt.status === "completed"
                            ? "default"
                            : "warning"
                        }
                      >
                        {evt.status.toUpperCase()}
                      </Badge>
                      <span className="text-xs font-mono uppercase text-ink/60">
                        {evt.category}
                      </span>
                    </div>
                    <Link
                      href={`/events/${evt.id}`}
                      className="text-lg font-semibold text-ink hover:text-primary transition-colors block"
                    >
                      {evt.name}
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-ink/70">
                      <span className="flex items-center gap-1">
                        <CalendarBlank className="w-3.5 h-3.5" />
                        {new Date(evt.start_time).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span>{evt.venue_city}</span>
                      <span>•</span>
                      <span>Cap: {evt.capacity}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <Link href={`/events/${evt.id}/check-in`}>
                      <Button variant="secondary" size="sm" className="gap-1.5">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Scan</span>
                      </Button>
                    </Link>
                    <Link href={`/events/${evt.id}`}>
                      <Button variant="primary" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Audit Trail & Security */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="card-title text-xl text-ink font-sans font-bold">
              Security &amp; Audit Logs
            </h3>
            <span className="caption-mono text-xs text-primary font-semibold">
              Live
            </span>
          </div>

          <Card className="p-5 space-y-4">
            <p className="text-xs text-ink/60 leading-relaxed">
              Every invitation dispatch, role modification, guest check-in, and export is recorded in the verified system audit log.
            </p>

            <div className="space-y-3 pt-2">
              {auditLogs.map((log) => (
                <div key={log.id} className="text-xs border-b border-hairline pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between font-mono text-[11px] text-ink font-medium">
                    <span className="text-primary">{log.action}</span>
                    <span className="text-ink/40">
                      {new Date(log.created_at).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="text-ink/70 mt-1">
                    By {log.actor_name} on <span className="font-mono text-ink/90">{log.resource_type}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Third Color Block: Navy (#2b3364) */}
          <div className="bg-block-navy text-white rounded-lg p-6 space-y-4">
            <span className="caption-mono text-white/70 text-xs">
              Live Event Day Contingency
            </span>
            <h4 className="headline text-lg font-semibold text-white">
              High-Availability Check-in
            </h4>
            <p className="text-xs text-white/80 leading-relaxed">
              If venue Wi-Fi falters, staff can utilize instant manual lookup by name, phone or VIP category with built-in idempotent conflict resolution.
            </p>
            <Link href={`/events/${activeEvent.id}/check-in`} className="inline-block">
              <Button variant="promo" size="sm" className="bg-white text-ink hover:bg-surface-soft">
                Test Scanner Mode
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
