"use client";

import React, { useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { db } from "@/lib/db";
import { Guest, GuestCategory } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, ColorBlock } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { ImportSpreadsheetModal } from "@/components/guests/ImportSpreadsheetModal";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Users,
  MagnifyingGlass,
  UploadSimple,
  DownloadSimple,
  Plus,
  Funnel,
  CheckCircle,
  WarningCircle,
  FileCsv,
  EnvelopeSimple,
  Phone,
  Tag,
  Buildings,
  MapPin,
} from "@phosphor-icons/react";

export default function GuestCrmPage() {
  const { can, mask } = useAuth();
  const [guests, setGuests] = useState<Guest[]>(() => db.getGuests(db.organisation.id));
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // New Guest Form
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    city: "Bengaluru",
    organisation: "",
    category: "Creator" as GuestCategory,
    tags: "Lifestyle, Tier-1",
    notes: "",
    relationship_owner: "Rahul Mehta",
  });

  const refreshGuests = () => {
    setGuests([...db.getGuests(db.organisation.id)]);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Add Guest Submit
  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    const created = db.createGuest({
      organisation_id: db.organisation.id,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      organisation: formData.organisation,
      category: formData.category,
      tags: formData.tags.split(",").map((t) => t.trim()),
      notes: formData.notes,
      relationship_owner: formData.relationship_owner,
      social_links: {},
      communication_preferences: { email: true, whatsapp: true },
    });

    setIsAddOpen(false);
    refreshGuests();
    showToast(`Added ${created.full_name} to CRM`);
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      city: "Bengaluru",
      organisation: "",
      category: "Creator",
      tags: "Lifestyle, Tier-1",
      notes: "",
      relationship_owner: "Rahul Mehta",
    });
  };

  // CSV Export
  const handleExportCsv = () => {
    const csvData = guests.map((g) => ({
      ID: g.id,
      Name: g.full_name,
      Email: g.email,
      Phone: g.phone,
      City: g.city,
      Organisation: g.organisation,
      Category: g.category,
      Tags: g.tags.join("; "),
      Notes: g.notes || "",
      Owner: g.relationship_owner || "",
    }));

    const csvStr = Papa.unparse(csvData);
    const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `ROOM_Guest_CRM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    db.logAudit("usr-rahul-01", "Rahul Mehta", "GUEST_CRM_EXPORTED", "guests", db.organisation.id, {
      count: guests.length,
    });
    showToast("Exported CRM records to CSV.");
  };

  // Filtered Guests
  const filtered = guests.filter((g) => {
    const q = search.toLowerCase();
    const matchesSearch =
      g.full_name.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.phone.includes(q) ||
      g.organisation.toLowerCase().includes(q) ||
      g.tags.some((t) => t.toLowerCase().includes(q));
    const matchesCat = categoryFilter === "all" || g.category === categoryFilter;
    return matchesSearch && matchesCat;
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
          <span className="caption-mono text-primary font-semibold">
            Module C • Guest Relationship Management
          </span>
          <h1 className="headline text-3xl font-bold text-ink tracking-tight mt-1">
            Guest CRM
          </h1>
          <p className="text-sm text-ink/70 mt-1">
            Build a reusable database of creators, VIPs, brand partners, and media contacts across all events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {can("guests.export") && (
            <Button
              variant="secondary"
              size="md"
              onClick={handleExportCsv}
              className="gap-1.5"
            >
              <DownloadSimple className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
          )}

          {can("guests.import") && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsImportOpen(true)}
              className="gap-1.5"
            >
              <UploadSimple className="w-4 h-4 text-primary" />
              <span>Import Excel / CSV</span>
            </Button>
          )}

          {can("guests.create") && (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAddOpen(true)}
              className="gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Guest</span>
            </Button>
          )}
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlass className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            placeholder="Search by name, email, phone, company, or tag..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-mono uppercase text-ink/60 mr-1 hidden sm:inline">
            Category:
          </span>
          {["all", "Creator", "VVIP", "VIP", "Media", "General"].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-pill text-xs font-medium uppercase tracking-wider transition-all ${
                categoryFilter === cat
                  ? "bg-primary text-white"
                  : "bg-surface-soft text-ink hover:bg-hairline"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Guest Table */}
      <Card className="p-0 overflow-hidden border border-hairline">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-soft text-[11px] font-mono uppercase text-ink/70 border-b border-hairline">
              <tr>
                <th className="px-6 py-3.5">Full Name</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Contact Details</th>
                <th className="px-6 py-3.5">City &amp; Affiliation</th>
                <th className="px-6 py-3.5">Tags</th>
                <th className="px-6 py-3.5">Relationship Owner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-ink/50 text-sm">
                    No contacts found. Click &quot;Add Guest&quot; or &quot;Bulk CSV Import&quot; to populate your database.
                  </td>
                </tr>
              ) : (
                filtered.map((g) => (
                  <tr key={g.id} className="hover:bg-surface-soft/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-ink font-forum text-base">
                        {g.full_name}
                      </div>
                      {mask(g.notes, "notes") && (
                        <div className="text-xs text-ink/60 mt-0.5 line-clamp-1 italic">
                          &ldquo;{mask(g.notes, "notes")}&rdquo;
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          g.category === "VVIP"
                            ? "vvip"
                            : g.category === "VIP"
                            ? "vip"
                            : g.category === "Creator"
                            ? "creator"
                            : g.category === "Media"
                            ? "media"
                            : "default"
                        }
                      >
                        {g.category}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 space-y-1 text-xs text-ink/80">
                      <div className="flex items-center gap-1.5">
                        <EnvelopeSimple className="w-3.5 h-3.5 text-ink/40" />
                        <span>{mask(g.email, "email")}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-ink/60">
                        <Phone className="w-3.5 h-3.5 text-ink/40" />
                        <span>{mask(g.phone, "phone")}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-ink/80">
                      <div className="font-medium text-ink">
                        {g.organisation || "Independent"}
                      </div>
                      <div className="text-ink/60 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{g.city}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {g.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-mono bg-surface-soft text-ink/70 px-2 py-0.5 rounded border border-hairline"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs font-mono text-ink/70">
                      {g.relationship_owner || "Rahul Mehta"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Guest Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Single Contact to CRM"
        description="Store reusable guest information with category, city, tags, and communication preferences."
      >
        <form onSubmit={handleAddGuest} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Natasha Poonawalla"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="name@domain.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98..."
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                City
              </label>
              <Select
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
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

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Organisation / Studio
              </label>
              <input
                type="text"
                placeholder="e.g. Vogue India"
                value={formData.organisation}
                onChange={(e) =>
                  setFormData({ ...formData, organisation: e.target.value })
                }
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Default Category
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
                className="w-full text-sm"
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

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Beauty, Tier-1, CleanSkincare"
              value={formData.tags}
              onChange={(e) =>
                setFormData({ ...formData, tags: e.target.value })
              }
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Internal Relationship Notes
            </label>
            <textarea
              rows={2}
              placeholder="Preferences, past event feedback, seating requirements..."
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
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
              Save Contact
            </Button>
          </div>
        </form>
      </Modal>

      {/* Bulk Spreadsheet (Excel / CSV) Import Modal */}
      <ImportSpreadsheetModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={(count) => {
          refreshGuests();
          showToast(`Successfully imported ${count} guests into CRM.`);
        }}
      />
    </div>
  );
}
