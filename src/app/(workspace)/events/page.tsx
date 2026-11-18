"use client";

import React, { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { EventItem, EventStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  CalendarBlank,
  MapPin,
  Users,
  Plus,
  MagnifyingGlass,
  Funnel,
  Copy,
  ArrowRight,
  QrCode,
  TrendUp,
} from "@phosphor-icons/react";

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>(() => db.getEvents(db.organisation.id));
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = events.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.venue_city.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const dup = db.duplicateEvent(id);
    if (dup) {
      setEvents([...db.getEvents(db.organisation.id)]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <span className="caption-mono text-primary font-semibold">
            Module B • Event Management
          </span>
          <h1 className="headline text-3xl font-semibold text-ink mt-1">
            Organised Events
          </h1>
          <p className="text-sm text-ink/70 mt-1">
            Manage invitations, gate entry, access tiers, and post-event creator performance.
          </p>
        </div>

        <Link href="/events/new">
          <Button variant="primary" size="md" className="gap-2">
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </Button>
        </Link>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            placeholder="Search by event title, city or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-mono uppercase text-ink/60 mr-1 hidden sm:inline">
            Status:
          </span>
          {["all", "published", "ongoing", "completed", "draft", "cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-pill text-xs font-medium uppercase tracking-wider transition-all ${
                statusFilter === st
                  ? "bg-primary text-white"
                  : "bg-surface-soft text-ink hover:bg-hairline"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((evt) => {
          const an = db.getEventAnalytics(evt.id);
          const checkedIn = an.actualAttendance;
          const confirmed = an.acceptedCount;

          return (
            <Card
              key={evt.id}
              className="flex flex-col justify-between overflow-hidden p-0 border border-hairline group hover:border-ink/40 transition-all"
            >
              <div className="relative h-44 w-full bg-surface-soft overflow-hidden">
                <img
                  src={evt.cover_image}
                  alt={evt.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex gap-2">
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
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-mono uppercase bg-black/60 text-white backdrop-blur-sm">
                    {evt.category}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="card-title text-xl text-ink font-semibold group-hover:text-primary transition-colors line-clamp-1">
                    {evt.name}
                  </h3>
                  <p className="text-xs text-ink/70 mt-2 line-clamp-2 leading-relaxed">
                    {evt.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-hairline text-xs text-ink/80">
                  <div className="flex items-center gap-2">
                    <CalendarBlank className="w-3.5 h-3.5 text-primary" />
                    <span>
                      {new Date(evt.start_time).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="truncate">{evt.venue_name}, {evt.venue_city}</span>
                  </div>
                  <div className="flex items-center justify-between text-ink/60 pt-1 font-mono text-[11px]">
                    <span>Confirmed: {confirmed} / {evt.capacity}</span>
                    <span>Checked-in: {checkedIn}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-hairline flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => handleDuplicate(evt.id, e)}
                    title="Duplicate Event"
                    className="p-2 rounded-full hover:bg-surface-soft text-ink/60 hover:text-ink transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <Link href={`/events/${evt.id}/check-in`}>
                      <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Scan</span>
                      </Button>
                    </Link>
                    <Link href={`/events/${evt.id}`}>
                      <Button variant="primary" size="sm" className="gap-1 text-xs">
                        <span>Manage</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
