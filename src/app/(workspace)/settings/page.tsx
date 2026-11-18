"use client";

import React, { useState } from "react";
import { db } from "@/lib/db";
import { UserProfile, Role } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
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
  ShareNetwork,
  EnvelopeSimple,
  WhatsappLogo,
  CalendarCheck,
  Lock,
} from "@phosphor-icons/react";

export default function SettingsPage() {
  const { can, isOwner } = useAuth();
  const [org, setOrg] = useState(db.organisation);
  const [users, setUsers] = useState<UserProfile[]>(db.users);
  const [activeTab, setActiveTab] = useState<"profile" | "team" | "billing" | "integrations">("profile");
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
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-10 space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-md shadow-modal flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 text-sm font-medium">
          <CheckCircle className="w-4 h-4 text-block-lime" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="pb-4 border-b border-hairline flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="caption-mono text-primary font-semibold">
            Module A • Organisation Management
          </span>
          <h1 className="headline text-3xl font-bold text-ink tracking-tight mt-1">
            Organisation &amp; Workspace Settings
          </h1>
          <p className="text-sm text-ink/70 mt-1">
            Manage workspace identity, team roles, permissions, SaaS plans, and delivery integrations.
          </p>
        </div>

        <Badge variant="vvip">PLAN: {org.plan.toUpperCase()}</Badge>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-hairline pb-2 overflow-x-auto text-xs font-mono uppercase tracking-wider">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-4 py-2 rounded-md font-semibold transition-all flex items-center gap-2 ${
            activeTab === "profile"
              ? "bg-primary text-white"
              : "text-ink/70 hover:bg-surface-soft hover:text-ink"
          }`}
        >
          <Buildings className="w-4 h-4" />
          <span>Organisation Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={`px-4 py-2 rounded-md font-semibold transition-all flex items-center gap-2 ${
            activeTab === "team"
              ? "bg-primary text-white"
              : "text-ink/70 hover:bg-surface-soft hover:text-ink"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team &amp; Roles ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("billing")}
          className={`px-4 py-2 rounded-md font-semibold transition-all flex items-center gap-2 ${
            activeTab === "billing"
              ? "bg-primary text-white"
              : "text-ink/70 hover:bg-surface-soft hover:text-ink"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Plans &amp; Entitlements</span>
        </button>

        <button
          onClick={() => setActiveTab("integrations")}
          className={`px-4 py-2 rounded-md font-semibold transition-all flex items-center gap-2 ${
            activeTab === "integrations"
              ? "bg-primary text-white"
              : "text-ink/70 hover:bg-surface-soft hover:text-ink"
          }`}
        >
          <ShareNetwork className="w-4 h-4" />
          <span>Integrations &amp; Channels</span>
        </button>
      </div>

      {/* TAB 1: Organisation Profile */}
      {activeTab === "profile" && (
        <Card className="p-6 space-y-6 animate-in fade-in">
          <div className="flex items-center gap-2 border-b border-hairline pb-3">
            <Buildings className="w-5 h-5 text-primary" />
            <h3 className="card-title text-lg font-semibold text-ink">
              Company Identity &amp; Regional Defaults
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
                Workspace URL Identifier
              </label>
              <input
                type="text"
                readOnly
                value={`room.app/${org.slug}`}
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
                Operating Model
              </label>
              <input
                type="text"
                readOnly
                value="Experiential Marketing Agency & Production Studio"
                className="w-full px-4 py-2 bg-surface-soft border border-hairline rounded-md text-sm text-ink"
              />
            </div>
          </div>
        </Card>
      )}

      {/* TAB 2: Team Members & RBAC */}
      {activeTab === "team" && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <span className="caption-mono text-primary font-semibold">
                Access Control &amp; Least Privilege
              </span>
              <h3 className="card-title text-xl font-bold text-ink">
                Team Members &amp; Roles
              </h3>
            </div>

            {can("organisation.members.manage") && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsInviteOpen(true)}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Invite Member</span>
              </Button>
            )}
          </div>

          <Card className="p-0 overflow-hidden border border-hairline">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-soft font-mono uppercase text-[11px] text-ink/70 border-b border-hairline">
                  <tr>
                    <th className="px-6 py-3.5">User</th>
                    <th className="px-6 py-3.5">Assigned Role</th>
                    <th className="px-6 py-3.5">Scope &amp; Authority</th>
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
                          {u.role.replace(/_/g, " ")}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-xs text-ink/80">
                        {u.role === "ORGANISATION_OWNER"
                          ? "Full workspace, billing, audit & data deletion authority"
                          : u.role === "BRAND_MANAGER"
                          ? "View campaigns, creator CRM, and client event reports"
                          : u.role === "OPERATIONS_STAFF"
                          ? "Gate check-in console & attendee validation"
                          : "Create, publish & manage assigned events"}
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
      )}

      {/* TAB 3: Plans & Billing */}
      {activeTab === "billing" && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <span className="caption-mono text-primary font-semibold">
              Subscription Tiers &amp; Entitlements
            </span>
            <h3 className="card-title text-xl font-bold text-ink">
              Active SaaS Plan &amp; Upgrades
            </h3>
            <p className="text-xs text-ink/70 mt-1">
              Select the plan that matches your monthly activation volume and delivery channels.
            </p>
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
                  For boutique PR agencies managing 1–2 intimate activations per month.
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
                Pilot Standard
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
                  <li>• WhatsApp Business Cloud integration</li>
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
                  For nationwide event conglomerates &amp; enterprise luxury houses.
                </p>
                <ul className="text-xs text-ink/80 space-y-1.5 pt-2 border-t border-hairline">
                  <li>• Dedicated cloud infrastructure &amp; custom SLAs</li>
                  <li>• On-ground check-in engineering support</li>
                  <li>• Custom ERP &amp; CRM webhooks</li>
                  <li>• Enterprise least-privilege audit exports</li>
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
      )}

      {/* TAB 4: Integrations & Delivery Channels */}
      {activeTab === "integrations" && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <span className="caption-mono text-primary font-semibold">
              Delivery Channels &amp; Provider Gateways
            </span>
            <h3 className="card-title text-xl font-bold text-ink">
              Connected External Services
            </h3>
            <p className="text-xs text-ink/70 mt-1">
              Active email relays, calendar services, and messaging APIs configured for this workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Resend Email Relay */}
            <Card className="p-6 space-y-4 border border-hairline">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-block-lime flex items-center justify-center text-ink">
                    <EnvelopeSimple className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-ink">Transactional Email (Resend)</h4>
                    <span className="text-xs font-mono text-ink/60">Bearer RSVP &amp; QR Pass Relay</span>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-xs text-ink/70 leading-relaxed">
                Dispatches responsive HTML invitations and digital pass confirmations with DKIM signing and delivery webhooks.
              </p>
              <div className="pt-2 border-t border-hairline flex items-center justify-between text-[11px] font-mono text-ink/60">
                <span>Sender: invites@room.app</span>
                <span className="text-semantic-success font-semibold">● CONNECTED</span>
              </div>
            </Card>

            {/* WhatsApp Business API */}
            <Card className="p-6 space-y-4 border border-hairline">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-soft flex items-center justify-center text-ink">
                    <WhatsappLogo className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-ink">WhatsApp Business Cloud API</h4>
                    <span className="text-xs font-mono text-ink/60">Direct Mobile Passes</span>
                  </div>
                </div>
                <Badge variant="warning">Setup Required</Badge>
              </div>
              <p className="text-xs text-ink/70 leading-relaxed">
                Connect your Meta Developer Business App and System User Token to dispatch branded WhatsApp message templates.
              </p>
              <div className="pt-2 border-t border-hairline flex items-center justify-between">
                <span className="text-[11px] font-mono text-ink/60">Token: Not Configured</span>
                <Button variant="secondary" size="sm" className="text-xs">
                  Configure Meta Token
                </Button>
              </div>
            </Card>

            {/* Calendar Integration */}
            <Card className="p-6 space-y-4 border border-hairline">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-block-lilac flex items-center justify-center text-ink">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-ink">Calendar Add-to-Event (.ics)</h4>
                    <span className="text-xs font-mono text-ink/60">Google &amp; Apple Calendar</span>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-xs text-ink/70 leading-relaxed">
                Embeds native iCalendar event attachments in all invitation acceptances, including venue coordinates and schedule.
              </p>
              <div className="pt-2 border-t border-hairline text-[11px] font-mono text-semantic-success font-semibold">
                ● STANDARD PROTOCOL ENABLED
              </div>
            </Card>

            {/* Immutable Security Audit Webhook */}
            <Card className="p-6 space-y-4 border border-hairline">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-block-navy text-white flex items-center justify-center">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-ink">Audit Log Ledger</h4>
                    <span className="text-xs font-mono text-ink/60">Tamper-Evident History</span>
                  </div>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-xs text-ink/70 leading-relaxed">
                Streams all authentication, gate check-in, pass invalidation, and data export events to the append-only ledger.
              </p>
              <div className="pt-2 border-t border-hairline text-[11px] font-mono text-semantic-success font-semibold">
                ● INTERNAL AUDIT STREAMING
              </div>
            </Card>
          </div>
        </div>
      )}

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
