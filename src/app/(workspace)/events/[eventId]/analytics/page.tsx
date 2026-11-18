"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { EventItem } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, ColorBlock } from "@/components/ui/Card";
import {
  TrendUp,
  DownloadSimple,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  ShareNetwork,
  FileText,
  Eye,
  Heart,
  ChatCircle,
} from "@phosphor-icons/react";

export default function EventAnalyticsPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [content, setContent] = useState<any[]>([]);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    const e = db.getEventById(eventId);
    if (e) {
      setEvent(e);
      setAnalytics(db.getEventAnalytics(eventId));
      setContent(db.getContentSubmissions(eventId));
    }
  }, [eventId]);

  const handleExportReport = () => {
    // Generate CSV string
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Value\n" +
      `Event Name,${event?.name}\n` +
      `Total Invited,${analytics?.totalInvited}\n` +
      `Delivered Count,${analytics?.deliveredCount}\n` +
      `Delivery Rate,${analytics?.deliveryRate}%\n` +
      `Accepted RSVPs,${analytics?.acceptedCount}\n` +
      `Declined RSVPs,${analytics?.declinedCount}\n` +
      `RSVP Acceptance Rate,${analytics?.acceptanceRate}%\n` +
      `Actual Attendance,${analytics?.actualAttendance}\n` +
      `No-Show Rate,${analytics?.noShowRate}%\n` +
      `Total Content Views,${analytics?.totalViews}\n` +
      `Total Likes,${analytics?.totalLikes}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ROOM_Event_Report_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    db.logAudit("usr-rahul-01", "Rahul Mehta", "REPORT_EXPORTED", "reports", eventId, {
      type: "CSV",
    });

    setExportNotice("Event report downloaded successfully.");
    setTimeout(() => setExportNotice(null), 3500);
  };

  if (!event || !analytics) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-10">
      {/* Toast */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-md shadow-modal flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 text-sm font-medium">
          <CheckCircle className="w-4 h-4 text-block-lime" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <Link
            href={`/events/${eventId}`}
            className="inline-flex items-center text-xs font-mono uppercase text-ink/60 hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Event Overview
          </Link>
          <h1 className="headline text-3xl font-bold text-ink tracking-tight">
            Event Intelligence &amp; Performance
          </h1>
          <p className="text-sm text-ink/70 mt-1">
            {event.name} • Full lifecycle metrics from invitation to post-event creator impact.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={handleExportReport}
            className="gap-2"
          >
            <DownloadSimple className="w-4 h-4" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleExportReport}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            <span>Generate Client PDF</span>
          </Button>
        </div>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="text-xs font-mono uppercase text-ink/60 mb-2">
            Total Invited
          </div>
          <div className="text-4xl font-extrabold text-ink font-sans">
            {analytics.totalInvited}
          </div>
          <div className="text-xs text-ink/60 mt-3 pt-3 border-t border-hairline flex justify-between">
            <span>Delivered: {analytics.deliveredCount}</span>
            <span className="font-mono text-primary font-semibold">
              {analytics.deliveryRate}% rate
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-xs font-mono uppercase text-ink/60 mb-2">
            RSVP Acceptance
          </div>
          <div className="text-4xl font-extrabold text-ink font-sans">
            {analytics.acceptanceRate}%
          </div>
          <div className="text-xs text-ink/60 mt-3 pt-3 border-t border-hairline flex justify-between">
            <span>Accepted: {analytics.acceptedCount}</span>
            <span className="text-[#b42318]">Declined: {analytics.declinedCount}</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-xs font-mono uppercase text-ink/60 mb-2">
            Actual Attendance
          </div>
          <div className="text-4xl font-extrabold text-ink font-sans">
            {analytics.actualAttendance}
          </div>
          <div className="text-xs text-ink/60 mt-3 pt-3 border-t border-hairline flex justify-between">
            <span>Capacity: {event.capacity}</span>
            <span className="font-mono text-semantic-success font-semibold">Verified</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="text-xs font-mono uppercase text-ink/60 mb-2">
            No-Show Rate
          </div>
          <div className="text-4xl font-extrabold text-ink font-sans">
            {analytics.noShowRate}%
          </div>
          <div className="text-xs text-ink/60 mt-3 pt-3 border-t border-hairline flex justify-between">
            <span>Unattended RSVPs: {Math.max(0, analytics.acceptedCount - analytics.actualAttendance)}</span>
            <span className="text-xs text-ink/50">Industry avg: 22%</span>
          </div>
        </Card>
      </div>

      {/* Color Block Section: Soft Periwinkle (#adbaff) - Category Distribution */}
      <div className="bg-block-lilac text-ink rounded-lg p-8 md:p-12 transition-all space-y-6">
        <div>
          <span className="caption-mono font-bold text-ink">
            Audience Composition &amp; Access Categories
          </span>
          <h3 className="headline text-2xl font-bold mt-1">
            Guest Category Distribution
          </h3>
          <p className="text-sm text-ink/80 mt-1 max-w-2xl">
            Breakdown of confirmed attendees across creator, media, and VIP tiers.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {analytics.categoryDistribution.map((item: any) => (
            <div
              key={item.category}
              className="bg-white/80 backdrop-blur-sm p-4 rounded-md border border-hairline flex flex-col justify-between"
            >
              <span className="text-xs font-mono uppercase text-ink/70">
                {item.category}
              </span>
              <div className="text-2xl font-bold text-ink mt-2">
                {item.count}
              </div>
              <span className="text-[11px] text-ink/50 mt-1">
                {analytics.totalInvited > 0
                  ? Math.round((item.count / analytics.totalInvited) * 100)
                  : 0}
                % of total
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Post-Event Content Tracking Section (P1 Module H) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="caption-mono text-primary font-semibold">
              Module H • Post-Event Content Tracking
            </span>
            <h3 className="headline text-2xl font-bold text-ink mt-1">
              Creator Content &amp; Social Reach
            </h3>
          </div>

          <Link href={`/events/${eventId}/content`}>
            <Button variant="primary" size="sm">
              Add Content Link
            </Button>
          </Link>
        </div>

        {/* Reach Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center text-primary flex-shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-ink/60">Total Views</div>
              <div className="text-2xl font-bold text-ink font-sans">
                {analytics.totalViews.toLocaleString("en-IN")}
              </div>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center text-primary flex-shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-ink/60">Total Likes</div>
              <div className="text-2xl font-bold text-ink font-sans">
                {analytics.totalLikes.toLocaleString("en-IN")}
              </div>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-soft flex items-center justify-center text-primary flex-shrink-0">
              <ShareNetwork className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase text-ink/60">Total Shares</div>
              <div className="text-2xl font-bold text-ink font-sans">
                {analytics.totalShares.toLocaleString("en-IN")}
              </div>
            </div>
          </Card>
        </div>

        {/* Content Submissions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {content.map((c) => (
            <Card key={c.id} className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <Badge variant="creator">{c.platform} {c.post_type}</Badge>
                  <h4 className="font-semibold text-lg text-ink mt-2">
                    {c.creator_name}
                  </h4>
                  <a
                    href={c.post_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline font-mono truncate block max-w-xs mt-1"
                  >
                    {c.post_url}
                  </a>
                </div>

                <div className="text-right text-xs text-ink/50 font-mono">
                  {new Date(c.published_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-hairline text-center text-xs">
                <div>
                  <div className="font-semibold text-ink">
                    {(c.metrics.views || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-ink/50 uppercase">Views</div>
                </div>
                <div>
                  <div className="font-semibold text-ink">
                    {(c.metrics.likes || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-ink/50 uppercase">Likes</div>
                </div>
                <div>
                  <div className="font-semibold text-ink">
                    {(c.metrics.comments || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-ink/50 uppercase">Comments</div>
                </div>
                <div>
                  <div className="font-semibold text-ink">
                    {(c.metrics.shares || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-ink/50 uppercase">Shares</div>
                </div>
              </div>

              {c.campaign_hashtags && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.campaign_hashtags.map((tag: string) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono text-ink/60 bg-surface-soft px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
