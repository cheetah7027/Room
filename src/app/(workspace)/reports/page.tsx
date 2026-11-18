"use client";

import React, { useState } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, ColorBlock } from "@/components/ui/Card";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  FileText,
  DownloadSimple,
  CalendarBlank,
  Users,
  CheckCircle,
  TrendUp,
  ShieldWarning,
  ArrowRight,
} from "@phosphor-icons/react";

export default function ReportsHubPage() {
  const { can } = useAuth();
  const org = db.organisation;
  const events = db.getEvents(org.id);
  const auditLogs = db.auditLogs;
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownloadOrgAudit = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "ID,Actor,Action,Resource,Timestamp,Details\n" +
      auditLogs
        .map(
          (l) =>
            `"${l.id}","${l.actor_name}","${l.action}","${l.resource_type}","${l.created_at}","${JSON.stringify(l.metadata || {})}"`
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ROOM_Security_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadNotice("Organisation audit trail exported.");
    setTimeout(() => setDownloadNotice(null), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-10">
      {/* Toast */}
      {downloadNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-md shadow-modal flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 text-sm font-medium">
          <CheckCircle className="w-4 h-4 text-block-lime" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <span className="caption-mono text-primary font-semibold">
            Intelligence &amp; Governance Hub
          </span>
          <h1 className="headline text-3xl font-bold text-ink tracking-tight mt-1">
            Client Reports &amp; Audit Logs
          </h1>
          <p className="text-sm text-ink/70 mt-1">
            Produce client-facing event dossiers, creator reach statements, and compliance audit logs.
          </p>
        </div>

        {can("audit.read") && (
          <Button
            variant="secondary"
            size="md"
            onClick={handleDownloadOrgAudit}
            className="gap-2"
          >
            <DownloadSimple className="w-4 h-4" />
            <span>Export Audit Trail (CSV)</span>
          </Button>
        )}
      </div>

      {/* Color Block Section: Navy (#2b3364) */}
      <div className="bg-block-navy text-white rounded-lg p-8 md:p-12 transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-2">
            <span className="caption-mono text-block-lime font-bold">
              Agency Client Deliverables
            </span>
            <h2 className="display-lg text-white font-normal">
              Transparent, measurable brand activations.
            </h2>
            <p className="text-white/80 text-base leading-relaxed">
              Replace fragmented Excel sheets with standardized event reporting. Every report synthesizes attendance ratios, VIP participation, and creator social deliverables into an exportable client package.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="promo"
              onClick={handleDownloadOrgAudit}
              className="bg-primary text-white hover:bg-primary-pressed"
            >
              Export Organisation Dossier
            </Button>
          </div>
        </div>
      </div>

      {/* Per-Event Reports Grid */}
      <div className="space-y-6">
        <h3 className="card-title text-xl font-bold text-ink">
          Event Performance Dossiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => {
            const an = db.getEventAnalytics(evt.id);
            return (
              <Card key={evt.id} className="p-6 flex flex-col justify-between space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
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
                    <span className="caption-mono text-ink/60">
                      {evt.venue_city}
                    </span>
                  </div>

                  <h4 className="font-bold text-lg text-ink line-clamp-1">
                    {evt.name}
                  </h4>
                  <p className="text-xs text-ink/70 mt-1 line-clamp-2">
                    {evt.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 p-3 bg-surface-soft rounded-md text-center text-xs">
                    <div>
                      <div className="font-bold text-ink">{an.totalInvited}</div>
                      <div className="text-[10px] text-ink/60 uppercase">Invited</div>
                    </div>
                    <div>
                      <div className="font-bold text-semantic-success">{an.acceptanceRate}%</div>
                      <div className="text-[10px] text-ink/60 uppercase">RSVP</div>
                    </div>
                    <div>
                      <div className="font-bold text-ink">{an.actualAttendance}</div>
                      <div className="text-[10px] text-ink/60 uppercase">Attended</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-hairline flex items-center justify-between">
                  <Link
                    href={`/events/${evt.id}/analytics`}
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Analytics</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>

                  <Link href={`/events/${evt.id}/analytics`}>
                    <Button variant="secondary" size="sm" className="text-xs">
                      Export Report
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-xl font-bold text-ink">
            System Audit Log &amp; Governance Trail
          </h3>
          <span className="caption-mono text-xs text-ink/60">
            Total Records: {auditLogs.length}
          </span>
        </div>

        <Card className="p-0 overflow-hidden border border-hairline">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-soft font-mono uppercase text-ink/70 border-b border-hairline">
                <tr>
                  <th className="px-6 py-3">Timestamp</th>
                  <th className="px-6 py-3">Action</th>
                  <th className="px-6 py-3">Actor</th>
                  <th className="px-6 py-3">Target Resource</th>
                  <th className="px-6 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-soft/40 transition-colors">
                    <td className="px-6 py-3 font-mono text-ink/60">
                      {new Date(log.created_at).toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-3 font-mono font-bold text-primary">
                      {log.action}
                    </td>
                    <td className="px-6 py-3 text-ink font-medium">
                      {log.actor_name}
                    </td>
                    <td className="px-6 py-3 font-mono text-ink/70">
                      {log.resource_type} / {log.resource_id}
                    </td>
                    <td className="px-6 py-3 font-mono text-ink/50 text-[11px] truncate max-w-xs">
                      {JSON.stringify(log.metadata || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
