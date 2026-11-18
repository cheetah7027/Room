"use client";

import React, { useState } from "react";
import { db } from "@/lib/db";
import { UserProfile, Role } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, ColorBlock } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Buildings,
  Users,
  CreditCard,
  Shield,
  Plus,
  CheckCircle,
  Sparkle,
  ArrowRight,
} from "@phosphor-icons/react";

export default function SettingsPage() {
  const { can, isOwner } = useAuth();
  const [org, setOrg] = useState(db.organisation);
  const [users, setUsers] = useState<UserProfile[]>(db.users);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [inviteForm, setInviteForm] = useState({
    full_name: "",
    email: "",
    role: "EVENT_MANAGER" as Role,
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: inviteForm.email,
      full_name: inviteForm.full_name,
      role: inviteForm.role,
      organisation_id: org.id,
      created_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    setUsers([...db.users]);
    db.logAudit("usr-rahul-01", "Rahul Mehta", "TEAM_MEMBER_INVITED", "users", newUser.id, {
      role: newUser.role,
    });
    setIsInviteOpen(false);
    showToast(`Invited ${newUser.full_name} as ${newUser.role}`);
    setInviteForm({ full_name: "", email: "", role: "EVENT_MANAGER" });
  };

  const handleChangePlan = (newPlan: "Starter" | "Growth" | "Enterprise") => {
    const updated = db.updateOrganisation(org.id, { plan: newPlan });
    setOrg({ ...updated });
    showToast(`Organisation plan upgraded to ${newPlan}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-10">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-md shadow-modal flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 text-sm font-medium">
          <CheckCircle className="w-4 h-4 text-block-lime" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-hairline">
        <span className="caption-mono text-primary font-semibold">
          Module A • Organisation Management
        </span>
        <h1 className="headline text-3xl font-bold text-ink tracking-tight mt-1">
          Organisation &amp; Team Settings
        </h1>
        <p className="text-sm text-ink/70 mt-1">
          Manage workspace identity, team roles, permissions, and SaaS subscription tiers.
        </p>
      </div>

      {/* Organisation Profile Card */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-hairline pb-3">
          <Buildings className="w-5 h-5 text-primary" />
          <h3 className="card-title text-lg font-semibold text-ink">
            Company Profile
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Organisation Name
            </label>
            <input
              type="text"
              defaultValue={org.name}
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Workspace Slug
            </label>
            <input
              type="text"
              readOnly
              value={org.slug}
              className="w-full px-4 py-2 bg-surface-soft border border-hairline rounded-md text-sm text-ink/70 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Default Currency &amp; Timezone
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value="INR (₹) Indian Rupee"
                className="w-1/2 px-4 py-2 bg-surface-soft border border-hairline rounded-md text-sm text-ink"
              />
              <input
                type="text"
                readOnly
                value="Asia/Kolkata (IST)"
                className="w-1/2 px-4 py-2 bg-surface-soft border border-hairline rounded-md text-sm text-ink"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Business Model Type
            </label>
            <input
              type="text"
              readOnly
              value="Experiential Marketing Agency"
              className="w-full px-4 py-2 bg-surface-soft border border-hairline rounded-md text-sm text-ink"
            />
          </div>
        </div>
      </Card>

      {/* Subscription Plans (PRD Section 11 Monetisation) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="caption-mono text-primary font-semibold">
              B2B Pricing Hypotheses
            </span>
            <h3 className="card-title text-xl font-bold text-ink">
              Subscription Plan
            </h3>
          </div>
          <Badge variant="vvip">CURRENT: {org.plan.toUpperCase()}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <Card className="p-6 flex flex-col justify-between border-2 hover:border-ink/40 transition-all">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-base text-ink">Starter</span>
                {org.plan === "Starter" && <Badge variant="success">Active</Badge>}
              </div>
              <div className="text-3xl font-extrabold text-ink font-sans">
                ₹2,999
                <span className="text-xs font-normal text-ink/60"> /month</span>
              </div>
              <p className="text-xs text-ink/70 leading-relaxed">
                For independent event producers &amp; boutique PR agencies managing 1–2 events per month.
              </p>
              <ul className="text-xs text-ink/80 space-y-1.5 pt-2 border-t border-hairline">
                <li>• Up to 3 active events</li>
                <li>• 500 guest CRM records</li>
                <li>• Instant QR pass check-in</li>
                <li>• Email invitations</li>
              </ul>
            </div>

            <Button
              variant={org.plan === "Starter" ? "secondary" : "primary"}
              size="sm"
              disabled={!can("organisation.billing.manage") || org.plan === "Starter"}
              onClick={() => handleChangePlan("Starter")}
              className="mt-6 w-full"
            >
              {org.plan === "Starter"
                ? "Current Plan"
                : !can("organisation.billing.manage")
                ? "Owner Required"
                : "Downgrade to Starter"}
            </Button>
          </Card>

          {/* Growth Plan (Popular) */}
          <Card className="p-6 flex flex-col justify-between border-2 border-primary bg-surface-soft/30 hover:border-primary transition-all relative">
            <div className="absolute -top-3 right-6 bg-primary text-white text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold">
              Agency Pilot Standard
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-base text-ink">Growth</span>
                {org.plan === "Growth" && <Badge variant="vvip">Active</Badge>}
              </div>
              <div className="text-3xl font-extrabold text-primary font-sans">
                ₹9,999
                <span className="text-xs font-normal text-ink/60"> /month</span>
              </div>
              <p className="text-xs text-ink/70 leading-relaxed">
                For experiential agencies and high-velocity D2C brand marketing teams.
              </p>
              <ul className="text-xs text-ink/80 space-y-1.5 pt-2 border-t border-hairline">
                <li>• Unlimited events &amp; team members</li>
                <li>• Reusable Creator CRM &amp; saved lists</li>
                <li>• WhatsApp Business Platform integration</li>
                <li>• Idempotent gate scanner + manual fallback</li>
                <li>• Post-event content tracking &amp; reports</li>
              </ul>
            </div>

            <Button
              variant={org.plan === "Growth" ? "secondary" : "primary"}
              size="sm"
              disabled={!can("organisation.billing.manage") || org.plan === "Growth"}
              onClick={() => handleChangePlan("Growth")}
              className="mt-6 w-full"
            >
              {org.plan === "Growth"
                ? "Current Plan"
                : !can("organisation.billing.manage")
                ? "Owner Required"
                : "Upgrade to Growth"}
            </Button>
          </Card>

          {/* Enterprise Plan */}
          <Card className="p-6 flex flex-col justify-between border-2 hover:border-ink/40 transition-all">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-base text-ink">Enterprise</span>
                {org.plan === "Enterprise" && <Badge variant="success">Active</Badge>}
              </div>
              <div className="text-2xl font-extrabold text-ink font-sans">
                ₹30,000–₹1L+
                <span className="text-xs font-normal text-ink/60"> /month</span>
              </div>
              <p className="text-xs text-ink/70 leading-relaxed">
                For nationwide event management conglomerates &amp; enterprise fashion houses.
              </p>
              <ul className="text-xs text-ink/80 space-y-1.5 pt-2 border-t border-hairline">
                <li>• Multi-tenant custom workspaces</li>
                <li>• Dedicated SLA &amp; on-ground check-in support</li>
                <li>• Custom CRM &amp; ERP integrations</li>
                <li>• Enterprise role-based access control</li>
              </ul>
            </div>

            <Button
              variant={org.plan === "Enterprise" ? "secondary" : "primary"}
              size="sm"
              disabled={!can("organisation.billing.manage") || org.plan === "Enterprise"}
              onClick={() => handleChangePlan("Enterprise")}
              className="mt-6 w-full"
            >
              {org.plan === "Enterprise"
                ? "Current Plan"
                : !can("organisation.billing.manage")
                ? "Owner Required"
                : "Contact for Enterprise"}
            </Button>
          </Card>
        </div>
      </div>

      {/* Team Members & Roles (PRD Section 5) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="caption-mono text-primary font-semibold">
              Role-Based Access Control
            </span>
            <h3 className="card-title text-xl font-bold text-ink">
              Team Members &amp; Permissions
            </h3>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsInviteOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </Button>
        </div>

        <Card className="p-0 overflow-hidden border border-hairline">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-soft font-mono uppercase text-[11px] text-ink/70 border-b border-hairline">
                <tr>
                  <th className="px-6 py-3.5">User</th>
                  <th className="px-6 py-3.5">Assigned Role</th>
                  <th className="px-6 py-3.5">Scope &amp; Permissions</th>
                  <th className="px-6 py-3.5">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-soft/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-ink font-sans">
                        {u.full_name}
                      </div>
                      <div className="text-xs text-ink/60">{u.email}</div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          u.role === "ORGANISATION_OWNER"
                            ? "vvip"
                            : u.role === "BRAND_MANAGER"
                            ? "vip"
                            : u.role === "EVENT_MANAGER"
                            ? "creator"
                            : "outline"
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>

                    <td className="px-6 py-4 text-xs text-ink/80">
                      {u.role === "ORGANISATION_OWNER"
                        ? "Full organisation & billing control"
                        : u.role === "BRAND_MANAGER"
                        ? "View campaigns, creator CRM, and event reports"
                        : u.role === "OPERATIONS_STAFF"
                        ? "Gate check-in console & guest verification"
                        : "Create & manage assigned events"}
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-ink/60">
                      {new Date(u.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Invite Member Modal */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Team Member"
        description="Add a colleague and assign their role-based permissions."
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sanya Mirza"
              value={inviteForm.full_name}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, full_name: e.target.value })
              }
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="colleague@domain.com"
              value={inviteForm.email}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, email: e.target.value })
              }
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Role &amp; Permissions *
            </label>
            <Select
              value={inviteForm.role}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, role: e.target.value as Role })
              }
              containerClassName="w-full"
              className="w-full text-sm"
            >
              <option value="EVENT_MANAGER">Event Manager (Create &amp; manage events)</option>
              <option value="BRAND_MANAGER">Brand Manager (View campaigns &amp; creators)</option>
              <option value="OPERATIONS_STAFF">Operations Staff (Gate check-in)</option>
              <option value="ORGANISATION_ADMIN">Organisation Admin (Full settings access)</option>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
