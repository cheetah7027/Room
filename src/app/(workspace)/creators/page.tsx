"use client";

import React, { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Creator, EventItem } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, ColorBlock } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Sparkle,
  MagnifyingGlass,
  Funnel,
  Plus,
  MapPin,
  InstagramLogo,
  YoutubeLogo,
  LinkedinLogo,
  CheckCircle,
  TrendUp,
  CalendarBlank,
  ArrowSquareOut,
} from "@phosphor-icons/react";

export default function CreatorCrmPage() {
  const { can } = useAuth();
  const [creators, setCreators] = useState<Creator[]>(() => db.getCreators(db.organisation.id));
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedCreatorForInvite, setSelectedCreatorForInvite] = useState<Creator | null>(null);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const events = db.getEvents(db.organisation.id).filter((e) => e.status !== "completed");

  const [formData, setFormData] = useState({
    name: "",
    handle: "",
    profile_image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    location: "Bengaluru",
    categories: "Fashion, Lifestyle",
    languages: "English, Hindi",
    audience_size: "150,000",
    engagement_rate: "4.5%",
    primary_platform: "Instagram" as const,
    notes: "High aesthetic brand alignment.",
  });

  const refreshCreators = () => {
    setCreators([...db.getCreators(db.organisation.id)]);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddCreator = (e: React.FormEvent) => {
    e.preventDefault();
    const created = db.createCreator({
      organisation_id: db.organisation.id,
      name: formData.name,
      handle: formData.handle.startsWith("@") ? formData.handle : `@${formData.handle}`,
      profile_image: formData.profile_image,
      location: formData.location,
      categories: formData.categories.split(",").map((c) => c.trim()),
      languages: formData.languages.split(",").map((l) => l.trim()),
      audience_size: formData.audience_size,
      engagement_rate: formData.engagement_rate,
      primary_platform: formData.primary_platform,
      social_links: {
        instagram: `https://instagram.com/${formData.handle.replace("@", "")}`,
      },
      collaboration_count: 1,
      average_sentiment: "High",
      notes: formData.notes,
      is_verified: true,
    });

    setIsAddOpen(false);
    refreshCreators();
    showToast(`Creator ${created.name} added to CRM.`);
  };

  const handleInviteToEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCreatorForInvite || !selectedEventId) return;

    // Check if creator exists in CRM guests
    let guest = db.guests.find((g) => g.email.toLowerCase().includes(selectedCreatorForInvite.handle.replace("@", "").toLowerCase()));
    if (!guest) {
      guest = db.createGuest({
        organisation_id: db.organisation.id,
        full_name: selectedCreatorForInvite.name,
        email: `${selectedCreatorForInvite.handle.replace("@", "")}@creators.room`,
        phone: "+91 98000 00000",
        city: selectedCreatorForInvite.location,
        organisation: selectedCreatorForInvite.handle,
        category: "Creator",
        tags: selectedCreatorForInvite.categories,
        relationship_owner: "Rahul Mehta",
        social_links: selectedCreatorForInvite.social_links,
        communication_preferences: { email: true, whatsapp: true },
      });
    }

    const eg = db.addGuestToEvent(selectedEventId, guest.id, "Creator");
    db.sendInvitation(selectedEventId, eg.id, "email");

    setIsInviteOpen(false);
    setSelectedCreatorForInvite(null);
    setSelectedEventId("");
    showToast(`Invited ${guest.full_name} to event.`);
  };

  const filtered = creators.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      c.name.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q) ||
      c.categories.some((cat) => cat.toLowerCase().includes(q));
    const matchCity = selectedCity === "all" || c.location === selectedCity;
    const matchCat =
      selectedCategory === "all" ||
      c.categories.some((cat) => cat.toLowerCase() === selectedCategory.toLowerCase());
    return matchSearch && matchCity && matchCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-md shadow-modal flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 text-sm font-medium">
          <CheckCircle className="w-4 h-4 text-block-lime" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <div className="flex items-center gap-2">
            <span className="caption-mono text-primary font-semibold">
              Module D • Creator Relationship Management
            </span>
            <Badge variant="creator">P1 CORE</Badge>
          </div>
          <h1 className="headline text-3xl font-bold text-ink tracking-tight mt-1">
            Creator Directory &amp; Talent CRM
          </h1>
          <p className="text-sm text-ink/70 mt-1">
            Discover relevant creators, maintain relationship history, verified engagement rates, and send direct event invitations.
          </p>
        </div>

        {can("creators.create") && (
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Creator Profile</span>
          </Button>
        )}
      </div>

      {/* Signature Color Block Highlight (Light Gold: #fff49d) */}
      <div className="bg-block-lime text-ink rounded-lg p-8 transition-all">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge variant="vvip">BRAND MARKETING CONCIERGE</Badge>
            <h3 className="headline text-xl font-bold">
              Targeted Creator Matching for D2C &amp; Luxury Activations
            </h3>
            <p className="text-sm text-ink/80 leading-relaxed">
              Find creators who match your target audience, not just vanity follower counts. ROOM tracks past attendance reliability, content velocity, and average audience sentiment.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase text-ink/70">
              Verified Profiles: {creators.length}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            placeholder="Search by creator name, Instagram handle, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
          >
            <option value="all">All Cities</option>
            <option value="Bengaluru">Bengaluru</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Delhi">Delhi</option>
          </Select>

          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="Fashion">Fashion</option>
            <option value="Beauty">Beauty</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Cinematography">Cinematography</option>
            <option value="Tech">Tech</option>
          </Select>
        </div>
      </div>

      {/* Creator Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((creator) => (
          <Card
            key={creator.id}
            className="p-6 flex flex-col justify-between space-y-5 hover:border-ink/40 transition-all"
          >
            <div>
              <div className="flex items-start gap-4">
                <img
                  src={creator.profile_image}
                  alt={creator.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-hairline flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-lg text-ink font-sans truncate">
                      {creator.name}
                    </h3>
                    {creator.is_verified && (
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs font-mono text-primary font-medium">
                    {creator.handle}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-ink/60 mt-1">
                    <MapPin className="w-3 h-3 text-ink/40" />
                    <span>{creator.location}</span>
                  </div>
                </div>
              </div>

              {creator.notes && (
                <p className="text-xs text-ink/70 mt-3 line-clamp-2 italic border-l-2 border-hairline pl-2.5">
                  &ldquo;{creator.notes}&rdquo;
                </p>
              )}

              {/* Stats Box */}
              <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-surface-soft rounded-md text-center text-xs">
                <div>
                  <div className="font-bold text-ink text-sm">
                    {creator.audience_size}
                  </div>
                  <div className="text-[10px] text-ink/60 uppercase">Audience</div>
                </div>
                <div>
                  <div className="font-bold text-primary text-sm">
                    {creator.engagement_rate}
                  </div>
                  <div className="text-[10px] text-ink/60 uppercase">Eng. Rate</div>
                </div>
                <div>
                  <div className="font-bold text-ink text-sm">
                    {creator.collaboration_count}
                  </div>
                  <div className="text-[10px] text-ink/60 uppercase">Events</div>
                </div>
              </div>

              {/* Tags & Languages */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {creator.categories.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-block-lilac/50 text-ink"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-hairline flex items-center justify-between">
              <span className="text-[11px] font-mono text-ink/50 uppercase">
                Languages: {creator.languages.join(", ")}
              </span>

              {can("invitations.send") && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedCreatorForInvite(creator);
                    setIsInviteOpen(true);
                  }}
                  className="text-xs gap-1"
                >
                  <CalendarBlank className="w-3 h-3" />
                  <span>Invite to Event</span>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Add Creator Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Creator to Directory"
        description="Store verified social credentials, location, and audience reach."
      >
        <form onSubmit={handleAddCreator} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Creator Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Komal Pandey"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Primary Handle *
              </label>
              <input
                type="text"
                required
                placeholder="@handle"
                value={formData.handle}
                onChange={(e) =>
                  setFormData({ ...formData, handle: e.target.value })
                }
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                City / Location
              </label>
              <Select
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                containerClassName="w-full"
                className="w-full text-sm"
              >
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Goa">Goa</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Audience Size
              </label>
              <input
                type="text"
                placeholder="e.g. 250,000"
                value={formData.audience_size}
                onChange={(e) =>
                  setFormData({ ...formData, audience_size: e.target.value })
                }
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Engagement Rate
              </label>
              <input
                type="text"
                placeholder="e.g. 5.2%"
                value={formData.engagement_rate}
                onChange={(e) =>
                  setFormData({ ...formData, engagement_rate: e.target.value })
                }
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Categories (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Sustainable Fashion, Clean Beauty"
              value={formData.categories}
              onChange={(e) =>
                setFormData({ ...formData, categories: e.target.value })
              }
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Internal Collaboration Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Creator
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invite to Event Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title={`Invite ${selectedCreatorForInvite?.name} to Event`}
        description="Select an active event. ROOM will automatically generate a secure bearer invitation token."
      >
        <form onSubmit={handleInviteToEvent} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Select Event *
            </label>
            <Select
              required
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              containerClassName="w-full"
              className="w-full text-sm py-2.5"
            >
              <option value="">-- Choose Event --</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.venue_city} • {new Date(e.start_time).toLocaleDateString("en-IN")})
                </option>
              ))}
            </Select>
          </div>

          <div className="p-4 bg-surface-soft rounded-md text-xs space-y-1 text-ink/80">
            <div><strong>Creator:</strong> {selectedCreatorForInvite?.name} ({selectedCreatorForInvite?.handle})</div>
            <div><strong>Category:</strong> Creator Access Pass</div>
            <div><strong>Channel:</strong> Transactional Email + WhatsApp notification</div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!selectedEventId}
            >
              Send Invitation Pass
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
