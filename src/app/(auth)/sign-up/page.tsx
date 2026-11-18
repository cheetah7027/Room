"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { RoomLoading } from "@/components/ui/RoomLoading";
import { Sparkle, Buildings, User } from "@phosphor-icons/react";
import { useAuth } from "@/components/providers/AuthProvider";
import { PERSONAS } from "@/lib/auth/rbac";

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    orgName: "",
    orgSlug: "",
    fullName: "",
    workEmail: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Register organization and log in as Organisation Owner
    login(PERSONAS[0]);

    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-surface-soft flex flex-col justify-between p-6">
      <header className="max-w-md mx-auto w-full flex items-center justify-between py-4">
        <Link href="/dashboard" className="font-extrabold tracking-tighter text-2xl text-ink font-sans">
          ROOM<span className="text-primary">.</span>
        </Link>
        <span className="caption-mono text-xs text-primary font-bold">
          ORG ONBOARDING
        </span>
      </header>

      <main className="max-w-md mx-auto w-full my-auto space-y-6">
        <Card className="p-8 space-y-6 shadow-soft border border-hairline">
          <div>
            <span className="caption-mono text-primary font-semibold">
              Get Started with ROOM
            </span>
            <h1 className="headline text-2xl font-bold text-ink mt-1">
              Register Organisation
            </h1>
            <p className="text-xs text-ink/70 mt-1">
              Create an experiential workspace for your agency or brand team.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Company / Agency Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Experiential Labs"
                value={formData.orgName}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
                  setFormData({ ...formData, orgName: name, orgSlug: slug });
                }}
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Workspace URL Slug
              </label>
              <div className="flex items-center text-xs font-mono bg-surface-soft px-3 py-2 rounded-md border border-hairline text-ink/70">
                <span>room.app/</span>
                <span className="text-primary font-bold">{formData.orgSlug || "your-agency"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Founder / Owner Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikram Singhania"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Work Email *
              </label>
              <input
                type="email"
                required
                placeholder="name@agency.com"
                value={formData.workEmail}
                onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono uppercase text-ink/70">
                Password *
              </label>
              <input
                type="password"
                required
                placeholder="Create secure master password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 bg-canvas border border-hairline rounded-md text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full py-3 mt-3"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <RoomLoading size="xs" />
                  <span>Creating Workspace...</span>
                </span>
              ) : (
                "Create Organisation Workspace"
              )}
            </Button>
          </form>

          <div className="text-center text-xs text-ink/60 pt-2 border-t border-hairline">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </Card>
      </main>

      <footer className="py-4 text-center text-xs text-ink/50 font-mono">
        ROOM MULTI-TENANT ARCHITECTURE • INDIA
      </footer>
    </div>
  );
}
