"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { EventStatus } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { RoomLoading } from "@/components/ui/RoomLoading";
import { ArrowLeft, Sparkle, Image as ImageIcon } from "@phosphor-icons/react";

export default function NewEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Brand Launch" as const,
    start_time: "2026-12-10T19:00",
    end_time: "2026-12-10T23:30",
    timezone: "Asia/Kolkata",
    venue_name: "",
    venue_city: "Bengaluru",
    venue_address: "",
    capacity: 100,
    visibility: "invitation_only" as const,
    cover_image:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
    status: "published" as EventStatus,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const created = db.createEvent({
      organisation_id: db.organisation.id,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: new Date(formData.end_time).toISOString(),
      timezone: formData.timezone,
      venue_name: formData.venue_name,
      venue_city: formData.venue_city,
      venue_address: formData.venue_address,
      capacity: Number(formData.capacity),
      visibility: formData.visibility,
      cover_image: formData.cover_image,
      status: formData.status,
    });

    setTimeout(() => {
      setLoading(false);
      router.push(`/events/${created.id}`);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-10 py-10 space-y-8">
      <div>
        <Link
          href="/events"
          className="inline-flex items-center text-xs font-mono uppercase text-ink/60 hover:text-primary transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back to Events
        </Link>
        <h1 className="headline text-3xl font-semibold text-ink">
          Create New Event
        </h1>
        <p className="text-sm text-ink/70 mt-1">
          Define activation details, venue schedule, capacity controls, and access tiers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="space-y-5">
          <h3 className="card-title text-lg font-semibold text-ink border-b border-hairline pb-3">
            1. Core Details
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-ink/70">
              Event Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AURA SS26 Sanctuary Launch"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-canvas border border-hairline rounded-md text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-ink/70">
              Description &amp; Objective
            </label>
            <textarea
              rows={3}
              placeholder="Provide context, dress code, brand theme, and creator brief..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2.5 bg-canvas border border-hairline rounded-md text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-ink/70">
                Activation Category
              </label>
              <Select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as any,
                  })
                }
                containerClassName="w-full"
                className="w-full text-sm py-2.5"
              >
                <option value="Brand Launch">Brand Launch</option>
                <option value="Influencer Activation">Influencer Activation</option>
                <option value="Networking Experience">Networking Experience</option>
                <option value="Private Showcase">Private Showcase</option>
                <option value="Pop-up">Pop-up</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-ink/70">
                Initial Status
              </label>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as any,
                  })
                }
                containerClassName="w-full"
                className="w-full text-sm py-2.5"
              >
                <option value="published">Published (Ready for Invites)</option>
                <option value="draft">Draft (Planning)</option>
              </Select>
            </div>
          </div>
        </Card>

        <Card className="space-y-5">
          <h3 className="card-title text-lg font-semibold text-ink border-b border-hairline pb-3">
            2. Venue &amp; Schedule
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-ink/70">
                Start Date &amp; Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.start_time}
                onChange={(e) =>
                  setFormData({ ...formData, start_time: e.target.value })
                }
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
              </input>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-ink/70">
                End Date &amp; Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.end_time}
                onChange={(e) =>
                  setFormData({ ...formData, end_time: e.target.value })
                }
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
              </input>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-xs font-mono uppercase text-ink/70">
                Venue Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. The Leela Palace, Soho House, Olive"
                value={formData.venue_name}
                onChange={(e) =>
                  setFormData({ ...formData, venue_name: e.target.value })
                }
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-ink/70">
                City *
              </label>
              <Select
                value={formData.venue_city}
                onChange={(e) =>
                  setFormData({ ...formData, venue_city: e.target.value })
                }
                containerClassName="w-full"
                className="w-full text-sm"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Goa">Goa</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-ink/70">
              Full Physical Address
            </label>
            <input
              type="text"
              placeholder="e.g. 23 HAL Old Airport Rd, Kodihalli, Bengaluru"
              value={formData.venue_address}
              onChange={(e) =>
                setFormData({ ...formData, venue_address: e.target.value })
              }
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </Card>

        <Card className="space-y-5">
          <h3 className="card-title text-lg font-semibold text-ink border-b border-hairline pb-3">
            3. Capacity &amp; Aesthetics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-ink/70">
                Target Capacity
              </label>
              <input
                type="number"
                min={1}
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: Number(e.target.value) })
                }
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase text-ink/70">
                Access Visibility
              </label>
              <Select
                value={formData.visibility}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    visibility: e.target.value as any,
                  })
                }
                containerClassName="w-full"
                className="w-full text-sm"
              >
                <option value="invitation_only">Invitation-Only (Strict Pass)</option>
                <option value="public">Public Registration</option>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono uppercase text-ink/70">
              Cover Image URL
            </label>
            <input
              type="url"
              value={formData.cover_image}
              onChange={(e) =>
                setFormData({ ...formData, cover_image: e.target.value })
              }
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </Card>

        {/* 4. Access Tiers & Guest Categories */}
        <Card className="space-y-5">
          <h3 className="card-title text-lg font-semibold text-ink border-b border-hairline pb-3">
            4. Access Tiers &amp; Admitted Categories
          </h3>
          <p className="text-xs text-ink/70">
            Configure permitted guest tiers for invitations, badge generation, and scanner verification.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { id: "Creator", label: "Creators & Influencers" },
              { id: "VIP", label: "VIP Guests" },
              { id: "VVIP", label: "VVIP & Executives" },
              { id: "Brand Partner", label: "Brand Partners" },
              { id: "Media", label: "Press & Media" },
              { id: "General", label: "General Admission" },
            ].map((tier) => (
              <label
                key={tier.id}
                className="flex items-center gap-2.5 p-3 rounded-md border border-hairline bg-surface-soft/40 cursor-pointer hover:bg-surface-soft transition-colors"
              >
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-hairline text-primary focus:ring-primary/30"
                />
                <span className="text-xs font-medium text-ink">{tier.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* 5. Operational Team Assignment */}
        <Card className="space-y-5">
          <h3 className="card-title text-lg font-semibold text-ink border-b border-hairline pb-3">
            5. Operations &amp; Team Assignment
          </h3>
          <p className="text-xs text-ink/70">
            Assign workspace team members responsible for execution, creator communication, and gate security.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-ink/70">
                Lead Event Producer
              </label>
              <Select defaultValue="arjun" containerClassName="w-full" className="w-full text-xs">
                <option value="arjun">Arjun Roy (Lead Producer)</option>
                <option value="rahul">Rahul Mehta (Executive Producer)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-ink/70">
                Brand Marketing Lead
              </label>
              <Select defaultValue="priya" containerClassName="w-full" className="w-full text-xs">
                <option value="priya">Priya Sharma (Brand Manager)</option>
                <option value="meera">Meera Sen (Account Director)</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-ink/70">
                Gate Check-in Supervisor
              </label>
              <Select defaultValue="karan" containerClassName="w-full" className="w-full text-xs">
                <option value="karan">Karan Verma (Operations Gate Lead)</option>
                <option value="vikram">Vikram Rathore (Field Operations)</option>
              </Select>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-hairline">
          <Link href="/events">
            <Button type="button" variant="ghost" className="text-xs">
              Cancel &amp; Return
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => {
                setFormData({ ...formData, status: "draft" });
                const form = document.querySelector("form");
                if (form) form.requestSubmit();
              }}
              className="text-xs"
            >
              Save as Draft
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              onClick={() => setFormData({ ...formData, status: "published" })}
              className="gap-2 text-xs"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <RoomLoading size="xs" />
                  <span>Processing...</span>
                </span>
              ) : (
                <>
                  <Sparkle className="w-4 h-4" />
                  <span>Publish &amp; Proceed to Guestlist</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
