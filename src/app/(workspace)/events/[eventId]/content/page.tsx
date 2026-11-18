"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { EventItem, ContentSubmission, Creator } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import {
  ArrowLeft,
  Plus,
  ArrowSquareOut,
  InstagramLogo,
  YoutubeLogo,
  Eye,
  Heart,
  ChatCircle,
  ShareNetwork,
  CheckCircle,
} from "@phosphor-icons/react";
import { RoomLoading } from "@/components/ui/RoomLoading";

export default function EventContentPage() {
  const params = useParams();
  const eventId = (params?.eventId as string) || "";

  const [event, setEvent] = useState<EventItem | null>(() => {
    if (eventId) return db.getEventById(eventId) || null;
    return null;
  });
  const [contentList, setContentList] = useState<ContentSubmission[]>(() => {
    if (eventId) return db.getContentSubmissions(eventId);
    return [];
  });
  const [creators, setCreators] = useState<Creator[]>(() => {
    if (eventId) {
      const e = db.getEventById(eventId);
      if (e) return db.getCreators(e.organisation_id);
    }
    return [];
  });
  const [loading, setLoading] = useState<boolean>(() => !event);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    creator_id: "",
    post_url: "",
    platform: "Instagram" as const,
    post_type: "Reel" as const,
    published_at: new Date().toISOString().slice(0, 10),
    hashtags: "#AuraSanctuary, #RoomExperiences",
    views: 120000,
    likes: 8500,
    comments: 240,
    shares: 1100,
    notes: "Aesthetic placement at botanical perfume station.",
    metrics_source: "Agency Verified" as const,
    evidence_url: "",
  });

  useEffect(() => {
    refreshContent();
  }, [eventId]);

  const refreshContent = () => {
    const e = db.getEventById(eventId);
    if (e) {
      setEvent(e);
      setContentList([...db.getContentSubmissions(eventId)]);
      setCreators([...db.getCreators(e.organisation_id)]);
    }
    setLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const creator = creators.find((c) => c.id === formData.creator_id);
    const creatorName = creator ? creator.name : "Independent Creator";

    db.addContentSubmission({
      event_id: eventId,
      creator_id: formData.creator_id || "crt-general",
      creator_name: creatorName,
      post_url: formData.post_url,
      platform: formData.platform,
      post_type: formData.post_type,
      published_at: new Date(formData.published_at).toISOString(),
      campaign_hashtags: formData.hashtags.split(",").map((t) => t.trim()),
      metrics: {
        views: Number(formData.views),
        likes: Number(formData.likes),
        comments: Number(formData.comments),
        shares: Number(formData.shares),
      },
      metrics_source: formData.metrics_source,
      metrics_captured_at: new Date().toISOString(),
      evidence_url: formData.evidence_url || undefined,
      notes: formData.notes,
    });

    setIsModalOpen(false);
    refreshContent();
    setToast("Social content submission added.");
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <RoomLoading fullPage size="lg" text="Loading Social Content Deliverables..." />;
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-4">
        <h2 className="headline text-2xl text-ink">Event not found</h2>
        <p className="text-sm text-ink/70">
          The event ID &ldquo;{eventId}&rdquo; was not found in content deliverables.
        </p>
        <Link href="/events">
          <Button variant="secondary">Back to Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-10 space-y-8">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-ink text-white px-5 py-3 rounded-md shadow-modal flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 text-sm font-medium">
          <CheckCircle className="w-4 h-4 text-block-lime" />
          <span>{toast}</span>
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
          <div className="flex items-center gap-3">
            <h1 className="headline text-3xl font-bold text-ink tracking-tight">
              Post-Event Content Tracking
            </h1>
            <Badge variant="creator">P1 MODULE H</Badge>
          </div>
          <p className="text-sm text-ink/70 mt-1">
            Associate creator social media posts, reels, hashtags, and engagement metrics with {event.name}.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Log Creator Post</span>
        </Button>
      </div>

      {/* Grid of Content Submissions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contentList.length === 0 ? (
          <div className="col-span-2 py-16 text-center text-ink/50 text-sm border border-dashed border-hairline rounded-lg">
            No post-event content tracked yet. Click &quot;Log Creator Post&quot; above to record creator social content.
          </div>
        ) : (
          contentList.map((item) => (
            <Card key={item.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="vvip">{item.platform}</Badge>
                    <span className="text-xs font-mono uppercase text-ink/60">
                      {item.post_type}
                    </span>
                    {item.metrics_source && (
                      <span
                        className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1 ${
                          item.metrics_source === "Agency Verified"
                            ? "bg-semantic-success/15 text-semantic-success border border-semantic-success/30"
                            : item.metrics_source === "Platform Graph API"
                            ? "bg-block-navy/15 text-primary border border-primary/25"
                            : item.metrics_source === "Creator Submitted"
                            ? "bg-block-lilac/50 text-ink border border-block-lilac"
                            : "bg-surface-soft text-ink/70 border border-hairline"
                        }`}
                      >
                        <span>●</span>
                        <span>{item.metrics_source}</span>
                      </span>
                    )}
                  </div>
                  <h3 className="card-title text-xl font-bold text-ink font-sans">
                    {item.creator_name}
                  </h3>
                  <a
                    href={item.post_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline font-mono inline-flex items-center gap-1 mt-1 break-all"
                  >
                    <span>{item.post_url}</span>
                    <ArrowSquareOut className="w-3 h-3 flex-shrink-0" />
                  </a>
                </div>

                <span className="text-xs font-mono text-ink/40">
                  {new Date(item.published_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Metrics Box */}
              <div className="grid grid-cols-4 gap-3 p-3 bg-surface-soft rounded-md text-center text-xs">
                <div>
                  <div className="font-bold text-ink text-base">
                    {(item.metrics.views || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-ink/60 uppercase">Views</div>
                </div>
                <div>
                  <div className="font-bold text-ink text-base">
                    {(item.metrics.likes || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-ink/60 uppercase">Likes</div>
                </div>
                <div>
                  <div className="font-bold text-ink text-base">
                    {(item.metrics.comments || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-ink/60 uppercase">Comments</div>
                </div>
                <div>
                  <div className="font-bold text-ink text-base">
                    {(item.metrics.shares || 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-ink/60 uppercase">Shares</div>
                </div>
              </div>

              {/* Provenance and Verification Timestamp */}
              <div className="flex items-center justify-between text-[10px] font-mono text-ink/50 px-1">
                <span>Source: {item.metrics_source || "Manual Entry"}</span>
                {item.metrics_captured_at && (
                  <span>Verified: {new Date(item.metrics_captured_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                )}
              </div>

              {item.evidence_url && (
                <div className="text-[10px] font-mono px-1">
                  <a
                    href={item.evidence_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>● Verified Proof / Evidence Screenshot</span>
                  </a>
                </div>
              )}

              {item.notes && (
                <p className="text-xs text-ink/70 italic border-l-2 border-primary/40 pl-3">
                  &ldquo;{item.notes}&rdquo;
                </p>
              )}

              {item.campaign_hashtags && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.campaign_hashtags.map((h) => (
                    <span
                      key={h}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-block-lime/60 text-ink"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Add Content Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Post-Event Creator Content"
        description="Record verified post URLs, publication date, campaign hashtags, and engagement metrics."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Select Creator *
            </label>
            <Select
              required
              value={formData.creator_id}
              onChange={(e) =>
                setFormData({ ...formData, creator_id: e.target.value })
              }
              containerClassName="w-full"
              className="w-full text-sm py-2.5"
            >
              <option value="">-- Choose Creator --</option>
              {creators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.handle} • {c.location})
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Post URL *
            </label>
            <input
              type="url"
              required
              placeholder="https://www.instagram.com/reel/..."
              value={formData.post_url}
              onChange={(e) =>
                setFormData({ ...formData, post_url: e.target.value })
              }
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Platform
              </label>
              <Select
                value={formData.platform}
                onChange={(e) =>
                  setFormData({ ...formData, platform: e.target.value as any })
                }
                containerClassName="w-full"
                className="w-full text-sm"
              >
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Twitter">Twitter / X</option>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Post Type
              </label>
              <Select
                value={formData.post_type}
                onChange={(e) =>
                  setFormData({ ...formData, post_type: e.target.value as any })
                }
                containerClassName="w-full"
                className="w-full text-sm"
              >
                <option value="Reel">Reel / Short</option>
                <option value="Post">Feed Post</option>
                <option value="Story">Story</option>
                <option value="Video">Long-form Video</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-ink/70">
                Views
              </label>
              <input
                type="number"
                value={formData.views}
                onChange={(e) =>
                  setFormData({ ...formData, views: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 bg-canvas border border-hairline rounded-md text-xs text-ink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-ink/70">
                Likes
              </label>
              <input
                type="number"
                value={formData.likes}
                onChange={(e) =>
                  setFormData({ ...formData, likes: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 bg-canvas border border-hairline rounded-md text-xs text-ink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-ink/70">
                Comments
              </label>
              <input
                type="number"
                value={formData.comments}
                onChange={(e) =>
                  setFormData({ ...formData, comments: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 bg-canvas border border-hairline rounded-md text-xs text-ink"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono uppercase text-ink/70">
                Shares
              </label>
              <input
                type="number"
                value={formData.shares}
                onChange={(e) =>
                  setFormData({ ...formData, shares: Number(e.target.value) })
                }
                className="w-full px-3 py-1.5 bg-canvas border border-hairline rounded-md text-xs text-ink"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Campaign Hashtags (comma separated)
            </label>
            <input
              type="text"
              value={formData.hashtags}
              onChange={(e) =>
                setFormData({ ...formData, hashtags: e.target.value })
              }
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Internal Campaign Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Metric Provenance &amp; Verification Method
            </label>
            <Select
              value={formData.metrics_source}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  metrics_source: e.target.value as any,
                })
              }
              containerClassName="w-full"
              className="w-full text-sm"
            >
              <option value="Agency Verified">Agency Verified (Audit Checked by Producer)</option>
              <option value="Platform Graph API">Platform Graph API (Instagram / YouTube OAuth)</option>
              <option value="Creator Submitted">Creator Submitted (Screenshots / Media Kit)</option>
              <option value="Manual Entry">Manual Entry (Estimated / Unverified)</option>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono uppercase text-ink/70">
              Evidence Screenshot URL (Optional Verification Proof)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or cloud storage URL"
              value={formData.evidence_url}
              onChange={(e) =>
                setFormData({ ...formData, evidence_url: e.target.value })
              }
              className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Content Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
