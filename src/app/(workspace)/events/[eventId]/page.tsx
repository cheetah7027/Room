"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { EventItem, EventGuest, Guest, GuestCategory } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { AddGuestModal } from "@/components/guests/AddGuestModal";
import { ImportSpreadsheetModal } from "@/components/guests/ImportSpreadsheetModal";
import {
  CalendarBlank,
  MapPin,
  Users,
  QrCode,
  EnvelopeSimple,
  PaperPlaneTilt,
  Plus,
  UploadSimple,
  CheckCircle,
  Clock,
  XCircle,
  ArrowSquareOut,
  ArrowLeft,
  ShareNetwork,
  TrendUp,
} from "@phosphor-icons/react";

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [eventGuests, setEventGuests] = useState<any[]>([]);
  const [allCrmGuests, setAllCrmGuests] = useState<Guest[]>([]);
  const [isAddGuestOpen, setIsAddGuestOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<GuestCategory>("Creator");
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isSendingAll, setIsSendingAll] = useState(false);
  const [isOutboxOpen, setIsOutboxOpen] = useState(false);
  const [sentEmails, setSentEmails] = useState<any[]>([]);

  useEffect(() => {
    refreshData();
  }, [eventId]);

  const refreshData = () => {
    const e = db.getEventById(eventId);
    if (e) {
      setEvent({ ...e });
      setEventGuests([...db.getEventGuests(eventId)]);
      setAllCrmGuests([...db.getGuests(e.organisation_id)]);
    }
  };

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="headline text-2xl text-ink">Event not found</h2>
        <Link href="/events">
          <Button variant="secondary">Back to Events</Button>
        </Link>
      </div>
    );
  }

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGuestId) return;

    db.addGuestToEvent(eventId, selectedGuestId, selectedCategory);
    setIsAddGuestOpen(false);
    setSelectedGuestId("");
    refreshData();
    showNotice("Guest added to event guestlist.");
  };

  const handleSendInvite = async (eventGuestId: string, channel: "email" | "whatsapp") => {
    try {
      const res = await fetch("/api/invitations/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: eventId,
          event_guest_id: eventGuestId,
          channel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showNotice(data.message || `Invitation dispatched via ${channel.toUpperCase()}`);
      } else {
        showNotice(data.error || "Failed to dispatch invitation");
      }
    } catch {
      db.sendInvitation(eventId, eventGuestId, channel);
      showNotice(`Invitation dispatched via ${channel.toUpperCase()}`);
    } finally {
      refreshData();
    }
  };

  const handleSendAllPending = async () => {
    setIsSendingAll(true);
    try {
      const res = await fetch(`/api/events/${eventId}/send-invitations`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        showNotice(data.message || `Dispatched ${data.sentCount} invitations`);
      } else {
        showNotice(data.error || "Failed to dispatch invitations");
      }
    } catch (err: any) {
      showNotice("Bulk invitation dispatch failed: " + err.message);
    } finally {
      setIsSendingAll(false);
      refreshData();
    }
  };

  const openOutbox = () => {
    setSentEmails([...db.emailOutbox]);
    setIsOutboxOpen(true);
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Filter CRM guests not yet in this event
  const existingGuestIds = new Set(eventGuests.map((eg) => eg.guest_id));
  const availableCrmGuests = allCrmGuests.filter((g) => !existingGuestIds.has(g.id));

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-8">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-md shadow-modal flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 text-sm font-medium">
          <CheckCircle className="w-4 h-4 text-block-lime" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Top Navigation Breadcrumb */}
      <div>
        <Link
          href="/events"
          className="inline-flex items-center text-xs font-mono uppercase text-ink/60 hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Events List
        </Link>
      </div>

      {/* Event Hero Cover & Header */}
      <div className="relative rounded-lg overflow-hidden border border-hairline bg-surface-soft">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={event.cover_image}
            alt={event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge variant="vvip">{event.category.toUpperCase()}</Badge>
            <Badge variant={event.status === "published" ? "success" : "warning"}>
              {event.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-canvas flex flex-col md:flex-row md:items-end justify-between gap-6 border-t border-hairline">
          <div className="space-y-2 max-w-3xl">
            <h1 className="headline text-2xl sm:text-3xl font-bold text-ink tracking-tight">
              {event.name}
            </h1>
            <p className="text-sm text-ink/70 leading-relaxed">
              {event.description}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-ink/70 pt-2">
              <span className="flex items-center gap-1">
                <CalendarBlank className="w-3.5 h-3.5 text-primary" />
                {new Date(event.start_time).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {event.venue_name}, {event.venue_city}
              </span>
              <span>•</span>
              <span>Capacity: {event.capacity}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/events/${event.id}/check-in`}>
              <Button variant="primary" size="md" className="gap-2">
                <QrCode className="w-4 h-4" />
                <span>Open Scanner</span>
              </Button>
            </Link>
            <Link href={`/events/${event.id}/analytics`}>
              <Button variant="secondary" size="md" className="gap-2">
                <TrendUp className="w-4 h-4" />
                <span>Analytics</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action Strip & Sub-navigation */}
      <div className="flex items-center justify-between border-b border-hairline pb-4">
        <div className="flex items-center space-x-6 text-sm font-medium text-ink">
          <span className="text-primary border-b-2 border-primary pb-4 font-semibold">
            Guest List ({eventGuests.length})
          </span>
          <Link
            href={`/events/${event.id}/check-in`}
            className="text-ink/60 hover:text-primary pb-4 transition-colors"
          >
            Check-in Console
          </Link>
          <Link
            href={`/events/${event.id}/analytics`}
            className="text-ink/60 hover:text-primary pb-4 transition-colors"
          >
            Event Intelligence
          </Link>
          <Link
            href={`/events/${event.id}/content`}
            className="text-ink/60 hover:text-primary pb-4 transition-colors"
          >
            Content Tracking (P1)
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={openOutbox}
            className="gap-1.5"
          >
            <EnvelopeSimple className="w-4 h-4" />
            <span>Email Outbox ({db.emailOutbox.length})</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={isSendingAll || eventGuests.length === 0}
            onClick={handleSendAllPending}
            className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
          >
            <PaperPlaneTilt className="w-4 h-4" />
            <span>{isSendingAll ? "Dispatching..." : "Dispatch All Invitations"}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddGuestOpen(true)}
            className="gap-1.5"
          >
            <Users className="w-4 h-4 text-ink/70" />
            <span>Select from CRM</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
          >
            <UploadSimple className="w-4 h-4" />
            <span>Bulk Import (Excel / CSV)</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsManualModalOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Guest Manually</span>
          </Button>
        </div>
      </div>

      {/* Guest Table */}
      <Card className="p-0 overflow-hidden border border-hairline">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-soft text-[11px] font-mono uppercase text-ink/70 border-b border-hairline">
              <tr>
                <th className="px-6 py-3.5">Guest &amp; Organisation</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">RSVP Status</th>
                <th className="px-6 py-3.5">Invitation / Channel</th>
                <th className="px-6 py-3.5">QR Pass</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {eventGuests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                        <Users className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-ink text-base">No guests on this guestlist yet</h4>
                        <p className="text-xs text-ink/60">
                          Add individual attendees manually, bulk import from an Excel (.xlsx / .csv) spreadsheet, or select from your existing CRM contacts.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => setIsManualModalOpen(true)}
                          className="gap-1.5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Guest Manually</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setIsImportModalOpen(true)}
                          className="gap-1.5 text-primary border-primary/30"
                        >
                          <UploadSimple className="w-4 h-4" />
                          <span>Bulk Import Excel / CSV</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setIsAddGuestOpen(true)}
                          className="gap-1.5"
                        >
                          <span>Select from CRM</span>
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                eventGuests.map((eg) => {
                  const guest = eg.guest;
                  const invitation = eg.invitation;
                  const qrPass = eg.qr_pass;
                  const isCheckedIn = eg.status === "checked_in";

                  return (
                    <tr key={eg.id} className="hover:bg-surface-soft/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-ink font-sans">
                          {guest?.full_name || "Unknown"}
                        </div>
                        <div className="text-xs text-ink/60 mt-0.5">
                          {guest?.organisation || "Guest"} • {guest?.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            eg.category === "VVIP"
                              ? "vvip"
                              : eg.category === "VIP"
                              ? "vip"
                              : eg.category === "Creator"
                              ? "creator"
                              : eg.category === "Media"
                              ? "media"
                              : "default"
                          }
                        >
                          {eg.category}
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-semantic-success">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Checked In
                          </span>
                        ) : eg.status === "confirmed" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-semantic-success">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Accepted (Confirmed)
                          </span>
                        ) : eg.status === "declined" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#b42318]">
                            <XCircle className="w-3.5 h-3.5" />
                            Declined
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-ink/60">
                            <Clock className="w-3.5 h-3.5" />
                            Awaiting Response
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {invitation ? (
                          <div className="space-y-1">
                            <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-surface-soft text-ink/80 border border-hairline inline-block">
                              {invitation.channel} • {invitation.status}
                            </span>
                            <div className="text-[11px] text-ink/50">
                              <Link
                                href={`/invite/${invitation.secure_token}`}
                                target="_blank"
                                className="text-primary hover:underline inline-flex items-center gap-1"
                              >
                                <span>Guest RSVP Link</span>
                                <ArrowSquareOut className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-ink/40 font-mono">Not sent</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {qrPass ? (
                          <div className="space-y-1">
                            <span className="font-mono text-xs text-ink font-semibold">
                              {qrPass.secure_token}
                            </span>
                            <div>
                              <Link
                                href={`/pass/${qrPass.secure_token}`}
                                target="_blank"
                                className="text-xs text-primary hover:underline inline-flex items-center gap-1"
                              >
                                <span>View QR Pass</span>
                                <ArrowSquareOut className="w-3 h-3" />
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-ink/40">Generated on RSVP</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right space-x-2">
                        {!invitation ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSendInvite(eg.id, "email")}
                            className="gap-1 text-xs"
                          >
                            <EnvelopeSimple className="w-3 h-3" />
                            <span>Send Email</span>
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSendInvite(eg.id, "whatsapp")}
                            className="text-xs text-ink/60 hover:text-ink"
                            title="Resend WhatsApp Invite"
                          >
                            <PaperPlaneTilt className="w-3 h-3 mr-1" />
                            Resend
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Guest Modal */}
      <Modal
        isOpen={isAddGuestOpen}
        onClose={() => setIsAddGuestOpen(false)}
        title="Add Guest to Event"
        description="Select an existing contact from your organisation CRM and set their event-specific access category."
      >
        <form onSubmit={handleAddGuest} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-ink/70">
              Select Guest *
            </label>
            <Select
              required
              value={selectedGuestId}
              onChange={(e) => setSelectedGuestId(e.target.value)}
              containerClassName="w-full"
              className="w-full text-sm py-2.5"
            >
              <option value="">-- Choose contact --</option>
              {availableCrmGuests.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.full_name} ({g.category} • {g.organisation || g.city})
                </option>
              ))}
            </Select>
            {availableCrmGuests.length === 0 && (
              <p className="text-xs text-[#b54708]">
                All current CRM guests are already added to this event. Add new guests in Guest CRM.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-ink/70">
              Event Access Category *
            </label>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as GuestCategory)}
              containerClassName="w-full"
              className="w-full text-sm py-2.5"
            >
              <option value="Creator">Creator</option>
              <option value="VVIP">VVIP</option>
              <option value="VIP">VIP</option>
              <option value="Media">Media</option>
              <option value="Brand Partner">Brand Partner</option>
              <option value="General">General</option>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddGuestOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!selectedGuestId}
            >
              Add to Guestlist
            </Button>
          </div>
        </form>
      </Modal>

      {/* Email Outbox & Verifiable Delivery Modal */}
      <Modal
        isOpen={isOutboxOpen}
        onClose={() => setIsOutboxOpen(false)}
        title="Email Gateway & Outbox Log"
        description="Inspect dispatched transactional invitation and QR pass confirmation emails."
        maxWidth="xl"
      >
        <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
          {sentEmails.length === 0 ? (
            <div className="p-8 text-center text-xs text-ink/60">
              No emails dispatched yet. Click &quot;Dispatch All Invitations&quot; or send an individual invite.
            </div>
          ) : (
            sentEmails.map((eml) => (
              <div
                key={eml.id}
                className="p-4 rounded-md border border-hairline bg-surface-soft/40 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink text-sm">{eml.to}</span>
                  <Badge variant="success">{eml.status.toUpperCase()} • {eml.provider}</Badge>
                </div>
                <div className="text-ink/80 font-medium">{eml.subject}</div>
                <div className="text-ink/50 font-mono text-[10px]">
                  ID: {eml.id} • Sent: {new Date(eml.sent_at).toLocaleTimeString("en-IN")}
                </div>
                {eml.metadata?.secureToken && (
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href={`/invite/${eml.metadata.secureToken}`}
                      target="_blank"
                      className="text-primary hover:underline text-[11px] font-mono flex items-center gap-1"
                    >
                      <span>Open Guest Invitation URL</span>
                      <ArrowSquareOut className="w-3 h-3" />
                    </Link>
                  </div>
                )}
                {eml.metadata?.passToken && (
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      href={`/pass/${eml.metadata.passToken}`}
                      target="_blank"
                      className="text-semantic-success hover:underline text-[11px] font-mono flex items-center gap-1"
                    >
                      <span>Open Guest Digital QR Pass</span>
                      <ArrowSquareOut className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Manual Guest Creation Modal */}
      <AddGuestModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        eventId={eventId}
        onSuccess={(guest) => {
          refreshData();
          showNotice(`Added ${guest.full_name} to guestlist & CRM.`);
        }}
      />

      {/* Bulk Spreadsheet (Excel / CSV) Import Modal */}
      <ImportSpreadsheetModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        eventId={eventId}
        onSuccess={(count) => {
          refreshData();
          showNotice(`Successfully imported ${count} guests to event & CRM.`);
        }}
      />
    </div>
  );
}
