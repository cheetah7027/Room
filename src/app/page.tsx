"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { RoomLogo } from "@/components/ui/RoomLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PERSONAS, getDefaultRouteForRole } from "@/lib/auth/rbac";
import {
  CalendarBlank,
  QrCode,
  Users,
  ShieldCheck,
  TrendUp,
  Sparkle,
  ArrowRight,
  EnvelopeSimple,
  CheckCircle,
  DeviceMobile,
  ChartBar,
} from "@phosphor-icons/react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, persona, login } = useAuth();

  // If already authenticated, redirect to role home
  useEffect(() => {
    if (isAuthenticated) {
      router.push(getDefaultRouteForRole(persona.role));
    }
  }, [isAuthenticated, persona, router]);

  const handleQuickPersonaEnter = (p: (typeof PERSONAS)[0]) => {
    login(p);
    router.push(getDefaultRouteForRole(p.role));
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between selection:bg-primary/20">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-md border-b border-hairline h-16 flex items-center px-6 md:px-12 justify-between">
        <div className="flex items-center space-x-3">
          <RoomLogo className="h-12 w-auto" />
          <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-block-lime text-ink font-bold">
            EVENT SAAS
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm" className="text-xs">
              Sign In
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="primary" size="sm" className="text-xs gap-1.5">
              <span>Create Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-soft border border-hairline text-xs font-mono text-ink/80">
            <Sparkle className="w-3.5 h-3.5 text-primary" />
            <span>Next-Generation Experiential Event Platform</span>
          </div>

          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="display-xl text-ink font-bold tracking-tight">
              The Operating System for Experiential Events
            </h1>
            <p className="text-base md:text-lg text-ink/70 max-w-2xl mx-auto leading-relaxed">
              Multi-tenant agency workspace, talent CRM, branded mobile RSVP portals, sub-second idempotent QR gate verification, and live attendance dashboards.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/sign-in">
              <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 px-8">
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto px-8">
                Create Organisation
              </Button>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-4 rounded-lg bg-surface-soft border border-hairline">
              <div className="text-2xl font-bold font-mono text-ink">Sub-second</div>
              <div className="text-xs text-ink/60 uppercase font-mono mt-0.5">QR Gate Check-in</div>
            </div>
            <div className="p-4 rounded-lg bg-surface-soft border border-hairline">
              <div className="text-2xl font-bold font-mono text-primary">8 PRD Roles</div>
              <div className="text-xs text-ink/60 uppercase font-mono mt-0.5">Strict Least-Privilege</div>
            </div>
            <div className="p-4 rounded-lg bg-surface-soft border border-hairline">
              <div className="text-2xl font-bold font-mono text-semantic-success">100% Idempotent</div>
              <div className="text-xs text-ink/60 uppercase font-mono mt-0.5">Replay Attack Proof</div>
            </div>
            <div className="p-4 rounded-lg bg-surface-soft border border-hairline">
              <div className="text-2xl font-bold font-mono text-ink">Real-Time</div>
              <div className="text-xs text-ink/60 uppercase font-mono mt-0.5">Live Attendance Sync</div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="bg-surface-soft/60 border-y border-hairline py-16">
          <div className="max-w-6xl mx-auto px-6 space-y-10">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="caption-mono text-primary font-bold">End-to-End Event Lifecycle</span>
              <h2 className="headline text-2xl md:text-3xl font-bold text-ink">
                Engineered for High-Stakes Activations
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 space-y-4 bg-canvas border border-hairline hover:border-ink/40 transition-all">
                <div className="w-10 h-10 rounded-lg bg-block-lime flex items-center justify-center text-ink">
                  <EnvelopeSimple className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-ink">Branded RSVP &amp; Bearer Tokens</h3>
                  <p className="text-xs text-ink/70 leading-relaxed">
                    Zero-knowledge invitation links allow guests to accept or decline without passwords. Accepted responses instantly generate cryptographic QR passes.
                  </p>
                </div>
              </Card>

              <Card className="p-6 space-y-4 bg-canvas border border-hairline hover:border-ink/40 transition-all">
                <div className="w-10 h-10 rounded-lg bg-block-navy text-white flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-ink">Gate Check-in &amp; Scanner</h3>
                  <p className="text-xs text-ink/70 leading-relaxed">
                    Continuously scannable mobile camera QR reader with sound feedback, instant visual verification, offline manual lookup, and cross-event rejection.
                  </p>
                </div>
              </Card>

              <Card className="p-6 space-y-4 bg-canvas border border-hairline hover:border-ink/40 transition-all">
                <div className="w-10 h-10 rounded-lg bg-block-lilac text-ink flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-ink">Talent CRM &amp; Provenance</h3>
                  <p className="text-xs text-ink/70 leading-relaxed">
                    Maintain creator profiles, past attendance sentiment, social handles, and explicit data provenance states (Agency Verified vs Creator Provided).
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Quick Persona Launchpad for Reviewers */}
        <section className="max-w-6xl mx-auto px-6 py-16 space-y-8">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <Badge variant="vvip">RBAC DEMO LAUNCHPAD</Badge>
            <h2 className="headline text-2xl font-bold text-ink">
              Experience ROOM as Any Persona
            </h2>
            <p className="text-xs text-ink/70">
              Click any role below to instantly load the workspace with tailored permissions, navigation items, and data masking.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PERSONAS.slice(0, 8).map((p) => (
              <button
                key={p.id}
                onClick={() => handleQuickPersonaEnter(p)}
                className="text-left p-4 rounded-lg bg-canvas border border-hairline hover:border-primary/40 hover:shadow-soft transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-10 h-10 rounded-full object-cover border border-hairline"
                  />
                  <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${p.badgeColor}`}>
                    {p.role.split("_")[0]}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-sm text-ink group-hover:text-primary transition-colors">
                    {p.name}
                  </div>
                  <div className="text-xs text-ink/60 line-clamp-1">{p.title}</div>
                  <div className="text-[11px] text-ink/50 line-clamp-2 mt-1 leading-snug">
                    {p.description}
                  </div>
                </div>
                <div className="pt-2 border-t border-hairline flex items-center justify-between text-xs text-primary font-mono font-medium">
                  <span>Enter as {p.name.split(" ")[0]}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-hairline py-8 bg-surface-soft/40">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-ink/60">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-ink">ROOM.</span>
            <span>• Multi-Tenant Event Operations • India</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/sign-in" className="hover:text-primary transition-colors">
              Sign In
            </Link>
            <Link href="/sign-up" className="hover:text-primary transition-colors">
              Register Organisation
            </Link>
            <Link href="/forgot-password" className="hover:text-primary transition-colors">
              Recovery
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
