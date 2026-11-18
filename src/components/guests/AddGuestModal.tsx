"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { db } from "@/lib/db";
import { Guest, GuestCategory } from "@/types";
import { Sparkle, User, EnvelopeSimple, Phone, Buildings, MapPin, Tag } from "@phosphor-icons/react";

interface AddGuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
  onSuccess: (guest: Guest) => void;
}

export function AddGuestModal({
  isOpen,
  onClose,
  eventId,
  onSuccess,
}: AddGuestModalProps) {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "Bengaluru",
    organisation: "",
    category: "Creator" as GuestCategory,
    tags: "VIP, BrandExperience",
    notes: "",
    relationship_owner: "Rahul Mehta",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email) return;

    setIsSubmitting(true);
    try {
      const createdGuest = db.createGuest({
        organisation_id: db.organisation.id,
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        city: formData.city,
        organisation: formData.organisation.trim(),
        category: formData.category,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        notes: formData.notes.trim(),
        relationship_owner: formData.relationship_owner,
        social_links: {},
        communication_preferences: { email: true, whatsapp: true },
      });

      if (eventId) {
        db.addGuestToEvent(eventId, createdGuest.id, formData.category);
      }

      onSuccess(createdGuest);
      onClose();
      // Reset form
      setFormData({
        full_name: "",
        email: "",
        phone: "",
        city: "Bengaluru",
        organisation: "",
        category: "Creator",
        tags: "VIP, BrandExperience",
        notes: "",
        relationship_owner: "Rahul Mehta",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={eventId ? "Add Guest to Event & CRM" : "Add New Guest to CRM"}
      description={
        eventId
          ? "Add an attendee manually. They will be registered in your CRM and immediately added to this event's guest list."
          : "Add an individual creator, brand partner, VIP, or media contact to your persistent CRM database."
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-ink/70 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary" />
            <span>Full Name *</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Ananya Pandey"
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            className="w-full px-3.5 py-2.5 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-ink/70 flex items-center gap-1.5">
              <EnvelopeSimple className="w-3.5 h-3.5 text-primary" />
              <span>Email Address *</span>
            </label>
            <input
              type="email"
              required
              placeholder="ananya@creator.in"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-ink/70 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" />
              <span>Mobile Number *</span>
            </label>
            <input
              type="tel"
              required
              placeholder="+91 98200 12345"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-ink/70 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>City</span>
            </label>
            <Select
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              containerClassName="w-full"
              className="w-full text-sm py-2.5"
            >
              <option value="Bengaluru">Bengaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Delhi">Delhi</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Goa">Goa</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Chennai">Chennai</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-ink/70 flex items-center gap-1.5">
              <Buildings className="w-3.5 h-3.5 text-primary" />
              <span>Organisation / Brand</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Vogue India"
              value={formData.organisation}
              onChange={(e) =>
                setFormData({ ...formData, organisation: e.target.value })
              }
              className="w-full px-3.5 py-2.5 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-ink/70 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-primary" />
              <span>Category *</span>
            </label>
            <Select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as GuestCategory,
                })
              }
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
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-ink/70">
            Tags (comma separated)
          </label>
          <input
            type="text"
            placeholder="e.g. Lifestyle, Tier-1, KeynoteSpeaker"
            value={formData.tags}
            onChange={(e) =>
              setFormData({ ...formData, tags: e.target.value })
            }
            className="w-full px-3.5 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-ink/70">
            Internal Relationship Notes
          </label>
          <textarea
            rows={2}
            placeholder="Special seating, dietary preferences, past event feedback..."
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="w-full px-3.5 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || !formData.full_name || !formData.email}
            className="gap-2"
          >
            <Sparkle className="w-4 h-4" />
            <span>{isSubmitting ? "Saving..." : eventId ? "Add to Event Guestlist" : "Save to CRM"}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
