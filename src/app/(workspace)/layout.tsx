import React from "react";
import { TopNav } from "@/components/layout/TopNav";
import { MarqueeStrip } from "@/components/layout/MarqueeStrip";
import { RouteGuard } from "@/components/auth/RouteGuard";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-canvas">
      <MarqueeStrip />
      <TopNav />
      <main className="flex-1 pb-16">
        <RouteGuard>{children}</RouteGuard>
      </main>
      <footer className="border-t border-hairline bg-surface-soft py-12 px-6 md:px-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="font-extrabold tracking-tighter text-xl text-ink font-sans">
              ROOM<span className="text-primary">.</span>
            </div>
            <p className="text-xs text-ink/70 mt-1 max-w-sm">
              India&apos;s operating system for brand experiences, creator relationships and invitation-driven events. Built for agencies & brands.
            </p>
          </div>
          <div className="flex items-center space-x-6 text-xs font-mono uppercase tracking-wider text-ink/70">
            <span>Bengaluru</span>
            <span>•</span>
            <span>Mumbai</span>
            <span>•</span>
            <span>Delhi NCR</span>
            <span>•</span>
            <span className="text-ink/70 font-semibold font-mono">PILOT EVALUATION BUILD</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
